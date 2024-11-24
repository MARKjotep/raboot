import { Server } from "bun";
import { obj } from "./@";
export declare class request {
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
    get ip(): import("bun").SocketAddress | null | undefined;
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
