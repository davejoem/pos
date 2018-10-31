import { NgModule } from '@angular/core'
import { Sell } from './sell'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
    declarations: [Sell],
    imports: [
        IonicPageModule.forChild(Sell)
    ]
    , exports: [
        Sell
    ]
})
export class SellModule { }
