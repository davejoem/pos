import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormGroup } from '@angular/forms'
import { IonicPage, ViewController } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'new-employee',
  templateUrl: 'new-employee.html',
})
export class NewEmployee implements OnInit {
  public employee: FormGroup
  public errors: {
    username: string    
  }|any
  public validationMessages: {
    username: { 
      required: string
      minlength: string
      maxlength: string
    }
  }|any

  constructor(
    private fb: FormBuilder
    , public viewCtrl: ViewController
  ) {}

  ngOnInit() {
    this.validationMessages = {
      'username': {
        'required':      'Username is required.'
        , 'minlength':   'Username must be at least 4 characters long.'
        , 'maxlength':   'Username cannot be more than 10 characters long.'
      }
    }
    this.errors = {
      'username': ''
    }
    this.employee = this.fb.group({
      username: ['', [ Validators.minLength(4), Validators.maxLength(10), Validators.required ]]
      , role: ['user', [ Validators.required ]]
    })
    this.employee.valueChanges.subscribe(()=>this.employeeValueChanges())
  }
  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }
  create() {
    this.viewCtrl.dismiss(this.employee.value)
  }
  employeeValueChanges() {
    if (!this.employee) { return; }
    for (const field in this.errors) {
      this.errors[field] = ''
      const control: any = this.employee.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.errors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }
}
