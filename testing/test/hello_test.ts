import { main } from "../main.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { request } from "@/mod.ts";

async function getServer() {
  return await main({
    showWelcomeMessage: false,
    environment: "test",
  });
}

describe("Hello endpoint test", () => {
  it("GET /api/hello", async () => {
    const app = await getServer();

    const task = await request(app, "/api/hello?name=world", {
      method: "GET",
    });

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe("text");
    expect(task.res.text).toBe("Hello, world");
  });
});

describe("Another Hello endpoint test", () => {
  it("GET /api/hello", async () => {
    const app = await getServer();

    const task = await request(app, "/api/hello?name=world", {
      method: "GET",
    });

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe("text");
    expect(task.res.text).toBe("Hello, world");
  });
});
