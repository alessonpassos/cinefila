import "@angular/compiler";
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { DatePipe, DecimalPipe, registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt";
import { FilmesService } from "../src/app/core/services/filmes.service";
import { MinhaListaService } from "../src/app/core/services/minha-lista.service";
import { CONFIG_LOCAL } from "../src/app/core/config-local";
import { DuracaoFilmePipe } from "../src/app/shared/pipes/duracao-filme.pipe";
import { ResumoGenerosPipe } from "../src/app/shared/pipes/resumo-generos.pipe";
import { DestaqueNotaDirective } from "../src/app/shared/directives/destaque-nota.directive";
import { mensagemErro } from "../src/app/core/erro-api";

const janela = new Window({ url: "http://localhost:8100" });
Object.assign(globalThis, {
  window: janela,
  document: janela.document,
  localStorage: janela.localStorage,
  StorageEvent: janela.StorageEvent,
});
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
registerLocaleData(localePt, "pt-BR");

beforeEach(() => {
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: CONFIG_LOCAL,
        useValue: { tmdbToken: "token-ficticio-teste-unitario" },
      },
    ],
  });
});
afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
  TestBed.resetTestingModule();
});

test("os quatro GETs usam endpoints, parâmetros, credencial e respostas corretos", () => {
  const api = TestBed.inject(FilmesService);
  const http = TestBed.inject(HttpTestingController);
  const exemplos = [
    {
      requisicao: api.listarPopulares(),
      caminho: "/movie/popular",
      idioma: "pt-BR",
      resposta: { results: [{ id: 42 }] },
    },
    {
      requisicao: api.buscarPorTitulo("  Ação & espaço  "),
      caminho: "/search/movie",
      idioma: "pt-BR",
      resposta: { results: [{ id: 43 }] },
    },
    {
      requisicao: api.obterDetalhes(42),
      caminho: "/movie/42",
      idioma: "pt-BR",
      resposta: { id: 42, title: "Teste" },
    },
    {
      requisicao: api.obterElenco(42),
      caminho: "/movie/42/credits",
      idioma: null,
      resposta: { id: 42, cast: [] },
    },
  ];
  for (const exemplo of exemplos) {
    let recebido: unknown;
    exemplo.requisicao.subscribe((valor) => (recebido = valor));
    const req = http.expectOne(
      (r) => r.url === `https://api.themoviedb.org/3${exemplo.caminho}`,
    );
    assert.equal(req.request.method, "GET");
    assert.equal(
      req.request.headers.get("Authorization"),
      "Bearer token-ficticio-teste-unitario",
    );
    assert.equal(req.request.params.get("language"), exemplo.idioma);
    if (exemplo.caminho.includes("search"))
      assert.equal(req.request.params.get("query"), "Ação & espaço");
    req.flush(exemplo.resposta);
    assert.deepEqual(recebido, exemplo.resposta);
  }
});

test("token ausente não faz chamada nem expõe credencial no erro", () => {
  TestBed.overrideProvider(CONFIG_LOCAL, { useValue: { tmdbToken: "" } });
  let erro: unknown;
  TestBed.inject(FilmesService)
    .listarPopulares()
    .subscribe({ error: (e) => (erro = e) });
  assert.match(mensagemErro(erro), /Configure o token/);
  TestBed.inject(HttpTestingController).expectNone(() => true);
});

test("falhas de autenticação e conexão são traduzidas para a interface", () => {
  const api = TestBed.inject(FilmesService);
  const http = TestBed.inject(HttpTestingController);
  let mensagem = "";
  api
    .listarPopulares()
    .subscribe({ error: (e) => (mensagem = mensagemErro(e)) });
  http
    .expectOne((r) => r.url.endsWith("/popular"))
    .flush({}, { status: 401, statusText: "Unauthorized" });
  assert.match(mensagem, /não autorizou/);
  api
    .listarPopulares()
    .subscribe({ error: (e) => (mensagem = mensagemErro(e)) });
  http
    .expectOne((r) => r.url.endsWith("/popular"))
    .error(new janela.ProgressEvent("error") as unknown as ProgressEvent);
  assert.match(mensagem, /Verifique sua conexão/);
});

