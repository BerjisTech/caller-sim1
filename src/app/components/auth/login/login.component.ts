// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/user/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Listen for OAuth popup message
    window.addEventListener('message', this.handleOAuthMessage.bind(this));
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(
        this.loginForm.get('email')?.value,
        this.loginForm.get('password')?.value
      ).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: error => {
          console.error('Login failed:', error);
        }
      });
    }
  }

  googleLogin() {
    this.authService.googleAuth();
  }

  githubLogin() {
    this.authService.githubAuth();
  }

  private handleOAuthMessage(event: MessageEvent) {
    if (event.data.type === 'oauth-response') {
      this.authService.handleOAuthCallback(event.data.response);
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleOAuthMessage.bind(this));
  }
}
