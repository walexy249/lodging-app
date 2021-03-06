import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Place } from 'src/app/places/place.model';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'select' | 'random';
  @ViewChild('f', { static: true }) form: NgForm;
  startDate: string;
  endDate: string;
  constructor(private modalCtl: ModalController) {}

  ngOnInit() {
    console.log(this.selectedPlace);

    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availabeTo);
    if (this.selectedMode === 'random') {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 60 * 1000 -
              availableFrom.getTime())
      ).toISOString();

      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();
    }
  }
  onBookPlace() {
    if (this.form.invalid || !this.dateIsValid()) {
      return;
    }
    console.log('dismissing...');

    this.modalCtl.dismiss({ booking: this.form.value }, 'confirm');
  }
  dateIsValid() {
    const startDate = new Date(this.form.value.date_from);
    const endDate = new Date(this.form.value.date_to);
    return endDate > startDate;
  }
  onCancel() {
    this.modalCtl.dismiss(null, 'cancel');
  }
}
