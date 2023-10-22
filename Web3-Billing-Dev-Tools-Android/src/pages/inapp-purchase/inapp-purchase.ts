import { Component } from '@angular/core';
import { IonicPage, NavController, ActionSheetController, Platform, ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { InappPurchaseService } from '../../providers/inapp-purchase-service';
import { PDF_10, PDF_25, PDF_50, PDF_100, SPE_10, SPE_500, SPE_1000 } from '../../providers/app-data';

@IonicPage()
@Component({
  selector: 'page-inapp-purchase',
  templateUrl: 'inapp-purchase.html',
})
export class InappPurchase {

	items: any = [];
	loaded: any;

	constructor(public navCtrl: NavController,
				public platform: Platform,
				public inapp: InappPurchaseService,
				public toastCtrl: ToastController,
				public actionSheetCtrl: ActionSheetController,
				public network: Network) {

				this.loaded = false;
	}

	ionViewWillEnter() {
		// console.log('Hello InappPurchasePage Page');
		this.inapp.displayItems().subscribe(items => {
			this.items = items;
		});

		if(!this.loaded){
    		this.inapp.loadItems().then(products =>{
				this.loaded = true;
			},
			error => {
				console.log("Error while loading: "+JSON.stringify(error));
			});
    	}

		this.platform.ready().then(() => {
			// watch network for a connection
			this.network.onConnect().subscribe(() => {
			  console.log('network connected!');
			  setTimeout(() => {
					if(this.network.type == 'unknown'){
						console.log("No network connection.Connect and continue");
						this.loaded = false;
					}
					else{
						console.log("Loaded=>"+this.loaded)
				    	if(!this.loaded){
				    		this.inapp.loadItems().then(products =>{
								this.loaded = true;
							},
							error => {
								console.log("Error while loading: "+JSON.stringify(error));
							});
				    	}
					}
			  }, 3000);
			});

			this.network.onDisconnect().subscribe(() => {
				console.log("No network connection.Connect and continue");
				this.loaded = false;
			});
        });
	}

	loadProducts(){
		this.inapp.loadItems().then(products =>{
			this.loaded = true;
		},
		error => {
			console.log("Error while loading: "+JSON.stringify(error));
		});
	}

	buyItem(id){
		if(!this.loaded){
			this.loadProducts();
		}
		let that = this;
		this.inapp.getInappItems().then(products =>{
        	switch(id) {
        		case PDF_10: 
        		case PDF_25: 
        		case PDF_50: 
        		case PDF_100:
						for(var i=0;i<4;i++){
							if(products[i].Purchase =='Yes') {
								that.showToast("PDFs already purchased");
								return;
							}
						}
        			break;

        		case SPE_10:
        		case SPE_500:
        		case SPE_1000:
        			if(products[9].Purchase == "Yes"){
		                if((products[9].Own - products[9].Consumed) > 3) { that.showToast("Please consume the remaining units"); return; }
		                else if((products[10].Own - products[10].Consumed) > 30) { that.showToast("Please consume the remaining units"); return; }
		                else if((products[11].Own - products[11].Consumed) > 30) { that.showToast("Please consume the remaining units"); return; }
		            }
		            else if(products[10].Purchase == "Yes"){
		                if((products[9].Own - products[9].Consumed) > 3) { that.showToast("Please consume the remaining units"); return; }
		                else if((products[10].Own - products[10].Consumed) > 30) { that.showToast("Please consume the remaining units"); return; }
		                else if((products[11].Own - products[11].Consumed) > 30) { that.showToast("Please consume the remaining units"); return; }
		            }
		            else if(products[11].Purchase == "Yes"){
		                if((products[9].Own - products[9].Consumed) > 3) { that.showToast("Please consume the remaining units"); return; }
		                else if((products[10].Own - products[10].Consumed) > 30) { that.showToast("Please consume the remaining units"); return; }
		                else if((products[11].Own - products[11].Consumed) > 30) { that.showToast("Please consume the remaining units"); return; }
		            }
        			break;
        		
        		default:
        			break;
        	}

        	this.inapp.purchaseItem(id).then(data =>{
				// console.log(JSON.stringify(data));
				this.inapp.successCallback(id).subscribe(sucesss =>{
					console.log("Purchase successful. Product updated. ");
					that.inapp.displayItems().subscribe(items => {
						that.items = items;
					});
				});
			});
		});
	}

	showActionForInapp(item){
		let actionSheet = this.actionSheetCtrl.create({
			title: 'More Options',
			buttons: [
			{
			  text: 'Buy',
			  handler: () => {
			    console.log('buy clicked');
			    this.buyItem(item.id);
			  }
			},{
			  text: 'Cancel',
			  role: 'cancel',
			  handler: () => {
			    console.log('Cancel clicked');
			  }
			}
			]
			});
		actionSheet.present();
	}

	doRefresh(refresher){
		this.inapp.displayItems().subscribe(items => {
			this.items = items;
			refresher.complete();
		});
	}

	showToast(message){
  		let toast = this.toastCtrl.create({
    		message: message,
    		duration: 3000,
    		position: 'bottom'
    	});

  		toast.onDidDismiss(() => {
  		// console.log('Dismissed toast');
  		});

		toast.present();
  	}

}
