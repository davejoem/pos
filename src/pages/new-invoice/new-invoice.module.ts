import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewInvoice } from './new-invoice'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewInvoice],
  imports: [
    IonicPageModule.forChild(NewInvoice)
    , ReactiveFormsModule
  ]
  , exports: [
    NewInvoice
  ]
})
export class NewInvoiceModule { }
