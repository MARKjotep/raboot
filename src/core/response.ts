import { deflateSync, gzipSync } from "bun";
import { $$, oAss, obj, oItems, Singleton, Time, V } from "./@";
import { request } from "./request";
import { Auth, AuthInterface, JWTInterface, ServerSide } from "authored";
import { ROUTE } from "./router";

type meta<T> = {
  charset?: T;
  content?: T;
  "http-equiv"?: T;
  name?: T;
  media?: T;
  url?: T;
};
type link<T> = {
  href?: T;
  hreflang?: T;
  media?: T;
  referrerpolicy?: T;
  rel?: "stylesheet" | "icon" | "manifest" | T;
  sizes?: T;
  title?: T;
  type?: T;
  as?: T;
};
type impmap = {
  imports?: obj<string>;
  scopes?: obj<string>;
  integrity?: obj<string>;
};
type script<T> = {
  async?: T;
  crossorigin?: T;
  defer?: T;
  integrity?: T;
  nomodule?: T;
  referrerpolicy?: T;
  src?: T;
  type?: "text/javascript" | T;
  id?: T;
  importmap?: impmap;
  body?: T;
};
type base = {
  href?: string;
  target?: "_blank" | "_parent" | "_self" | "_top";
};

export interface headP {
  title?: string;
  base?: base[];
  meta?: meta<V>[];
  link?: link<V>[];
  script?: script<V>[];
}

export class Maker {
  route: ROUTE | undefined;
  status: number;
  x_args: string[];
  isFile: boolean;
  headers: Headers = new Headers({
    "Content-Type": "text/plain",
  });
  deflate: (ctx: Uint8Array | string | ArrayBuffer) => Uint8Array;
  gzip: (ctx: Uint8Array | string | ArrayBuffer) => Uint8Array;
  constructor(
    {
      route,
      status = 404,
      headers = {},
    }: { route?: ROUTE; status?: number; headers?: obj<string> },
    x_args?: string[],
  ) {
    this.status = status || 404;
    this.route = route;
    this.x_args = x_args || [];
    if (headers) this.header = headers;
    oAss(this, {
      status,
    });

    this.isFile = !!route?.isFile;

    // ----------------------------------------
    this.deflate = (ctx: Uint8Array | string | ArrayBuffer) => {
      const buffd = deflateSync(ctx);
      this.header = {
        "Content-Length": buffd.byteLength.toString(),
        "Content-Encoding": "deflate",
      };
      return buffd;
    };

    this.gzip = (ctx: Uint8Array | string | ArrayBuffer) => {
      const buffd = gzipSync(ctx);
      this.header = {
        "Content-Length": buffd.byteLength.toString(),
        "Content-Encoding": "gzip",
      };
      return buffd;
    };
  }
  set header(head: obj<string>) {
    oItems(head).forEach(([k, v]) => {
      this.headers.set(k, v);
    });
  }
  set type(content: string) {
    this.headers.set("Content-Type", content);
  }
  options(options: string, headers: obj<string> = {}) {
    options += ", OPTIONS";
    return new Response("", {
      status: 204,
      headers: {
        Allow: options,
        "Access-Control-Allow-Methods": options,
        "Access-Control-Max-Age": "86400",
        ...headers,
      },
    });
  }
}

export class _r {
  static headstr: string = "";
  headattr: obj<string[]> = {};
  head: (heads: headP) => void;
  constructor() {
    this.head = (heads: headP) => {
      oItems(heads).forEach(([k, v]) => {
        if (k == "title" || k == "base") {
          this.headattr[k] = v;
        } else {
          if (!(k in this.headattr)) {
            this.headattr[k] = v;
          } else {
            this.headattr[k].push(...v);
          }
        }
      });
    };
  }
}

/*
-------------------------

-------------------------
*/

export type responses = string | Response | Record<string, any> | void;
export class response {
  get?(...args: any[]): Promise<responses> | responses;
  post?(...args: any[]): Promise<responses> | responses;
  put?(...args: any[]): Promise<responses> | responses;
  patch?(...args: any[]): Promise<responses> | responses;
  eventStream?(...args: any[]): Promise<responses> | responses;
  /* ------------------------- */
  declare lang: string;
  declare request: request;
  declare status: number;
  declare stream: eStream;
  declare header: obj<string>;
  declare session: obj<string>;
  declare jwt: obj<string>;
  declare timedJWT: ServerSide;
  declare head: (head: headP) => void;
  declare setCookie: ({}: {
    key: string;
    val: string;
    path?: string;
    days?: number;
    httpOnly?: boolean;
  }) => void;
  declare deleteCookie: (key: string) => void;
}

