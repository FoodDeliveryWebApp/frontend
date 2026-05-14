# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at http://localhost:4200 (auto-reloads)
ng build           # production build → dist/
ng build --watch --configuration development  # watch mode
ng test            # unit tests via Karma/Jasmine
ng generate component <path/name>   # scaffold a standalone component
```

## Architecture

**Angular 20** app using **standalone components** everywhere. No NgModules are used for routing or features — `AuthModule` is an empty shell kept for compatibility.

### Key config files

- `src/env/environment.ts` — `apiHost: 'https://localhost:44333/api/'` (backend base URL)
- `src/app/app.config.ts` — wires `provideRouter`, `provideHttpClient(withInterceptors([jwtInterceptorFn]))`, `provideAnimations()`
- `src/app/app.routes.ts` — all routes with `canActivate: [authGuard]` + `data: { role: '...' }` for role enforcement

### Folder structure

```
src/app/
├── infrastructure/auth/      Auth service, JWT interceptor, functional authGuard, login/registration components
├── shared/                   constants.ts (ACCESS_TOKEN, USER), model/paged-results.model.ts
├── layout/navbar/            Navbar — shows role-specific links from AuthService.user$
└── feature/
    ├── restaurant/           RestaurantListComponent, RestaurantDetailComponent (cart + order + rating)
    │   ├── model/            Restaurant, Food, WorkerCreate interfaces
    │   └── services/         RestaurantService (getAll, addRestaurant, addWorker, addFood, getFoodsByRestaurant)
    ├── order/                GuestOrdersComponent, WorkerDashboardComponent, DeliveryDashboardComponent
    │   ├── model/            Order, OrderCreate, ManagerEarnings interfaces
    │   └── services/         OrderService (all order CRUD + updateStatus)
    ├── rating/               RestaurantRating, RatingReport models; RatingService
    ├── manager/              ManagerDashboard, AddWorker, AddFood, Earnings, RatingsView
    │   └── services/         ManagerService — finds manager's restaurant by matching username in getAll()
    └── admin/                AdminDashboard, AddRestaurant, Applications, Reports
        └── services/         AdminService (applications CRUD)
```

### Auth flow

1. `LoginComponent` calls `AuthService.login()` → saves JWT to localStorage → decodes JWT manually (`atob`) to populate `user$` (`BehaviorSubject<User>`)
2. After login, navigates to role-specific dashboard based on `user$.role`
3. `jwtInterceptorFn` (functional) attaches `Authorization: Bearer <token>` to every HTTP request
4. `authGuard` (functional) checks `user$.username` for auth, and optionally `route.data['role']` for RBAC
5. `AuthService.checkIfUserExists()` is called in `App.ngOnInit()` to restore session from localStorage

### User roles and routes

| Role | Landing route |
|---|---|
| `guest` | `/home` → `/my-orders` |
| `worker` | `/worker` |
| `deliveryman` | `/delivery` |
| `manager` | `/manager` → `/manager/add-worker`, `/manager/add-food`, `/manager/earnings`, `/manager/ratings` |
| `administrator` | `/admin` → `/admin/add-restaurant`, `/admin/applications`, `/admin/reports` |

### Backend API base

`https://localhost:44333/api/` — .NET backend must be running. Key endpoints:

- `POST /users/login`, `POST /users` (register guest)
- `GET /restaurants`, `POST /restaurants`, `POST /restaurants/{id}/workers`, `POST /restaurants/{id}/foods`
- `GET /foods/restaurant/{id}`
- `POST /orders`, `GET /orders/guest/{id}`, `GET /orders/worker/{id}`, `GET /orders/delivery`, `GET /orders/manager/{id}/earnings`, `PUT /orders/order/{id}/status`
- `POST /restaurant-ratings`, `GET /restaurant-ratings/restaurant/{id}`
- `POST /ratingReports`, `GET /ratingReports`, `PUT /ratingReports/{id}/status`
- `POST /restaurant-applications`, `GET /restaurant-applications`, `GET /restaurant-applications/pending`, `PUT /restaurant-applications/{id}/process`

### JWT role claim

The backend puts the role in the claim `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` as a lowercase string (`administrator`, `manager`, `worker`, `deliveryman`, `guest`). The `authGuard` compares in lowercase.

### Pipes in standalone components

Angular pipes (`SlicePipe`, `DecimalPipe`) must be explicitly imported in each standalone component's `imports` array — they are not globally available.

### Finding a manager's restaurant

There is no dedicated `GET /restaurants/by-manager` endpoint. `ManagerService.getManagedRestaurant()` calls `GET /restaurants` and filters by `restaurant.manager?.username === currentUser.username`. The result is cached in-memory per service instance.
