import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService, MovieSummary } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection {
  @Input() movies: MovieSummary[] = [];

  activeIndex = 0;

  constructor(
    readonly movieService: MovieService,
    readonly watchlist: WatchlistService,
  ) {}

  get featuredMovie(): MovieSummary | null {
    return this.movies[this.activeIndex] ?? this.movies[0] ?? null;
  }

  setActive(index: number): void {
    this.activeIndex = index;
  }

  nextMovie(): void {
    if (!this.movies.length) {
      return;
    }

    this.activeIndex = (this.activeIndex + 1) % this.movies.length;
  }

  toggleWatchlist(event: MouseEvent, movie: MovieSummary): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlist.toggle(movie);
  }

}
