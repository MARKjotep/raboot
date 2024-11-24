import { BunFile, file, Serve, Server, WebSocketHandler } from "bun";
import { Auth, ServerSide } from "authored";
import {
  $$,
  getArgs,
  getByteRange,
  isArr,
  isArraybuff,
  isBool,
  isStr,
  makeID,
  oAss,
  obj,
  oItems,
  oLen,
  V,
} from "./@";
import { _r, _response, eStream, headP, Maker, responses, S } from "./response";
import { request } from "./request";
import { _websocket, getClient } from "./wss";
import { getPath, ROUTE } from "./router";

/*
-------------------------
TYPES
-------------------------
*/

export interface dev {
  path?: string;
  hostname?: string;
  method?: string;
  port?: number;
}
export interface raboot {
  appDir?: string;
  envPath?: string;
  session?: Auth;
}
export type server = (
  options: Partial<Serve> & dev,
  wssOptions?: Partial<WebSocketHandler>,
) => Promise<any>;

type responseBody =
  | string
  | Uint8Array
  | ArrayBuffer
  | BunFile
  | ReadableStream<Uint8Array>
  | null;

/*
-------------------------
MAIN
-------------------------
*/

export class Render {
  constructor(
    private app: any,
    private data: any = {},
  ) {}
  private _head(path: string) {
    const isl = path.startsWith(".");
    if (!isl) path = "." + path;
    return `<script type="module">import x from "${path}";x.ctx(${JSON.stringify(this.data)});</script>`;
  }
  async render(head: string, lang: string) {
    if (isStr(this.app)) {
      let bscr = this._head(this.app);
      return makeHTML("", head + bscr, lang);
    } else {
      if ("ssr" in this.app) {
        const TX = await this.app.ssr(this.data);
        //
        return makeHTML("", head + TX.script, lang, TX.body);
      }
    }
    return makeHTML("", head, lang);
  }
}

export class Boot {
  declare req: request;
  declare maker: Maker;
  declare _resp: _response;
  method: string;
  isFile: boolean;
  isEStream: boolean;
  isWSS: boolean = false;
  z_args: obj<string> = {};
  constructor(
    req: Request,
    server?: Server,
    public apt: string = "./",
  ) {
    const _req = new request(req, server);
    const { parsed, method, path, isWSS, isEventStream } = _req;
    const maker = getPath({ parsed, isWSS, path });
    this.isEStream = !!isEventStream;
    this.isWSS = isWSS;
    this.isFile = maker.isFile;
    this.method = method;
    const _resp = defineResponse(_req);

    Object.defineProperties(this, {
      req: {
        get: function () {
          return _req;
        },
      },
      _resp: {
        get: function () {
          return _resp;
        },
      },
      maker: {
        get: function () {
          return maker;
        },
      },
    });
  }
  push(body?: responseBody, status?: number) {
    const { status: _st, headers } = this.maker;
    status ??= _st;
    return new Response(body, { status, headers });
  }
  async processMethod(
    proto: (args: obj<string>) => Promise<responses> | responses,
  ) {
    const { maker, method, _resp } = this;
    const CTX = await proto.call(_resp, this.z_args);

    if (typeof CTX === "object" && "error" in CTX) {
      maker.status = CTX.error as number;
      return;
    }

    const { header, status, headattr, lang, __session } = _resp;

    if (oLen(header)) maker.header = header;
    if (status) maker.status = status;

    __session && (await setSession(__session, maker.headers));

    // -------------------------------------

    if (!CTX) {
      maker.status = status ?? 204;
      return;
    }

    if (CTX instanceof Response) {
      maker.status = CTX.status;
      maker.header = CTX.headers.toJSON();
      return await CTX.arrayBuffer();
    }

    if (method === "post" && CTX instanceof ServerSide) {
      return JWT.call(this, CTX);
    }

    if (typeof CTX === "object" && !(CTX instanceof Render)) {
      maker.type = "application/json";
      return JSON.stringify(CTX);
    }

    maker.type = "text/html";
    const HD = [_r.headstr, ...getHead(headattr)].join("");

    if (CTX instanceof Render) {
      return await CTX.render(HD, lang);
    }

    return makeHTML(String(CTX), HD, lang);
  }
  async response(): Promise<Response> {
    const { maker, isWSS, isFile, isEStream, method, _resp } = this;
    const route = maker.route;

    // ---------------------------------------
    if (!route) return this.push(maker.deflate(""));
    // ---------------------------------------
    this.z_args = getArgs(route.args ?? [], maker.x_args);

    await checkAuth(_resp, this.z_args, await this.req.authgroup());
    // ---------------------------------------
    if (isAuthorized(!!route.config.requireSession, this.z_args)) {
      maker.status = 401;
      return this.push();
    }

    // ---------------------------------------
    if (isFile) {
      return this.push(await FILE.call(this, route));
    }
    // ---------------------------------------
    // The following requires a function -----
    const { proto, isWSS: rWSS } = route;

    if (isWSS && rWSS) {
      const upg = await UPGRADE.call(this, route);
      return this.push(maker.deflate(upg ?? ""));
    }

    const estr = "eventStream";
    if (proto?.[estr] && isEStream) {
      const STM = await ESTREAM.call(this, proto[estr]);
      return this.push(STM);
    }

    if (proto?.[method]) {
      const CTX = await this.processMethod(proto[method]);
      return this.push(maker.deflate(CTX ?? ""));
    }

    return this.push(maker.deflate(""));
  }
}

