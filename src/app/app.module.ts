import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ServerFunction } from './helper/ServerFunction';
import { Connection } from './helper/Connection';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
  ],
  providers: [ ServerFunction, Connection ],
  bootstrap: [AppComponent]
})
export class AppModule { }
