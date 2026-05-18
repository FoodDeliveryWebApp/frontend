import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { RestaurantApplication } from '../model/restaurant-application.model';
import { DeliveryMan } from '../model/delivery-man.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiHost + 'restaurant-applications';
  private deliveryBase = environment.apiHost + 'delivery-men';

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<RestaurantApplication[]> {
    return this.http.get<RestaurantApplication[]>(this.base);
  }

  getPendingApplications(): Observable<RestaurantApplication[]> {
    return this.http.get<RestaurantApplication[]>(`${this.base}/pending`);
  }

  processApplication(id: number, decision: string, adminComment: string): Observable<RestaurantApplication> {
    return this.http.put<RestaurantApplication>(`${this.base}/${id}/process`, { decision, adminComment });
  }

  getDeliveryMen(): Observable<DeliveryMan[]> {
    return this.http.get<DeliveryMan[]>(this.deliveryBase);
  }

  createDeliveryMan(dto: object): Observable<void> {
    return this.http.post<void>(this.deliveryBase, dto);
  }

  updateDeliveryMan(id: number, dto: Partial<DeliveryMan>): Observable<void> {
    return this.http.put<void>(`${this.deliveryBase}/${id}`, dto);
  }

  deleteDeliveryMan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.deliveryBase}/${id}`);
  }
}
