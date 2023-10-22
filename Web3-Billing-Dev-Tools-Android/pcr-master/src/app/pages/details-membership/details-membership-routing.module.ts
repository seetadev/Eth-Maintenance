import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsMembershipComponent } from './details-membership.component';
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: ':id', component: DetailsMembershipComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailsMembershipRoutingModule{ }
