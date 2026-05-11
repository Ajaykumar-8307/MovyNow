import { Component, HostListener, OnInit, ViewChild, ElementRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isScrolled = false;
  isExpanded = false;
  isSearchOpen = false;
  searchTerm = '';
  private readonly searchSubject = new Subject<string>();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('searchInput') searchInput!: ElementRef;

  readonly navItems = [
    { label: 'Home', link: '/home', queryParams: null },
    { label: 'Sports', link: '/home', queryParams: { genre: 'sports' } },
    { label: 'Movies', link: '/home', queryParams: { genre: '28' } },
    { label: 'TV', link: '/home', queryParams: { genre: '10765' } },
    { label: 'Categories', link: '/home', queryParams: null },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe((term) => {
      this.executeSearch(term);
    });

    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchTerm = params['q'];
      }
    });
    
    if (this.isBrowser) {
      this.isScrolled = window.scrollY > 10;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.isBrowser) return;
    this.isScrolled = window.scrollY > 10;
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  submitSearch(): void {
    this.executeSearch(this.searchTerm);
    this.isSearchOpen = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.executeSearch('');
  }
  
  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
    }
  }

  getIconFor(label: string): string {
    switch (label) {
      case 'Home': return 'home';
      case 'Sports': return 'sports_baseball';
      case 'Movies': return 'movie';
      case 'TV': return 'tv';
      case 'Categories': return 'category';
      default: return 'circle';
    }
  }

  private executeSearch(query: string): void {
    const term = query.trim();
    if (!term) {
      const currentParams = { ...this.route.snapshot.queryParams };
      delete currentParams['q'];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: currentParams,
        queryParamsHandling: '',
      });
      return;
    }

    this.router.navigate(['/home'], {
      queryParams: { q: term },
      queryParamsHandling: 'merge',
    });
  }
}