export class _response extends _r {
  lang = "en";
  status?: number;
  stream?: eStream;
  declare request: request;
  __session?: ServerSide;
  __jwt?: ServerSide;
  private headers: obj<string> = {};
  set header(head: obj<string>) {
    oAss(this.headers, head);
  }
  get header() {
    return this.headers;
  }
  set type(content: string) {
    this.header = { "Content-Type": content };
  }
  get session() {
    if (!this.__session) {
      this.__session = S.session.new;
    }
    return this.__session;
  }
  set session(sesh: ServerSide) {
    this.__session = sesh;
  }
  get jwt() {
    if (!this.__jwt) {
      this.__jwt = S.jwt.new;
    }
    return this.__jwt;
  }
  set jwt(jwt: ServerSide) {
    this.__jwt = jwt;
  }
  get timedJWT() {
    return S.jwtInt.jwt();
  }
  setCookie({
    key,
    val,
    path = "/",
    days = 31,
    httpOnly = false,
  }: {
    key: string;
    val: string;
    path?: string;
    days?: number;
    httpOnly?: boolean;
  }) {
    const cd = setCookie(key, val, {
      expires: new Time().timed({ day: days }),
      path: path,
      httpOnly: httpOnly,
      sameSite: "Strict",
    });
    this.header = { "Set-Cookie": cd };
  }
  deleteCookie(key: string) {
    this.setCookie({ key: key, val: "", days: 0 });
  }
}

interface cookieSet {
  maxAge?: Date | number;
  expires?: Date | string | number;
  path?: string | null;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string | null;
  sync_expires?: boolean;
  max_size?: number;
}

const setCookie = (
  key: string,
  value: string = "",
  { maxAge, expires, path, domain, secure, httpOnly, sameSite }: cookieSet,
) => {
  if (maxAge instanceof Date) {
    maxAge = maxAge.getSeconds();
  }

  if (expires instanceof Date) {
    expires = expires.toUTCString();
  } else if (expires === 0) {
    expires = new Date().toUTCString();
  }

  const cprops = [
    ["Domain", domain],
    ["Expires", expires],
    ["Max-Age", maxAge],
    ["Secure", secure],
    ["HttpOnly", httpOnly],
    ["Path", path],
    ["SameSite", sameSite],
  ];

  return cprops
    .reduce<string[]>(
      (acc, [kk, v]) => {
        if (v !== undefined) acc.push(`${kk}=${v}`);
        return acc;
      },
      [`${key}=${value}`],
    )
    .join("; ");
};

export class eStream {
  intervalID: Timer[] = [];
  constructor(public ctrl?: ReadableStreamDefaultController<any>) {}
  push(
    fn: () => {
      id: string | number;
      data: string | obj<string>;
      event?: string;
      retry?: number;
      end?: boolean;
    },
    interval: number | 1000 = 2000,
  ) {
    if (this.ctrl) {
      const intervalID = setInterval(
        () => {
          const { id, retry, data, event, end } = fn();
          if (this.ctrl) {
            let _data = end ? "end" : data;
            if (retry) {
              let rt = retry > 2000 ? retry : 2000;
              this.ctrl.enqueue(`retry: ${rt}\\n`);
            }
            this.ctrl.enqueue(`id: ${id}\\n`);
            event && this.ctrl.enqueue(`event: ${event}\\n`);
            if (typeof _data == "object") {
              this.ctrl.enqueue("data: " + JSON.stringify(_data) + "\\n\\\n");
            } else {
              this.ctrl.enqueue(
                "data: " + JSON.stringify({ message: _data }) + "\\n\\n",
              );
            }
            end && this.close();
          }
        },
        interval > 1000 ? interval : 1000,
      );
      this.intervalID.push(intervalID);
    }
  }
  close() {
    if (this.intervalID.length) {
      this.intervalID.forEach((ff) => {
        clearInterval(ff);
      });
      this.intervalID = [];
    }
    this.ctrl?.close();
  }
}

@Singleton
class Session {
  session!: AuthInterface;
  jwt!: AuthInterface;
  jwtInt!: JWTInterface;
  constructor() {
    this.jwtInt = new JWTInterface();
  }
  init(sh: Auth) {
    this.session = sh.session;
    this.jwt = sh.jwt;
  }
}

export const S = new Session();
