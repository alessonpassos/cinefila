import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilmesService } from '../../core/services/filmes.service';
import { Filme } from '../../core/models/filmes';
import { mensagemErro } from '../../core/erro-api';
import { FilmeCardComponent } from '../../shared/components/filme-card.component';
import { EstadoComponent } from '../../shared/components/estado.component';
import { CreditosComponent } from '../../shared/components/creditos.component';

@Component({
  selector: 'app-home', standalone: true,
  imports: [IonContent, IonButton, IonIcon, RouterLink, FilmeCardComponent, EstadoComponent, CreditosComponent],
  templateUrl: './home.page.html'
})
export class HomePage implements OnInit {
  private readonly api = inject(FilmesService);
  private readonly destroyRef = inject(DestroyRef);
  readonly filmes = signal<Filme[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');

  ngOnInit(): void { this.carregar(); }
  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.listarPopulares().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: pagina => { this.filmes.set(pagina.results ?? []); this.carregando.set(false); },
      error: erro => { this.erro.set(mensagemErro(erro)); this.carregando.set(false); }
    });
  }
}
