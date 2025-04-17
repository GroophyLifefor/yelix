import type { Middleware } from "@/mod.ts";

const simpleLoggerMiddleware: Middleware = async (request, next, yelix) => {
  const startms = performance.now();
  await next();
  const endms = performance.now();

  const method = request.ctx.req.method;
  const pathname = request.ctx.req.path;
  const status = request.ctx.res.status;
  const duration = endms - startms;

  const colorsByStatus = (status: number) => {
    if (status >= 200 && status < 300) return "green";
    if (status >= 300 && status < 400) return "cyan";
    if (status >= 400 && status < 500) return "yellow";
    if (status >= 500) return "red";
    return "white";
  };

  const isMicroseconds = duration < 1;
  const durationUnit = isMicroseconds ? "μs" : "ms";
  const durationFixed = (isMicroseconds ? duration * 1000 : duration).toFixed(
    0,
  );

  const cacheStatus = request.ctx.get("x-cache");
  let cacheText = "";
  let cacheColorize = "";

  if (cacheStatus) {
    cacheText = "Cache: " + cacheStatus.toUpperCase();

    if (cacheStatus === "hit") {
      cacheColorize = "color: gray;";
    } else {
      cacheColorize = "background-color: white; color: black;";
    }
  } else {
    cacheText = "Cache: not implemented";
    cacheColorize = "color: gray;";
  }

  yelix.logger.info([
    `${method} %c ${cacheText} %c ${pathname} %c${status}%c in ${durationFixed}${durationUnit}`,
    cacheColorize,
    "",
    `color: ${colorsByStatus(status)};`,
    "color: white;",
  ]);
};

export { simpleLoggerMiddleware };
