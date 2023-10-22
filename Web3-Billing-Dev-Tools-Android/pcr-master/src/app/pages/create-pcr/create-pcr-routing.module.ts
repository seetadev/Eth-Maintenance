import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatePcrComponent } from './create-pcr.component';

const routes: Routes = [{ path: '', component: CreatePcrComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatePcrRoutingModule { }
