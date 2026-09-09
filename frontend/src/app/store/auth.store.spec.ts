import { AuthStore } from './auth.store';
import { AuthService } from '../services/auth.service';

describe('Account display', () => {
  let previous: string | null;
  beforeEach(() => { previous = localStorage.getItem('algorithm-viz-session'); localStorage.removeItem('algorithm-viz-session'); });
  afterEach(() => { localStorage.removeItem('algorithm-viz-session'); if (previous) localStorage.setItem('algorithm-viz-session', previous); });
  it('keeps a valid saved account with an empty display name', () => {
    localStorage.setItem('algorithm-viz-session', JSON.stringify({ id: 1, username: 'sleepy-shawn', displayName: '' }));
    const store = new AuthStore({} as AuthService);
    expect(store.isAuthenticated()).toBeTrue();
    expect(store.displayName()).toBe('sleepy-shawn');
    expect(store.avatarInitial()).toBe('S');
  });
  it('uses the same trimmed name for the account and avatar', () => {
    const store = new AuthStore({} as AuthService);
    store.currentUser.set({ id: 1, username: 'shawn', displayName: '  葛帅  ' });
    expect(store.displayName()).toBe('葛帅');
    expect(store.avatarInitial()).toBe('葛');
  });
  it('ignores malformed sessions', () => {
    localStorage.setItem('algorithm-viz-session', '{');
    expect(new AuthStore({} as AuthService).isAuthenticated()).toBeFalse();
  });
});
