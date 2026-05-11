import { MovieDetailsResponse } from '../services/movie.service';

export function createPendingMovieDetails(imdbId: string): MovieDetailsResponse {
  return {
    id: 0,
    title: 'Loading movie...',
    overview: 'Fetching latest movie details from TMDB.',
    poster_path: null,
    backdrop_path: null,
    release_date: '',
    vote_average: 0,
    tagline: '',
    runtime: null,
    genres: [],
    imdb_id: imdbId,
    videos: {
      results: [],
    },
    credits: {
      cast: [],
    },
    recommendations: {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    },
  };
}
