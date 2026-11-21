import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filmOutline, searchOutline, bookmarkOutline, arrowForwardOutline, arrowBackOutline, star, addOutline, checkmarkOutline, trashOutline, refreshOutline } from 'ionicons/icons';
import { MinhaListaService } from './core/services/minha-lista.service';

@Component({
  selector: 'app-root', standalone: true,
  imports: [IonApp, IonRouterOutlet, IonIcon, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html', styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly lista = inject(MinhaListaService);
  constructor() {
    addIcons({ filmOutline, searchOutline, bookmarkOutline, arrowForwardOutline, arrowBackOutline, star, addOutline, checkmarkOutline, trashOutline, refreshOutline });
  }
}
