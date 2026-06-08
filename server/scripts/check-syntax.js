import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function jsFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const filePath = join(dir, entry);
    return statSync(filePath).isDirectory() ? jsFiles(filePath) : filePath.endsWith(".js") ? [filePath] : [];
  });
}

for (const filePath of jsFiles("src")) {
  execFileSync(process.execPath, ["--check", filePath], { stdio: "inherit" });
}
