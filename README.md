# Cinefila

Catálogo de filmes em **Ionic 8 + Angular 20 standalone**, com interface em português do Brasil. Home, Buscar, Detalhes e Minha lista formam um fluxo completo: descobrir, conhecer e guardar um filme para depois.

**Apresentação:** abra o [MAPA_DO_CODIGO.md](MAPA_DO_CODIGO.md). Ele divide os requisitos entre cinco integrantes, aponta implementação e uso com termos de Ctrl+F e traz o roteiro de demonstração e uma fala para cada pessoa.

## Pré-requisitos

- Node.js **22.12 ou superior na versão 22**, ou **Node.js 24**. Recomendação para o laboratório: Node.js 22 LTS atualizado. Confira com `node --version` e `npm --version`.
- npm, que acompanha o Node.js; Chrome ou Edge atualizado; editor de código, como VS Code.
- Internet para instalar dependências e acessar `api.themoviedb.org` e `image.tmdb.org`.
- Uma conta na TMDB com **Token de Leitura da API** (API Read Access Token).

Não é necessário instalar Angular CLI ou Ionic CLI globalmente, nem Android Studio. A apresentação é feita no navegador do computador do laboratório.

## Instalar e executar

Abra um terminal **dentro da pasta `cinefila`**, e execute:

```bash
npm ci
```

Copie `.env.example` para `.env.local`. Pode fazer isso pelo editor ou pelo terminal:

```bash
# Linux/macOS
cp .env.example .env.local
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

Preencha `TMDB_READ_TOKEN=` no arquivo `.env.local` com o token de leitura da sua conta, em uma única linha, **sem a palavra Bearer**. Use o token longo de leitura; não use a chave curta v3 nem um token de sessão de usuário. Consulte [Configurações da API da TMDB](https://www.themoviedb.org/settings/api) e [Autenticação oficial](https://developer.themoviedb.org/docs/authentication-application).

```bash
npm start
```

Abra **[http://localhost:8100](http://localhost:8100)**. Para encerrar, use `Ctrl+C` no terminal. Ao trocar o token, encerre e execute `npm start` novamente. Uma variável de ambiente `TMDB_READ_TOKEN` já definida tem prioridade sobre `.env.local`.

Sem token, o app inicia e mostra a orientação de configuração na Home. Ele **não usa dados fictícios como alternativa à API**. Minha lista continua acessível com o que já foi salvo naquele navegador.

### Como a configuração funciona

`scripts/configurar.mjs` lê o token e gera `public/config.local.json`, ignorado pelo Git. `src/main.ts` lê esse arquivo antes de iniciar o Angular. `FilmesService` recebe a configuração por injeção e envia o cabeçalho `Authorization: Bearer …` somente à TMDB. O script não imprime o token.

`.env.local`, `config.local.json`, `dist/` e `node_modules/` ficam fora do Git e do ZIP gerado. **O token é visível ao navegador enquanto o aplicativo está rodando**, pois esta é uma aplicação cliente. Ignorar os arquivos protege a entrega e o repositório, mas não torna a credencial um segredo no navegador. Não publique o build com seu token; para uma implantação pública com credencial protegida, seria necessário um backend. Não compartilhe capturas da aba Rede que mostrem o valor de Authorization.

## Usar o aplicativo

| Página     | Rota             | O que fazer                                                                                                 |
| ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Home        | `/home`        | Ver os populares, com pôster, título e nota; clicar em qualquer card.                                     |
| Buscar      | `/buscar`      | Digitar um título; aguardar a busca; abrir um resultado. Busca sem correspondência tem mensagem própria. |
| Detalhes    | `/filmes/:id`  | Ver ficha, sinopse, lançamento, duração, gêneros, nota e elenco; salvar ou remover.                     |
| Minha lista | `/minha-lista` | Abrir um filme salvo ou removê-lo. A lista vazia tem orientação para começar.                           |

A Home exibe a primeira página de populares. A busca exibe até a primeira página da resposta, informa a quantidade e permite refinar pelo título. Consultas anteriores são canceladas quando o texto muda. O elenco mostra todos os atores retornados, com personagem e alternativa quando não há foto.

**Ponto extra:** os cards criam links para `/filmes/ID`. Detalhes lê `ActivatedRoute.paramMap`, valida o ID e busca ficha e elenco com ele. Não depende de `history.state` nem do objeto vindo da Home. Recarregue a URL ou cole-a em outra aba para demonstrar. O servidor iniciado por `npm start` fornece o fallback para o Angular. Se servir o build em outro servidor, configure todas as rotas desconhecidas para retornarem `index.html`; não abra o HTML por `file://`.

**Persistência:** a chave `cinefila.minha-lista.v1` armazena somente resumos dos filmes no `localStorage`. A lista é do navegador e da origem usados, sem conta ou sincronização entre computadores. Ela persiste após recarregar; alterações em outra aba da mesma origem atualizam o estado. Dados inválidos e falhas de gravação geram aviso sem interromper a interface.

## Estrutura do código

