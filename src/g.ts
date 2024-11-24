import { Server } from "bun";
import { $$, isStr, makeID, oAss, obj, parsePath, Singleton } from "./core/@";
import { websocket } from "./core/wss";

/*
-------------------------
ROUTER --
-------------------------
*/

/*
-------------------------
do not nest 
-------------------------
*/

// Factory

interface User {
  name: string;
  age: number;
}

class User implements User {
  constructor(
    public name: string,
    public age: number,
  ) {}
}

class UserFactory {
  createUser(name: string, age: number) {
    return new User(name, age);
  }
}

// Module Pattern for my router

// Interface driven
interface IService {
  process(): void;
  getData(): Record<string, unknown>;
}

export class Service implements IService {
  process(): void {
    // Implementation
  }

  getData(): Record<string, unknown> {
    return {};
  }
}

@Singleton
export class ConfigService {
  private config: Record<string, any> = {};

  setConfig(key: string, value: any): void {
    this.config[key] = value;
  }

  getConfig(key: string): any {
    return this.config[key];
  }
}

const c1 = new ConfigService();
const c2 = new ConfigService();

// Singleton proxy

/*
-------------------------

-------------------------
*/

/*
-------------------------
Repository Pattern:
-------------------------
*/

export abstract class BaseRepository<T> {
  constructor(protected items: T[] = []) {}

  findAll(): T[] {
    return this.items;
  }

  findById(id: string): T | undefined {
    return this.items.find((item) => (item as any).id === id);
  }

  create(item: T): T {
    this.items.push(item);
    return item;
  }

  update(id: string, item: T): T {
    const index = this.items.findIndex((i) => (i as any).id === id);
    if (index !== -1) {
      this.items[index] = item;
    }
    return item;
  }

  delete(id: string): void {
    const index = this.items.findIndex((i) => (i as any).id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}

interface User {
  id: string;
  name: string;
  email: string;
}

export class UserRepository extends BaseRepository<User> {
  findByEmail(email: string): User | undefined {
    return this.items.find((user) => user.email === email);
  }

  // Add more specific user-related query methods
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  createUser(userData: User): User {
    return this.userRepository.create(userData);
  }

  getUserByEmail(email: string): User | undefined {
    return this.userRepository.findByEmail(email);
  }
}
