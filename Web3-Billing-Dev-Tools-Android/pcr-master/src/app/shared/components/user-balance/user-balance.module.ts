import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBalanceComponent } from './user-balance/user-balance.component';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';




@NgModule({
  declarations: [
    UserBalanceComponent
  ],
  imports: [
    CommonModule,

    FormsModule,
    ReactiveFormsModule,

    DialogModule,
    InputNumberModule,
    ButtonModule
  ],
  exports: [
    UserBalanceComponent
  ]
})
export class UserBalanceModule { }
