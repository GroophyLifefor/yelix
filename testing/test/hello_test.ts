import { main } from '../main.ts';
import { describe, it, beforeAll, afterAll } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { YelixTestClient } from "@/mod.ts";

const test = new YelixTestClient();

beforeAll(async () => {
  const app = await main({
    yelix: {
      debug: false,
      port: 3030,
    },
    app: {
      serve: false,
    },
  });
  test.setApp(app);
});

afterAll(test.afterAll);

describe('Hello endpoint test', () => {
  test.cleanup('Killing email service', () => {
    const _data = test.GlobalStore.get('data');
    console.log('Data:', _data);
  });

  it('GET /api/hello', async () => {
    const task = await test.request('/api/hello?name=world');

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe('string');
    expect(await task.res.text).toBe('Hello, world');

    test.GlobalStore.set('data', 'hello, world');
  });
});
