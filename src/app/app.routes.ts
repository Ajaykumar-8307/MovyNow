import { Routes } from '@angular/router';
import { MovieDetails } from './pages/movie-details/movie-details';
import { HomePage } from './pages/home-page/home-page';
import { Play } from './pages/play/play';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'play/:imdbId', component: Play },
  { path: '**', redirectTo: '/home' },
];
