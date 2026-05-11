import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MovieDetails } from './movie-details';
import { MovieService } from '../../services/movie.service';
import { WatchlistService } from '../../services/watchlist.service';

describe('MovieDetails', () => {
  let component: MovieDetails;
  let fixture: ComponentFixture<MovieDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetails],
      providers: [
        provideRouter([]),
        {
          provide: MovieService,
          useValue: {
            imageUrl: () => '',
            posterUrl: () => '',
            backdropUrl: () => '',
            yearFromDate: () => 'New',
            formatRuntime: () => 'Feature',
            formatRating: () => 'NR',
          },
        },
        {
          provide: WatchlistService,
          useValue: {
            has: () => false,
            toggle: () => true,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
