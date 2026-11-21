import {
  readdirSync,
  lstatSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";

// Lista permitida: nunca empacotar o diretório inteiro ou usar apenas .gitignore.
const raizes = ["src", "public", "scripts", "tests", "docs"];
const arquivosRaiz = [
  "package.json",
  "package-lock.json",
  "angular.json",
  "ionic.config.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "playwright.config.ts",
  ".gitignore",
  ".env.example",
  "README.md",
  "MAPA_DO_CODIGO.md",
];
const zip = new JSZip();
let quantidade = 0;
const tokenLocal = existsSync("public/config.local.json")
  ? JSON.parse(readFileSync("public/config.local.json", "utf8")).tmdbToken
  : "";

function adicionar(caminho) {
  if (
    /(^|\/)(node_modules|dist|\.git|\.angular|test-results|playwright-report)(\/|$)/.test(
      caminho,
    ) ||
    /\.local\./.test(caminho) ||
    /(^|\/)\.env(?!\.example$)/.test(caminho)
  )
    return;
  const stat = lstatSync(caminho);
  if (stat.isSymbolicLink())
    throw new Error(`Link simbólico não permitido no ZIP: ${caminho}`);
  if (stat.isDirectory()) {
    for (const nome of readdirSync(caminho).sort())
      adicionar(join(caminho, nome));
    return;
  }
  const dados = readFileSync(caminho);
  const texto = dados.toString("utf8");
  if (
    (tokenLocal && tokenLocal.length >= 12 && texto.includes(tokenLocal)) ||
    /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/.test(texto)
  )
    throw new Error(
      `Possível credencial em ${caminho}. Revise antes de gerar o ZIP.`,
    );
  if (caminho === ".env.example" && /^TMDB_READ_TOKEN=.+$/m.test(texto))
    throw new Error(".env.example precisa estar sem token.");
  zip.file(`cinefila/${caminho.replaceAll("\\", "/")}`, dados);
  quantidade++;
}
for (const caminho of [...arquivosRaiz, ...raizes])
  if (existsSync(caminho)) adicionar(caminho);
mkdirSync("entrega", { recursive: true });
writeFileSync(
  "entrega/cinefila.zip",
  await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  }),
);
console.log(
  `ZIP pronto: entrega/cinefila.zip (${quantidade} arquivos, sem dependências, build ou configuração local).`,
);
