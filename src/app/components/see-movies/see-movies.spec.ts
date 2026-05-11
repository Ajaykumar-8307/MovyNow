import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeMovies } from './see-movies';

describe('SeeMovies', () => {
  let component: SeeMovies;
  let fixture: ComponentFixture<SeeMovies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeeMovies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeMovies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
