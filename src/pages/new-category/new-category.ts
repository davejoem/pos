import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormGroup } from '@angular/forms'
import { IonicPage, ViewController } from 'ionic-angular'
// import { Category } from '../../models/models'
// import { IpcRenderer } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'new-category',
  templateUrl: 'new-category.html',
})
export class NewCategory implements OnInit {
  public categories: string[]
  public category: FormGroup
  public errors: {
    name: string
  } | any
  public validationMessages: {
    name: {
      required: string
      minlength: string
    }
  } | any

  constructor(
    private fb: FormBuilder
    // , private ipcRenderer: IpcRenderer
    , public viewCtrl: ViewController
  ) { }

  ngOnInit() {
    this.errors = {
      'name': ''
    }
    this.validationMessages = {
      'name': {
        'required': 'Please set a name for this category.'
        , 'minlength': 'Username must be at least 1 character long.'
      }
    }
    this.category = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]]
    })
    this.category.valueChanges.subscribe(() => this.categoryValueChanges())
  }
  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }
  create() {
    this.viewCtrl.dismiss(this.category.value)
  }
  categoryValueChanges() {
    if (!this.category) { return; }
    for (const field in this.errors) {
      this.errors[field] = ''
      const control: any = this.category.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.errors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }
}
