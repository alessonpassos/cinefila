import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { MinhaListaService } from '../../core/services/minha-lista.service';
import { Filme } from '../../core/models/filmes';
import { FilmeCardComponent } from '../../shared/components/filme-card.component';
import { EstadoComponent } from '../../shared/components/estado.component';
import { CreditosComponent } from '../../shared/components/creditos.component';

@Component({
  selector: 'app-minha-lista', standalone: true,
  imports: [IonContent, IonButton, IonIcon, RouterLink, FilmeCardComponent, EstadoComponent, CreditosComponent],
  templateUrl: './minha-lista.page.html'
})
export class MinhaListaPage {
  readonly lista = inject(MinhaListaService);
  readonly aviso = signal('');
  remover(filme: Filme): void {
    this.aviso.set(this.lista.remover(filme.id) ? `${filme.title} foi removido da sua lista.` : '');
  }
}
