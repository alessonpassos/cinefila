export interface Filme {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date: string;
  vote_average: number | null;
  vote_count?: number;
}
export interface Genero { id: number; name: string; }
export interface FilmeDetalhes extends Filme { runtime: number | null; genres: Genero[]; tagline?: string; }
export interface Ator { id: number; credit_id: string; name: string; character: string; profile_path: string | null; }
export interface Creditos { id: number; cast: Ator[]; }
export interface PaginaFilmes { page: number; results: Filme[]; total_pages: number; total_results: number; }
