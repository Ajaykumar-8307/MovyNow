import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { SeeMovies } from '../../components/see-movies/see-movies';
import { CastMember, MovieDetailsResponse, MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-movie-details',
  imports: [CommonModule, RouterLink, Navbar, SeeMovies],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.css']
})
export class MovieDetails implements OnInit {
  movie: MovieDetailsResponse | null = null;
  isLoading = true;
  hasError = false;

  constructor(
    private readonly route: ActivatedRoute,
    readonly movieService: MovieService,
    readonly watchlist: WatchlistService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fetchDetails(id);
    } else {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  get topCast(): CastMember[] {
    return this.movie?.credits.cast.filter((actor) => actor.profile_path).slice(0, 12) ?? [];
  }

  get recommendations() {
    return this.movie?.recommendations.results.filter((item) => item.poster_path).slice(0, 12) ?? [];
  }

  toggleWatchlist(movie: MovieDetailsResponse): void {
    this.watchlist.toggle(movie);
  }

  private fetchDetails(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.movieService
      .getMovieDetails(id)
      .pipe(timeout(8000), catchError(() => of(null)))
      .subscribe({
      next: (movie) => {
        if (!movie) {
          this.hasError = true;
          this.isLoading = false;
          return;
        }

        this.movie = movie;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
}