| Caminho                                                               | Responsabilidade                                                  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts` | Bootstrap standalone, providers, locale e rotas.                  |
| `src/app/pages/`                                                    | As quatro páginas, cada uma com classe e template próprios.     |
| `src/app/core/services/filmes.service.ts`                           | HttpClient e os quatro métodos GET da TMDB.                      |
| `src/app/core/services/minha-lista.service.ts`                      | Persistência, prevenção de duplicatas e estado reativo.        |
| `src/app/shared/pipes/`                                             | `duracaoFilme` e `resumoGeneros`.                             |
| `src/app/shared/directives/`                                        | `appDestaqueNota` e `appEstadoSalvo`.                         |
| `src/app/shared/components/`                                        | Cards, pôsteres, estados de tela e atribuição à TMDB.         |
| `src/global.scss`                                                   | Tema, grades responsivas e estilos usados pelas diretivas.        |
| `tests/`                                                            | Testes unitários/integrados e roteiro automatizado de navegador. |

## Build e testes

```bash
npm run build
npm run test:unit
npm run verificar:mapa
```

O build é gerado em `dist/cinefila/browser`. Ele inclui a configuração local gerada durante o build, por isso **não deve ser colocado no Git nem no ZIP**. O arquivo de dependências `package-lock.json` acompanha a entrega para reproduzir a instalação com `npm ci`.

Para executar os testes de navegador com respostas controladas, sem precisar de token real:

```bash
npx playwright install chromium
npm run test:e2e
```

No Linux, caso faltem bibliotecas do sistema, o administrador do laboratório pode instalar as dependências indicadas pelo Playwright. `npm test` executa os testes unitários e os de navegador em sequência. Os testes interceptam as requisições somente no ambiente de teste; não alteram o aplicativo nem acessam dados pessoais.

Consulte [docs/VALIDACAO.md](docs/VALIDACAO.md) para o que foi efetivamente executado nesta entrega e as limitações do ambiente. **Testes com respostas simuladas não certificam a disponibilidade da TMDB nem a validade do token.**

## Preparar a apresentação no laboratório

1. Com os cinco integrantes presentes, configure o token local, execute `npm ci` e `npm start` e abra o mapa no editor.
2. Abra Home e confirme pôsteres reais. Em Buscar, teste um título conhecido. **Interestelar** é uma sugestão para o ensaio, mas não foi verificado com uma credencial nesta entrega. Escolham um resultado real e anotem seu ID após confirmar ficha e elenco.
3. Confiram uma nota bruta de pelo menos 8 para demonstrar o destaque. A diretiva usa o valor bruto, enquanto `number` arredonda a exibição; 7,99 aparece como 8,0, mas não recebe destaque.
4. Abram as ferramentas do navegador (`F12`) na aba **Rede**, filtro **Fetch/XHR**. Recarreguem Home, façam uma busca e abram Detalhes. Demonstrem os quatro GETs, os caminhos e os parâmetros, sem exibir a credencial.
5. Recarreguem `/filmes/ID` e confirmem ficha e elenco; salvem, recarreguem, abram Minha lista, removam e confirmem a atualização do botão.
6. Testem uma busca como `zzzzfilmeinexistente987654`, a lista vazia e a visualização móvel. Voltem à largura normal para apresentar ao professor.
7. Cada integrante apresenta sua seção do mapa: **o que faz, onde está no código e onde aparece na tela**. O professor não conduzirá a demonstração. Informem os nomes associados aos números do mapa antes de começar.

## Gerar ZIP e enviar

Depois de validar o projeto:

```bash
npm run verificar:mapa
npm run zip
```

O resultado é `entrega/cinefila.zip`, pronto para extrair em outro computador. O script usa uma lista de pastas e arquivos permitidos; exclui `node_modules`, builds, caches, Git, relatórios de teste, `.env.local` e todo arquivo `.local.*`. Inclui `.env.example` vazio. Ele também impede a inclusão do token local conhecido ou de um JWT reconhecível em outros arquivos. Nunca colem credenciais nos fontes ou na documentação.

Para conferir manualmente, abra o ZIP no explorador e confirme que `package-lock.json`, `src/`, `README.md` e `MAPA_DO_CODIGO.md` existem, e que os diretórios e arquivos privados acima não existem. Extraia-o em uma pasta nova e siga a instalação para ensaiar a entrega.

**Um integrante escolhido pelo grupo** publica os fontes no próprio perfil do GitHub e envia o ZIP no Teams. Essas duas ações não foram feitas nesta entrega. Antes de fazer commit, confira os arquivos preparados pelo Git e preserve o `.gitignore`; não use `git add -f` em arquivos locais. O build, o token e as dependências serão preparados separadamente no computador do laboratório. Todos os cinco devem estar presentes e entender sua responsabilidade.

## Referência oficial e atribuição

O [enunciado oficial em PDF](docs/REQUISITOS_OFICIAIS.pdf), fornecido como “Requisitos - Projeto - IONIC(1).pdf”, acompanha a entrega. O mapa contém a conferência requisito por requisito. O pedido detalha o tema de filmes e divide a apresentação entre cinco pessoas, dentro do intervalo de 5–6 permitido pelo PDF. Foram implementados **quatro GETs**, superando o mínimo de três. O PDF recomenda APIs sem cabeçalho para facilitar, mas deixa a escolha aberta e cita a TMDB, que utiliza token. Portanto, não houve conflito que exigisse substituir a API ou remover algum requisito.

Dados e imagens de filmes: [TMDB](https://www.themoviedb.org). Este produto utiliza a API da TMDB, mas não é endossado ou certificado pela TMDB. A mesma atribuição aparece em **Créditos**, no rodapé das quatro páginas.

> This product uses the TMDB API but is not endorsed or certified by TMDB.

Fontes técnicas: [Ionic Angular](https://ionicframework.com/docs/angular/overview), [Angular standalone](https://angular.dev/reference/migrations/standalone), [populares](https://developer.themoviedb.org/reference/movie-popular-list), [busca](https://developer.themoviedb.org/reference/search-movie), [detalhes](https://developer.themoviedb.org/reference/movie-details), [elenco](https://developer.themoviedb.org/reference/movie-credits) e [atribuição TMDB](https://developer.themoviedb.org/docs/faq).
