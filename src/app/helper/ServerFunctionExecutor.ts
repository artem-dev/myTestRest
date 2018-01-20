import { Http, RequestOptions, RequestMethod, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';


export class ServerFunctionExecutor {
    constructor(private className: string, public connectionInfo: {} , private owner?: string) {
        // this.CloseSession();
     }
    private Port: number = this.getConnectionPort(this.connectionInfo);
    // private Port: Number = 80;
    private Host: string = this.getConnectionHost(this.connectionInfo);
    private UserName: String = '';
    private Password: String = '';
    private connectionTimeout = 5000;
    private communicationTimeout = 0;
    private SessionID: String;
    private SessionIDExpires: Date;
    private SessionCookiePrefix: String = 'Julivi_';
    private UseSessionCookie: Boolean = true;
    private isHttpS: boolean = this.getIsHTTPS(this.connectionInfo);
    private dsContext: String = this.getDSContext(this.connectionInfo);
    private restContext: String = this.getRestContext(this.connectionInfo);
    private authentication: String = this.getAuthentication(this.connectionInfo);

    getAuthentication(connectionInfo: any): String {
        console.log('getAuthentication ' + JSON.stringify(this.connectionInfo));
        const authentication: string = (connectionInfo == null ||
            connectionInfo.authentication == null) ? null : connectionInfo.authentication;

        return authentication;
    }
    getDSContext(connectionInfo: any): any {
        if (connectionInfo != null && connectionInfo.dscontext != null) {
            const result = this.trimString(connectionInfo.dscontext);
            if (result === '') {
                return '';
            }
            return result + '/';
        }
        return 'datasnap/';
    }
    CloseSession(): void {
        this.SessionID = null;
        this.SessionIDExpires = new Date(-1);
    }
    trimString(stringToTrim: String): String {
        return String(stringToTrim) ? stringToTrim.replace(/^\s+|\s+$/, '') : stringToTrim;
    }

    getConnectionHost(connectionInfo: any): string {
        console.log('getConnectionHost ' + JSON.stringify(this.connectionInfo));
        if (connectionInfo != null && connectionInfo.host != null && connectionInfo.host !== '') {
            return connectionInfo.host;
        }
        let host = 'localhost';
        const hostAndPort = location.host;
        if (hostAndPort !== 'localhost') {
            if (hostAndPort.indexOf(':') > -1) {
                const splits = hostAndPort.split(':', 2);
                host = splits[0];
            }
            // tslint:disable-next-line:one-line
            else {
                host = hostAndPort;
            }
        }
        // console.log('Host' + host);
        return host;
    }
    getConnectionPort(connectionInfo: any): number {
        if (connectionInfo != null && connectionInfo.port != null && connectionInfo.port !== '') {
            return connectionInfo.port;
        }
        let port = null;
        const hostAndPort = location.host;
        if (hostAndPort !== 'localhost' && hostAndPort.indexOf(':') > -1) {
            const splits = hostAndPort.split(':', 2);
            port = splits[1];
        }
        return port;
    }
    isValidPort(port: number): boolean {
        if (port == null) {
            return false;
        }
        else {
            return true;
        }
    }

    getRestContext(connectionInfo: any): String {
        if (connectionInfo != null && connectionInfo.restcontext != null) {
            let result = this.trimString(connectionInfo.restcontext);
            if (result === '') {
                return '';
            }
            return result + '/';
        }
        return 'rest/';
    }
    getURLPrefix(includeRest?: boolean): string {
        if (includeRest == null) {
            includeRest = true;
        }
        let pathPrefix = '';

        if (this.connectionInfo != null && this.connectionInfo.pathPrefix != null && this.connectionInfo.pathPrefix !== '') {
            pathPrefix = '/' + this.connectionInfo.pathPrefix;
        }
        console.log(this.Port);
        const portString = this.isValidPort(this.Port) ? ':' + this.Port : '';
        // let portString = ':' + this.Port;

        let dsAndRestSegments = '/' + this.dsContext;
        if (includeRest) {
            dsAndRestSegments += this.restContext;
        }
        const httpPrefix = this.isHttpS ? 'https://' : 'http://';
        return httpPrefix + encodeURIComponent(this.Host) + portString + pathPrefix + dsAndRestSegments;
    }
    getIsHTTPS(connectionInfo: any): any {
        if (connectionInfo != null && connectionInfo.https != null && connectionInfo.https !== '') {
            return connectionInfo.https === true;
        }
        return location.protocol === 'https:';
    }
    getMethodURL(methodName: string, requestType: string, params: any, requestFilters: any): any {
        console.log(this.className);
        if (methodName == null) {
            return null;
        }
        requestType = this.validateRequestType(requestType);
        // optionally using the 'pathPrefix' property which could be contributed through connectionInfo
        const portString = this.isValidPort(this.Port) ? ':' + this.Port : '';
        const dsAndRestSegments = '/' + this.dsContext + this.restContext;
        let url = this.getURLPrefix() + encodeURIComponent(this.className) + '/' + encodeURIComponent(methodName) + '/';
        let paramArrayForSend = new Array();
        let paramToSend = null;
        if (Array.isArray(params)) {
            let arrLen = params.length;
            for (let x = 0; x < arrLen; x++) {
                let param = params[x];
                // If the parameter an array or object then this needs to be passed to the server through the request body
                // If a 'complex' parameter has already been found, all input parameters after it also need to be sent in the request body
                // tslint:disable-next-line:max-line-length
                if ((paramArrayForSend.length > 0) || ((Array(param) || Object(param)) && (requestType !== 'GET') && (requestType !== 'DELETE'))) {
                    paramArrayForSend[paramArrayForSend.length] = param;
                }
                else {
                    url += encodeURIComponent(param) + '/';
                }
            }
        }
        else {
            if (requestType === 'GET' || requestType === 'DELETE') {
                url += encodeURIComponent(params) + '/';
            }
            else {
                paramArrayForSend[0] = params;
            }
        }
        // set the paramToSend based on if there is one or more than one parameter to send as the content of the request.
        // A JSON Object with key '_parameters' is used when sending multiple parameters in the body.
        if (paramArrayForSend.length > 0) {
            if (paramArrayForSend.length === 1) {
                paramToSend = paramArrayForSend[0];
            }
            else {
                paramToSend = { '_parameters': paramArrayForSend };
            }
        }
        // if request filters are specified, then add them to the URL
        if (requestFilters != null) {
            let doneOne = false;
            for (let key in requestFilters) {
                if (requestFilters.hasOwnProperty(key)) {
                    const propPrefix = doneOne ? '&' : '?';
                    doneOne = true;
                    let propVal = requestFilters[key];
                    url += propPrefix + encodeURIComponent(key);
                    if (propVal != null) {
                        url += '=' + encodeURIComponent(propVal);
                    }
                }
            }
        }
        return [url, paramToSend];
    }
    executeMethodURL(url: any, contentParam, requestType: string, callback: any, hasResult: boolean, accept: string) {
        if (hasResult == null) {
            hasResult = true;
        }
        requestType = this.validateRequestType(requestType);
        let request = new XMLHttpRequest(); // async is only true if there is a callback that can be notified on completion
        let useCallback = (callback != null);
        // let parse = this.parseHTTPResponse();
        request.open(requestType, url, callback);
        if (useCallback) {
            request.onload = () => {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        // the callback will be notified the execution finished even if there is no expected result
                        let JSONResult = hasResult ? this.parseHTTPResponse(request) : null;
                        callback(JSONResult, request.status, this.owner);
                    }
                }
            };
        }
        if (contentParam != null) {
            contentParam = JSON.stringify(contentParam);
        }
        request.setRequestHeader('Accept', (accept == null ? 'application/json' : accept));
        request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        request.setRequestHeader('If-Modified-Since', 'Mon, 1 Oct 2017 00:00:00 GMT');
        let sessId = this.getSessionID();
        // let sessId;
        if (sessId != null) {
            request.setRequestHeader('Pragma', 'dssession=' + sessId);
        }
        if (this.authentication != null) {
            request.setRequestHeader('Authorization', 'Basic ' + this.authentication);
        }
        request.send(contentParam);
        // if a callback wasn't used then simply return the result.
        // otherwise, return nothing because this function will finish executing before
        // the server call returns, so the result text will be empty until it is passed to the callback
        if (hasResult && !useCallback) {
            return this.parseHTTPResponse(request);
        }
    }
    executeMethod(methodName, requestType, params, callback, hasResult, requestFilters, accept) {
        let url = this.getMethodURL(methodName, requestType, params, requestFilters);
        return this.executeMethodURL(url[0], url[1], requestType, callback, hasResult, accept);
    }
    validateRequestType(requestType: string): string {
        if (requestType == null) {
            requestType = 'GET';
        }
        // tslint:disable-next-line:one-line
        else {
            requestType = requestType.toUpperCase();
            if (requestType !== 'GET' && requestType !== 'POST' && requestType !== 'PUT' && requestType !== 'DELETE') {
                requestType = 'GET';
            }
        }
        return requestType;
    }
    parseSessionID(request) {
        if (request != null) {
            // pragma may store the Session ID value to use in future calls
            let pragmaStr = request.getResponseHeader('Pragma');
            if (pragmaStr != null) {
                // Header looks like this, if set: Pragma: dssession=this.SessionID,dssessionexpires=this.SessionIDExpires
                let sessKey = 'dssession=';
                let expireKey = 'dssessionexpires=';
                let sessIndx = pragmaStr.indexOf('dssession=');
                if (sessIndx > -1) {
                    let commaIndx = pragmaStr.indexOf(',', sessIndx);
                    commaIndx = commaIndx < 0 ? pragmaStr.length : commaIndx;
                    sessIndx = sessIndx + sessKey.length;
                    const sessionId: string = pragmaStr.substr(sessIndx, (commaIndx - sessIndx));
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
                    // console.log(sessionId);
                    this.setSessionData(sessionId, sessionExpires);
                }
            }
        }
    }
    getSessionCookieId(): string {
        return this.SessionCookiePrefix + 'dssessionid';
    }
    setSessionData(sessionId: string, expireDate: Date): void {
        this.SessionID = sessionId;
        this.SessionIDExpires = expireDate;
        if (this.UseSessionCookie === true && navigator.cookieEnabled) {
            if (sessionId) {
                console.log(this.getSessionCookieId() + ' ' + sessionId);
                this.setCookie(this.getSessionCookieId(), sessionId, expireDate);
            } else {
                this.deleteCookie(this.getSessionCookieId());
            }
        }
    }
    initSessionData(useSessionCookie: boolean, sessionCookiePrefix?: string): void {
        this.SessionID = null;
        this.SessionIDExpires = null;
        this.SessionCookiePrefix = '';

        if (sessionCookiePrefix) {
            this.SessionCookiePrefix = sessionCookiePrefix;
        }
        if (useSessionCookie != null) {
            this.UseSessionCookie = useSessionCookie === true;
        }
        if (this.UseSessionCookie === true && navigator.cookieEnabled) {
            this.SessionID = this.getCookie(this.getSessionCookieId());
        }
    }
    parseHTTPResponse(request: any) {
        this.parseSessionID(request);
        if (request != null && request.responseText != null) {
            let responseText = request.responseText;
            if (responseText.length > 0) {
                let JSONResultWrapper = null;
                try {
                    JSONResultWrapper = JSON.parse(responseText);
                }
                // tslint:disable-next-line:one-line
                catch (e) {
                    JSONResultWrapper = responseText;
                }
                // handle session timeouts (status = 403) and other session and authorization related errors
                if (request.status === 403) {
                    if (JSONResultWrapper != null && JSONResultWrapper.SessionExpired != null) {
                        // the session is no longer valid, so clear the stored session ID
                        // a new session will be creates the next time the user invokes a server function
                        this.setSessionData(null, null);
                    }
                }
                // all other results (including other errors)
                return JSONResultWrapper;
            }
        }
        return null;
    }
    getSessionID(): String {
        let result = null;
        if (this.SessionID != null) {
            result = this.SessionID;
            const date = new Date();
            if (this.SessionIDExpires != null && date >= new Date(this.SessionIDExpires)) {
                result = null;
                const oldSessionID = this.SessionID;
                this.SessionID = null;
                this.SessionIDExpires = null;
                // if (isReferenceAFunction(notifySessionExpired)) {
                //     notifySessionExpired(oldSessionID);
                // }
            }
        }
        return result;
    }
    /**
     * Returns the value for the cookie key, or null if not found
     * @param keyName
     */
    getCookie(keyName: string): string {
        let result = null;

        if (keyName != null && document.cookie.length > 0) {
            let tokens = document.cookie.split(';');

            for (let i = 0; i < tokens.length; i++) {
                let crumb = tokens[i].split('=');

                let thisKey = crumb[0].replace(/^\s+|\s+$/g, '');

                if (keyName === thisKey) {
                    if (crumb.length > 1) {
                        result = encodeURIComponent(crumb[1].replace(/^\s+|\s+$/g, ''));
                    } else {
                        result = '';
                    }
                }
            }
        }

        return result;
    }

    /**
     * Sets the crumb into the cookie, with an optional date object for when it expires
     * @param keyName 
     * @param value
     * @param expires 
     */

    setCookie(keyName: string, value: string, expires: Date): void {
        if (keyName != null && value != null && keyName.length > 0 && value.length > 0) {
            let cookieString = keyName + '=' + decodeURIComponent(value);
            if (expires != null) {
                cookieString += '; expires=' + expires.toUTCString();
            }
            document.cookie = cookieString + '; path=/';
        }
    }

    /**
     * Convenience function for deleting the cookie crumb with the given key.
     * @param keyName 
     */
    deleteCookie(keyName: string): void {
        this.setCookie(keyName, 'deleted', new Date(1000));
    }


}
