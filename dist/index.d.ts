import * as bun from 'bun';
import { Server, ServerWebSocket, Serve, WebSocketHandler } from 'bun';
import { ServerSide, Auth } from 'authored';

interface obj<T> {
    [Key: string]: T;
}
type V = string | number | boolean;
declare class $$ {
    static set p(a: any);
}

declare class request {
    req: Request;
    server?: Server | undefined;
    formData?: FormData;
    url: URL;
    method: string;
    __cookies: Map<string, string>;
    constructor(req: Request, server?: Server | undefined);
    form(): Promise<FormData>;
    authgroup(): Promise<{
        sid: string;
        jwtv: string;
        refreshjwt: string;
    }>;
    upgradeConnection(data?: obj<any>): boolean;
    get auth(): string | undefined;
    get accept(): string | null;
    get contentType(): string | null;
    get cookies(): Map<string, string>;
    get headers(): Headers;
    get ip(): bun.SocketAddress | null | undefined;
    get isForm(): boolean;
    get isEventStream(): boolean | undefined;
    get path(): string;
    get parsed(): string[];
    get searchParams(): URLSearchParams;
    get range(): string | undefined;
    get isWSS(): boolean;
    get upgrade(): string | null;
    get request(): Request;
    get signal(): AbortSignal;
}

interface ROUTEcfg {
    credentials?: boolean;
    requireSession?: boolean;
    preload?: boolean;
    broadcast?: boolean;
    maxClient?: number;
}

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
interface headP {
    title?: string;
    base?: base[];
    meta?: meta<V>[];
    link?: link<V>[];
    script?: script<V>[];
}
declare class _r {
    static headstr: string;
    headattr: obj<string[]>;
    head: (heads: headP) => void;
    constructor();
}
type responses = string | Response | Record<string, any> | void;
declare class response {
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
declare class eStream {
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

interface repsWSS {
    role: "maker" | "joiner" | "god";
}
declare class _websocket {
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
declare class websocket {
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

interface dev {
    path?: string;
    hostname?: string;
    method?: string;
    port?: number;
}
interface raboot {
    appDir?: string;
    envPath?: string;
    session?: Auth;
}
type server = (options: Partial<Serve> & dev, wssOptions?: Partial<WebSocketHandler>) => Promise<any>;
declare class Render {
    private app;
    private data;
    constructor(app: any, data?: any);
    private _head;
    render(head: string, lang: string): Promise<string>;
}

declare class Raboot extends _r {
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
declare class Builder {
    dir: string;
    files: string[];
    out: string;
    target: string;
    define: Record<string, string>;
    constructor({ dir, files, out, target, define, }: {
        dir: string;
        files: string[];
        out: string;
        target?: "browser" | "bun";
        define?: Record<string, string>;
    });
    build(): this;
    watch(folder?: string): void;
}

export { $$, Builder, Raboot, Render, response, websocket };
