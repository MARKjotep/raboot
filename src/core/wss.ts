import { ServerWebSocket } from "bun";
import { makeID, obj, oKeys, oLen } from "./@";
import { request } from "./request";
import { ServerSide } from "authored";
import { S } from "./response";

interface repsWSS {
  role: "maker" | "joiner" | "god";
}
const wssClients: Map<string, obj<repsWSS>> = new Map();

export class _websocket {
  [Key: string]: any;
  ws!: ServerWebSocket<{ wclass: _websocket }>;
  path: string;
  id: string;
  broadcasting = false;
  max: number = 0;
  constructor(public request: request) {
    this.path = request.path;
    this.id = makeID(10);
  }
  async init?(...args: any[]): Promise<void>;
  async open() {}
  async message(message: string | Buffer | undefined) {}
  async close(code: number, reason: string) {}

  set send(message: string | Bun.BufferSource | undefined) {
    if (message)
      if (this.broadcasting) {
        this.ws.publish(this.path, message);
      } else {
        this.ws.send(message);
      }
  }
  get role() {
    const WT = wssClients.get(this.path);
    if (WT && this.id in WT) {
      return WT[this.id].role;
    }
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
}

export class websocket {
  async init?(...args: any[]): Promise<void>;
  async open() {}
  async message(message: string | Buffer | undefined) {}
  async close(code: number, reason: string) {}
  max: number = 0;
  broadcasting = false;
  // -------------------
  declare send: string | Bun.BufferSource | undefined;
  declare role: repsWSS;
  declare request: request;
  declare ws: ServerWebSocket<{ wclass: _websocket }>;
  declare path: string;
  declare id: string;
  declare session: obj<string>;
  declare jwt: obj<string>;
  declare timedJWT: ServerSide;
}

export const getClient = (rurl: string) => {
  const _WS = wssClients.get(rurl);
  if (!_WS) wssClients.set(rurl, {});
  return wssClients.get(rurl) ?? {};
};

export const LSocket = {
  async open(
    ws: ServerWebSocket<{
      wclass: _websocket;
      z_args: obj<string>;
      client: obj<repsWSS>;
    }>,
  ) {
    const WC = ws.data.wclass;
    const { z_args, client } = ws.data;
    if (WC) {
      WC.ws = ws;
      const cid = WC.id;
      const clen = oLen(client);
      if (!(cid in client)) {
        const role = clen ? "joiner" : "maker";
        client[cid] = {
          role: role,
        };
      }
      if (typeof WC["init"] == "function") await WC.init(z_args);
      if (WC.broadcasting) {
        WC.ws.subscribe(WC.path);
      }
      await WC.open();
    } else {
      ws.close();
    }
  },
  async message(
    ws: ServerWebSocket<{ wclass: _websocket; client: obj<repsWSS> }>,
    message: string | Buffer,
  ) {
    const WC = ws.data.wclass;
    if (WC) {
      await WC.message(message);
    }
  },
  async close(
    ws: ServerWebSocket<{ wclass: _websocket; client: obj<repsWSS> }>,
    code: number,
    reason: string,
  ) {
    const WC = ws.data.wclass;
    const client = ws.data.client;
    if (WC) {
      await WC.close(code, reason);

      if (WC.broadcasting) {
        WC.ws.unsubscribe(WC.path);
      }

      const wid = WC.id;
      delete client[wid];

      if (oLen(client) === 1) {
        oKeys(client).forEach((c, indx) => {
          client[c].role = "maker";
        });
      }
    }
  },
};
