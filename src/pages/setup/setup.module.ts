import { NgModule } from '@angular/core'
import { Setup } from './setup'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [Setup],
  imports: [
    IonicPageModule.forChild(Setup)
  ]
  , exports: [
    Setup
  ]
})
export class SetupModule { }
