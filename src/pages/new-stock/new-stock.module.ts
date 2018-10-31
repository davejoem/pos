import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewStock } from './new-stock'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewStock],
  imports: [
    IonicPageModule.forChild(NewStock)
    , ReactiveFormsModule
  ]
  , exports: [
    NewStock
  ]
})
export class NewStockModule { }
