import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Restaurant, Worker, WorkerCreate } from '../model/restaurant.model';
import { Food } from '../model/food.model';


@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private base = environment.apiHost + 'restaurants';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.base);
  }

  addRestaurant(dto: object): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.base, dto);
  }

  addWorker(restaurantId: number, worker: WorkerCreate): Observable<void> {
    return this.http.post<void>(`${this.base}/${restaurantId}/workers`, worker);
  }

  addFood(restaurantId: number, food: object): Observable<void> {
    return this.http.post<void>(`${this.base}/${restaurantId}/foods`, food);
  }

  uploadFoodImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${environment.apiHost}foods/upload-image`, formData, { responseType: 'text' });
  }

  getFoodsByRestaurant(restaurantId: number): Observable<Food[]> {
    return this.http.get<Food[]>(`${environment.apiHost}foods/restaurant/${restaurantId}`);
  }

  getWorkers(restaurantId: number): Observable<Worker[]> {
    return this.http.get<Worker[]>(`${this.base}/${restaurantId}/workers`);
  }

  removeWorker(restaurantId: number, workerId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${restaurantId}/workers/${workerId}`);
  }

  updateWorker(restaurantId: number, workerId: number, data: Partial<Worker>): Observable<void> {
    return this.http.put<void>(`${this.base}/${restaurantId}/workers/${workerId}`, data);
  }

  updateFood(foodId: number, data: Food): Observable<void> {
    return this.http.put<void>(`${environment.apiHost}foods/${foodId}`, data);
  }

  removeFood(foodId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiHost}foods/${foodId}`);
  }
}
