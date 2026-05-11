import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomePage } from './home-page';
import { MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';
import { ContinueWatchingService } from '../../services/continue-watching.service';

const emptyMovieResponse = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
};

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        {
          provide: MovieService,
          useValue: {
            getTrendingMovies: () => of(emptyMovieResponse),
            getPopularMovies: () => of(emptyMovieResponse),
            getTopRatedMovies: () => of(emptyMovieResponse),
            getNowPlayingMovies: () => of(emptyMovieResponse),
            getIndianMovies: () => of(emptyMovieResponse),
            getMoviesByGenre: () => of(emptyMovieResponse),
            searchMovies: () => of(emptyMovieResponse),
            posterUrl: () => '',
            backdropUrl: () => '',
            yearFromDate: () => 'New',
            formatRating: () => 'NR',
          },
        },
        {
          provide: WatchlistService,
          useValue: {
            items: () => [],
            has: () => false,
            toggle: () => true,
          },
        },
        {
          provide: ContinueWatchingService,
          useValue: {
            items: () => [],
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
