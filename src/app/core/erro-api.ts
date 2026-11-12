import { HttpErrorResponse } from '@angular/common/http';

export function mensagemErro(erro: unknown): string {
  if (erro instanceof Error && erro.message === 'TOKEN_AUSENTE') return 'Configure o token da TMDB no arquivo .env.local e reinicie o aplicativo. Veja o README para começar.';
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 401 || erro.status === 403) return 'A TMDB não autorizou o acesso. Confira seu token no arquivo .env.local e reinicie o aplicativo.';
    if (erro.status === 404) return 'Este filme não foi encontrado na TMDB. Volte à busca e escolha outro título.';
    if (erro.status === 429) return 'Muitas consultas em pouco tempo. Aguarde alguns instantes e tente novamente.';
    if (erro.status === 0) return 'Não foi possível conectar à TMDB. Verifique sua conexão e tente novamente.';
  }
  return 'Não foi possível carregar os dados agora. Tente novamente em instantes.';
}
