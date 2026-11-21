import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonCard, IonIcon } from '@ionic/angular/standalone';
import { Filme } from '../../core/models/filmes';
import { PosterComponent } from './poster.component';
import { DestaqueNotaDirective } from '../directives/destaque-nota.directive';

@Component({
  selector: 'app-filme-card', standalone: true,
  imports: [IonCard, IonIcon, RouterLink, DecimalPipe, PosterComponent, DestaqueNotaDirective],
  template: `
    <ion-card class="filme-card">
      <a [routerLink]="['/filmes', filme().id]" [attr.aria-label]="'Ver detalhes de ' + filme().title">
        <div class="poster-card">
          <app-poster [caminho]="filme().poster_path" [descricao]="'Pôster de ' + filme().title" />
          <span class="abrir-filme">Ver detalhes <ion-icon name="arrow-forward-outline" aria-hidden="true" /></span>
        </div>
        <div class="info-card">
          <h3>{{ filme().title || 'Título não informado' }}</h3>
          <div class="linha-card"><span>{{ filme().release_date ? filme().release_date.slice(0, 4) : 'Ano não informado' }}</span>
            <span class="nota" [appDestaqueNota]="filme().vote_average"><ion-icon name="star" aria-hidden="true" /> {{ filme().vote_average == null ? 'Sem nota' : (filme().vote_average | number: '1.1-1') }}</span>
          </div>
        </div>
      </a>
    </ion-card>
  `,
  styles: `ion-card { margin: 0; box-shadow: none; border: 0; background: transparent; overflow: visible; } a { display: block; color: var(--texto); text-decoration: none; } .poster-card { position: relative; aspect-ratio: 2/3; overflow: hidden; border-radius: 12px; background: #252d33; transition: transform .2s; } a:hover .poster-card { transform: translateY(-4px); } .abrir-filme { position: absolute; inset: auto 0 0; padding: 28px 14px 15px; background: linear-gradient(transparent,#000d); display: flex; justify-content: space-between; font-size: 12px; opacity: 0; transition: opacity .2s; } a:hover .abrir-filme, a:focus-visible .abrir-filme { opacity: 1; } .info-card { padding: 15px 1px 8px; } h3 { font-size: 15px; font-weight: 650; margin: 0 0 8px; line-height: 1.4; } .linha-card { display: flex; align-items: center; justify-content: space-between; color: var(--suave); font-size: 12px; gap: 8px; }`
})
export class FilmeCardComponent { readonly filme = input.required<Filme>(); }
