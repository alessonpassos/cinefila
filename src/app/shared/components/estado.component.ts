import { Component, input, output } from "@angular/core";
import { IonButton, IonIcon, IonSpinner } from "@ionic/angular/standalone";

@Component({
  selector: "app-estado",
  standalone: true,
  imports: [IonButton, IonIcon, IonSpinner],
  template: `
    <div
      class="estado"
      [attr.role]="erro() ? 'alert' : 'status'"
      aria-live="polite"
    >
      @if (carregando()) {
        <ion-spinner name="crescent" aria-label="Carregando" />
      } @else {
        <ion-icon [name]="icone()" aria-hidden="true" class="icone-estado" />
      }
      <h2>{{ titulo() }}</h2>
      <p>{{ mensagem() }}</p>
      @if (erro()) {
        <ion-button fill="outline" (click)="tentar.emit()"
          ><ion-icon name="refresh-outline" slot="start" />Tentar
          novamente</ion-button
        >
      }
    </div>
  `,
})
export class EstadoComponent {
  readonly carregando = input(false);
  readonly erro = input(false);
  readonly titulo = input("");
  readonly mensagem = input("");
  readonly icone = input("film-outline");
  readonly tentar = output<void>();
}
