import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService, MovieSummary } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-see-movies',
  imports: [CommonModule, RouterLink],
  templateUrl: './see-movies.html',
  styleUrl: './see-movies.css',
})
export class SeeMovies {
  @Input() title = 'Recommended';
  @Input() subtitle = '';
  @Input() movies: MovieSummary[] = [];
  @Input() ranked = false;
  @Input() emptyText = 'No titles found here yet.';

  @ViewChild('rail') private readonly rail?: ElementRef<HTMLDivElement>;

  constructor(
    readonly movieService: MovieService,
    readonly watchlist: WatchlistService,
  ) {}

  scrollRail(direction: -1 | 1): void {
    this.rail?.nativeElement.scrollBy({
      left: direction * 720,
      behavior: 'smooth',
    });
  }

  toggleWatchlist(event: MouseEvent, movie: MovieSummary): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlist.toggle(movie);
  }

  markPosterMissing(movie: MovieSummary): void {
    movie.poster_path = null;
  }
}
