import { NgModule } from '@angular/core'
import { Sales } from './sales'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
    declarations: [Sales],
    imports: [
        IonicPageModule.forChild(Sales)
    ]
    , exports: [
        Sales
    ]
})
export class SalesModule { }
