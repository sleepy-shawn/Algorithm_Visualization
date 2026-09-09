import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthStore } from './store/auth.store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Learning navigation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    TestBed.inject(AuthStore).currentUser.set({ id: 1, username: 'shawn', displayName: '葛帅' });
  });
  it('opens the catalog from home and enters an existing algorithm', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(element => element.textContent?.includes('浏览算法目录'))!;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-algorithm-catalog')).toBeTruthy();
    fixture.nativeElement.querySelector('.catalog-row').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.store.selectedAlgo()).toBe('quick-sort');
    expect(fixture.componentInstance.store.activePanel()).toBe('visualizer');
    expect(fixture.nativeElement.querySelector('app-control-panel')).toBeTruthy();
  });
});
