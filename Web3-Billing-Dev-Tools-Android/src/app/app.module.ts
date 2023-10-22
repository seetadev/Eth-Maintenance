import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';
import { List } from '../pages/list/list';
import { MenuPage } from '../pages/menu/menu';
import { InappPurchase } from '../pages/inapp-purchase/inapp-purchase';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { IonicStorageModule } from '@ionic/storage';
import { Printer } from '@ionic-native/printer';
import { EmailComposer } from '@ionic-native/email-composer';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera } from '@ionic-native/camera';
import { Network } from '@ionic-native/network';
import { InAppPurchase } from '@ionic-native/in-app-purchase';

import { LocalService } from '../providers/local-service';
import { InappPurchaseService } from '../providers/inapp-purchase-service';
import { CloudService } from '../providers/cloud-service';
import { LoginModal } from '../pages/login-modal/login-modal';

@NgModule({
  declarations: [
    MyApp,
    List,
    MenuPage,
    HomePage,
    LoginModal,
    InappPurchase,
    TabsPage
  ],
  imports: [
    BrowserModule, HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    List,
    MenuPage,
    HomePage,
    LoginModal,
    InappPurchase,
    TabsPage
  ],
  providers: [
    Printer,
    InAppPurchase,
    Network,
    InAppBrowser,
    Camera,
    SocialSharing,
    EmailComposer,
    StatusBar,
    LocalService,
    CloudService,
    InappPurchaseService,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
