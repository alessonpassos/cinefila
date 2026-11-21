import { Component } from '@angular/core';

@Component({
  selector: 'app-creditos', standalone: true,
  template: `<footer class="creditos"><div><strong>cinefila.</strong><span>Uma boa história merece entrar na sua lista.</span></div><details><summary>Créditos · Dados e imagens: TMDB</summary><p>Este produto utiliza a API da <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>, mas não é endossado ou certificado pela TMDB.</p><p lang="en">This product uses the TMDB API but is not endorsed or certified by TMDB.</p></details></footer>`,
  styles: `.creditos { display: flex; justify-content: space-between; align-items: start; gap: 28px; padding: 30px 0 12px; margin-top: 64px; border-top: 1px solid var(--borda); font-size: 12px; color: var(--suave); } strong { display: block; font-size: 18px; color: var(--texto); margin-bottom: 7px; } details { max-width: 420px; line-height: 1.6; } summary { cursor: pointer; } @media(max-width:600px) { .creditos { flex-direction: column; margin-top: 42px; } }`
})
export class CreditosComponent {}
