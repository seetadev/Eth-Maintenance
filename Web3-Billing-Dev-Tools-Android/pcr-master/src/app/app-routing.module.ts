import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'landing', loadChildren: () => import('./pages/landing/landing.module').then(m => m.LandingModule) },
  { path: 'create-pcr', loadChildren: () => import('./pages/create-pcr/create-pcr.module').then(m => m.CreatePcrModule) },
  { path: 'details-pcr', loadChildren: () => import('./pages/details-pcr/details-pcr.module').then(m => m.DetailsPcrModule) },
  { path: 'details-membership', loadChildren: () => import('./pages/details-membership/details-membership.module').then(m => m.DetailsMembershipModule) },
  { path: 'upcoming', loadChildren: () => import('./pages/upcoming-page/upcoming-page.module').then(m => m.UpcomingPageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
