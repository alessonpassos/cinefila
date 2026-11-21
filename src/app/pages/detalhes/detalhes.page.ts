import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { DatePipe, DecimalPipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
  IonContent,
  IonButton,
  IonIcon,
  IonChip,
} from "@ionic/angular/standalone";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
  switchMap,
} from "rxjs";
import { FilmesService } from "../../core/services/filmes.service";
import { MinhaListaService } from "../../core/services/minha-lista.service";
import { Ator, FilmeDetalhes } from "../../core/models/filmes";
import { mensagemErro } from "../../core/erro-api";
import { DuracaoFilmePipe } from "../../shared/pipes/duracao-filme.pipe";
import { ResumoGenerosPipe } from "../../shared/pipes/resumo-generos.pipe";
import { DestaqueNotaDirective } from "../../shared/directives/destaque-nota.directive";
import { EstadoSalvoDirective } from "../../shared/directives/estado-salvo.directive";
import { PosterComponent } from "../../shared/components/poster.component";
import { EstadoComponent } from "../../shared/components/estado.component";
import { CreditosComponent } from "../../shared/components/creditos.component";

@Component({
  selector: "app-detalhes",
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonChip,
    RouterLink,
    DatePipe,
    DecimalPipe,
    DuracaoFilmePipe,
    ResumoGenerosPipe,
    DestaqueNotaDirective,
    EstadoSalvoDirective,
    PosterComponent,
    EstadoComponent,
    CreditosComponent,
  ],
  templateUrl: "./detalhes.page.html",
  styleUrl: "./detalhes.page.scss",
})
export class DetalhesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(FilmesService);
  private readonly recarregar = new BehaviorSubject(0);
  readonly lista = inject(MinhaListaService);
  readonly filme = signal<FilmeDetalhes | null>(null);
  readonly elenco = signal<Ator[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal("");
  readonly erroElenco = signal("");
  readonly aviso = signal("");
  readonly salvo = computed(() => this.lista.estaSalvo(this.filme()?.id ?? 0));

  constructor() {
    combineLatest([this.route.paramMap, this.recarregar])
      .pipe(
        switchMap(([parametros]) => {
          this.filme.set(null);
          this.elenco.set([]);
          this.erro.set("");
          this.erroElenco.set("");
          this.aviso.set("");
          this.carregando.set(true);
          const parametro = parametros.get("id");
          const id = Number(parametro);
          if (
            !parametro ||
            !/^\d+$/.test(parametro) ||
            !Number.isSafeInteger(id) ||
            id <= 0
          ) {
            return of({
              filme: null,
              elenco: [] as Ator[],
              erro: "O ID do filme é inválido. Volte à busca e escolha um título.",
              erroElenco: "",
            });
          }
          // Os dois GETs usam o ID lido da URL. Nenhum estado da página anterior é necessário.
          return forkJoin({
            filme: this.api.obterDetalhes(id),
            creditos: this.api.obterElenco(id).pipe(
              map((dados) => ({ atores: dados.cast ?? [], erro: "" })),
              catchError((erro) =>
                of({ atores: [] as Ator[], erro: mensagemErro(erro) }),
              ),
            ),
          }).pipe(
            map(({ filme, creditos }) => ({
              filme,
              elenco: creditos.atores,
              erro: "",
              erroElenco: creditos.erro,
            })),
            catchError((erro) =>
              of({
                filme: null,
                elenco: [] as Ator[],
                erro: mensagemErro(erro),
                erroElenco: "",
              }),
            ),
          );
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((estado) => {
        this.filme.set(estado.filme);
        this.elenco.set(estado.elenco);
        this.erro.set(estado.erro);
        this.erroElenco.set(estado.erroElenco);
        this.carregando.set(false);
      });
  }

  tentarNovamente(): void {
    this.recarregar.next(this.recarregar.value + 1);
  }
  alternarSalvo(): void {
    const filme = this.filme();
    if (!filme) return;
    const estavaSalvo = this.salvo();
    const sucesso = estavaSalvo
      ? this.lista.remover(filme.id)
      : this.lista.salvar(filme);
    this.aviso.set(
      sucesso
        ? estavaSalvo
          ? "Filme removido da sua lista."
          : "Filme salvo na sua lista."
        : "",
    );
  }
}
