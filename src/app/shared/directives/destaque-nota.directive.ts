
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appDestaqueNota]',
  standalone: true,
  host: {
    '[class.nota-alta]': 'notaAlta',
    '[attr.title]': 'notaAlta ? "Filme com nota alta" : null'
  }
})
export class DestaqueNotaDirective {

  @Input() appDestaqueNota: number | null | undefined = null;

  get notaAlta(): boolean {
    return typeof this.appDestaqueNota === 'number'
      && this.appDestaqueNota >= 8;
  }

}
