import { Component, DestroyRef, inject, signal } from '@angular/core';
import { IonContent, IonSearchbar, IonButton } from '@ionic/angular/standalone';
import { SearchbarCustomEvent } from '@ionic/core';
import { Subject, switchMap, of, timer, catchError, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilmesService } from '../../core/services/filmes.service';
import { Filme } from '../../core/models/filmes';
import { mensagemErro } from '../../core/erro-api';
import { FilmeCardComponent } from '../../shared/components/filme-card.component';
import { EstadoComponent } from '../../shared/components/estado.component';
import { CreditosComponent } from '../../shared/components/creditos.component';

@Component({
  selector: 'app-buscar', standalone: true,
  imports: [IonContent, IonSearchbar, IonButton, FilmeCardComponent, EstadoComponent, CreditosComponent],
  templateUrl: './buscar.page.html'
})
export class BuscarPage {
  private readonly api = inject(FilmesService);
  private readonly consultas = new Subject<string>();
  readonly termo = signal('');
  readonly resultados = signal<Filme[]>([]);
  readonly total = signal(0);
  readonly carregando = signal(false);
  readonly pesquisou = signal(false);
  readonly erro = signal('');

  constructor() {
    this.consultas.pipe(
      // Cancela imediatamente a busca anterior; aguarda 350 ms antes do novo GET.
      switchMap(termo => termo ? timer(350).pipe(
        switchMap(() => this.api.buscarPorTitulo(termo)),
        map(pagina => ({ filmes: pagina.results ?? [], total: pagina.total_results ?? 0, erro: '' })),
        catchError(erro => of({ filmes: [] as Filme[], total: 0, erro: mensagemErro(erro) }))
      ) : of(null)),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(resposta => {
      this.carregando.set(false);
      this.pesquisou.set(resposta !== null);
      this.resultados.set(resposta?.filmes ?? []);
      this.total.set(resposta?.total ?? 0);
      this.erro.set(resposta?.erro ?? '');
    });
  }

  aoDigitar(evento: SearchbarCustomEvent): void { this.buscar(evento.detail.value ?? ''); }
  buscar(texto = this.termo()): void {
    this.termo.set(texto);
    this.erro.set('');
    this.pesquisou.set(false);
    this.resultados.set([]);
    this.carregando.set(!!texto.trim());
    this.consultas.next(texto.trim());
  }
}
