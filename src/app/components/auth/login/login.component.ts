// src/app/components/login/login.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('loginContainer') loginContainer?: ElementRef;

  public signupForm: FormGroup;
  public loginForm: FormGroup;
  public show_login: boolean = false;
  public show_signup: boolean = false;
  public email_selected: boolean = false;
  public password_selected: boolean = false;
  public email: string = '';
  public password: string = '';
  public confirm_password_selected: boolean = false;
  public confirmPassword: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });


    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Set showw_login and show_signup to false if r3_token exists in localStorage
    if (localStorage.getItem('r3_token')) {
      this.hideAuthButtons();
    }
  }

  ngOnInit() {
    // Listen for OAuth popup message
    window.addEventListener('message', this.handleOAuthMessage.bind(this));
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  onDocumentClick = (event: MouseEvent): void => {
    // Check if login is shown and click target is not null
    if (!this.show_login || !event.target) return;

    // Check if click was outside the login container
    const clickedElement = event.target as HTMLElement;
    if (this.loginContainer?.nativeElement &&
      !this.loginContainer.nativeElement.contains(clickedElement) &&
      !clickedElement.closest('button')) {
      this.show_login = false;
    }
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onSignupSubmit() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;
      this.authService.register(email, password).subscribe({
        next: () => this.hideAuthButtons(), // this.router.navigate(['/dashboard']),
        error: error => console.error('Signup failed:', error)
      });
    } else {
      console.error('Form is invalid');
    }
  }

  onSigninSubmit() {
    try {
      if (this.loginForm.valid) {
        this.authService.login(
          this.loginForm.get('email')?.value,
          this.loginForm.get('password')?.value
        ).subscribe({
          next: () => {
            // this.router.navigate(['/dashboard']);
            this.hideAuthButtons()
          },
          error: error => {
            console.error('Login failed:', error);
          }
        });
      } else {
        console.error('Form is invalid');
      }
    } catch (error) {
      console.error('Login failed:', error);
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

  private hideAuthButtons() {
    this.show_login = false;
    this.show_signup = false;
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleOAuthMessage.bind(this));
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }
}
