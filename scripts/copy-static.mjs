import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const filesToCopy = [
  ["public/ads.txt", "dist/ads.txt"],
];

for (const [source, destination] of filesToCopy) {
  const sourcePath = resolve(source);
  const destinationPath = resolve(destination);

  await mkdir(dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);

  console.log(`Copied ${source} -> ${destination}`);
}