import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { DeliveryMan } from '../model/delivery-man.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private deliveryBase = environment.apiHost + 'delivery-men';

  constructor(private http: HttpClient) {}

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
