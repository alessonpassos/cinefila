import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { defer, Observable, throwError, timeout } from 'rxjs';
import { CONFIG_LOCAL } from '../config-local';
import { Creditos, FilmeDetalhes, PaginaFilmes } from '../models/filme';

@Injectable({ providedIn: 'root' })
export class FilmesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(CONFIG_LOCAL);
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  listarPopulares(): Observable<PaginaFilmes> {
    return this.get<PaginaFilmes>('/movie/popular', new HttpParams().set('language', 'pt-BR'));
  }

  buscarPorTitulo(titulo: string): Observable<PaginaFilmes> {
    const params = new HttpParams().set('query', titulo.trim()).set('language', 'pt-BR').set('include_adult', false);
    return this.get<PaginaFilmes>('/search/movie', params);
  }

  obterDetalhes(id: number): Observable<FilmeDetalhes> {
    return this.get<FilmeDetalhes>(`/movie/${id}`, new HttpParams().set('language', 'pt-BR'));
  }

  obterElenco(id: number): Observable<Creditos> {
    return this.get<Creditos>(`/movie/${id}/credits`);
  }

  private get<T>(caminho: string, params = new HttpParams()): Observable<T> {
    return defer(() => {
      if (!this.config.tmdbToken) return throwError(() => new Error('TOKEN_AUSENTE'));
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.config.tmdbToken}`, Accept: 'application/json' });
      return this.http.get<T>(`${this.baseUrl}${caminho}`, { headers, params }).pipe(timeout(15000));
    });
  }
}
