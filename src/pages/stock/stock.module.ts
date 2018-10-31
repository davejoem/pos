import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Stock } from './stock';

@NgModule({
  declarations: [
    Stock
  ],
  imports: [
    IonicPageModule.forChild(Stock)
  ],
  exports: [
    Stock
  ]
})
export class StockModule {}
