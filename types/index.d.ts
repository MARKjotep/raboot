import { $$, obj } from "./core/@";
import { _r, response } from "./core/response";
import { ROUTEcfg } from "./core/router";
import { websocket } from "./core/wss";
import { Render, raboot, server } from "./core/raboot";
export { $$, response, websocket, Render };
export declare class Raboot extends _r {
    dir: string;
    apt: string;
    serve: server;
    constructor(dir?: string, options?: raboot);
    route(path: string): <T extends typeof response>(f: T | Function["prototype"]) => any;
    wss(path: string, config?: ROUTEcfg): <T extends typeof websocket>(f: T | Function["prototype"]) => any;
    redirect(url: string, headers?: obj<string>): Response;
    folders(...folder: ([string, {
        requireSession?: boolean;
    }] | string)[]): void;
    files(...file: ([string, ROUTEcfg] | string)[]): void;
    session<T>(...arg: any[]): any;
    jwt<T>(...arg: any[]): any;
    jwt_refresh<T>(...arg: any[]): any;
}
