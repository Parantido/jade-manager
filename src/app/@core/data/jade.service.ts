import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Router } from '@angular/router';

import * as TAFFY from 'taffy';
// import * as io from 'socket.io-client';

import {$WebSocket, WebSocketSendMode} from 'angular2-websocket/angular2-websocket';

@Injectable()
export class JadeService {
  
  private authtoken: string = '';
  private baseUrl: string = 'https://' + window.location.hostname + ':8081/v1';
  private websockUrl: string = 'wss://' + window.location.hostname + ':8083';
  // private websock;
  private websock: $WebSocket;

  private info: any = {};
  private contacts: any = {};
  private messages: any = {};
  private cur_chat: string = '';
  private cur_chatroom: string = '';

  // database
  private db_users = TAFFY();
  private db_trunks = TAFFY();
  private db_sdialplans = TAFFY();

  constructor(private http: HttpClient, private route: Router, private injector:Injector) {
    console.log("Fired jade.service.");

    if(this.authtoken === '') {
      this.route.navigate(['/login']);
    }
  }

  init(): Observable<boolean> {

    const observable = Observable.create(observer => {
      this.htp_get_info().subscribe(
        data => {
          console.log(data);
          this.info = data.result;

          // keep the init order.
          this.init_websock();

          this.init_users();
          this.init_trunks();
          this.init_sdialplans();

          observer.next(true);
          observer.complete();
        },
      )
    });
    
    return observable;
  }

  set_authtoken(token: string) {
    console.log('Update token. token: ' + token);
    this.authtoken = token;
  }
  
  set_curchat(uuid: string) {
    this.cur_chat = uuid;
  }

  set_curchatroom(uuid: string) {
    console.log('set_curchatroom: ' + uuid);
    this.cur_chatroom = uuid;
  }


  get_info() {
    return this.info;
  }
  get_users() {
    return this.db_users;
  }
  get_trunks() {
    return this.db_trunks;
  }
  get_sdialplans() {
    return this.db_sdialplans;
  }

  update_user(uuid: string, data: any) {
    const url = this.baseUrl + '/manager/users/' + uuid + '?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.put<any>(url, JSON.stringify(data), httpOptions)
    .pipe(
      map(res => res),
      catchError(this.handleError<any>('update_info')),
    )
    .subscribe(
      res => {
        console.log(res);
      },
    );
  }

  delete_user(uuid: string) {
    const url = this.baseUrl + '/manager/users/' + uuid + '?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.delete<any>(url, httpOptions)
      .pipe(
        map(res => res),
        catchError(this.handleError<any>('delete_user')),
      )
      .subscribe(
        res => {
          console.log(res);
        },
      );
  }

  create_user(data: any) {
    const url = this.baseUrl + '/manager/users?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.post<any>(url, data, httpOptions)
    .pipe(
      map(res => res),
      catchError(this.handleError<any>('create_user')),
    ).subscribe(
      res => {
        console.log(res);
      },
    );
  }

  update_info(data: any) {
    const url = this.baseUrl + '/manager/info?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };    

    this.http.put<any>(url, JSON.stringify(data), httpOptions)
    .pipe(
      map(data => data),
      catchError(this.handleError<any>('update_info'))
    )
    .subscribe(
      data => {
        console.log(data);
      },
    );
  }

  update_trunk(name: string, data: any) {
    const url = this.baseUrl + '/manager/trunks/' + encodeURI(name) + '?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.put<any>(url, JSON.stringify(data), httpOptions)
    .pipe(
      map(res => res),
      catchError(this.handleError<any>('update_trunk')),
    )
    .subscribe(
      res => {
        console.log(res);
      },
    );
  }

  delete_trunk(name: string) {
    const url = this.baseUrl + '/manager/trunks/' + encodeURI(name) + '?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.delete<any>(url, httpOptions)
      .pipe(
        map(res => res),
        catchError(this.handleError<any>('delete_trunk')),
      )
      .subscribe(
        res => {
          console.log(res);
        },
      );
  }

