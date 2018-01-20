import { Injectable } from '@angular/core';
import { ConnectionBackend, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CustomHttp extends Http {
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
        super(backend, defaultOptions);
    }
    // constructor(http: Http) {
    //     this.http = http;
    // }

    SetUpAuthorizationHeader(options?: RequestOptionsArgs): RequestOptionsArgs {
        // ensure request options and headers are not null
        options = options || new RequestOptions();
        options.headers = options.headers || new Headers();
        options.headers.append('Authorization', 'Basic ' + btoa('username:password'));
        return options;
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return super.get(url, this.SetUpAuthorizationHeader(options));
        // return super.get(url, this.createAuthorizationHeader(headers)  });
    }

    // post(url, obj) {
    //     let headers = new Headers();
    //     let data = JSON.stringify(obj);
    //     this.createAuthorizationHeader(headers);
    //     return super.post(url, data, {
    //         headers: headers
    //     });
    // }
}

export function customHttpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
    return new CustomHttp(xhrBackend, requestOptions);
}

export let customHttpProvider = {
    provide: Http,
    useFactory: customHttpFactory,
    deps: [XHRBackend, RequestOptions]
};