/*
-------------------------
JWT
-------------------------
*/
async function JWT(this: Boot, JWT: ServerSide) {
  const maker = this.maker;
  const { jwtv, refreshjwt } = await this.req.authgroup();
  let resp = {};

  const handleError = (error: string) => {
    maker.status = 403;
    return { error };
  };

  const refreshToken = async (_JWT: ServerSide) => {
    const accessToken = S.jwtInt.save(_JWT);
    _JWT.access_token = accessToken;
    await S.jwt.saveSession(_JWT, maker.headers);
    return {
      access_token: accessToken,
      refresh_token: _JWT.sid,
      status: "ok",
    };
  };

  if (refreshjwt) {
    const refreshSession = await S.jwt.openSession(refreshjwt);
    const storedAccessToken = refreshSession.data.access_token;

    if (jwtv !== storedAccessToken) {
      resp = handleError("tokens don't match.");
    } else if (!S.jwtInt.verify(storedAccessToken, { days: 5 })) {
      await S.jwt.saveSession(refreshSession, undefined, true);
      resp = handleError("expired refresh_token");
    } else {
      resp = await refreshToken(refreshSession);
    }
  } else if (!jwtv && JWT.modified) {
    resp = await refreshToken(JWT);
  } else {
    maker.status = 204;
  }

  maker.type = "application/json";
  return JSON.stringify(resp);
}
/*
-------------------------
Check Auth
-------------------------
*/
async function checkAuth(
  FS: _response,
  z_args: obj<string>,
  authGrp: obj<string>,
) {
  const a_args: obj<boolean> = {};
  const { sid, jwtv, refreshjwt } = authGrp;

  if (sid) {
    FS.session = await S.session.openSession(sid);
    if (!FS.session.new) {
      a_args.session = true;
    }
  }

  if (jwtv) {
    FS.jwt = S.jwtInt.open(jwtv, { hours: 6 });
    if (!FS.jwt.new) {
      a_args.jwt = true;
    }
    if (refreshjwt) {
      const rjwt = await S.jwt.openSession(refreshjwt);
      if (!rjwt.new) {
        a_args.jwt_refresh = true;
      }
    }
  }

  if (oLen(a_args)) {
    oAss(z_args, a_args);
  }
}
/*
-------------------------
Event Stream
-------------------------
*/

async function ESTREAM(
  this: Boot,
  proto: (args: obj<string>) => Promise<responses> | responses,
) {
  const { req, z_args, _resp: FS } = this;

  const maker = this.maker;
  const stream = new ReadableStream({
    async start(controller) {
      FS.stream = new eStream(controller);
      await proto.call(FS, z_args);

      req.signal.addEventListener("abort", () => {
        FS.stream?.close();
        if (FS.stream?.intervalID.length) {
          controller.close();
        }
      });
    },
  });

  maker.header = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  const initialCtx = await proto.call(FS, z_args);
  if (typeof initialCtx === "object" && "error" in initialCtx) {
    maker.status = initialCtx.error;
    return "";
  }

  return stream;
}
/*
-------------------------
UPGRADE
-------------------------
*/

