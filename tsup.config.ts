import fs from "fs/promises";
import fsExists from "fs.promises.exists";
import path from "path";
import { defineConfig } from "tsup";

const copyCerts = async (): Promise<void> => {
  console.log("\u{2139} Createing folders");
  if (await fsExists(path.join(__dirname, "dist", "certs"))) {
    // log warn
    console.log("\u{2139} Removing old certs");
    await fs.rmdir(path.join(__dirname, "dist", "certs"), { recursive: true });
  }
  await fs.mkdir(path.join(__dirname, "dist", "certs"));
  console.log("\u{1F31F} Copying certs");
  console.log("dirname", __dirname);
  await fs.copyFile(
    path.join(__dirname, "src", "certs", "key.pem"),
    path.join(__dirname, "dist", "certs", "key.pem")
  );
  await fs.copyFile(
    path.join(__dirname, "src", "certs", "cert.pem"),
    path.join(__dirname, "dist", "certs", "cert.pem")
  );
  console.log("\u{2713} Certs copied");
};

export default defineConfig((options) => {
  console.log(options);
  return {
    entry: ["src/index.ts"],
    onSuccess: copyCerts,
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
