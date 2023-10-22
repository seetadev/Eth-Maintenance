import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController } from 'ionic-angular';
import { FormBuilder, Validators , FormGroup} from '@angular/forms';
import { CloudService} from '../../providers/cloud-service';
import { APP_NAME } from '../../providers/app-data';

@IonicPage()
@Component({
  selector: 'page-login-modal',
  templateUrl: 'login-modal.html',
})
export class LoginModal {

  	loginForm : FormGroup;
	emailChanged: boolean = false;
    passwordChanged: boolean = false;
    status: any = {};
	request: any = {};

	constructor(public navCtrl: NavController,
				public viewCtrl: ViewController, 
				public formBuilder: FormBuilder, 
				public cloudService: CloudService) {

		this.loginForm = formBuilder.group({
			email: ['', Validators.required],
			password: ['', Validators.required]
		});

		this.cloudService = cloudService;
		this.request.done = true;

	}

	ionViewDidLoad() {
		// console.log('Hello LoginModalPage Page');
	}

	dismiss() {
		console.log("Dismissing modal with data: "+JSON.stringify(this.status));
		if(!this.status){
			this.viewCtrl.dismiss('');
		}
		else{
			this.viewCtrl.dismiss(this.status);
		}
		
	}

	doAction(action){
		let appname = APP_NAME;
		let emailadd = this.loginForm.value.email;
		emailadd = emailadd.toLowerCase();
		console.log(emailadd);
		let data = {email: emailadd, password: this.loginForm.value.password, appname: appname };
		console.log(JSON.stringify(data));
		this.request.done = false;
		this.cloudService.auth(data, action).subscribe(success => {
          	this.request.done = true;
          	console.log("Auth: "+JSON.stringify(success));
	      	let result = success.result;
	      	this.status = { status: result, user: success.user, action: action };
	      	this.dismiss();
	      	
	    }, error => {
			console.log(JSON.stringify(error));
			this.request.done = true;
			this.dismiss();
	    });
	}

}
