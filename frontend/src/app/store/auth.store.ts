import { Injectable, computed, signal } from '@angular/core';
import { AuthService, AuthUser } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly sessionKey = 'algorithm-viz-session';

  currentUser = signal<AuthUser | null>(this.loadSession());
  displayName = computed(() => this.currentUser()?.displayName?.trim() || this.currentUser()?.username || '学习者');
  avatarInitial = computed(() => Array.from(this.displayName())[0].toLocaleUpperCase());
  isAuthenticated = computed(() => this.currentUser() !== null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(private authService: AuthService) {}

  login(username: string, password: string): void {
    this.success.set(null);
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      this.error.set('请输入用户名和密码。');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.authService.login(normalizedUsername, password).subscribe({
      next: user => this.setSession(user),
      error: err => this.handleError(err, '登录失败，请确认后端服务已启动。'),
    });
  }

  register(
    username: string,
    displayName: string,
    password: string,
    confirmPassword: string,
    onSuccess?: () => void,
  ): void {
    this.success.set(null);
    const normalizedUsername = username.trim();
    const normalizedDisplayName = displayName.trim();

    if (!normalizedUsername || !password || !confirmPassword) {
      this.error.set('请完整填写注册信息。');
      return;
    }
    if (password !== confirmPassword) {
      this.error.set('两次输入的密码不一致。');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.authService.register(normalizedUsername, normalizedDisplayName, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set('注册成功，请登录。');
        onSuccess?.();
      },
      error: err => this.handleError(err, '注册失败，请确认后端服务已启动。'),
    });
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.currentUser.set(null);
    this.error.set(null);
    this.success.set(null);
  }

  clearFeedback(): void {
    this.error.set(null);
    this.success.set(null);
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.currentUser.set(user);
    this.error.set(null);
    this.success.set(null);
    this.isLoading.set(false);
  }

  private handleError(err: unknown, fallback: string): void {
    const message = this.extractMessage(err) || fallback;
    this.error.set(message);
    this.isLoading.set(false);
  }

  private extractMessage(err: unknown): string | null {
    const response = err as { error?: { message?: string } };
    return response.error?.message ?? null;
  }

  private loadSession(): AuthUser | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) return null;

    try {
      const user = JSON.parse(raw);
      return user?.id && typeof user?.username === 'string' && user.username.trim()
        ? { ...user, displayName: typeof user.displayName === 'string' ? user.displayName : '' } : null;
    } catch {
      return null;
    }
  }
}
