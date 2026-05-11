import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Play } from './play';
import { MovieService } from '../../services/movie.service';

describe('Play', () => {
  let component: Play;
  let fixture: ComponentFixture<Play>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Play],
      providers: [
        provideRouter([]),
        {
          provide: MovieService,
          useValue: {
            getMovieDetailsByImdb: () => undefined,
            getStreamSourceByImdb: () => undefined,
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Play);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
