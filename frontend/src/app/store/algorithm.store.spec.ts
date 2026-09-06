import { fakeAsync, tick } from '@angular/core/testing';
import { AlgorithmStore } from './algorithm.store';
import { AlgorithmService } from '../services/algorithm.service';
import { AlgorithmResponse, AnyStep, SortStep } from '../models/algorithm.models';
import { Subject } from 'rxjs';

describe('Learning navigation playback lifecycle', () => {
  function playingStore(): AlgorithmStore {
    const store = new AlgorithmStore({} as AlgorithmService);
    store.setActivePanel('visualizer');
    const steps = [{ description: 'first' }, { description: 'second' }, { description: 'third' }] as AnyStep[];
    store.steps.set(steps);
    store.compareSteps.set(steps);
    store.startPlay();
    store.startComparePlay();
    return store;
  }
  it('stops both timers when leaving the learning panel', fakeAsync(() => {
    const store = playingStore();
    store.setActivePanel('catalog');
    tick(1500);
    expect(store.currentStep()).toBe(0);
    expect(store.compareCurrentStep()).toBe(0);
    expect(store.isPlaying()).toBeFalse();
    expect(store.compareIsPlaying()).toBeFalse();
  }));
  it('stops timers and clears incompatible comparison when switching algorithms', fakeAsync(() => {
    const store = playingStore();
    store.compareMode.set(true);
    store.setAlgorithm('binary-search');
    tick(1500);
    expect(store.isPlaying()).toBeFalse();
    expect(store.compareIsPlaying()).toBeFalse();
    expect(store.steps()).toEqual([]);
    expect(store.compareSteps()).toEqual([]);
    expect(store.compareMode()).toBeFalse();
  }));
});

// A late response must not replace the newly selected algorithm's view.

describe('Pending algorithm requests', () => {
  it('ignores responses after switching algorithms', () => {
    const response = new Subject<AlgorithmResponse<SortStep>>();
    const service = { runSort: () => response.asObservable() } as unknown as AlgorithmService;
    const store = new AlgorithmStore(service);
    store.runAlgorithm();
    store.setAlgorithm('binary-search');
    response.next({ steps: [{ description: 'old sort' }] } as AlgorithmResponse<SortStep>);
    expect(store.steps()).toEqual([]);
    expect(store.isLoading()).toBeFalse();
    response.complete();
  });
  it('ignores responses after reset', () => {
    const response = new Subject<AlgorithmResponse<SortStep>>();
    const service = { runSort: () => response.asObservable() } as unknown as AlgorithmService;
    const store = new AlgorithmStore(service);
    store.runAlgorithm();
    store.reset();
    response.next({ steps: [{ description: 'old sort' }] } as AlgorithmResponse<SortStep>);
    expect(store.steps()).toEqual([]);
    expect(store.isLoading()).toBeFalse();
    response.complete();
  });
});
