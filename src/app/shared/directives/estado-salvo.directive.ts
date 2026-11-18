
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appEstadoSalvo]',
  standalone: true,
  host: {
    '[class.filme-salvo]': 'appEstadoSalvo',
    '[attr.aria-pressed]': 'appEstadoSalvo'
  }
})
export class EstadoSalvoDirective {

  @Input() appEstadoSalvo: boolean = false;

}
