# Cinefila

Catálogo de filmes desenvolvido com **Ionic 8 e Angular 20 standalone**, com interface em português do Brasil. Permite descobrir filmes populares, pesquisar por título, consultar fichas e manter uma lista pessoal no navegador.

## Funcionalidades

| Página | Rota | Recursos |
| --- | --- | --- |
| Home | `/home` | Filmes populares com pôster, título e nota. |
| Buscar | `/buscar` | Pesquisa por título, resultados clicáveis e indicação de busca sem resultados. |
| Detalhes | `/filmes/:id` | Pôster, sinopse, lançamento, duração, gêneros, nota, elenco e botão para salvar ou remover. |
| Minha lista | `/minha-lista` | Filmes salvos, acesso aos detalhes, remoção e indicação de lista vazia. |

A interface possui tema escuro, grades responsivas e tratamento de carregamento, erros de conexão e dados ausentes. Pôsteres, sinopses e informações de elenco indisponíveis recebem alternativas textuais.

## Tecnologias

- Ionic 8, Angular 20 e TypeScript.
- Componentes standalone e Angular Router.
- HttpClient e RxJS para consultas à TMDB.
- Signals e localStorage para a lista de filmes.
- SCSS para estilos e layout responsivo.
- Node Test Runner, Happy DOM e Playwright para testes.

## Pré-requisitos

- Node.js 22, a partir da versão 22.12, ou Node.js 24.
- npm e um navegador atualizado.
- Conexão com a internet para instalar dependências e consultar `api.themoviedb.org` e `image.tmdb.org`.
- Token de Leitura da API da TMDB (API Read Access Token).

Angular CLI e Ionic CLI não precisam ser instalados globalmente. O aplicativo pode ser executado no navegador, sem Android Studio.

## Instalação

Na pasta `cinefila`, execute:

```bash
npm ci
```

O `package-lock.json` fixa as versões utilizadas para reproduzir a instalação.

## Configuração da TMDB

Copie `.env.example` para `.env.local`:

```bash
# Linux/macOS
cp .env.example .env.local
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

No arquivo `.env.local`, preencha `TMDB_READ_TOKEN=` com o token de leitura, em uma única linha e **sem o prefixo Bearer**. Use o token de leitura, não a chave curta v3 nem um token de sessão de usuário. O token pode ser obtido nas [configurações da API da TMDB](https://www.themoviedb.org/settings/api).

Uma variável de ambiente `TMDB_READ_TOKEN` já definida tem prioridade sobre `.env.local`. Ao alterar a credencial, reinicie o servidor.

O script `scripts/configurar.mjs` gera `public/config.local.json`. O arquivo é lido antes da inicialização do Angular, e `FilmesService` envia a credencial à TMDB pelo cabeçalho `Authorization: Bearer …`. O script não imprime o token.

`.env.local`, `config.local.json`, `dist/` e `node_modules/` são ignorados pelo Git e excluídos do ZIP. Como o aplicativo executa no cliente, **o token fica visível ao navegador durante o uso**. Para uma implantação pública com credencial protegida, é necessário um backend. O build com a configuração local não deve ser publicado com um token privado.

Sem token, as páginas que consultam a API exibem uma orientação de configuração. A lista já armazenada no navegador continua acessível. O aplicativo não substitui consultas reais por dados fictícios.

## Execução

```bash
npm start
```

Acesse [http://localhost:8100](http://localhost:8100). Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Integração com a API

URL base: `https://api.themoviedb.org/3`.

| Método do service | Endpoint GET | Uso |
| --- | --- | --- |
| `listarPopulares()` | `/movie/popular?language=pt-BR` | Home. |
| `buscarPorTitulo(titulo)` | `/search/movie?query=...&language=pt-BR&include_adult=false` | Busca por título. |
| `obterDetalhes(id)` | `/movie/:id?language=pt-BR` | Ficha do filme. |
| `obterElenco(id)` | `/movie/:id/credits` | Atores e personagens. |

A Home e a busca exibem a primeira página de resultados da TMDB. A busca aguarda 350 ms sem novas alterações antes de consultar a API e cancela consultas anteriores quando o texto muda. O elenco inclui todos os atores retornados.

