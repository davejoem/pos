import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Client } from './client';

@NgModule({
  declarations: [
    Client
  ],
  imports: [
    IonicPageModule.forChild(Client),
  ],
  exports: [
    Client
  ]
})
export class ClientModule {}
