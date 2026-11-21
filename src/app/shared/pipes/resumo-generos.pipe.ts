import { Pipe, PipeTransform } from '@angular/core';
import { Genero } from '../../core/models/filmes';

@Pipe({ name: 'resumoGeneros', standalone: true })
export class ResumoGenerosPipe implements PipeTransform {
  transform(generos: Genero[] | null | undefined): string {
    const nomes = (generos ?? []).map(g => g.name).filter(Boolean);
    if (!nomes.length) return 'Gêneros não informados';
    return nomes.slice(0, 2).join(', ') + (nomes.length > 2 ? ` +${nomes.length - 2}` : '');
  }
}
