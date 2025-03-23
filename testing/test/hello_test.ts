import { main } from '../main.ts';
import { describe, it } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { request, ResponseType } from '@/mod.ts';

async function getServer() {
  return await main({
    isTest: true,
  });
}

const app = await getServer();

// Example of step by step testing
describe('Hello endpoint test', () => {
  it('CACHE HIT - GET /api/hello', async () => {
    const task = await request(app, '/api/hello?name=world', {
      method: 'GET',
    });

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe(ResponseType.TEXT);
    expect(task.res.text).toBe('Hello, world');
  });

  it('CACHE MISS - GET /api/hello', async () => {
    const task = await request(app, '/api/hello?name=world', {
      method: 'GET',
    });

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe(ResponseType.TEXT);
    expect(task.res.text).toBe('Hello, world - (cached)');
  });

  it('NO LOGGING - GET /api/hello', async () => {
    const task = await request(app, '/api/hello?name=world', {
      method: 'GET',
      logging: false,
    });

    expect(task.req.status).toBe(200);
    expect(task.res.responseType).toBe(ResponseType.TEXT);
    expect(task.res.text).toBe('Hello, world - (cached)');
  });
});
