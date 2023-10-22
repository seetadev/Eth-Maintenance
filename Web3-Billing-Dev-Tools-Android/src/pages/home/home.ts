import {  Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import * as AppGeneral from 'socialcalc/AppGeneral';
import { DATA } from '../../providers/app-data';
import { LocalService, File } from '../../providers/local-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	@ViewChild('tableeditor') defaultContent: ElementRef;

	footers : any = [];
	msc: any ;
	tableeditor: any;
	selectedFile : string ;
	selectedFileInterval: any ;
	saveInterval: any ;

	constructor(public navCtrl: NavController, 
				public localService: LocalService,
				public alertCtrl: AlertController) {

		this.msc = DATA['home'][AppGeneral.getDeviceType()]['msc'];
		this.footers = DATA['home'][AppGeneral.getDeviceType()]['footers'];

		this.localService.getSelectedFile().then(selectedFile=>{
			this.selectedFile = selectedFile;
		});
	}

	ionViewWillEnter(){
		this.selectedFileInterval = setInterval(() => {
			this.localService.getSelectedFile().then(selectedFile=>{
				this.selectedFile = selectedFile;
			});
		}, 2000);

		this.saveInterval = setInterval( ()=>{
			// console.log("Entering..")
			this.localService.getSelectedFile().then(selectedFile=>{
				if(selectedFile == 'default') {
					selectedFile = 'Untitled';
					let content= encodeURIComponent(AppGeneral.getSpreadsheetContent());
					this.localService.saveFile(new File(new Date().toString(), new Date().toString(), content, selectedFile));
					this.localService.setSelectedFile(selectedFile);
					return;
				}
				let name = selectedFile;
				let content= encodeURIComponent(AppGeneral.getSpreadsheetContent());
				this.localService.getFile(name).then(data=>{
					let password = data.password;
					let created = new Date(data.created).toString();
					this.localService.saveFile(new File(created, new Date().toString(), content, name, password));
					this.localService.setSelectedFile(name);
				});
			});
		}, 1000);
	}

	ionViewWillLeave(){
		clearInterval(this.selectedFileInterval);
		this.localService.getSelectedFile().then(selectedFile=>{
			if(selectedFile == 'Untitled'){
				this.presentAlert('Save file', 'File temporary saved. Please click Save As in Menu to save file');
			}
		});
		clearInterval(this.saveInterval);
	}

	ngAfterViewInit() {
		var tableeditor: HTMLDivElement = this.defaultContent.nativeElement;
		this.tableeditor = tableeditor;
		this.localService.getSelectedFile().then(selectedFile=>{
			if(selectedFile == 'default' || !selectedFile){
				AppGeneral.initializeApp(tableeditor, JSON.stringify(this.msc));
			}
			else{
				this.localService.getFile(this.selectedFile).then(data => {
					AppGeneral.initializeApp(tableeditor, decodeURIComponent(data.content));
				});
			}
		});
		
	}

	activateFooter(footer){
		AppGeneral.activateFooterButton(footer.index);
		// console.log("activating: "+footer.index+", name:"+footer.name);
		for(var i in this.footers){
			if(this.footers[i].index == footer.index){
				this.footers[i].isActive = true;
			}
			else{
				this.footers[i].isActive = false;
			}
		}
	}

	presentAlert(title, subtitle) {
	  let alert = this.alertCtrl.create({
	    title: title,
	    subTitle: subtitle,
	    buttons: ['Ok']
	  });
	  alert.present();
	}


}
