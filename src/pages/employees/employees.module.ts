import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { Employees } from './employees'

@NgModule({
  declarations: [
    Employees
  ],
  imports: [
    IonicPageModule.forChild(Employees)
  ],
  exports: [
    Employees
  ]
})
export class EmployeesModule {}
