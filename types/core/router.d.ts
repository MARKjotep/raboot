import { Maker } from "./response";
export interface ROUTEcfg {
    credentials?: boolean;
    requireSession?: boolean;
    preload?: boolean;
    broadcast?: boolean;
    maxClient?: number;
}
export declare class ROUTE {
    path: string;
    proto: Function["prototype"];
    config: ROUTEcfg;
    isWSS: boolean;
    isFile: boolean;
    options: string;
    bytes?: Uint8Array;
    parsed: string[];
    args: string[];
    fileType: string;
    constructor(path: string, proto: Function["prototype"], config?: ROUTEcfg, isWSS?: boolean, isFile?: boolean, options?: string);
    loadbytes(apt: string): Promise<this>;
}
export declare const setPath: <Q>(path: string, config: ROUTEcfg, isWSS: boolean, isFile: boolean, apt?: string) => <T extends Q>(f: T | Function["prototype"]) => any, getPath: ({ parsed, isWSS, path, }: {
    parsed: string[];
    isWSS?: boolean;
    path: string;
}) => Maker, setFolder: (path: string, config?: {
    requireSession?: boolean;
}) => void;
