import type { Logger } from "@/src/core/Logger.ts";
import type { Yelix } from "@/mod.ts";
import { parseArgs } from "jsr:@std/cli@1.0.15/parse-args";
import * as path from "jsr:@std/path@1.0.8";

function watchHotModuleReload(yelix: Yelix, logger: Logger) {
  const args = parseArgs(Deno.args);
  const cdir = Deno.cwd();
  let outputPath: string = args["yelix-static-endpoint-generation-output"] ||
    args["yelix-sego"] ||
    path.join(cdir, "endpoints.ts");
  if (outputPath.startsWith(".")) {
    outputPath = path.join(cdir, outputPath);
  }
  const fileName = path.basename(outputPath);

  addEventListener("hmr", async (e) => {
    const event = e as unknown as {
      type: string;
      detail: { path: string };
    };

    logger.clientLog("╓───────────────────────────────────────────────");
    logger.setPrefix("║ ");

    const isEndpointFile = event.detail.path.endsWith(fileName);
    if (isEndpointFile) {
      logger.clientLog("Output file changed, skipping HMR.");
      logger.endPrefix();
      logger.clientLog("╙───────────────────────────────────────────────");
      return;
    }

    await resolveEndpoints();

    const descriptionByEventType = {
      hmr: "Hot Module Reload - Server will restart.",
    };

    const description = descriptionByEventType[
      event.type as keyof typeof descriptionByEventType
    ] || "Unknown event type";

    logger.clientLog(
      "%c[%s], %s",
      "color: #007acc;",
      event.type.toUpperCase(),
      description,
    );
    logger.clientLog("Changed Module Path: %s", event.detail.path);
    await yelix.restartEndpoints("", "", "");
    logger.endPrefix();
    logger.clientLog("╙───────────────────────────────────────────────");
  });
}

async function resolveEndpoints() {
  const args = parseArgs(Deno.args);
  const targetFolder = args["yelix-static-endpoint-generation"] ||
    args["yelix-seg"];

  if (!targetFolder) {
    return;
  }

  const cdir = Deno.cwd();
  const mergedPath = path.join(cdir, targetFolder);
  let outputPath: string = args["yelix-static-endpoint-generation-output"] ||
    args["yelix-sego"] ||
    path.join(cdir, "endpoints.ts");
  if (outputPath.startsWith(".")) {
    outputPath = path.join(cdir, outputPath);
  }

  await generateEndpointsFile(mergedPath, outputPath);
}

async function walkDirectory(
  directoryPath: string,
  fileHandler: (args: { path: string; fileInfo: Deno.FileInfo }) => void,
) {
  const fileInfo = await Deno.lstat(directoryPath);
  fileHandler({ fileInfo, path: directoryPath });

  if (fileInfo.isDirectory) {
    const entries = await Deno.readDir(directoryPath);
    for await (const entry of entries) {
      await walkDirectory(path.join(directoryPath, entry.name), fileHandler);
    }
  }
}

function generateImportStatement(filePath: string, basePath: string): string {
  const relativePath = "." +
    filePath.replace(basePath, "").replaceAll("\\", "/").replaceAll("//", "/");
  return `  await import("${relativePath}"),\n`;
}

async function generateEndpointsFile(rootPath: string, outputPath: string) {
  const folderPathOfOutput = path.dirname(outputPath);
  let endpointsContent = "const endpoints = [\n";

  await walkDirectory(rootPath, (file) => {
    const extension = path.extname(file.path);
    if (file.fileInfo.isFile && (extension === ".ts" || extension === ".js")) {
      endpointsContent += generateImportStatement(
        file.path,
        folderPathOfOutput,
      );
    }
  });

  endpointsContent += "\n];\nexport default endpoints;\n";
  await Deno.writeTextFile(outputPath, endpointsContent);
}

export { watchHotModuleReload };
