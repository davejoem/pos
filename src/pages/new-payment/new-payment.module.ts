import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewPayment } from './new-payment'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewPayment],
  imports: [
    IonicPageModule.forChild(NewPayment)
    , ReactiveFormsModule
  ]
  , exports: [
    NewPayment
  ]
})
export class NewPaymentModule { }
