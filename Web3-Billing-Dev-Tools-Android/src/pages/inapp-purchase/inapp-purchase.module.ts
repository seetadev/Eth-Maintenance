import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InappPurchase } from './inapp-purchase';

@NgModule({
  declarations: [
    InappPurchase,
  ],
  imports: [
    IonicPageModule.forChild(InappPurchase),
  ],
  exports: [
    InappPurchase
  ]
})
export class InappPurchaseModule {}
