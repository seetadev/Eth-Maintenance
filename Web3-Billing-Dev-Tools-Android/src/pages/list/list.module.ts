import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { List } from './list';

@NgModule({
  declarations: [
    List,
  ],
  imports: [
    IonicPageModule.forChild(List),
  ],
  exports: [
    List
  ]
})
export class ListModule {}