Os cards apontam para `/filmes/ID`. A página de detalhes lê `ActivatedRoute.paramMap`, valida o ID e consulta ficha e elenco. A navegação não depende de dados recebidos da página anterior, permitindo acesso direto e recarga da URL.

## Persistência e formatação

`MinhaListaService` armazena resumos dos filmes na chave `cinefila.minha-lista.v1` do localStorage. Cada ID aparece uma única vez. O estado reativo mantém a lista, o contador e o botão de salvar sincronizados; alterações em outra aba da mesma origem também atualizam o estado.

A persistência é restrita ao navegador e à origem utilizados, sem conta ou sincronização entre dispositivos. Dados inválidos e falhas de gravação geram avisos.

O pipe `duracaoFilme` converte minutos em horas e minutos. `resumoGeneros` exibe até dois gêneros e resume os demais como `+N`. Os pipes nativos `date` e `number` utilizam o locale `pt-BR` para formatar datas e notas.

A diretiva `appDestaqueNota` destaca notas brutas iguais ou superiores a 8. A diretiva `appEstadoSalvo` atualiza a aparência e o atributo `aria-pressed` do botão de salvar.

## Estrutura do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/main.ts` | Configuração local e inicialização standalone. |
| `src/app/app.config.ts` | Providers do Ionic, HttpClient, Router e locale. |
| `src/app/app.routes.ts` | Rotas e carregamento das páginas. |
| `src/app/pages/` | Classes, templates e estilos das páginas. |
| `src/app/core/services/` | Consultas à API e persistência da lista. |
| `src/app/shared/pipes/` | Formatação de duração e gêneros. |
| `src/app/shared/directives/` | Destaque de notas e estado salvo. |
| `src/app/shared/components/` | Cards, pôsteres, estados de tela e créditos. |
| `src/global.scss` | Tema e estilos compartilhados. |
| `scripts/` | Configuração local, verificação de referências e geração do ZIP. |
| `tests/` | Testes unitários e de navegador. |

Referências de arquivos e símbolos: [MAPA_DO_CODIGO.md](MAPA_DO_CODIGO.md).

## Build

```bash
npm run build
```

Os arquivos são gerados em `dist/cinefila/browser`. O build inclui a configuração local gerada pelo script e deve ser tratado como conteúdo que contém a credencial configurada.

Ao servir o build, configure o servidor para retornar `index.html` nas rotas do Angular, incluindo `/filmes/:id`. O servidor de desenvolvimento já fornece esse fallback. Não abra o HTML diretamente por `file://`.

## Testes

Testes unitários:

```bash
npm run test:unit
```

Testes de navegador com respostas controladas da API:

```bash
npx playwright install chromium
npm run test:e2e
```

O comando `npm test` executa as duas suítes em sequência. Em Linux, o Playwright pode exigir bibliotecas adicionais do sistema. Os dados simulados são utilizados somente nos testes e não fazem parte do fluxo normal do aplicativo.

As verificações cobrem endpoints, parâmetros, formatação, persistência, duplicatas, erros e navegação. Testes simulados não validam a disponibilidade da TMDB nem a credencial local.

Para verificar os links e os termos do mapa do código:

```bash
npm run verificar:mapa
```

## Gerar ZIP e enviar

Para gerar um pacote dos fontes que possa ser compartilhado e instalado em outro computador:

```bash
npm run zip
```

O arquivo é criado em `entrega/cinefila.zip`. O script usa uma lista de arquivos e pastas permitidos e exclui dependências instaladas, builds, caches, metadados do Git, relatórios de testes e configurações locais. O pacote inclui `.env.example` sem credencial.

O empacotamento também verifica a presença do token local conhecido e de padrões reconhecíveis de JWT nos arquivos. Essa verificação não substitui a revisão dos fontes antes de compartilhá-los. Após extrair o ZIP, execute `npm ci` e configure a credencial localmente.

## Créditos

Dados e imagens de filmes: [TMDB](https://www.themoviedb.org). Este produto utiliza a API da TMDB, mas não é endossado ou certificado pela TMDB. A atribuição também está disponível no rodapé das páginas.

> This product uses the TMDB API but is not endorsed or certified by TMDB.
