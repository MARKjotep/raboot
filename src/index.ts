import {
  BunFile,
  file,
  inflateSync,
  serve,
  Serve,
  WebSocketHandler,
  write,
} from "bun";
import { Auth } from "authored";
import { config } from "dotenv";
import { $$, isStr, makeID, obj, oItems } from "./core/@";
import { _r, response, S } from "./core/response";
import { ROUTEcfg, setFolder, setPath } from "./core/router";
import { LSocket, websocket } from "./core/wss";
import { Render, Boot, dev, getHead, raboot, server } from "./core/raboot";
import { readdirSync, rmSync, statSync, unlinkSync, watch } from "node:fs";
import { isDir, isFile } from "./core/@n";
import path from "node:path";

// Buneary JS
// Raboot

/*
-------------------------
Create type validator

Ask me clarifying questions until you are 95% confident you can complete the task succesfully. Take a deep breath and take it step by step. Remember to search the internet to retrieve up-to-date information.
-------------------------
*/
export { $$, response, websocket, Render };

export class Raboot extends _r {
  apt: string;
  serve: server;
  constructor(
    public dir: string = "./",
    options: raboot = {},
  ) {
    super();

    const PRIV = this.dir + "/.private";
    const { envPath, appDir, session } = options;
    if (!envPath) {
      isDir(PRIV);
      isFile(PRIV + "/.env", `SECRET_KEY="${makeID(20)}"`);
    }
    this.apt = dir + "/" + (appDir ?? "app") + "/";

    config({ path: (envPath ? envPath : PRIV) + "/.env" });

    const SH = session ?? new Auth({ dir: this.dir });

    S.init(SH);
    /*
      -------------------------
      
      -------------------------
      */
    this.serve = async (
      options: Partial<Serve> & dev,
      wssOptions?: Partial<WebSocketHandler>,
    ) => await Served.call(this, options, wssOptions);
  }
  route(path: string) {
    return setPath<typeof response>(path, {}, false, false);
  }
  wss(path: string, config: ROUTEcfg = {}) {
    return setPath<typeof websocket>(path, config, true, false);
  }
  redirect(url: string, headers: obj<string> = {}) {
    return new Response("", {
      status: 302,
      headers: { ...headers, Location: url },
    });
  }
  folders(...folder: ([string, { requireSession?: boolean }] | string)[]) {
    folder.forEach((ff) => setFolder(...getFFConfig(ff)));
  }
  files(...file: ([string, ROUTEcfg] | string)[]) {
    file.forEach((ff) => {
      const [path, config] = getFFConfig(ff);
      const fs = path.replace(/^\.+/, "");
      const rr = fs.startsWith("/") ? fs : "/" + fs;
      setPath(rr, config, false, true, config.preload ? this.apt : undefined);
    });
  }
  session<T>(...arg: any[]) {
    return authDecor<T>(arg[0], arg[2], "session");
  }
  jwt<T>(...arg: any[]) {
    return authDecor<T>(arg[0], arg[2], "jwt");
  }
  jwt_refresh<T>(...arg: any[]) {
    return authDecor<T>(arg[0], arg[2], "jwt_refresh");
  }
}

async function Served(
  this: Raboot,
  options: Partial<Serve> & dev,
  wssOptions: Partial<WebSocketHandler> = {},
) {
  let { path, hostname, method, port } = options;
  port ??= 3000;
  _r.headstr = getHead(this.headattr).join("");

  if (path) {
    await setIndex(
      {
        url: `http://${hostname ?? "127.0.0.1"}:${port}${path}`,
        method: method ?? "GET",
      } as Request,
      this.apt,
    );
  } else {
    serve({
      port: options.port,
      tls: getTLS(this.dir),
      fetch: async (req, server) => {
        //

        return await new Boot(req, server, this.apt).response();
      },
      websocket: {
        sendPings: true,
        perMessageDeflate: true,
        ...wssOptions,
        ...LSocket,
      },
    });
  }
}

/*
-------------------------
-------------------------
*/

const getTLS = (dir: string) => {
  return oItems(process.env)
    .filter(([key]) => key.startsWith("TLS_"))
    .reduce<obj<BunFile>>((acc, [key, value]) => {
      if (value) {
        const certKey = key.replace("TLS_", "").toLowerCase();
        acc[certKey] = file(dir + "/" + value);
      }
      return acc;
    }, {});
};

const getFFConfig = (ff: string | [string, ROUTEcfg]): [string, ROUTEcfg] => {
  const _isStr = isStr(ff);
  return [_isStr ? (ff as string) : ff[0], _isStr ? {} : ff[1]];
};

const authDecor = <T>(t: T, descriptor: any, auth: string) => {
  const OG: (args: obj<string>) => any = descriptor.value;
  descriptor.value = async function (args: obj<string> = {}) {
    if (auth in args && args.session) {
      return OG.call(t, args);
    }
    return {
      error: 401,
    };
  };
  return descriptor;
};

const setIndex = async (rq: Request, apt: string) => {
  const CTX = await new Boot(rq, undefined, apt).response();
  const AB = inflateSync(await CTX.arrayBuffer());
  AB.byteLength && write(apt + "index.html", AB);
};

/*
-------------------------
Builder
-------------------------
*/

export class Builder {
  dir: string;
  files: string[];
  out: string;
  target: string;
  define: Record<string, string>;
  exclude: string[] = [];
  private clearing?: boolean = false;
  constructor({
    dir,
    files,
    out,
    target = "browser",
    define = {},
  }: {
    dir: string;
    files: string[];
    out: string;
    target?: "browser" | "bun";
    define?: Record<string, string>;
  }) {
    this.dir = dir;
    this.files = files.map((m) => dir + "/" + m);
    this.out = out;
    isDir(out);
    this.target = target;
    this.define = define ?? {};
    //
  }
  clear(c: { exclude: string[] } = { exclude: [] }) {
    //
    this.exclude = c.exclude.length ? c.exclude : this.exclude;
    this.clearing = true;

    const recurse = (_PATH: string) => {
      const dirs = readdirSync(_PATH);
      if (dirs.length == 0) {
        rmSync(_PATH, { recursive: true });
        return;
      }
      dirs.forEach((ff) => {
        if (ff.startsWith(".") || this.exclude.includes(ff)) return;
        const _path = path.join(_PATH, ff);
        if (statSync(_path).isDirectory()) {
          recurse(_path);
        } else {
          unlinkSync(_path);
        }
      });
    };

    recurse(this.out);

    return this;
  }
  build() {
    this.files.length &&
      Bun.build({
        entrypoints: this.files,
        outdir: this.out,
        splitting: true,
        minify: {
          identifiers: true,
          whitespace: true,
          syntax: true,
        },
        target: (this.target as "browser") ?? "browser",
        naming: {
          chunk: "[name]-[hash].[ext]",
          entry: "[dir]/[name].[ext]",
          asset: "[name]-[hash].[ext]",
        },
        define: {
          ...this.define,
        },
        experimentalCss: true,
      }).then((e) => {
        if (e.success) {
          $$.p = `success`;
        } else {
          $$.p = e.logs;
        }
      });

    return this;
  }
  watch(folder?: string) {
    const watchFolder = folder ? this.dir + folder : this.dir;

    const watcher = watch(
      watchFolder,
      { recursive: true },
      async (event, filename) => {
        if (filename && filename.endsWith("tsx")) {
          this.clearing && this.clear();
          this.build();
        }
      },
    );
    process.on("SIGINT", () => {
      console.log("\nwatcher closed...");
      watcher.close();
      process.exit(0);
    });
  }
}
