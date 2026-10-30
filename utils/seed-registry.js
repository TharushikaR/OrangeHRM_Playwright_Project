import fs from "node:fs";
import path from "node:path";

export const registryPath = path.resolve("playwright/.auth/seed-cleanup.json");

export function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  } catch {
    return null;
  }
}

export function writeRegistry(data) {
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, JSON.stringify(data, null, 2), "utf-8");
}

export function removeRegistry() {
  fs.rmSync(registryPath, { force: true });
}
