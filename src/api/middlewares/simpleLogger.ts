import type { Middleware } from '@/mod.ts';

const simpleLoggerMiddeware: Middleware = async (request, next, yelix) => {
  const startms = performance.now();
  await next();
  const endms = performance.now();

  const method = request.ctx.req.method;
  const pathname = request.ctx.req.path;
  const status = request.ctx.res.status;
  const duration = endms - startms;

  const colorsByStatus = (status: number) => {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'cyan';
    if (status >= 400 && status < 500) return 'yellow';
    if (status >= 500) return 'red';
    return 'white';
  };

  const isMicroseconds = duration < 1;
  const durationUnit = isMicroseconds ? 'μs' : 'ms';
  const durationFixed = (isMicroseconds ? duration * 1000 : duration).toFixed(0);

  yelix.clientLog(
    `${method} ${pathname} %c${status}%c in ${durationFixed}${durationUnit}`,
    `color: ${colorsByStatus(status)};`,
    'color: white;'
  );
};

export { simpleLoggerMiddeware };
