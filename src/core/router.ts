import { file, gzipSync } from "bun";
import { $$, ngify, oAss, parsePath, pathType, sparse, strip } from "./@";
import { _r, Maker } from "./response";

export interface ROUTEcfg {
  credentials?: boolean;
  requireSession?: boolean;
  preload?: boolean;
  broadcast?: boolean;
  maxClient?: number;
}

export class ROUTE {
  bytes?: Uint8Array;
  parsed: string[] = [];
  args: string[] = [];
  fileType: string = "text/plain";
  constructor(
    public path: string,
    public proto: Function["prototype"],
    public config: ROUTEcfg = {},
    public isWSS: boolean = false,
    public isFile: boolean = false,
    public options: string = "",
  ) {
    oAss(this, parsePath(path));
    if (isFile) {
      this.fileType = file(path).type;
    }
  }
  async loadbytes(apt: string) {
    if (this.config.preload) {
      try {
        const bytes = await file(apt + this.path).bytes();
        this.bytes = gzipSync(bytes);
      } catch {
        throw `error: can't preload ${this.path}. File not found.`;
      }
    }
    return this;
  }
}

export const { setPath, getPath, setFolder } = (function () {
  const TPS = ["string", "int", "float", "file", "uuid"];
  const METHODS: string[] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
  // -----------------------------
  const _PATH: Map<string, ROUTE> = new Map();
  const _WSS: Map<string, ROUTE> = new Map();
  const _FILE: Map<string, ROUTE> = new Map();
  const _FOLDER: Map<string, Record<string, boolean>> = new Map();
  // -----------------------------
  const getMap = (isWS: boolean, isFile: boolean) => {
    return isWS ? _WSS : isFile ? _FILE : _PATH;
  };
  const getIsFile = (parsed: string[]) => {
    const ppop = parsed.slice().pop();

    return ppop ? pathType(ppop, true).pop() === "file" : false;
  };
  const getOption = (prototype: Record<string, any>) => {
    return METHODS.filter((method) => prototype[method.toLowerCase()]).join(
      ", ",
    );
  };
  // -----------------------------
  const setRoute = (route: ROUTE) => {
    const { path, parsed, isFile, isWSS } = route;
    const routeMap = getMap(isWSS, isFile);
    const parsedKey = JSON.stringify(parsed);
    const existingRoute = routeMap.get(parsedKey);

    if (!existingRoute) {
      routeMap.set(parsedKey, route);
    } else if (!isFile) {
      throw `path: ${path} already declared.`;
    }
  };
  function setFolder(path: string, config: { requireSession?: boolean } = {}) {
    path = strip(path, ".");
    path = strip(path, "/");
    _FOLDER.set(path, config);
  }
  // -----------------------------
  function filer({
    isFile,
    parsed,
    path,
  }: {
    isFile: boolean;
    parsed: string[];
    path: string;
  }) {
    if (!isFile) return new Maker({});

    const folderPath = parsed.slice(0, -1).join("/");
    for (const [folder, config] of _FOLDER.entries()) {
      if (folderPath.startsWith(folder)) {
        return new Maker({
          route: new ROUTE(
            `.${path}`,
            null,
            { requireSession: !!config?.requireSession },
            false,
            isFile,
          ),
          status: 200,
        });
      }
    }

    return new Maker({});
  }
  function setPath<Q>(
    path: string,
    config: ROUTEcfg,
    isWSS: boolean,
    isFile: boolean,
    apt?: string,
  ) {
    return <T extends Q>(f: T | Function["prototype"]) => {
      const RT = new ROUTE(
        path,
        f.prototype,
        config,
        isWSS,
        isFile,
        getOption(f.prototype),
      );
      if (apt) RT.loadbytes(apt);
      //
      setRoute(RT);
      return f;
    };
  }
  function getPath({
    parsed,
    isWSS = false,
    path,
  }: {
    parsed: string[];
    isWSS?: boolean;
    path: string;
  }) {
    const isFile = getIsFile(parsed);
    const args: string[] = [];
    const routeMap = getMap(isWSS, isFile);
    let route = routeMap.get(ngify(parsed));

    if (!route) {
      const matches: string[] = [];
      for (const routeKey of routeMap.keys()) {
        const segments = sparse(routeKey) as string[];
        const seglen = segments.length;
        //
        if (parsed.length === seglen) {
          for (let i = 0; i < seglen; i++) {
            const parsi = parsed[i];
            const segsi = segments[i];
            if (segsi === parsi) {
              matches[i] = parsi;
            } else if (TPS.includes(segsi)) {
              matches[i] = segsi;
              args.push(parsi);
            }
          }
        }
      }
      route = routeMap.get(ngify(matches));
    }

    if (route) {
      //
      return new Maker({ route, status: 200 }, args);
    } else return filer({ isFile, parsed, path });
  }
  // -----------------------------
  return {
    setPath,
    getPath,
    setFolder,
  };
})();

/*
-------------------------
GETTERS
-------------------------
*/
