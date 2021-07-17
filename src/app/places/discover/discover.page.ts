import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  selected;
  isBookable = true;
  isLoading = false;
  private placesSub: Subscription;
  constructor(
    private placesService: PlacesService,
    private menuCtl: MenuController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe((places) => {
      // console.log(placess);

      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.selected = Math.floor(Math.random() * this.relevantPlaces.length);
    });
  }
  ionViewWillEnter() {
    if (this.loadedPlaces.length > 0) {
      return;
    }
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }
  onFilterBookings(event) {
    console.log(event.detail);
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      if (event.detail.value === 'bookable') {
        console.log(this.authService);
        console.log(this.loadedPlaces);
        console.log(this.relevantPlaces);

        this.relevantPlaces = this.loadedPlaces.filter(
          (pl) => pl.userId !== userId
        );
        this.selected = Math.floor(Math.random() * this.relevantPlaces.length);
        console.log(this.relevantPlaces);
      } else {
        this.relevantPlaces = this.loadedPlaces;
        this.selected = Math.floor(Math.random() * this.relevantPlaces.length);
        console.log(this.relevantPlaces);
      }
    });
  }
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
  // onOpenMenu() {
  //   this.menuCtl.toggle();
  // }
}
