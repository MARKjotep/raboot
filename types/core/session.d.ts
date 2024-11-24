import { Auth, AuthInterface, JWTInterface } from "authored";
declare class Session {
    session: AuthInterface;
    jwt: AuthInterface;
    jwtInt: JWTInterface;
    constructor();
    init(sh: Auth): void;
}
export declare const S: Session;
export {};
