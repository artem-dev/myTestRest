import { ServerFunctionExecutor } from './ServerFunctionExecutor';
import { Connection } from './Connection';
import { Injectable } from '@angular/core';

@Injectable()
export class ServerFunction {
    // constructor(private connection: Connection) { }
    private _connectionInfo: any = {};
    get connectionInfo(): any {
        return this._connectionInfo;
    }
    set connectionInfo(theConnectionInfo: any) {
        this._connectionInfo = theConnectionInfo;
    }
    private executor: ServerFunctionExecutor = null;

    SetConnection(host: String, port: number, https?: boolean, urlPath?: String): void {
        this.connectionInfo = { 'host': host, 'port': port, 'authentication': null, 'pathPrefix': urlPath, 'https': https };
        // console.log(this.connectionInfo);
        // this.executor = new ServerFunctionExecutor('TServerMethods1', this.connectionInfo);
    }
    /**      *   
     * @param user 
     * @param password 
     * @return result - Type boolean
     */
    setCredentials(user: String, password: String): Boolean {
        if (this.executor != null) {
            console.log('Already logged in' + JSON.stringify(this.executor));
            return true; // already logged in
        }
        console.log('Not logged in ' + JSON.stringify(this.connectionInfo));
        this.connectionInfo.authentication = btoa(user + ':' + password);
        this.executor = new ServerFunctionExecutor('TServerMethods1', this.connectionInfo);
        const testCreds = this.EchoString('ping');
        if (testCreds != null && testCreds.result != null) {
            return true;
        }
        else {
            return false;
        }
    }

getAuth(userName: String, password: String): any {
    const authStr = btoa(userName + ':' + password);
    return this.connectionInfo.authentication = authStr;
}

/**
* @param Value [in] - Type on server: string
* @return result - Type on server: string
*/
EchoString(Value: String): Object {
    // console.log('EchoString ' + JSON.stringify(this.connectionInfo));
    // console.log('Echo ' + JSON.stringify(this.connectionInfo));
    let returnObject = this.executor.executeMethod('EchoString', 'GET', [Value], arguments[1], true, arguments[2], arguments[3]);
    if (arguments[1] == null) {
        if (returnObject != null && returnObject.result != null && Array.isArray(returnObject.result)) {
            const resultArray = returnObject.result;
            let resultObject: any = {};
            resultObject.Value = Value;
            resultObject.result = resultArray[0];
            return resultObject;
        }
        return returnObject;
    }
}

EchoString_URL(Value: String): any {
    return this.executor.getMethodURL('EchoString', 'GET', [Value], arguments[1])[0];
}

/**
 * @param Value [in] - Type on server: string
 * @return result - Type on server: string
 */
ReverseString(Value: String): Object {
    let returnObject = this.executor.executeMethod('ReverseString', 'GET', [Value], arguments[1], true, arguments[2], arguments[3]);
    if (arguments[1] == null) {
        if (returnObject != null && returnObject.result != null && Array.isArray(returnObject.result)) {
            let resultArray = returnObject.result;
            let resultObject: Object = {};
            resultObject.Value = Value;
            resultObject.result = resultArray[0];
            return resultObject;
        }
        return returnObject;
    }
}

ReverseString_URL(Value: String): any {
    return this.executor.getMethodURL('ReverseString', 'GET', [Value], arguments[1])[0];
}
}
