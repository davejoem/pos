import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewEmployee } from './new-employee'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewEmployee],
  imports: [
    IonicPageModule.forChild(NewEmployee)
    , ReactiveFormsModule
  ]
  , exports: [
    NewEmployee
  ]
})
export class NewEmployeeModule { }
