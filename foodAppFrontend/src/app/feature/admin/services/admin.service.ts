import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { RestaurantApplication } from '../model/restaurant-application.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiHost + 'restaurant-applications';

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
}
