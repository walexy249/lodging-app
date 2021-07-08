import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Booking } from './booking.model';
import { BookingsService } from './bookings.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading = false;
  private bookingsSub: Subscription;
  constructor(
    private bookingsService: BookingsService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    // this.isLoading = true;
    this.bookingsSub = this.bookingsService.bookings.subscribe((bookings) => {
      this.loadedBookings = bookings;
    });
    // this.bookingsService.bookingsChanged.subscribe((bookings) => {
    //   this.loadedBookings = bookings;
    // });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingsService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }
  async onCancel(bookingId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    const ctrl = await this.loadingCtrl.create({
      message: 'Deleting...',
    });
    ctrl.present();
    this.bookingsService.deletebooking(bookingId).subscribe(() => {
      ctrl.dismiss();
    });
  }

  ngOnDestroy() {
    if (this.bookingsSub) {
      this.bookingsSub.unsubscribe();
    }
  }
}
