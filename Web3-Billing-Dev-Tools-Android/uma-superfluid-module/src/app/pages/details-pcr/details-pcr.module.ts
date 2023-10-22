import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailsPcrRoutingModule } from './details-pcr-routing.module';
import { DetailsPcrComponent } from './details-pcr.component';

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
import { ChartsModuleShared } from 'src/app/shared/components/charts/charts.module';
import { UserBalanceModule } from 'src/app/shared/components/user-balance/user-balance.module';

@NgModule({
  declarations: [
    DetailsPcrComponent
  ],
  imports: [
    CommonModule,
    DetailsPcrRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    ProposalDetailModule,
    ChartsModuleShared,
    UserBalanceModule, 
    
    TabViewModule,
    ButtonModule,
    InputTextModule, 
    InputNumberModule,
    InputTextareaModule,
    InputSwitchModule,
    DialogModule,
    StepsModule,
  ]
})
export class DetailsPcrModule{ }
