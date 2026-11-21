import { Component, computed, input, signal } from "@angular/core";

@Component({
  selector: "app-poster",
  standalone: true,
  template: `
    @if (url() && falha() !== url()) {
      <img
        [src]="url()"
        [alt]="descricao()"
        [attr.loading]="prioritario() ? 'eager' : 'lazy'"
        (error)="falha.set(url())"
      />
    } @else {
      <div
        class="sem-imagem"
        role="img"
        [attr.aria-label]="descricao() + ' — imagem indisponível'"
      >
        <span class="quadro" aria-hidden="true">C.</span
        ><span>{{
          retrato() ? "Foto indisponível" : "Pôster indisponível"
        }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
      background: #232b30;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .sem-imagem {
      height: 100%;
      min-height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 15px;
      background: linear-gradient(140deg, #283239, #151c21);
      color: #adb9bc;
      text-align: center;
      padding: 12px;
      font-size: 12px;
    }
    .quadro {
      font-size: 38px;
      font-weight: 800;
      color: #bdcf9c;
      border: 1px solid #546046;
      padding: 12px;
      border-radius: 12px;
    }
  `,
})
export class PosterComponent {
  readonly caminho = input<string | null | undefined>(null);
  readonly descricao = input("Pôster do filme");
  readonly prioritario = input(false);
  readonly retrato = input(false);
  readonly falha = signal("");
  readonly url = computed(() =>
    this.caminho()
      ? `https://image.tmdb.org/t/p/${this.retrato() ? "w185" : "w500"}${this.caminho()}`
      : "",
  );
}