  create_trunk(data: any) {
    const url = this.baseUrl + '/manager/trunks?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.post<any>(url, data, httpOptions)
    .pipe(
      map(res => res),
      catchError(this.handleError<any>('create_trunk')),
    ).subscribe(
      res => {
        console.log(res);
      },
    );
  }

  private init_users() {
    const url = this.baseUrl + '/manager/users?authtoken=' + this.authtoken;
    
    this.http.get<any>(url)
    .pipe(
      map(data => data),
      catchError(this.handleError('init_users', [])),
    )
    .subscribe(
      data => {
        console.log(data);

        this.db_users().remove();

        const list = data.result.list;
        for(let i = 0; i < list.length; i++) {
          this.db_users.insert(list[i]);
        }
      },
    );
  }

  reload_user() {
    this.init_users();
  }

  private init_trunks() {
    const url = this.baseUrl + '/manager/trunks?authtoken=' + this.authtoken;
    
    this.http.get<any>(url)
    .pipe(
      map(data => data),
      catchError(this.handleError('init_trunks', [])),
    )
    .subscribe(
      data => {
        console.log(data);

        this.db_trunks().remove();

        const list = data.result.list;
        for(let i = 0; i < list.length; i++) {
          this.db_trunks.insert(list[i]);
        }
      },
    );
  }

  reload_trunk() {
    this.init_trunks();
  }

  private init_sdialplans() {
    const url = this.baseUrl + '/manager/sdialplans?authtoken=' + this.authtoken;
    
    this.http.get<any>(url)
    .pipe(
      map(data => data),
      catchError(this.handleError('init_trunks', [])),
    )
    .subscribe(
      data => {
        console.log(data);
        
        this.db_sdialplans().remove();

        const list = data.result.list;
        for(let i = 0; i < list.length; i++) {
          this.db_sdialplans.insert(list[i]);
        }
      },
    );
  }

  reload_sdialplan() {
    this.init_sdialplans();
  }

  update_sdialplan(name: string, data: any) {
    const url = this.baseUrl + '/manager/sdialplans/' + encodeURI(name) + '?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.put<any>(url, JSON.stringify(data), httpOptions)
    .pipe(
      map(res => res),
      catchError(this.handleError<any>('update_sdialplan')),
    )
    .subscribe(
      res => {
        console.log(res);
        this.reload_sdialplan();
      },
    );
  }

  delete_sdialplan(name: string) {
    const url = this.baseUrl + '/manager/sdialplans/' + encodeURI(name) + '?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.delete<any>(url, httpOptions)
      .pipe(
        map(res => res),
        catchError(this.handleError<any>('delete_sdialplan')),
      )
      .subscribe(
        res => {
          console.log(res);
          this.reload_sdialplan();
        },
      );
  }

  create_sdialplan(data: any) {
    const url = this.baseUrl + '/manager/sdialplans?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };    

    this.http.post<any>(url, data, httpOptions)
    .pipe(
      map(res => res),
      catchError(this.handleError<any>('create_sdialplan')),
    ).subscribe(
      res => {
        console.log(res);
        this.reload_sdialplan();
      },
    );
  }

  private init_info() {
    this.htp_get_info().subscribe(
      data => {
        console.log(data);
        this.info = data.result;
      },
    )
  }

  private init_websock() {
    console.log('Fired init_websock.');
    const url = this.websockUrl + '?authtoken=' + this.authtoken;
    console.log("Connecting websocket. url: " + url);

    // init websocket
    this.websock = new $WebSocket(url);

    // set received message callback
    this.websock.onMessage(
      (msg: MessageEvent) => {
          console.log('onMessage ', msg.data);

          // get message
          // {"<topic>": {"<message_name>": {...}}}
          const j_data = JSON.parse(msg.data);
          const topic = Object.keys(j_data)[0];
          const j_msg = j_data[topic];

          // message parse
          this.message_handler(j_msg);
      },
      {autoApply: false},
    );
  }

