
import { Component, Input } from '@angular/core';

interface Filme {
  id: number;
  titulo: string;
}

@Component({
  selector: 'app-demonstracao-blocos',
  standalone: true,
  template: `
    <h2>Filmes encontrados</h2>

    @if (filmes.length === 0) {
      <p>Nenhum filme encontrado.</p>
    } @else {
      @for (filme of filmes; track filme.id) {
        <p>{{ filme.titulo }}</p>
      }
    }
  `
})
export class DemonstracaoBlocosComponent {
  @Input() filmes: Filme[] = [];
}
