import { DisplayPreferencesComponent } from './components/display-preferences/display-preferences.component';
import { TranslatePipe } from './i18n/translate.pipe';
import { UiIconComponent } from './components/ui-icon/ui-icon.component';
import { Component, computed, effect, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningHomeComponent } from './components/learning-home/learning-home.component';
import { AlgorithmCatalogComponent } from './components/algorithm-catalog/algorithm-catalog.component';
import { ALGORITHM_GROUPS } from './data/algorithm-catalog';
import { ActivePanel, AlgorithmId } from './models/algorithm.models';
import { AlgorithmStore } from './store/algorithm.store';
import { AuthStore } from './store/auth.store';
import { AuthComponent } from './components/auth/auth.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { InputConfigComponent } from './components/input-config/input-config.component';
import { ComplexityPanelComponent } from './components/complexity-panel/complexity-panel.component';
import { PhaseGuideComponent } from './components/phase-guide/phase-guide.component';
import { SortingVisualizerComponent } from './visualizers/sorting/sorting-visualizer.component';
import { GraphVisualizerComponent } from './visualizers/graph/graph-visualizer.component';
import { SearchVisualizerComponent } from './visualizers/search/search-visualizer.component';
import { DpVisualizerComponent } from './visualizers/dp/dp-visualizer.component';
import { NQueensVisualizerComponent } from './visualizers/n-queens/n-queens-visualizer.component';
import { DivideConquerVisualizerComponent } from './visualizers/divide-conquer/divide-conquer-visualizer.component';
import { Vr3dVisualizerComponent } from './visualizers/vr-3d/vr-3d-visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslatePipe, DisplayPreferencesComponent,
    UiIconComponent,
    CommonModule,
    LearningHomeComponent,
    AlgorithmCatalogComponent,
    AuthComponent,
    SidebarComponent,
    ControlPanelComponent,
    InputConfigComponent,
    ComplexityPanelComponent,
    PhaseGuideComponent,
    SortingVisualizerComponent,
    GraphVisualizerComponent,
    SearchVisualizerComponent,
    DpVisualizerComponent,
    NQueensVisualizerComponent,
    DivideConquerVisualizerComponent,
    Vr3dVisualizerComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly tabs: { id: ActivePanel; label: string }[] = [
    { id: 'home', label: '首页' },
    { id: 'catalog', label: '算法目录' },
    { id: 'visualizer', label: '可视化学习' },
  ];
  readonly compareEntryLabel = computed(() => ALGORITHM_GROUPS.flatMap(group => group.items).find(item => item.id === this.store.compareAlgo())?.label ?? this.store.compareAlgo());
  detailsOpen = false;
  catalogCategory = '';
  mobileNavigationOpen = false;
  @ViewChild('navigationTrigger') navigationTrigger?: ElementRef<HTMLButtonElement>;
  mobileNavigation?: ElementRef<HTMLElement>;
  @ViewChild('mobileNavigation') set navigationElement(element: ElementRef<HTMLElement> | undefined) {
    this.mobileNavigation = element;
    if (element) queueMicrotask(() => element.nativeElement.querySelector<HTMLButtonElement>('button')?.focus());
  }
  @ViewChild('mainContent') mainContent?: ElementRef<HTMLElement>;
  readonly selectedEntry = computed(() => {
    for (const group of ALGORITHM_GROUPS) {
      const item = group.items.find(entry => entry.id === this.store.selectedAlgo());
      if (item) return { ...item, category: group.category };
    }
    return null;
  });

  navigate(panel: ActivePanel): void {
    this.store.setActivePanel(panel);
    this.closeNavigation(false);
    queueMicrotask(() => { this.mainContent?.nativeElement.scrollTo(0, 0); this.mainContent?.nativeElement.focus(); });
  }

  browse(category = ''): void {
    this.catalogCategory = category;
    this.navigate('catalog');
  }

  learn(id: AlgorithmId): void {
    this.store.setAlgorithm(id);
    this.navigate('visualizer');
  }

  openNavigation(): void {
    this.mobileNavigationOpen = true;
  }

  closeNavigation(restoreFocus = true): void {
    this.mobileNavigationOpen = false;
    if (restoreFocus) this.navigationTrigger?.nativeElement.focus();
  }

  @HostListener('window:resize') onResize(): void {
    if (window.innerWidth >= 1024) this.closeNavigation(false);
  }

  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (!this.mobileNavigationOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); this.closeNavigation(); }
    if (event.key !== 'Tab') return;
    const items = this.mobileNavigation?.nativeElement.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, [tabindex="0"]');
    if (!items?.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  constructor(
    public store: AlgorithmStore,
    public auth: AuthStore,
  ) {
    effect(() => {
      this.store.selectedAlgo();
      this.store.compareAlgo();
      this.store.vr3dStructure();
      this.store.activePanel();
      this.detailsOpen = false;
    });
  }

  logout(): void {
    this.store.setActivePanel('home');
    this.closeNavigation(false);
    this.auth.logout();
  }

}
