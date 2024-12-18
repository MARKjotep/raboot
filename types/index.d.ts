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
export declare class Builder {
    dir: string;
    files: string[];
    out: string;
    target: string;
    define: Record<string, string>;
    exclude: string[];
    private clearing?;
    constructor({ dir, files, out, target, define, }: {
        dir: string;
        files: string[];
        out: string;
        target?: "browser" | "bun";
        define?: Record<string, string>;
    });
    clear(c?: {
        exclude: string[];
    }): this;
    build(): this;
    watch(folder?: string): void;
}
