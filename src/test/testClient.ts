// deno-lint-ignore-file no-explicit-any
import type { Yelix } from '@/src/core/Yelix.ts';
import { Store } from '@/src/test/store.ts';

type CleanupFuntion = (store?: Store<string | any>) => void | Promise<void>;

type Config = {
  method: string;
} & RequestInit;

class YelixTestClient {
  private app: Yelix | null = null;
  private dbCleanups: {
    title: string;
    fn: CleanupFuntion;
  }[] = [];
  
  constructor() {
    this.dbCleanups = [];
  }
  public GlobalStore = new Store<string | any>();

  setApp(app: Yelix) {
    this.app = app;
  }

  cleanup(title: string, fn: CleanupFuntion) {
    this.dbCleanups.push({ title, fn });
  }

  async afterAll() {
    console.log('Cleaning up...', this.dbCleanups);
    for (const cleanup of this.dbCleanups) {
      console.log(`Cleaning up: ${cleanup.title}`);
      console.group();
      await cleanup.fn(this.GlobalStore);
      console.groupEnd();
    }
  }

  async request(path: string, config?: Config) {
    const hono = this.app?.app;
    if (!hono) {
      throw new Error('No app found');
    }

    const res = await hono.request(path, config);

    if (!res) {
      throw new Error('No response');
    }
  
    let response;
    try {
      const clone = res.clone();
      response = await clone.json();
    } catch {
      response = await res.text();
    }
  
    console.log(
      'REQUEST  ',
      `${config?.method} ${path}`,
      config?.body && typeof config.body === 'string'
        ? JSON.parse(config?.body)
        : {}
    );
    console.log('RESPONSE ', response);
  
    return {
      req: res,
      res: {
        responseType: typeof response === 'string' ? 'text' : 'json',
        text: response,
        json: response
      },
    };
  }
  
}

export { YelixTestClient };
