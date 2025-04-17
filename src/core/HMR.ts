import type { Yelix } from "@/mod.ts";
import { parseArgs } from "jsr:@std/cli@1.0.15/parse-args";
import * as path from "jsr:@std/path@1.0.8";

const CACHED_ARGS = parseArgs(Deno.args);
const CDIR = Deno.cwd();

function watchHotModuleReload(yelix: Yelix) {
  const outputPath = getOutputPath();
  const fileName = path.basename(outputPath);

  addEventListener("hmr", async (e) => {
    const event = e as unknown as {
      type: string;
      detail: { path: string };
    };

    yelix.logger.info("╓───────────────────────────────────────────────");
    yelix.logger.startPrefix("║ ");

    const isEndpointFile = event.detail.path.endsWith(fileName);
    if (isEndpointFile) {
      yelix.logger.info("Output file changed, skipping HMR.");
      yelix.logger.endPrefix();
      yelix.logger.info("╙───────────────────────────────────────────────");
      return;
    }

    await resolveEndpoints();

    const descriptions = {
      hmr: "Hot Module Reload - Server will restart.",
    };

    const description = descriptions[event.type as keyof typeof descriptions] ||
      "Unknown event type";

    yelix.logger.info([
      "%c[%s], %s",
      "color: #007acc;",
      event.type.toUpperCase(),
      description,
    ]);
    yelix.logger.info(["Changed Module Path: %s", event.detail.path]);
    await yelix.restartEndpoints("", "", "");
    yelix.logger.endPrefix();
    yelix.logger.info("╙───────────────────────────────────────────────");
  });
}

function getOutputPath(): string {
  let outputPath: string =
    CACHED_ARGS["yelix-static-endpoint-generation-output"] ||
    CACHED_ARGS["yelix-sego"] ||
    path.join(CDIR, "endpoints.ts");

  if (outputPath.startsWith(".")) {
    outputPath = path.join(CDIR, outputPath);
  }

  return outputPath;
}

async function resolveEndpoints() {
  const targetFolder = CACHED_ARGS["yelix-static-endpoint-generation"] ||
    CACHED_ARGS["yelix-seg"];

  if (!targetFolder) {
    return;
  }

  const mergedPath = path.join(CDIR, targetFolder);
  const outputPath = getOutputPath();

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
  const importStatements: string[] = [];

  await walkDirectory(rootPath, (file) => {
    const extension = path.extname(file.path);
    if (file.fileInfo.isFile && (extension === ".ts" || extension === ".js")) {
      importStatements.push(
        generateImportStatement(file.path, folderPathOfOutput),
      );
    }
  });

  const endpointsContent = "const endpoints = [\n" +
    importStatements.join("") +
    "\n];\nexport default endpoints;\n";

  await Deno.writeTextFile(outputPath, endpointsContent);
}

export { watchHotModuleReload };
