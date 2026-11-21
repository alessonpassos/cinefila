import { test, expect, Page } from "@playwright/test";

// Respostas controladas só para testes. Não são importadas pelo aplicativo.
const filme = {
  id: 42,
  title: "Horizonte de teste",
  poster_path: "/poster-teste.jpg",
  release_date: "2014-11-07",
  vote_average: 8.66,
  runtime: 142,
  overview:
    "Uma equipe explora novos caminhos em uma história criada para os testes.",
  genres: [
    { id: 1, name: "Ação" },
    { id: 2, name: "Ficção científica" },
    { id: 3, name: "Drama" },
  ],
};
const segundo = {
  ...filme,
  id: 43,
  title: "Outro horizonte",
  vote_average: 6.45,
};
const creditos = {
  id: 42,
  cast: [
    {
      id: 1,
      credit_id: "ator-1",
      name: "Atriz de teste",
      character: "Comandante",
      profile_path: null,
    },
    {
      id: 2,
      credit_id: "ator-2",
      name: "Ator de teste",
      character: "Explorador",
      profile_path: null,
    },
  ],
};
const pagina = (results: unknown[]) => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
});
type Consulta = {
  path: string;
  params: URLSearchParams;
  method: string;
  authorization: string | undefined;
};

async function preparar(page: Page) {
  const chamadas: Consulta[] = [];
  await page.route("**/config.local.json", (route) =>
    route.fulfill({
      json: { tmdbToken: "TOKEN_FICTICIO_EXCLUSIVO_DOS_TESTES" },
    }),
  );
  await page.route("https://image.tmdb.org/**", (route) => route.abort());
  await page.route("https://api.themoviedb.org/3/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    chamadas.push({
      path: url.pathname,
      params: url.searchParams,
      method: req.method(),
      authorization: req.headers()["authorization"],
    });
    if (url.pathname.endsWith("/credits"))
      return route.fulfill({ json: creditos });
    if (url.pathname.endsWith("/popular"))
      return route.fulfill({ json: pagina([filme, segundo]) });
    if (url.pathname.endsWith("/search/movie"))
      return route.fulfill({
        json: pagina(
          url.searchParams.get("query")?.startsWith("zzzz") ? [] : [filme],
        ),
      });
    if (url.pathname.endsWith("/999"))
      return route.fulfill({
        status: 404,
        json: { status_message: "Not found" },
      });
    return route.fulfill({
      json: url.pathname.endsWith("/43") ? segundo : filme,
    });
  });
  return chamadas;
}
const paginaVisivel = (page: Page) =>
  page.locator("ion-router-outlet > :not(.ion-page-hidden)");

test("Home e os quatro GETs com ID, idioma e autenticação corretos", async ({
  page,
}) => {
  const chamadas = await preparar(page);
  await page.goto("/home");
  await expect(
    page.getByRole("heading", { name: "Populares agora." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Ver detalhes de Horizonte de teste",
      exact: true,
    }),
  ).toBeVisible();
  const cards = page.locator("app-filme-card");
  await expect(cards.first().locator(".nota")).toHaveText("8,7");
  await expect(cards.first().locator(".nota")).toHaveClass(/nota-alta/);
  await expect(cards.nth(1).locator(".nota")).not.toHaveClass(/nota-alta/);
  await page.getByRole("link", { name: "Buscar", exact: true }).click();
  await page.getByRole("searchbox").fill("Ação & espaço");
  await expect(
    paginaVisivel(page).getByRole("link", {
      name: "Ver detalhes de Horizonte de teste",
    }),
  ).toBeVisible();
  await paginaVisivel(page)
    .getByRole("link", { name: "Ver detalhes de Horizonte de teste" })
    .click();
  await expect(page).toHaveURL(/\/filmes\/42$/);
  await expect(
    page.getByRole("heading", { name: "Elenco.", exact: true }),
  ).toBeVisible();
  expect(chamadas.map((c) => c.path)).toEqual([
    "/3/movie/popular",
    "/3/search/movie",
    "/3/movie/42",
    "/3/movie/42/credits",
  ]);
  for (const chamada of chamadas) {
    expect(chamada.method).toBe("GET");
    expect(chamada.authorization).toBe(
      "Bearer TOKEN_FICTICIO_EXCLUSIVO_DOS_TESTES",
    );
    if (!chamada.path.endsWith("/credits"))
      expect(chamada.params.get("language")).toBe("pt-BR");
  }
  expect(chamadas[1].params.get("query")).toBe("Ação & espaço");
});

