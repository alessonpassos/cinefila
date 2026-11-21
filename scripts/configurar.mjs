import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// A variável de ambiente tem prioridade sobre o arquivo local ignorado pelo Git.
let token = process.env.TMDB_READ_TOKEN?.trim() ?? "";
const local = resolve(".env.local");
if (!token && existsSync(local)) {
  const linha = readFileSync(local, "utf8")
    .split(/\r?\n/)
    .find((l) => /^\s*TMDB_READ_TOKEN\s*=/.test(l));
  token =
    linha
      ?.replace(/^\s*TMDB_READ_TOKEN\s*=\s*/, "")
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2") ?? "";
}
mkdirSync("public", { recursive: true });
writeFileSync(
  "public/config.local.json",
  JSON.stringify({ tmdbToken: token }, null, 2),
);
console.log(
  token
    ? "Configuração local pronta. O token não será exibido."
    : "Token não configurado. Veja a seção de credencial no README.md.",
);
