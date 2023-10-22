import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreatePcrRoutingModule } from './create-pcr-routing.module';
import { CreatePcrComponent } from './create-pcr.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {DropdownModule} from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
@NgModule({
  declarations: [
    CreatePcrComponent
  ],
  imports: [
    CommonModule,
    CreatePcrRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    DialogModule
    
  ]
})
export class CreatePcrModule { }
