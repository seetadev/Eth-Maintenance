import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginModal } from './login-modal';

@NgModule({
  declarations: [
    LoginModal,
  ],
  imports: [
    IonicPageModule.forChild(LoginModal),
  ],
  exports: [
    LoginModal
  ]
})
export class LoginModalModule {}
