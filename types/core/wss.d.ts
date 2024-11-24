import { ServerWebSocket } from "bun";
import { obj } from "./@";
import { request } from "./request";
import { ServerSide } from "authored";
interface repsWSS {
    role: "maker" | "joiner" | "god";
}
export declare class _websocket {
    request: request;
    [Key: string]: any;
    ws: ServerWebSocket<{
        wclass: _websocket;
    }>;
    path: string;
    id: string;
    broadcasting: boolean;
    max: number;
    constructor(request: request);
    init?(...args: any[]): Promise<void>;
    open(): Promise<void>;
    message(message: string | Buffer | undefined): Promise<void>;
    close(code: number, reason: string): Promise<void>;
    set send(message: string | Bun.BufferSource | undefined);
    get role(): "maker" | "joiner" | "god" | undefined;
    get session(): ServerSide;
    set session(sesh: ServerSide);
    get jwt(): ServerSide;
    set jwt(jwt: ServerSide);
    get timedJWT(): ServerSide;
}
export declare class websocket {
    init?(...args: any[]): Promise<void>;
    open(): Promise<void>;
    message(message: string | Buffer | undefined): Promise<void>;
    close(code: number, reason: string): Promise<void>;
    max: number;
    broadcasting: boolean;
    send: string | Bun.BufferSource | undefined;
    role: repsWSS;
    request: request;
    ws: ServerWebSocket<{
        wclass: _websocket;
    }>;
    path: string;
    id: string;
    session: obj<string>;
    jwt: obj<string>;
    timedJWT: ServerSide;
}
export declare const getClient: (rurl: string) => obj<repsWSS>;
export declare const LSocket: {
    open(ws: ServerWebSocket<{
        wclass: _websocket;
        z_args: obj<string>;
        client: obj<repsWSS>;
    }>): Promise<void>;
    message(ws: ServerWebSocket<{
        wclass: _websocket;
        client: obj<repsWSS>;
    }>, message: string | Buffer): Promise<void>;
    close(ws: ServerWebSocket<{
        wclass: _websocket;
        client: obj<repsWSS>;
    }>, code: number, reason: string): Promise<void>;
};
export {};
