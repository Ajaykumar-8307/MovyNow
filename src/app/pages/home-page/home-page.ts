import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, forkJoin, of, timeout } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { SeeMovies } from '../../components/see-movies/see-movies';
import { HeroSection } from '../../components/hero-section/hero-section';
import { MovieListResponse, MovieService, MovieSummary } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { ContinueWatchingService } from '../../services/continue-watching.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, Navbar, SeeMovies, HeroSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private readonly fallbackMovies: MovieSummary[] = [
    {
      id: 693134,
      title: 'Dune: Part Two',
      overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
      release_date: '2024-02-27',
      vote_average: 8.2,
      genre_ids: [878, 12],
    },
    {
      id: 157336,
      title: 'Interstellar',
      overview: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanitys survival.',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      release_date: '2014-11-05',
      vote_average: 8.5,
      genre_ids: [878, 18],
    },
    {
      id: 872585,
      title: 'Oppenheimer',
      overview: 'The story of J. Robert Oppenheimer and the work that changed the course of modern history.',
      poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
      release_date: '2023-07-19',
      vote_average: 8.1,
      genre_ids: [18, 36],
    },
    {
      id: 361743,
      title: 'Top Gun: Maverick',
      overview: 'After more than thirty years of service, Maverick trains a new generation of elite pilots for a dangerous mission.',
      poster_path: '/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      backdrop_path: '/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg',
      release_date: '2022-05-24',
      vote_average: 8.2,
      genre_ids: [28, 18],
    },
    {
      id: 155,
      title: 'The Dark Knight',
      overview: 'Batman faces the Joker, a criminal mastermind who plunges Gotham into chaos.',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      backdrop_path: '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
      release_date: '2008-07-16',
      vote_average: 8.5,
      genre_ids: [28, 80],
    },
    {
      id: 634649,
      title: 'Spider-Man: No Way Home',
      overview: 'Peter Parker asks Doctor Strange for help and finds the multiverse breaking open around him.',
      poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
      release_date: '2021-12-15',
      vote_average: 7.9,
      genre_ids: [28, 12],
    },
    {
      id: 76600,
      title: 'Avatar: The Way of Water',
      overview: 'Jake Sully and Neytiri protect their family as an old threat returns to Pandora.',
      poster_path: '/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
      release_date: '2022-12-14',
      vote_average: 7.6,
      genre_ids: [878, 12],
    },
    {
      id: 414906,
      title: 'The Batman',
      overview: 'Batman ventures into Gothams underworld when a sadistic killer leaves behind cryptic clues.',
      poster_path: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      backdrop_path: '/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
      release_date: '2022-03-01',
      vote_average: 7.7,
      genre_ids: [80, 9648],
    },
    {
      id: 27205,
      title: 'Inception',
      overview: 'A skilled thief is offered a chance to erase his past if he can implant an idea inside a target.',
      poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
      release_date: '2010-07-15',
      vote_average: 8.4,
      genre_ids: [28, 878],
    },
    {
      id: 1022789,
      title: 'Inside Out 2',
      overview: 'Riley enters her teenage years as new emotions arrive at headquarters.',
      poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      backdrop_path: '/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg',
      release_date: '2024-06-11',
      vote_average: 7.6,
      genre_ids: [16, 35],
    },
  ];

  heroMovies: MovieSummary[] = this.fallbackMovies.slice(0, 6);
  trendingMovies: MovieSummary[] = this.fallbackMovies;
  popularMovies: MovieSummary[] = this.fallbackMovies.slice(2).concat(this.fallbackMovies.slice(0, 2));
  topRatedMovies: MovieSummary[] = this.fallbackMovies.slice().sort((a, b) => b.vote_average - a.vote_average);
  nowPlayingMovies: MovieSummary[] = this.fallbackMovies.slice(0, 8);
  indianMovies: MovieSummary[] = this.fallbackMovies.slice(0, 10);
  genreMovies: MovieSummary[] = [];
  searchResults: MovieSummary[] = [];

  isLoading = false;
  isSearching = false;
  hasError = false;
  searchQuery = '';
  activeShelf = 'home';
  selectedGenreId: number | null = null;

  readonly genres = [
    { id: 28, label: 'Action' },
    { id: 35, label: 'Comedy' },
    { id: 18, label: 'Drama' },
    { id: 53, label: 'Thriller' },
    { id: 10749, label: 'Romance' },
    { id: 878, label: 'Sci-fi' },
  ];

  readonly liveTiles = [
    { title: 'Cricket Night', meta: 'Live scoreboard', icon: 'sports_cricket' },
    { title: 'Football Arena', meta: 'Match center', icon: 'sports_soccer' },
    { title: 'Grand Prix', meta: 'Highlights', icon: 'sports_motorsports' },
  ];

  constructor(
    private readonly movieService: MovieService,
    private readonly route: ActivatedRoute,
    readonly watchlist: WatchlistService,
    readonly continueWatching: ContinueWatchingService,
  ) {}

  ngOnInit(): void {
    this.loadHome();

    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('q') ?? '';
      this.activeShelf = params.get('shelf') ?? 'home';

      if (this.searchQuery) {
        this.searchMovies(this.searchQuery);
      } else {
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  get selectedGenreLabel(): string {
    return this.genres.find((genre) => genre.id === this.selectedGenreId)?.label ?? '';
  }

  get searchSubtitle(): string {
    if (this.isSearching) {
      return 'Looking across the catalogue...';
    }

    return this.searchResults.length
      ? `${this.searchResults.length} titles found`
      : 'Movies matching your search';
  }

  get continueWatchingMovies(): MovieSummary[] {
    return this.continueWatching.items().map((item) => item.movie).slice(0, 12);
  }

  selectGenre(genreId: number): void {
    if (this.selectedGenreId === genreId) {
      this.selectedGenreId = null;
      this.genreMovies = [];
      return;
    }

    this.selectedGenreId = genreId;
    this.movieService.getMoviesByGenre(genreId).subscribe({
      next: (response) => {
        this.genreMovies = this.cleanMovies(response.results);
      },
      error: () => {
        this.genreMovies = [];
      },
    });
  }

  private loadHome(): void {
    this.isLoading = true;
    this.hasError = false;

    forkJoin({
      trending: this.withFallback(this.movieService.getTrendingMovies(), this.trendingMovies),
      popular: this.withFallback(this.movieService.getPopularMovies(), this.popularMovies),
      topRated: this.withFallback(this.movieService.getTopRatedMovies(), this.topRatedMovies),
      nowPlaying: this.withFallback(this.movieService.getNowPlayingMovies(), this.nowPlayingMovies),
      indian: this.withFallback(this.movieService.getIndianMovies(), this.indianMovies),
    }).subscribe({
      next: ({ trending, popular, topRated, nowPlaying, indian }) => {
        this.trendingMovies = this.keepFallbackIfEmpty(trending.results, this.trendingMovies);
        this.popularMovies = this.keepFallbackIfEmpty(popular.results, this.popularMovies);
        this.topRatedMovies = this.keepFallbackIfEmpty(topRated.results, this.topRatedMovies);
        this.nowPlayingMovies = this.keepFallbackIfEmpty(nowPlaying.results, this.nowPlayingMovies);
        this.indianMovies = this.keepFallbackIfEmpty(indian.results, this.indianMovies);
        this.heroMovies = this.trendingMovies.filter((movie) => movie.backdrop_path).slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private searchMovies(query: string): void {
    this.isSearching = true;

    this.movieService.searchMovies(query).subscribe({
      next: (response) => {
        this.searchResults = this.cleanMovies(response.results);
        this.isSearching = false;
      },
      error: () => {
        this.searchResults = [];
        this.isSearching = false;
      },
    });
  }

  private cleanMovies(movies: MovieSummary[]): MovieSummary[] {
    return movies.filter((movie) => Boolean(movie.title && (movie.poster_path || movie.backdrop_path)));
  }

  private keepFallbackIfEmpty(movies: MovieSummary[], fallback: MovieSummary[]): MovieSummary[] {
    const cleanedMovies = this.cleanMovies(movies);
    return cleanedMovies.length ? cleanedMovies : fallback;
  }

  private withFallback(
    request: Observable<MovieListResponse>,
    fallback: MovieSummary[],
  ): Observable<MovieListResponse> {
    return request.pipe(
      timeout(8000),
      catchError(() =>
        of({
          page: 1,
          results: fallback,
          total_pages: 1,
          total_results: fallback.length,
        }),
      ),
    );
  }
}
