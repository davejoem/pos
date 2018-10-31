import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoreMenu } from './more-menu';

@NgModule({
  declarations: [
    MoreMenu
  ],
  imports: [
    IonicPageModule.forChild(MoreMenu),
  ],
  exports: [
    MoreMenu
  ]
})
export class MoreMenuModule {}
