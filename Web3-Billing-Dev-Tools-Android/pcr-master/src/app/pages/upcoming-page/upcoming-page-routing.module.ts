import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpcomingPageComponent } from './upcoming-page.component';

const routes: Routes = [{ path: '', component: UpcomingPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpcomingPageRoutingModule { }
