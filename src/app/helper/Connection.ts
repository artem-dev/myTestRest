import { Injectable } from '@angular/core';

@Injectable()
export class Connection {
    private _connectionInfo: any = {};
    /* get connectionInfo(): any {
        return this._connectionInfo;
    }
    set connectionInfo(theConnectionInfo: any) {
        this._connectionInfo = theConnectionInfo;
    } */

    SetConnection( host: String,  port: number,  https?: boolean,  urlPath?: String): void {
        this._connectionInfo = { 'host': host, 'port': port, 'authentication': null, 'pathPrefix': urlPath, 'https': https };
        return this._connectionInfo;
    }
    getAuth(userName: String, password: String): any {
        const authStr = btoa(userName + ':' + password);
        return this._connectionInfo.authentication = authStr;
    }
}