  /**
   * Get chat message of given room uuid.
   * @param uuid 
   */
  private htp_get_chatmessages(uuid: string, timestamp: string = '', count: string = '') {
    let url = this.baseUrl + '/me/chats/' + uuid + '/messages?authtoken=' + this.authtoken;
    if(timestamp != '') {
      url = url + '&timestamp=' + timestamp;
    }
    if(count != '') {
      url = url + '&count=' + count;
    }

    return this.http.get<any>(url)
    .pipe(
      map(data => data),
      catchError(this.handleError('get_chatmessages', []))
    );
  }

  /**
   * Login
   */
  login(username, password): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();

    headers = headers.set("Authorization", "Basic " + btoa(username + ':' + password));
    headers = headers.set("Content-Type", "application/x-www-form-urlencoded");

    const httpOptions = {headers: headers};

    return this.http.post<any>(this.baseUrl + '/manager/login', null, httpOptions)
      .pipe(
        map(res => res),
        catchError(this.handleError<any>('login')),
      );
  }

  logout() {
    const url = this.baseUrl + '/manager/login?authtoken=' + this.authtoken;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete<any>(url, httpOptions)
      .pipe(
        map(data => data),
        catchError(this.handleError<any>('logout'))
      )
      .subscribe(
        data => {
          console.log(data);
          this.authtoken = '';
        },
      );

  }
  
  private htp_get_info(): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/manager/info?authtoken=' + this.authtoken)
    .pipe(
      map(data => data),
      catchError(this.handleError('htp_get_info', [])),
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log(message);
  }

  /**
   * Jade notification message handler
   */
  private message_handler(j_data) {
    console.log(j_data);

    const type = Object.keys(j_data)[0];
    const j_msg = j_data[type];

    if(type === 'manager.info.update') {
      this.message_handler_manager_info_update(j_msg);
    }
    else if(type === "manager.notice.create") {
      this.message_handler_manager_notice_create(j_msg);
    }
    else if(type === "manager.trunk.update") {

    }
    else if(type === "manager.user.create") {
      this.message_handler_manager_user_create(j_msg);
    }
    else if(type === "manager.user.update") {
      this.message_handler_manager_user_update(j_msg);
    }
    else if(type === "manager.user.delete") {
      this.message_handler_manager_user_delete(j_msg);
    }
    else {
      console.error("Could not find correct message handler.");
    }

  }

  private message_handler_manager_notice_create(j_msg: any) {
    
    const type = j_msg.type;
    console.log("Fired message_handler_manager_notice_create. type: " + type);

    if(type === 'reload') {
      for(let i = 0; i < j_msg.modules.length; i++) {
        const module = j_msg.modules[i];
        console.log("Check value. name: " + module.name);

        if(module.name === 'trunk') {
          // reload trunk
          this.reload_trunk();
        }
        else if(module.name === 'user') {
          // reload user
          this.reload_user();
        }
      }
    }
  }

  private message_handler_manager_info_update(j_msg: any) {

    for(const k in j_msg) {
      this.info[k] = j_msg[k];
    }
    console.log('Updated info. ' + this.info.name);
  }

  private message_handler_manager_user_create(j_msg: any) {
    this.db_users.insert(j_msg);
  }

  private message_handler_manager_user_update(j_msg: any) {
    const uuid = j_msg['uuid'];
    this.db_users({uuid: uuid}).update(j_msg);
  }

  private message_handler_manager_user_delete(j_msg: any) {
    const uuid = j_msg['uuid'];
    this.db_users({uuid: uuid}).remove();
  }

  private message_handler_manager_trunk_update(j_msg: any) {
    const name = j_msg['name'];
    this.db_trunks({name: name}).update(j_msg);
  }


}
