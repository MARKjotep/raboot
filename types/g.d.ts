interface User {
    name: string;
    age: number;
}
declare class User implements User {
    name: string;
    age: number;
    constructor(name: string, age: number);
}
interface IService {
    process(): void;
    getData(): Record<string, unknown>;
}
export declare class Service implements IService {
    process(): void;
    getData(): Record<string, unknown>;
}
export declare class ConfigService {
    private config;
    setConfig(key: string, value: any): void;
    getConfig(key: string): any;
}
export declare abstract class BaseRepository<T> {
    protected items: T[];
    constructor(items?: T[]);
    findAll(): T[];
    findById(id: string): T | undefined;
    create(item: T): T;
    update(id: string, item: T): T;
    delete(id: string): void;
}
interface User {
    id: string;
    name: string;
    email: string;
}
export declare class UserRepository extends BaseRepository<User> {
    findByEmail(email: string): User | undefined;
}
export declare class UserService {
    private userRepository;
    constructor(userRepository: UserRepository);
    createUser(userData: User): User;
    getUserByEmail(email: string): User | undefined;
}
export {};
