import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpcomingPageRoutingModule } from './upcoming-page-routing.module';
import { UpcomingPageComponent } from './upcoming-page.component';
import { UpcomingRewardsModule } from 'src/app/shared/components/upcoming-rewards/upcoming-rewards.module';


@NgModule({
  declarations: [
    UpcomingPageComponent
  ],
  imports: [
    CommonModule,
    UpcomingPageRoutingModule,
    UpcomingRewardsModule
  ]
})
export class UpcomingPageModule { }