test("URL direta e recarga usam o ID e formatam quatro pipes e elenco", async ({
  page,
}) => {
  const chamadas = await preparar(page);
  await page.goto("/filmes/42");
  await expect(
    page.getByRole("heading", { name: filme.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator(".duracao")).toHaveText("2 h 22 min");
  await expect(page.locator(".generos-resumo")).toHaveText(
    "Ação, Ficção científica +1",
  );
  await expect(
    page.getByText("7 de novembro de 2014", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".nota-ficha")).toContainText("8,7");
  await expect(page.locator(".ator")).toHaveCount(2);
  await expect(page.getByText("Comandante", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: filme.title, exact: true }),
  ).toBeVisible();
  expect(chamadas.filter((c) => c.path === "/3/movie/42")).toHaveLength(2);
  expect(chamadas.filter((c) => c.path === "/3/movie/42/credits")).toHaveLength(
    2,
  );
});

test("salvar, recarregar, abrir lista, remover e sincronizar botão", async ({
  page,
}) => {
  await preparar(page);
  await page.goto("/filmes/42");
  await page
    .getByRole("button", { name: "Salvar na minha lista", exact: true })
    .click();
  await expect(page.locator("ion-button.botao-salvar")).toHaveClass(
    /filme-salvo/,
  );
  await expect(page.locator("ion-button.botao-salvar")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remover da minha lista", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Minha lista/ }).click();
  await expect(paginaVisivel(page).locator("app-filme-card")).toHaveCount(1);
  await paginaVisivel(page)
    .getByRole("link", { name: "Ver detalhes de Horizonte de teste" })
    .click();
  await expect(
    page.getByRole("button", { name: "Remover da minha lista", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Minha lista/ }).click();
  await paginaVisivel(page)
    .getByRole("button", { name: "Remover Horizonte de teste da minha lista" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Sua lista está esperando a primeira história",
    }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Salvar na minha lista", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cinefila.minha-lista.v1")!),
    ),
  ).toEqual([]);
});

