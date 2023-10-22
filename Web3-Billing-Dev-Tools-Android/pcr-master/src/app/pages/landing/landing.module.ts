import { InjectionToken, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UpcomingRewardsModule } from 'src/app/shared/components/upcoming-rewards/upcoming-rewards.module';



@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    ButtonModule,
    ProgressSpinnerModule,
    UpcomingRewardsModule
    
  ],

})
export class LandingModule { }
