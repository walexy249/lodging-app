import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = true;
  isLogin = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingctl: LoadingController
  ) {}

  ngOnInit() {}

  onLogin() {
    this.authService.login();
    this.loadingctl
      .create({ message: 'Loging in...', keyboardClose: true })
      .then((loadingEl) => {
        loadingEl.present();
        setTimeout(() => {
          loadingEl.dismiss();
          this.isLoading = false;
          this.router.navigateByUrl('/places');
        }, 1000);
      });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);

    if (this.isLogin) {
      // login
      this.onLogin();
    } else {
      // signup
    }
  }
  switchAuthMode() {
    this.isLogin = !this.isLogin;
  }
}
