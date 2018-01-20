import { Component, OnInit } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType } from '@angular/common/http';
import { Http, Request, RequestMethod, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ServerFunction } from './helper/ServerFunction';
import { Connection } from './helper/Connection';

@Component({
  selector: 'app-root',
  // providers: [ ServerFunction ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  results: string[];
  title: any;

  // this.reverseString();
  // this.request('http://localhost:8080/datasnap/rest/TServerMethods1/ReverseString/test');



  constructor(private http: Http, private serverFunction: ServerFunction, private connection: Connection) { }
  reverseString() {
    let headers = new Headers(); // ... Set content type to JSON
    // headers.append('Origin', '');
    let options = new RequestOptions({ headers: headers }); // Create a request option

    // tslint:disable-next-line:max-line-length
    this.http.get('http://localhost:8080/datasnap/rest/TServerMethods1/ReverseString/test', options)
      .map(res => res.json())
      .subscribe(

      data => { console.log(data.result); this.title = data.result },
      err => console.log(err)
    );
  }
  ngOnInit(): void {
    this.reverseString();
    // this.request('http://localhost:8080/datasnap/rest/TServerMethods1/ReverseString/test');
    // let connection = new Connection();
    // let proxy = new ServerFunction(connection);

    this.serverFunction.SetConnection('localhost', 8080, false);
    let tt = this.serverFunction.setCredentials('Admin', 'Admin');

    console.log('tt ' + tt);
    // this.serverFunction.connectionInfo ;
    // console.log(this.connection.connectionInfo);
    // let test2 = proxy.ReverseString('revers');
    let test2 = this.serverFunction.ReverseString('revers');
    console.log(this.serverFunction.EchoString('Test'));
    // this.serverFunction.CloseSession();
    let tt2 = this.serverFunction.setCredentials('Admin', 'Admin');
    console.log('tt ' + tt2);
    console.log(this.serverFunction.EchoString('Test'));
    console.log(test2);
    // let test3 = this.test('http://localhost:8080/datasnap/rest/TServerMethods1/ReverseString/test');
    // console.log(test3);
  }
  
  parseSessionID(request) {
    // if (request != null) {
    // pragma may store the Session ID value to use in future calls
    let pragmaStr = request;
    if (pragmaStr != null) {
      // Header looks like this, if set: Pragma: dssession=this.SessionID,dssessionexpires=this.SessionIDExpires
      let sessKey = 'dssession=';
      let expireKey = 'dssessionexpires=';
      let sessIndx = pragmaStr.indexOf('dssession=');
      if (sessIndx > -1) {
        let commaIndx = pragmaStr.indexOf(',', sessIndx);
        commaIndx = commaIndx < 0 ? pragmaStr.length : commaIndx;
        sessIndx = sessIndx + sessKey.length;
        const sessionId = pragmaStr.substr(sessIndx, (commaIndx - sessIndx));
        let sessionExpires = null;
        let expiresIndx = pragmaStr.indexOf(expireKey);
        if (expiresIndx > -1) {
          commaIndx = pragmaStr.indexOf(',', expiresIndx);
          commaIndx = commaIndx < 0 ? pragmaStr.length : commaIndx;
          expiresIndx = expiresIndx + expireKey.length;
          // tslint:disable-next-line:radix
          const expiresMillis = parseInt(pragmaStr.substr(expiresIndx, (commaIndx - expiresIndx)));
          if (expiresMillis !== 0 && expiresMillis !== NaN) {
            sessionExpires = new Date();
            sessionExpires.setMilliseconds(sessionExpires.getMilliseconds() + expiresMillis);
          }
        }
        console.log(sessionId);
        console.log(sessionExpires);
        // this.setSessionData(sessionId, sessionExpires);
      }
    }
  }
  request(url: string) {
    let req = new Request({
      url: url,
      method: RequestMethod.Get
    });

    return this.http.request(req).subscribe(
      res => {
        this.parseSessionID(res.headers.get('Pragma'));
        // console.log (res.headers.get('Pragma'));
        console.log('res ' + res.status);
      },
      data => { console.log(JSON.parse(data)); }
    );
  }
}

