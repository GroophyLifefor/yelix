import { main } from "@/testing/main.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { request, ResponseType } from "@/mod.ts";

async function getServer() {
  return await main({
    yelix: {
      environment: "test",
    },
  });
}

const app = await getServer();

// Example of paralel testing (getUser describe and hello describe is running in parallel)
describe("Get user endpoint test", () => {
  it("GET /api/getUser", async () => {
    const task = await request(app, "/api/getUser", {
      method: "GET",
    });

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe(ResponseType.JSON);
    expect(task.res.json).toEqual({
      username: "John Doe",
      email: "john@gmail.com",
      age: 25,
      friendNames: ["Alice", "Bob", "Charlie"],
      country: "USA",
    });
  });
});
