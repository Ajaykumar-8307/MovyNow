import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface MovieListResponse {
  page: number;
  results: MovieSummary[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoResult {
  id: string;
  key: string;
  name: string;
  official: boolean;
  site: string;
  type: string;
}

export interface MovieDetailsResponse extends MovieSummary {
  tagline: string;
  runtime: number | null;
  genres: Genre[];
  imdb_id: string | null;
  videos: {
    results: VideoResult[];
  };
  credits: {
    cast: CastMember[];
  };
  recommendations: MovieListResponse;
}

export interface StreamSourceResponse {
  streamUrl: string | null;
  embedUrl: string | null;
  sourceName: string;
  quality: string | null;
  subtitles: Array<{ label: string; url: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly apiBase = '/api';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p';

  constructor(private readonly http: HttpClient) {}

  getTrendingMovies(): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/trending`);
  }

  getPopularMovies(): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/popular`);
  }

  getTopRatedMovies(): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/top-rated`);
  }

  getNowPlayingMovies(): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/now-playing`);
  }

  getIndianMovies(): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/indian`);
  }

  getMoviesByGenre(genreId: number): Observable<MovieListResponse> {
    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/genre/${genreId}`);
  }

  searchMovies(query: string): Observable<MovieListResponse> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return of({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      });
    }

    return this.http.get<MovieListResponse>(`${this.apiBase}/movies/search`, {
      params: {
        q: trimmedQuery,
      },
    });
  }

  getMovieDetails(id: string | number): Observable<MovieDetailsResponse> {
    return this.http.get<MovieDetailsResponse>(`${this.apiBase}/movies/${id}`);
  }

  getMovieDetailsByImdb(imdbId: string): Observable<MovieDetailsResponse> {
    return this.http.get<MovieDetailsResponse>(`${this.apiBase}/movies/by-imdb/${imdbId}`);
  }

  getStreamSource(id: string | number): Observable<StreamSourceResponse> {
    return this.http.get<StreamSourceResponse>(`${this.apiBase}/stream/${id}`);
  }

  getStreamSourceByImdb(imdbId: string): Observable<StreamSourceResponse> {
    return this.http.get<StreamSourceResponse>(`${this.apiBase}/stream/by-imdb/${imdbId}`);
  }

  imageUrl(path: string | null | undefined, size = 'w500'): string {
    return path ? `${this.imageBaseUrl}/${size}${path}` : '';
  }

  posterUrl(path: string | null | undefined): string {
    return this.imageUrl(path, 'w500');
  }

  backdropUrl(path: string | null | undefined): string {
    return this.imageUrl(path, 'w1280');
  }

  yearFromDate(date: string | null | undefined): string {
    return date ? date.slice(0, 4) : 'New';
  }

  formatRuntime(minutes: number | null | undefined): string {
    if (!minutes) {
      return 'Feature';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? `${hours}h ${mins}m` : `${mins}m`;
  }

  formatRating(vote: number | null | undefined): string {
    return vote ? `${vote.toFixed(1)}` : 'NR';
  }

  findTrailer(videos: VideoResult[] | null | undefined): VideoResult | undefined {
    if (!videos?.length) {
      return undefined;
    }

    return (
      videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official) ??
      videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer') ??
      videos.find((video) => video.site === 'YouTube')
    );
  }

}
