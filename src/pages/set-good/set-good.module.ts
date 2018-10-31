import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SetGood } from './set-good'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [SetGood],
  imports: [
    IonicPageModule.forChild(SetGood)
    , ReactiveFormsModule
  ]
  , exports: [
    SetGood
  ]
})
export class SetGoodModule { }