async function UPGRADE(this: Boot, wss: ROUTE) {
  const { req, z_args } = this;
  const webSocket = new _websocket(req);

  await checkAuth(webSocket as any, z_args, await req.authgroup());

  if (isAuthorized(!!wss.config.requireSession, z_args)) {
    this.maker.status = 401;
    return "";
  }

  const { broadcast, maxClient } = wss.config;
  const clientPath = webSocket.path;
  const clients = getClient(clientPath);
  const clientCount = oLen(clients);

  webSocket.broadcasting = !!broadcast;
  webSocket.max = maxClient ?? 0;

  if (maxClient && clientCount >= maxClient) {
    return "upgrade error";
  }

  const { open, message, close, init } = wss.proto;
  webSocket.open = open;
  webSocket.message = message;
  webSocket.close = close;
  webSocket.init = init;

  this.req.upgradeConnection({
    data: {
      wclass: webSocket,
      z_args,
      client: clients,
    },
  });

  return "upgrade error";
} /*
-------------------------
FILE
-------------------------
*/

async function FILE(this: Boot, route: ROUTE) {
  const range = this.req.range;
  const maker = this.maker;
  const { path, bytes, fileType } = route;

  if (bytes) {
    return getFile(bytes, bytes.byteLength, fileType, maker, range);
  }

  const FL = file(this.apt + path);
  try {
    const isMedia = fileType.startsWith("video/");
    const fileBytes = isMedia ? FL : await FL.bytes();
    return getFile(fileBytes, FL.size, fileType, maker, range);
  } catch {
    maker.status = 404;
    return `${path} file not found.`;
  }
}

const getFile = (
  bytes: Uint8Array | BunFile,
  size: number,
  fileType: string,
  maker: Maker,
  range?: string,
) => {
  maker.type = fileType;

  if (!range) {
    maker.header = {
      "Cache-Control": "max-age=86400, must-revalidate",
    };
    return isArraybuff(bytes) ? maker.gzip(bytes) : bytes;
  }

  const [start, end, total] = getByteRange(size, range);
  maker.header = {
    "Content-Range": `bytes ${start}-${end}/${total}`,
    "Content-Length": size.toString(),
  };
  maker.status = 206;
  return bytes.slice(start, end + 1);
};

/*
-------------------------
GETTER 
-------------------------
*/

export const getHead = (v?: headP) => {
  if (!v) return [];
  return oItems(v).reduce<string[]>((acc, [kk, vv]) => {
    if (isStr(vv)) {
      acc.push(`<${kk}>${vv}</${kk}>`);
      return acc;
    }
    if (!isArr(vv)) return acc;

    const elements = vv.map((vl) => {
      if (kk === "script") {
        const attrs = { ...vl };
        let content = "";
        if ("importmap" in attrs) {
          attrs.type = "importmap";
          content = JSON.stringify(attrs.importmap);
          delete attrs.importmap;
        } else if ("body" in attrs) {
          content = attrs.body;
          delete attrs.body;
        }
        return `<${kk}${getAttr(attrs)}>${content}</${kk}>`;
      }
      return `<${kk}${getAttr(vl)}>`;
    });
    acc.push(...elements);
    return acc;
  }, []);
};

const getAttr = (attr: obj<V>) => {
  return oItems(attr)
    .reduce<string[]>(
      (acc, [k, v]) => {
        acc.push(isBool(v) ? k : `${k}="${v}"`);
        return acc;
      },
      [""],
    )
    .join(" ");
};

const isAuthorized = (requireSession: boolean, z_args: obj<string>) => {
  return requireSession && !("session" in z_args || "jwt" in z_args);
};

/*
-------------------------
SETTERS
-------------------------
*/

const makeHTML = (ctx: string, head: string, lang: string, body?: string) => {
  return [
    `<!DOCTYPE html><html lang="${lang}">`,
    `<head>${head}</head>`,
    body ? body : `<body id="${makeID(5)}">${ctx}</body>`,
    "</html>",
  ].join("");
};

const defineResponse = (rt: request) => {
  const NR = new _response();
  Object.defineProperties(NR, {
    request: {
      get: function () {
        return rt;
      },
    },
  });

  return NR;
};

const setSession = async (SS: ServerSide, headers: Headers) => {
  await S.session.saveSession(SS, headers);
};
