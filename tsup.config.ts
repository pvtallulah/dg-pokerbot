import fs from "fs/promises";
import fsExists from "fs.promises.exists";
import path from "path";
import { defineConfig } from "tsup";
import { PrettyConsole } from "./src/utils/prettyConsole";
const prettyConsole = new PrettyConsole();

const copyFiles = async (): Promise<void> => {
  prettyConsole.info("Createing folderse");
  if (await fsExists(path.join(__dirname, "dist", "certs"))) {
    // log warn
    prettyConsole.warn("Removing old certs");
    await fs.rm(path.join(__dirname, "dist", "certs"), { recursive: true });
  }
  if (await fsExists(path.join(__dirname, "dist", "gApi"))) {
    // log warn
    prettyConsole.warn("Removing gApi folder");
    await fs.rm(path.join(__dirname, "dist", "gApi"), { recursive: true });
  }
  await fs.mkdir(path.join(__dirname, "dist", "certs"));
  await fs.mkdir(path.join(__dirname, "dist", "gApi"));
  prettyConsole.assert("Copying certs");
  await fs.copyFile(
    path.join(__dirname, "src", "certs", "key.pem"),
    path.join(__dirname, "dist", "certs", "key.pem")
  );
  await fs.copyFile(
    path.join(__dirname, "src", "certs", "cert.pem"),
    path.join(__dirname, "dist", "certs", "cert.pem")
  );
  if (await fsExists(path.join(__dirname, "src", "gApi", "token.json"))) {
    prettyConsole.assert("Copying gApi token");
    await fs.copyFile(
      path.join(__dirname, "src", "gApi", "token.json"),
      path.join(__dirname, "dist", "gApi", "token.json")
    );
  } else prettyConsole.warn("No gApi token found");
  prettyConsole.success("Files copied");
};

export default defineConfig((options) => {
  return {
    entry: ["src/index.ts"],
    onSuccess: copyFiles,
    splitting: false,
    bundle: true,
    sourcemap: true,
    keepNames: true,
    clean: true,
    format: ["esm", "cjs"],
    minify: false,
    treeshake: false,
    // platform: "node",
    loader: {
      ".json": "file",
    },
    publicDir: "public",
  };
});
