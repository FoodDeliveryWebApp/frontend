import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { OrderReport, OrderReportCreate } from '../model/order-report.model';

@Injectable({ providedIn: 'root' })
export class OrderReportService {
  private base = environment.apiHost + 'order-reports';
  private jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  createReport(dto: OrderReportCreate): Observable<OrderReport> {
    return this.http.post<OrderReport>(this.base, dto);
  }

  getMyReports(): Observable<OrderReport[]> {
    return this.http.get<OrderReport[]>(`${this.base}/my`);
  }

  getAllReports(): Observable<OrderReport[]> {
    return this.http.get<OrderReport[]>(this.base);
  }

  answerReport(reportId: number, answer: string): Observable<OrderReport> {
    return this.http.put<OrderReport>(
      `${this.base}/${reportId}/answer`,
      JSON.stringify(answer),
      { headers: this.jsonHeaders }
    );
  }
}
