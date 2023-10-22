import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions ,URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

let BASE_URL = 'http://aspiringapps.com/api';

@Injectable()
export class CloudService {

	constructor(public http: Http) {
		//	console.log('Hello CloudService Provider');
	}
	createPDF(content){
		// alert(content);
		let url = BASE_URL+"/htmltopdf";
		// alert(url);
		let body = JSON.stringify({ content: content});
    	let headers = new Headers({ 'Content-Type': 'application/json' });
    	let options = new RequestOptions({ headers: headers });

        return this.http.post(url, body, options).map(res => res.json());
    }

    auth(data, action){
        let url = BASE_URL+"/"+action;
        let body = JSON.stringify({ data: data});
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, body, options).map(res => res.json());
    }

    logout(){
        let url = BASE_URL+"/logout";
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, '', options).map(res => res.json());
    }

    saveToServer(data){
        let url = BASE_URL+"/save";
        let body = JSON.stringify({ data: data});
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, body, options).map(res => res.json());
    }

    listFiles(appname){
        let url = BASE_URL+"/list";
        let params: URLSearchParams = new URLSearchParams();
        params.set('appname', appname);
        return this.http.get(url, { search: params }).map(res => res.json());
    }

    saveMultiple(appname, data){
        let url = BASE_URL+"/saveMutiple";
        let body = JSON.stringify({ appname: appname, data: data });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, body, options).map(res => res.json());
    }

    moveLocal(appname, args){
        let url = BASE_URL+"/moveLocal";
        let params: URLSearchParams = new URLSearchParams();
        params.set('appname', appname);
        params.set('args', args);
        return this.http.get(url, { search: params }).map(res => res.json());
    }

    deleteFile(filename, appname){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.delete(`${BASE_URL}/delete?appname=${appname}&filename=${filename}`, options).map(res => res.json());
    }

    restore(appname, key){
        let url = BASE_URL+"/purchases";
        let params: URLSearchParams = new URLSearchParams();
        params.set('appname', appname);
        params.set('key', key);
        return this.http.get(url, { search: params }).map(res => res.json());
    }

    handleError(error) {
        console.error(JSON.stringify(error));
        return Observable.throw(error.error || 'Server error');
    }

    putLogoURL(appname, content){
        let suffix = "jpeg";
        let url = BASE_URL+"/logo";
        let body = JSON.stringify({ content: content, suffix: suffix });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, body, options).map(res => res.json());
    }

}
