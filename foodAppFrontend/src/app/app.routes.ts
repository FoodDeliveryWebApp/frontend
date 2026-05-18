import { Routes } from '@angular/router';
import { authGuard } from './infrastructure/auth/auth.guard';
import { LoginComponent } from './infrastructure/auth/login/login.component';
import { RegistrationComponent } from './infrastructure/auth/registration/registration.component';
import { RestaurantListComponent } from './feature/restaurant/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from './feature/restaurant/restaurant-detail/restaurant-detail.component';
import { GuestOrdersComponent } from './feature/order/guest-orders/guest-orders.component';
import { WorkerDashboardComponent } from './feature/order/worker-dashboard/worker-dashboard.component';
import { DeliveryDashboardComponent } from './feature/order/delivery-dashboard/delivery-dashboard.component';
import { ManagerDashboardComponent } from './feature/manager/manager-dashboard/manager-dashboard.component';
import { AddWorkerComponent } from './feature/manager/add-worker/add-worker.component';
import { AddFoodComponent } from './feature/manager/add-food/add-food.component';
import { EarningsComponent } from './feature/manager/earnings/earnings.component';
import { RatingsViewComponent } from './feature/manager/ratings-view/ratings-view.component';
import { ManageWorkersComponent } from './feature/manager/manage-workers/manage-workers.component';
import { ManageFoodsComponent } from './feature/manager/manage-foods/manage-foods.component';
import { AdminDashboardComponent } from './feature/admin/admin-dashboard/admin-dashboard.component';
import { AddRestaurantComponent } from './feature/admin/add-restaurant/add-restaurant.component';
import { ReportsComponent } from './feature/admin/reports/reports.component';
import { AddDeliveryManComponent } from './feature/admin/add-delivery-man/add-delivery-man.component';
import { ManageDeliveryMenComponent } from './feature/admin/manage-delivery-men/manage-delivery-men.component';
import { ManageRestaurantsComponent } from './feature/admin/manage-restaurants/manage-restaurants.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: RestaurantListComponent },
  { path: 'restaurant/:id', component: RestaurantDetailComponent },

  { path: 'my-orders', component: GuestOrdersComponent, canActivate: [authGuard], data: { role: 'guest' } },
  { path: 'worker', component: WorkerDashboardComponent, canActivate: [authGuard], data: { role: 'worker' } },
  { path: 'delivery', component: DeliveryDashboardComponent, canActivate: [authGuard], data: { role: 'deliveryman' } },

  { path: 'manager', component: ManagerDashboardComponent, canActivate: [authGuard], data: { role: 'manager' } },
  { path: 'manager/add-worker', component: AddWorkerComponent, canActivate: [authGuard], data: { role: 'manager' } },
  { path: 'manager/add-food', component: AddFoodComponent, canActivate: [authGuard], data: { role: 'manager' } },
  { path: 'manager/earnings', component: EarningsComponent, canActivate: [authGuard], data: { role: 'manager' } },
  { path: 'manager/ratings', component: RatingsViewComponent, canActivate: [authGuard], data: { role: 'manager' } },
  { path: 'manager/workers', component: ManageWorkersComponent, canActivate: [authGuard], data: { role: 'manager' } },
  { path: 'manager/foods', component: ManageFoodsComponent, canActivate: [authGuard], data: { role: 'manager' } },

  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard], data: { role: 'administrator' } },
  { path: 'admin/add-restaurant', component: AddRestaurantComponent, canActivate: [authGuard], data: { role: 'administrator' } },
  { path: 'admin/reports', component: ReportsComponent, canActivate: [authGuard], data: { role: 'administrator' } },
  { path: 'admin/add-delivery-man', component: AddDeliveryManComponent, canActivate: [authGuard], data: { role: 'administrator' } },
  { path: 'admin/delivery-men', component: ManageDeliveryMenComponent, canActivate: [authGuard], data: { role: 'administrator' } },
  { path: 'admin/restaurants', component: ManageRestaurantsComponent, canActivate: [authGuard], data: { role: 'administrator' } },

  { path: '**', redirectTo: 'home' }
];
