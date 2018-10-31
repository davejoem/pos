import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewGood } from './new-good'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewGood],
  imports: [
    IonicPageModule.forChild(NewGood)
    , ReactiveFormsModule
  ]
  , exports: [
    NewGood
  ]
})
export class NewGoodModule { }
