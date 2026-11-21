import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duracaoFilme', standalone: true })
export class DuracaoFilmePipe implements PipeTransform {
  transform(minutos: number | null | undefined): string {
    if (!minutos || !Number.isFinite(minutos) || minutos < 0) return 'Duração não informada';
    const total = Math.floor(minutos);
    const horas = Math.floor(total / 60);
    const resto = total % 60;
    if (horas === 0) return `${resto} min`;
    return resto ? `${horas} h ${resto} min` : `${horas} h`;
  }
}
