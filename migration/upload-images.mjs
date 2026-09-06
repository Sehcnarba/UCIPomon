// Script de migração — corre-se UMA VEZ, depois de criares o bucket R2
// (ver README.md), para carregar as 38 imagens já comprimidas para lá.
//
// Uso (a partir da raiz do projeto):
//   node migration/upload-images.mjs
//
// Precisa do wrangler instalado (npm install) e sessão iniciada (wrangler login).

import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, "images");
const bucket = "ucipomon-images";

// No Windows, "npx" é na verdade "npx.cmd", e o Node só consegue arrancar
// ficheiros .cmd/.bat se passar pela shell (senão dá erro EINVAL, mesmo com
// o nome certo) — por isso o "shell: true" ali em baixo, só no Windows.
const isWindows = process.platform === "win32";
const npxCommand = isWindows ? "npx.cmd" : "npx";

const files = readdirSync(imagesDir).filter((f) => f.toLowerCase().endsWith(".jpg"));

if (files.length === 0) {
  console.error(`Nenhuma imagem encontrada em ${imagesDir}`);
  process.exit(1);
}

console.log(`A carregar ${files.length} imagens para o bucket "${bucket}"...\n`);

let ok = 0;
let failed = 0;

for (const file of files) {
  const localPath = join(imagesDir, file);
  const key = `people/${file}`;
  try {
    execFileSync(
      npxCommand,
      ["wrangler", "r2", "object", "put", `${bucket}/${key}`, `--file=${localPath}`, "--remote"],
      { stdio: "inherit", shell: isWindows }
    );
    ok++;
  } catch (err) {
    console.error(`Falhou: ${file} — ${err.message}`);
    failed++;
  }
}

console.log(`\nConcluído: ${ok} carregadas, ${failed} falhadas.`);
if (failed > 0) process.exit(1);