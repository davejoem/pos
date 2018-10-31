import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewCreditSale } from './new-creditsale'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewCreditSale],
  imports: [
    IonicPageModule.forChild(NewCreditSale)
    , ReactiveFormsModule
  ]
  , exports: [
    NewCreditSale
  ]
})
export class NewCreditSaleModule { }
