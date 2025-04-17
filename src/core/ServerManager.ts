// deno-lint-ignore-file no-explicit-any
import version from "@/version.ts";
import type { Yelix } from "@/src/core/Yelix.ts";

export class ServerManager {
  private yelix: Yelix;
  private server: any;
  private sigintListener: any;
  private servedInformations: { title: string; description: string }[] = [];
  private isGracefulShutdown: boolean = false;

  constructor(yelix: Yelix) {
    this.yelix = yelix;
  }

  private addLocalInformationToInitiate(addr: any) {
    const hostname = addr.hostname;
    const isLocalhost = hostname === "0.0.0.0";
    const port = addr.port;
    const addrStr = isLocalhost
      ? `http://localhost:${port}`
      : `http://${hostname}:${port}`;

    this.servedInformations.unshift({
      title: "Local",
      description: addrStr,
    });
  }

  onListen(addr: any) {
    this.addLocalInformationToInitiate(addr);

    const packageVersion = version;

    if (this.yelix.isFirstServe) {
      this.yelix.logger.info();
      this.yelix.logger.info([
        "  %c 𝕐 Yelix %c" + packageVersion,
        "color: orange;",
        "color: inherit",
      ]);
      const maxLength = Math.max(...this.servedInformations.map((i) =>
        i.title.length
      )) + 1;
      this.servedInformations.forEach((info) => {
        this.yelix.logger.info(
          `   - ${info.title.padEnd(maxLength)}:  ${info.description}`,
        );
      });
      this.yelix.logger.info();
    }
  }

  addServedInformation(info: { title: string; description: string }) {
    this.servedInformations.push(info);
  }

  startServer(port: number, appFetch: any): Promise<void> {
    this.sigintListener = () => {
      this.yelix.logger.info("interrupted!");
      this.kill();
      Deno.exit();
    };

    Deno.addSignalListener("SIGINT", this.sigintListener);

    return new Promise<void>((resolve) => {
      const handler = async (req: Request) => {
        if (this.isGracefulShutdown) {
          return new Response("Service Unavailable - Server is shutting down", {
            status: 503,
            headers: { Connection: "close" },
          });
        }
        return await appFetch(req);
      };

      this.server = Deno.serve(
        { port, onListen: (addr: any) => this.onListen(addr) },
        handler,
      );
      resolve();
    });
  }

  async kill(forceAfterMs = 3000) {
    if (this.server) {
      try {
        this.yelix.logger.info("Starting graceful server shutdown...");
        this.isGracefulShutdown = true;
        let timeoutId = 0;
        const timeoutPromise = new Promise<void>((resolve) => {
          timeoutId = setTimeout(() => {
            this.yelix.logger.warn("Server shutdown timed out, forcing close");
            resolve();
          }, forceAfterMs);
        });

        const shutdownPromise = this.server.shutdown();

        // Race between normal shutdown and timeout
        await Promise.race([shutdownPromise, timeoutPromise]);
        this.isGracefulShutdown = false;
        clearTimeout(timeoutId);

        Deno.removeSignalListener("SIGINT", this.sigintListener);

        // Clear the reference to prevent any lingering issues
        this.server = null;
      } catch (error) {
        this.yelix.logger.warn(["Error during server shutdown:", error]);
        Deno.removeSignalListener("SIGINT", this.sigintListener);
        this.server = null;
      }
    } else {
      this.yelix.logger.info(
        "You tried to kill the server but it was not running. This is fine.",
      );
    }
  }
}
