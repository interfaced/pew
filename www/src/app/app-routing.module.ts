import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BadGatewayComponent } from '@app/components/bad-gateway/bad-gateway.component';
import { BlasterDetailsComponent } from '@components/blaster-details/blaster-details.component';
import { HomeComponent } from '@components/home/home.component';
import { ListComponent } from '@components/list/list.component';
import { MqttFormComponent } from '@components/mqtt-form/mqtt-form.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import CanActivateBlasterDetails from '@guards/blaster-details.can-activate';

import { BlasterResolver } from '@resolvers/blaster.resolver';
import { BlastersResolver } from '@resolvers/blasters.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'blasters',
        component: ListComponent,
        resolve: {
          blasters: BlastersResolver
        }
      },
      {
        path: 'blasters/:id',
        component: BlasterDetailsComponent,
        canActivate: [CanActivateBlasterDetails],
        resolve: {
          blaster: BlasterResolver
        }
      },
      {
        path: 'mqtt',
        component: MqttFormComponent
      },
      {
        path: '404',
        component: NotFoundComponent
      },
      {
        path: '502',
        component: BadGatewayComponent
      },
      {
        path: '',
        redirectTo: 'blasters',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '404'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
