import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';

  loginUsername = '';
  loginPassword = '';

  registerUsername = '';
  registerDisplayName = '';
  registerPassword = '';
  registerConfirmPassword = '';

  constructor(public auth: AuthStore) {}

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.auth.clearFeedback();
  }

  submitLogin(): void {
    this.auth.login(this.loginUsername, this.loginPassword);
  }

  submitRegister(): void {
    this.auth.register(
      this.registerUsername,
      this.registerDisplayName,
      this.registerPassword,
      this.registerConfirmPassword,
      () => {
        this.loginUsername = this.registerUsername.trim();
        this.loginPassword = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';
        this.mode = 'login';
      },
    );
  }
}
