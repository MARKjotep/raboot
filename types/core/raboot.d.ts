import { BunFile, Serve, Server, WebSocketHandler } from "bun";
import { Auth } from "authored";
import { obj } from "./@";
import { _response, headP, Maker, responses } from "./response";
import { request } from "./request";
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
export type server = (options: Partial<Serve> & dev, wssOptions?: Partial<WebSocketHandler>) => Promise<any>;
type responseBody = string | Uint8Array | ArrayBuffer | BunFile | ReadableStream<Uint8Array> | null;
export declare class Render {
    private app;
    private data;
    constructor(app: any, data?: any);
    private _head;
    render(head: string, lang: string): Promise<string>;
}
export declare class Boot {
    apt: string;
    req: request;
    maker: Maker;
    _resp: _response;
    method: string;
    isFile: boolean;
    isEStream: boolean;
    isWSS: boolean;
    z_args: obj<string>;
    constructor(req: Request, server?: Server, apt?: string);
    push(body?: responseBody, status?: number): Response;
    processMethod(proto: (args: obj<string>) => Promise<responses> | responses): Promise<string | ArrayBuffer | undefined>;
    response(): Promise<Response>;
}
export declare const getHead: (v?: headP) => string[];
export {};
