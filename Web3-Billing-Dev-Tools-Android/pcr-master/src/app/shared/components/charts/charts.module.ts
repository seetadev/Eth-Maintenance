import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from './charts/charts.component';
import { ChartModule } from 'primeng/chart';



@NgModule({
  declarations: [
    ChartsComponent
  ],
  imports: [
    CommonModule,
    ChartModule
  ],
  exports: [
    ChartsComponent
  ]
})
export class ChartsModuleShared { }
