import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailsMembershipRoutingModule } from './details-membership-routing.module';
import { DetailsMembershipComponent } from './details-membership.component';

import { TabViewModule } from 'primeng/tabview';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { StepsModule } from 'primeng/steps';
import { ChartModule } from 'primeng/chart';
import { ProposalDetailModule } from 'src/app/shared/components/proposal-detail/proposal-detail.module';
import { SuperFluidServiceModule } from 'src/app/dapp-injector/services/super-fluid/super-fluid-service.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartsModuleShared } from 'src/app/shared/components/charts/charts.module';
import { UserBalanceModule } from 'src/app/shared/components/user-balance/user-balance.module';

@NgModule({
  declarations: [
    DetailsMembershipComponent
  ],
  imports: [
    CommonModule,
    DetailsMembershipRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    SuperFluidServiceModule,
    ProposalDetailModule,
    ChartsModuleShared,
    UserBalanceModule,
 
    ButtonModule,
    InputTextModule, 
    InputNumberModule,
    InputTextareaModule,
    InputSwitchModule,
    ProgressSpinnerModule
  ]
})
export class DetailsMembershipModule{ }