test("busca sem resultados e campo limpo têm estados diferentes", async ({
  page,
}) => {
  const chamadas = await preparar(page);
  await page.goto("/buscar");
  await page.getByRole("searchbox").fill("zzzzfilmeinexistente987654");
  await expect(
    page.getByRole("heading", { name: "Nenhum filme encontrado" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("   ");
  await expect(
    page.getByRole("heading", {
      name: "Toda boa sessão começa com uma escolha",
    }),
  ).toBeVisible();
  expect(chamadas).toHaveLength(1);
});

test("buscar cancela respostas antigas e só mantém a consulta atual", async ({
  page,
}) => {
  await preparar(page);
  await page.route("**/search/movie?**", async (route) => {
    const termo = new URL(route.request().url()).searchParams.get("query");
    if (termo === "antigo")
      await new Promise((resolve) => setTimeout(resolve, 900));
    await route.fulfill({
      json: pagina(termo === "antigo" ? [segundo] : [filme]),
    });
  });
  await page.goto("/buscar");
  await page.getByRole("searchbox").fill("antigo");
  await page.waitForRequest("**/search/movie?**");
  await page.getByRole("searchbox").fill("atual");
  await expect(
    page.getByRole("link", { name: "Ver detalhes de Horizonte de teste" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver detalhes de Outro horizonte" }),
  ).toHaveCount(0);
});

test("ID inválido não consulta API e 404 permite recuperar a navegação", async ({
  page,
}) => {
  const chamadas = await preparar(page);
  await page.goto("/filmes/abc");
  await expect(
    page.getByText("O ID do filme é inválido.", { exact: false }),
  ).toBeVisible();
  expect(chamadas).toHaveLength(0);
  await page.goto("/filmes/999");
  await expect(
    page.getByText("Este filme não foi encontrado na TMDB.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Voltar para a Home" }).click();
  await expect(page).toHaveURL(/\/home$/);
});

test("falha só no elenco preserva detalhes e oferece nova tentativa", async ({
  page,
}) => {
  await preparar(page);
  await page.route("**/42/credits", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto("/filmes/42");
  await expect(
    page.getByRole("heading", { name: filme.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "O elenco não carregou" }),
  ).toBeVisible();
  await page.unroute("**/42/credits");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".ator")).toHaveCount(2);
});

test("API sem dados e imagem quebrada exibem alternativas legíveis", async ({
  page,
}) => {
  await preparar(page);
  await page.route("**/movie/42?**", (route) =>
    route.fulfill({
      json: {
        ...filme,
        overview: " ",
        runtime: null,
        genres: [],
        release_date: "",
        vote_average: null,
      },
    }),
  );
  await page.route("**/42/credits", (route) =>
    route.fulfill({ json: { cast: [] } }),
  );
  await page.goto("/filmes/42");
  for (const texto of [
    "Duração não informada",
    "Data não informada",
    "Sinopse não disponível em português para este filme.",
    "Elenco não informado para este filme.",
  ])
    await expect(page.getByText(texto, { exact: true })).toBeVisible();
  await expect(page.locator(".generos-resumo")).toHaveText(
    "Gêneros não informados",
  );
  await expect(page.locator(".nota-ficha")).toContainText("Sem nota");
  await expect(
    page.getByText("Pôster indisponível", { exact: true }),
  ).toBeVisible();
});

for (const [minutos, esperado] of [
  [59, "59 min"],
  [120, "2 h"],
  [0, "Duração não informada"],
] as const) {
  test(`duração ${minutos} e gênero único`, async ({ page }) => {
    await preparar(page);
    await page.route("**/movie/42?**", (route) =>
      route.fulfill({
        json: { ...filme, runtime: minutos, genres: [filme.genres[0]] },
      }),
    );
    await page.goto("/filmes/42");
    await expect(page.locator(".duracao")).toHaveText(esperado);
    await expect(page.locator(".generos-resumo")).toHaveText("Ação");
  });
}

test("sem token orienta configuração sem fazer consulta TMDB", async ({
  page,
}) => {
  const chamadas = await preparar(page);
  await page.route("**/config.local.json", (route) =>
    route.fulfill({ json: { tmdbToken: "" } }),
  );
  await page.goto("/home");
  await expect(
    page.getByText("Configure o token da TMDB", { exact: false }),
  ).toBeVisible();
  expect(chamadas).toHaveLength(0);
});

for (const status of [401, 429]) {
  test(`erro ${status} e nova tentativa na Home`, async ({ page }) => {
    await preparar(page);
    await page.route("**/movie/popular?**", (route) =>
      route.fulfill({ status, json: {} }),
    );
    await page.goto("/home");
    await expect(
      page.getByText(
        status === 401
          ? "A TMDB não autorizou o acesso."
          : "Muitas consultas em pouco tempo.",
        { exact: false },
      ),
    ).toBeVisible();
    await page.unroute("**/movie/popular?**");
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.locator("app-filme-card")).toHaveCount(2);
  });
}

test("lista descarta duplicatas e não quebra com JSON inválido", async ({
  page,
}) => {
  await preparar(page);
  await page.goto("/minha-lista");
  await page.evaluate(
    (f) =>
      localStorage.setItem(
        "cinefila.minha-lista.v1",
        JSON.stringify([f, f, null, { id: -1 }]),
      ),
    filme,
  );
  await page.reload();
  await expect(page.locator("app-filme-card")).toHaveCount(1);
  await page.evaluate(() =>
    localStorage.setItem("cinefila.minha-lista.v1", "{invalido"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível ler a lista",
  );
});

test("armazenamento bloqueado não informa sucesso nem altera o botão", async ({
  page,
}) => {
  await preparar(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "QuotaExceededError");
    };
  });
  await page.goto("/filmes/42");
  await page
    .getByRole("button", { name: "Salvar na minha lista", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível gravar sua lista",
  );
  await expect(
    page.getByRole("button", { name: "Salvar na minha lista", exact: true }),
  ).toBeVisible();
  await expect(page.locator("ion-button.botao-salvar")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("outra aba atualiza o estado salvo pelo evento storage", async ({
  page,
  context,
}) => {
  await preparar(page);
  await page.goto("/filmes/42");
  const outra = await context.newPage();
  await preparar(outra);
  await outra.goto("/filmes/42");
  await outra
    .getByRole("button", { name: "Salvar na minha lista", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remover da minha lista", exact: true }),
  ).toBeVisible();
  await outra
    .getByRole("button", { name: "Remover da minha lista", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Salvar na minha lista", exact: true }),
  ).toBeVisible();
});

test("layout móvel permite navegar e salvar sem transbordamento horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await preparar(page);
  await page.goto("/home");
  await page
    .getByRole("link", {
      name: "Ver detalhes de Horizonte de teste",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Salvar na minha lista", exact: true })
    .click();
  await page.getByRole("link", { name: /Minha lista/ }).click();
  await expect(paginaVisivel(page).locator("app-filme-card")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
