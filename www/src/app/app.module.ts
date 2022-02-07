import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RootErrorHandler } from '@app/handlers/root.error-handler';
import { environment } from '@environments/environment';

import {
  MqttModule,
  IMqttServiceOptions
} from 'ngx-mqtt';

import CanActivateBlasterDetails  from '@app/guards/blaster-details.can-activate';

import { BlasterResolver } from '@resolvers/blaster.resolver';
import { BlastersResolver } from '@resolvers/blasters.resolver';
import { StickyDirectiveModule } from 'ngx-sticky-directive';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DropdownButtonDirective } from './directives/dropdown-button.directive';

import { SplashComponent } from '@components/splash/splash.component';
import { ListComponent } from '@components/list/list.component';
import { HomeComponent } from '@components/home/home.component';
import { BlasterComponent } from '@components/list/blaster/blaster.component';
import { StatusBtnComponent } from '@components/status-btn/status-btn.component';
import { DropdownComponent } from '@components/dropdown/dropdown.component';

import { BlastersService } from '@services/blasters.service';
import { InitStateService } from '@services/init-state.service';
import { BlasterDetailsComponent } from '@components/blaster-details/blaster-details.component';
import { CountPipe } from '@pipes/count.pipe';
import { BlasterEventComponent } from '@components/blaster-event/blaster-event.component';
import { RemoteComponent } from '@components/remote/remote.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import { BadGatewayComponent } from '@components/bad-gateway/bad-gateway.component';
import { MqttFormComponent } from '@components/mqtt-form/mqtt-form.component';
import { BlasterJobComponent } from '@components/blaster-job/blaster-job.component';
import { KeyCodePipe } from '@pipes/key-code.pipe';
import { DurationPipe } from './pipes/duration.pipe';


export function initFactory(blasterScanner: BlastersService) {
  return () => blasterScanner.init();
}

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  connectOnCreate: false,
  url: environment.mqttServer
};

@NgModule({
  declarations: [
    DropdownButtonDirective,

    AppComponent,
    SplashComponent,
    HomeComponent,
    ListComponent,
    BlasterComponent,
    StatusBtnComponent,
    DropdownComponent,
    BlasterDetailsComponent,
    CountPipe,
    BlasterEventComponent,
    RemoteComponent,
    NotFoundComponent,
    BadGatewayComponent,
    MqttFormComponent,
    BlasterJobComponent,
    KeyCodePipe,
    DurationPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PortalModule,
    OverlayModule,
    DragDropModule,
    ReactiveFormsModule,
    StickyDirectiveModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
  ],
  providers: [
    // services
    InitStateService,
    BlastersService,

    // resolvers
    BlastersResolver,
    BlasterResolver,

    // canActivate
    CanActivateBlasterDetails,

    {
      provide: APP_INITIALIZER,
      useFactory: initFactory,
      deps: [BlastersService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
