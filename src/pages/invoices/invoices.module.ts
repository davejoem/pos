import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Invoices } from './invoices';

@NgModule({
  declarations: [
    Invoices,
  ],
  imports: [
    IonicPageModule.forChild(Invoices)
  ],
  exports: [
    Invoices
  ]
})
export class InvoicesModule { }