test("duração cobre minutos, horas exatas, exemplo 142 e dados ausentes", () => {
  const pipe = new DuracaoFilmePipe();
  for (const [entrada, saida] of [
    [142, "2 h 22 min"],
    [59, "59 min"],
    [120, "2 h"],
    [null, "Duração não informada"],
    [0, "Duração não informada"],
    [-1, "Duração não informada"],
  ] as const)
    assert.equal(pipe.transform(entrada), saida);
});

test("resumo de gêneros cobre zero, um, dois e três gêneros", () => {
  const pipe = new ResumoGenerosPipe();
  const generos = [
    { id: 1, name: "Ação" },
    { id: 2, name: "Ficção científica" },
    { id: 3, name: "Drama" },
  ];
  assert.equal(pipe.transform(generos), "Ação, Ficção científica +1");
  assert.equal(pipe.transform(generos.slice(0, 2)), "Ação, Ficção científica");
  assert.equal(pipe.transform(generos.slice(0, 1)), "Ação");
  assert.equal(pipe.transform(null), "Gêneros não informados");
});

test("pipes nativos formatam data e decimal em pt-BR", () => {
  assert.equal(new DecimalPipe("pt-BR").transform(8.66, "1.1-1"), "8,7");
  assert.equal(
    new DatePipe("pt-BR").transform("2014-11-07", "longDate", "UTC"),
    "7 de novembro de 2014",
  );
});

test("destaque de nota começa em 8 e não aplica a dados ausentes", () => {
  const diretiva = new DestaqueNotaDirective();
  assert.equal(diretiva.notaAlta, false);
  diretiva.appDestaqueNota = 7.99;
  assert.equal(diretiva.notaAlta, false);
  diretiva.appDestaqueNota = 8;
  assert.equal(diretiva.notaAlta, true);
});

const filme = {
  id: 42,
  title: "Filme de teste",
  poster_path: null,
  release_date: "",
  vote_average: 8,
};
const chave = "cinefila.minha-lista.v1";
test("lista persiste, evita duplicatas e remove", () => {
  const lista = TestBed.inject(MinhaListaService);
  assert.equal(lista.salvar(filme), true);
  assert.equal(lista.salvar(filme), true);
  assert.equal(lista.filmes().length, 1);
  assert.equal(lista.estaSalvo(42), true);
  assert.equal(JSON.parse(localStorage.getItem(chave)!).length, 1);
  assert.equal(lista.remover(42), true);
  assert.equal(lista.estaSalvo(42), false);
  assert.deepEqual(JSON.parse(localStorage.getItem(chave)!), []);
});

test("instância nova recupera lista salva e elimina entradas inválidas", () => {
  localStorage.setItem(chave, JSON.stringify([filme, filme, null, { id: -1 }]));
  const lista = TestBed.inject(MinhaListaService);
  assert.deepEqual(lista.filmes(), [filme]);
});

test("JSON corrompido gera aviso e pode ser substituído por lista válida", () => {
  localStorage.setItem(chave, "{invalido");
  const lista = TestBed.inject(MinhaListaService);
  assert.match(lista.erro(), /Não foi possível ler/);
  assert.equal(lista.salvar(filme), true);
  assert.equal(lista.erro(), "");
});

test("falha ao gravar preserva estado e informa erro", () => {
  const lista = TestBed.inject(MinhaListaService);
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    },
  });
  try {
    assert.equal(lista.salvar(filme), false);
    assert.equal(lista.estaSalvo(42), false);
    assert.match(lista.erro(), /Não foi possível gravar/);
  } finally {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: original,
    });
  }
});

test("evento storage sincroniza adição e limpeza entre abas", () => {
  const lista = TestBed.inject(MinhaListaService);
  localStorage.setItem(chave, JSON.stringify([filme]));
  window.dispatchEvent(new StorageEvent("storage", { key: chave }));
  assert.equal(lista.estaSalvo(42), true);
  localStorage.clear();
  window.dispatchEvent(new StorageEvent("storage", { key: null }));
  assert.equal(lista.estaSalvo(42), false);
});
