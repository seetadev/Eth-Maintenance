import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalDetailComponent } from './proposal-detail/proposal-detail.component';
import { StepsModule } from 'primeng/steps';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProposalDetailComponent
  ],
  imports: [
    CommonModule,
    StepsModule,
    ButtonModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ProposalDetailComponent
  ]
})
export class ProposalDetailModule { }
