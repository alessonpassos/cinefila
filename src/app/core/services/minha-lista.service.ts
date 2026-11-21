import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { Filme } from "../models/filmes";

@Injectable({ providedIn: "root" })
export class MinhaListaService {
  private readonly chave = "cinefila.minha-lista.v1";
  private readonly estado = signal<Filme[]>([]);
  readonly filmes = this.estado.asReadonly();
  readonly erro = signal("");

  constructor() {
    this.carregar();
    const sincronizar = (evento: StorageEvent) => {
      if (evento.key === this.chave || evento.key === null) this.carregar();
    };
    window.addEventListener("storage", sincronizar);
    inject(DestroyRef).onDestroy(() =>
      window.removeEventListener("storage", sincronizar),
    );
  }

  estaSalvo(id: number): boolean {
    return this.filmes().some((f) => f.id === id);
  }

  salvar(filme: Filme): boolean {
    if (this.estaSalvo(filme.id)) return true;
    // Guarde somente o resumo: detalhes e elenco sempre vêm da API pelo ID.
    const resumo: Filme = {
      id: filme.id,
      title: filme.title,
      poster_path: filme.poster_path,
      release_date: filme.release_date,
      vote_average: filme.vote_average,
    };
    return this.persistir([resumo, ...this.filmes()]);
  }

  remover(id: number): boolean {
    return this.persistir(this.filmes().filter((f) => f.id !== id));
  }

  private persistir(filmes: Filme[]): boolean {
    try {
      localStorage.setItem(this.chave, JSON.stringify(filmes));
      this.estado.set(filmes);
      this.erro.set("");
      return true;
    } catch {
      this.erro.set(
        "Não foi possível gravar sua lista. Libere espaço ou permita o armazenamento neste navegador.",
      );
      return false;
    }
  }

  private carregar(): void {
    try {
      const valor: unknown = JSON.parse(
        localStorage.getItem(this.chave) ?? "[]",
      );
      if (!Array.isArray(valor)) throw new Error("Lista inválida");
      const unicos = new Map<number, Filme>();
      for (const item of valor) {
        if (
          !item ||
          typeof item !== "object" ||
          !Number.isSafeInteger(item.id) ||
          item.id <= 0 ||
          typeof item.title !== "string"
        )
          continue;
        unicos.set(item.id, {
          id: item.id,
          title: item.title,
          poster_path:
            typeof item.poster_path === "string" ? item.poster_path : null,
          release_date:
            typeof item.release_date === "string" ? item.release_date : "",
          vote_average:
            typeof item.vote_average === "number" ? item.vote_average : null,
        });
      }
      this.estado.set([...unicos.values()]);
      this.erro.set("");
    } catch {
      this.estado.set([]);
      this.erro.set(
        "Não foi possível ler a lista deste navegador. Você pode tentar salvar os filmes novamente.",
      );
    }
  }
}
