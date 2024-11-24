import { $$, Raboot, response, websocket } from "../dist";

const { wss, route, redirect, files, folders, serve, head, session } =
  new Raboot(__dirname);

// use as type
// I wont have to initialize and just use the prototype

folders("/");

head({
  link: [
    {
      rel: "stylesheet",
      href: "/a.css",
    },
  ],
});

@route("/")
class ac extends response {
  async get() {
    //
    // this.session.nana = "hello";

    return "hello world";
  }
  async post(...args: any[]) {
    return redirect("/");
  }
  eventStream() {
    this.stream.push(() => ({
      data: "nice",
      event: "lol",
      id: 0,
    }));
  }
}

@wss("/chat")
class wst extends websocket {
  async open() {
    this.send = "nice";
  }
  async message(message: string | Buffer | undefined) {
    this.send = message;
  }
  async close(code: number, reason: string) {
    $$.p = "connection closed";
  }
}

// -----
serve({
  path: "/",
});
