import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { RestaurantRating, RatingReport } from '../model/restaurant-rating.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private ratingsBase = environment.apiHost + 'restaurant-ratings';
  private reportsBase = environment.apiHost + 'ratingReports';
  private jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  addRating(rating: RestaurantRating): Observable<void> {
    return this.http.post<void>(this.ratingsBase, rating);
  }

  getRatingsForRestaurant(restaurantId: number): Observable<RestaurantRating[]> {
    return this.http.get<RestaurantRating[]>(`${this.ratingsBase}/restaurant/${restaurantId}`);
  }

  getAverageRating(restaurantId: number): Observable<number | null> {
    return this.http.get<number | null>(`${this.ratingsBase}/restaurant/${restaurantId}/average`);
  }

  createReport(report: RatingReport): Observable<RatingReport> {
    return this.http.post<RatingReport>(this.reportsBase, report);
  }

  getAllReports(): Observable<RatingReport[]> {
    return this.http.get<RatingReport[]>(this.reportsBase);
  }

  updateReportStatus(reportId: number, status: string): Observable<RatingReport> {
    return this.http.put<RatingReport>(
      `${this.reportsBase}/${reportId}/status`,
      JSON.stringify(status),
      { headers: this.jsonHeaders }
    );
  }
}
