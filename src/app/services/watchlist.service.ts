import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { MovieSummary } from './movie.service';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private readonly storageKey = 'movynow-watchlist';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly items = signal<MovieSummary[]>(this.loadItems());

  toggle(movie: MovieSummary): boolean {
    const exists = this.has(movie.id);
    const nextItems = exists
      ? this.items().filter((item) => item.id !== movie.id)
      : [this.normalizedMovie(movie), ...this.items()];

    this.items.set(nextItems);
    this.persistItems(nextItems);
    return !exists;
  }

  has(id: number | null | undefined): boolean {
    return Boolean(id && this.items().some((item) => item.id === id));
  }

  private normalizedMovie(movie: MovieSummary): MovieSummary {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
    };
  }

  private loadItems(): MovieSummary[] {
    if (!this.isBrowser) {
      return [];
    }

    const rawItems = localStorage.getItem(this.storageKey);

    if (!rawItems) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(rawItems) as MovieSummary[];
      if (!Array.isArray(parsedItems)) {
        return [];
      }

      const deduped = new Map<number, MovieSummary>();
      parsedItems.forEach((item) => {
        if (item && typeof item.id === 'number' && item.title) {
          deduped.set(item.id, this.normalizedMovie(item));
        }
      });
      return Array.from(deduped.values());
    } catch {
      return [];
    }
  }

  private persistItems(items: MovieSummary[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
