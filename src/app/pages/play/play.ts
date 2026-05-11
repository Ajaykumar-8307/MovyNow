import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, of, timeout } from 'rxjs';
import { SeeMovies } from '../../components/see-movies/see-movies';
import { MovieDetailsResponse, MovieService, StreamSourceResponse } from '../../services/movie.service';
import { ContinueWatchingService } from '../../services/continue-watching.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-play',
  imports: [CommonModule, RouterLink, SeeMovies],
  templateUrl: './play.html',
  styleUrl: './play.css',
})
export class Play implements OnInit {
  movie: MovieDetailsResponse | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  directStreamUrl: string | null = null;
  streamMeta: StreamSourceResponse | null = null;
  isLoading = true;
  hasError = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    readonly movieService: MovieService,
    private readonly continueWatching: ContinueWatchingService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const imdbId = this.route.snapshot.paramMap.get('imdbId');

    if (!imdbId) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.fetchDetails(imdbId);
    this.fetchStream(imdbId);
  }

  retryPlayback(): void {
    const imdbId = this.route.snapshot.paramMap.get('imdbId');
    if (!imdbId) {
      return;
    }

    this.hasError = false;
    this.isLoading = true;
    this.fetchStream(imdbId);
  }

  onVideoTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement | null;
    if (!video || !this.movie || !video.duration || video.currentTime < 10) {
      return;
    }

    this.continueWatching.upsert(this.movie, video.currentTime, video.duration);
  }

  private fetchDetails(imdbId: string): void {
    this.movieService
      .getMovieDetailsByImdb(imdbId)
      .pipe(timeout(1000), catchError(() => of(null)))
      .subscribe({
        next: (movie) => {
          if (!movie) {
            this.hasError = true;
            this.isLoading = false;
            return;
          }

          this.movie = movie;
          this.cdr.detectChanges();
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        },
      });
  }

  private fetchStream(imdbId: string): void {
    this.movieService
      .getStreamSourceByImdb(imdbId)
      .pipe(timeout(9000), catchError(() => of(null)))
      .subscribe({
        next: (source) => {
          if (!source) {
            this.safeVideoUrl = null;
            this.directStreamUrl = null;
            this.streamMeta = null;
            this.hasError = true;
            this.isLoading = false;
            return;
          }

          this.streamMeta = source;
          this.safeVideoUrl = source.embedUrl
            ? this.sanitizer.bypassSecurityTrustResourceUrl(source.embedUrl)
            : null;
          this.directStreamUrl = source.streamUrl;
          this.hasError = !this.safeVideoUrl && !this.directStreamUrl;
          this.isLoading = false;
        },
        error: () => {
          this.safeVideoUrl = null;
          this.directStreamUrl = null;
          this.streamMeta = null;
          this.hasError = true;
          this.isLoading = false;
        },
      });
  }
}
