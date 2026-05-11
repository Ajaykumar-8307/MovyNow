import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { MovieSummary } from './movie.service';

export interface ContinueWatchingItem {
  movie: MovieSummary;
  progressPercent: number;
  lastPositionSeconds: number;
  durationSeconds: number;
  updatedAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContinueWatchingService {
  private readonly storageKey = 'movynow-continue-watching';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly items = signal<ContinueWatchingItem[]>(this.loadItems());

  upsert(movie: MovieSummary, currentTimeSeconds: number, durationSeconds: number): void {
    if (!movie.id || !durationSeconds || Number.isNaN(currentTimeSeconds)) {
      return;
    }

    const progress = Math.max(0, Math.min(100, Math.round((currentTimeSeconds / durationSeconds) * 100)));
    const entry: ContinueWatchingItem = {
      movie: this.normalizedMovie(movie),
      progressPercent: progress,
      lastPositionSeconds: Math.round(currentTimeSeconds),
      durationSeconds: Math.round(durationSeconds),
      updatedAt: Date.now(),
    };

    const next = [entry, ...this.items().filter((item) => item.movie.id !== movie.id)].slice(0, 24);
    this.items.set(next);
    this.persist(next);
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

  private loadItems(): ContinueWatchingItem[] {
    if (!this.isBrowser) {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as ContinueWatchingItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => item?.movie?.id && item.movie.title)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 24);
    } catch {
      return [];
    }
  }

  private persist(items: ContinueWatchingItem[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }
}
