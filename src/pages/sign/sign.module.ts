import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicPageModule } from 'ionic-angular'
import { Sign } from './sign'

@NgModule({
  declarations: [
    Sign
  ],
  imports: [
    IonicPageModule.forChild(Sign)
    , ReactiveFormsModule
  ],
  exports: [
    Sign
  ]
})
export class SignModule {}
