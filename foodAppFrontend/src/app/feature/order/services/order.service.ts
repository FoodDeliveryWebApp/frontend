import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Order, OrderCreate, ManagerEarnings } from '../model/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = environment.apiHost + 'orders';
  private jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  createOrder(order: OrderCreate): Observable<Order> {
    return this.http.post<Order>(this.base, order);
  }

  getGuestOrders(guestId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/guest/${guestId}`);
  }

  getWorkerOrders(workerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/worker/${workerId}`);
  }

  getDeliveryOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/delivery`);
  }

  getManagerEarnings(managerId: number): Observable<ManagerEarnings> {
    return this.http.get<ManagerEarnings>(`${this.base}/manager/${managerId}/earnings`);
  }

  updateStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(
      `${this.base}/order/${orderId}/status`,
      JSON.stringify(status),
      { headers: this.jsonHeaders }
    );
  }
}
