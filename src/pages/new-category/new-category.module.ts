import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { NewCategory } from './new-category'
import { IonicPageModule } from 'ionic-angular'

@NgModule({
  declarations: [NewCategory],
  imports: [
    IonicPageModule.forChild(NewCategory)
    , ReactiveFormsModule
  ]
  , exports: [
    NewCategory
  ]
})
export class NewCategoryModule { }
