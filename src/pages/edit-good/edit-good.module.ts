import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { EditGood } from './edit-good'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [EditGood],
  imports: [
    IonicPageModule.forChild(EditGood)
    , ReactiveFormsModule
  ]
  , exports: [
    EditGood
  ]
})
export class NewGoodModule { }
