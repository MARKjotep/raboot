import { obj, V } from "./@";
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
export declare class Maker {
    route: ROUTE | undefined;
    status: number;
    x_args: string[];
    isFile: boolean;
    headers: Headers;
    deflate: (ctx: Uint8Array | string | ArrayBuffer) => Uint8Array;
    gzip: (ctx: Uint8Array | string | ArrayBuffer) => Uint8Array;
    constructor({ route, status, headers, }: {
        route?: ROUTE;
        status?: number;
        headers?: obj<string>;
    }, x_args?: string[]);
    set header(head: obj<string>);
    set type(content: string);
    options(options: string, headers?: obj<string>): Response;
}
export declare class _r {
    static headstr: string;
    headattr: obj<string[]>;
    head: (heads: headP) => void;
    constructor();
}
export type responses = string | Response | Record<string, any> | void;
export declare class response {
    get?(...args: any[]): Promise<responses> | responses;
    post?(...args: any[]): Promise<responses> | responses;
    put?(...args: any[]): Promise<responses> | responses;
    patch?(...args: any[]): Promise<responses> | responses;
    eventStream?(...args: any[]): Promise<responses> | responses;
    lang: string;
    request: request;
    status: number;
    stream: eStream;
    header: obj<string>;
    session: obj<string>;
    jwt: obj<string>;
    timedJWT: ServerSide;
    head: (head: headP) => void;
    setCookie: ({}: {
        key: string;
        val: string;
        path?: string;
        days?: number;
        httpOnly?: boolean;
    }) => void;
    deleteCookie: (key: string) => void;
}
export declare class _response extends _r {
    lang: string;
    status?: number;
    stream?: eStream;
    request: request;
    __session?: ServerSide;
    __jwt?: ServerSide;
    private headers;
    set header(head: obj<string>);
    get header(): obj<string>;
    set type(content: string);
    get session(): ServerSide;
    set session(sesh: ServerSide);
    get jwt(): ServerSide;
    set jwt(jwt: ServerSide);
    get timedJWT(): ServerSide;
    setCookie({ key, val, path, days, httpOnly, }: {
        key: string;
        val: string;
        path?: string;
        days?: number;
        httpOnly?: boolean;
    }): void;
    deleteCookie(key: string): void;
}
export declare class eStream {
    ctrl?: ReadableStreamDefaultController<any> | undefined;
    intervalID: Timer[];
    constructor(ctrl?: ReadableStreamDefaultController<any> | undefined);
    push(fn: () => {
        id: string | number;
        data: string | obj<string>;
        event?: string;
        retry?: number;
        end?: boolean;
    }, interval?: number | 1000): void;
    close(): void;
}
declare class Session {
    session: AuthInterface;
    jwt: AuthInterface;
    jwtInt: JWTInterface;
    constructor();
    init(sh: Auth): void;
}
export declare const S: Session;
export {};
