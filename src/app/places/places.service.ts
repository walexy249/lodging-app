/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import { HttpClient } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { delay, map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';

interface PlaceData {
  availabeTo: string;
  availableFrom: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _userId = 'user1';
  private _places = new BehaviorSubject<Place[]>([]);
  constructor(private authService: AuthService, private http: HttpClient) {}

  get places() {
    return this._places.asObservable();
  }
  fetchPlaces() {
    return this.http
      .get(
        'https://ionic-lodging-app-default-rtdb.firebaseio.com/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const arr = [];
          for (const keys in resData) {
            if (resData.hasOwnProperty(keys)) {
              arr.push(
                new Place(
                  keys,
                  resData[keys].title,
                  resData[keys].description,
                  resData[keys].imageUrl,
                  resData[keys].price,
                  new Date(resData[keys].availableFrom),
                  new Date(resData[keys].availabeTo),
                  resData[keys].userId
                )
              );
            }
          }
          return arr;
        }),
        tap((data) => {
          console.log(data);
          this._places.next(data);
        })
      );
  }
  getPlace(id: string) {
    return this.http
      .get<PlaceData>(
        `https://ionic-lodging-app-default-rtdb.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map(
          (resData) =>
            new Place(
              id,
              resData.title,
              resData.description,
              resData.imageUrl,
              resData.price,
              new Date(resData.availableFrom),
              new Date(resData.availabeTo),
              resData.userId
            )
        )
      );
  }
  addPlace(
    title: string,
    description: string,
    price: number,
    date_from: Date,
    date_to: Date
  ) {
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        if (!userId) {
          throw new Error('could not find userId');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThw71MEAhPCNXtnVuCBegYuTeR2bQ7eK1gQA&usqp=CAU',
          price,
          date_from,
          date_to,
          userId
        );
        return this.http.post<{ name: string }>(
          'https://ionic-lodging-app-default-rtdb.firebaseio.com/offered-places.json',
          { ...newPlace, id: null }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }
  updatePlace(id, title: string, description: string) {
    let updatedPlace;
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const index = places.findIndex((pl) => pl.id === id);
        updatedPlace = [...places];
        const oldPlace = updatedPlace[index];
        updatedPlace[index] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availabeTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-lodging-app-default-rtdb.firebaseio.com/offered-places/${id}.json`,
          { ...updatedPlace[index], id: null }
        );
      }),
      tap(() => {
        console.log('updated place');
        console.log(updatedPlace);
        this._places.next(updatedPlace);
      })
    );
  }
}
