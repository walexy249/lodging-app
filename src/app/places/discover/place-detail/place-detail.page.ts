import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { BookingsService } from 'src/app/bookings/bookings.service';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = true;
  isLoading = false;
  private placeSub: Subscription;
  constructor(
    private router: Router,
    private navCtl: NavController,
    private modalCtl: ModalController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingsService: BookingsService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertctrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((param: ParamMap) => {
      const id = param.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(id).subscribe(
        (place) => {
          this.place = place;
          // console.log(this.place);
          this.isBookable = this.place.userId !== this.authService.userId;
          this.isLoading = false;
        },
        async (error) => {
          const ctrl = await this.alertctrl.create({
            header: 'An Error Occured',
            message: 'Place could not be found.Please try again later',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/places/tabs/discover']);
                },
              },
            ],
          });
          ctrl.present();
        }
      );
    });
  }
  onBook() {
    // this.router.navigate(['/places', 'tabs', 'discover']);
    // this.navCtl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl
      .create({
        header: 'Choose an action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  async openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtl
      .create({
        component: CreateBookingComponent,
        componentProps: {
          selectedPlace: this.place,
          selectedMode: mode,
        },
      })
      .then((modal) => {
        modal.present();
        return modal.onDidDismiss();
      })
      .then(async (resultData) => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {
          const ctrl = await this.loadingCtrl.create({
            message: 'Booking Place...',
          });
          ctrl.present();
          console.log('Booked!!');
          this.bookingsService
            .addBooking(
              this.place.id,
              this.place.title,
              this.place.imageUrl,
              resultData.data.booking.first_name,
              resultData.data.booking.last_name,
              +resultData.data.booking.no_of_guest,
              new Date(resultData.data.booking.date_from),
              new Date(resultData.data.booking.date_to)
            )
            .subscribe(() => {
              ctrl.dismiss();
              this.router.navigateByUrl('/bookings');
            });
        }
      });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
