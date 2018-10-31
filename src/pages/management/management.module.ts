import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Management } from './management';

@NgModule({
  declarations: [
    Management
  ],
  imports: [
    IonicPageModule.forChild(Management)
  ],
  exports: [
    Management
  ]
})
export class HomeModule {}
