import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthResponseData, AuthService } from './auth.service';

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
    private loadingctl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.loadingctl
      .create({ message: 'Loging in...', keyboardClose: true })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          (resData) => {
            console.log(resData);
            loadingEl.dismiss();
            this.isLoading = false;
            this.router.navigateByUrl('/places');
          },
          (errRes) => {
            loadingEl.dismiss();
            console.log(errRes);
            const code = errRes.error.error.message;

            let message = 'Could not sign up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email address already exists';
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = 'This email cant be found';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'Invalid password';
            }
            this.showAlert(message);
          }
        );
      });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);

    this.authenticate(email, password);
  }
  switchAuthMode() {
    this.isLogin = !this.isLogin;
  }
  private showAlert(message: string) {
    this.alertCtrl
      .create({ header: 'Authentication Failed', message, buttons: ['Okay'] })
      .then((alertEl) => {
        alertEl.present();
      });
  }
}
