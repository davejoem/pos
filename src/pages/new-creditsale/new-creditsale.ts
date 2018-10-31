import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormGroup } from '@angular/forms'
import { IonicPage, ViewController } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'new-creditsale',
  templateUrl: 'new-creditsale.html',
})
export class NewCreditSale implements OnInit {
  public sale: FormGroup
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
      'name': {
        'required':      'Name is required.'
        , 'minlength':   'Name must be at least 1 characters long.'
        , 'maxlength':   'Name cannot be more than 50 characters long.'
      }
    }
    this.errors = {
      'name': ''
    }
    this.sale = this.fb.group({
      name: ['', [ Validators.minLength(1), Validators.maxLength(50), Validators.required ]]
    })
    this.sale.valueChanges.subscribe(()=>this.saleValueChanges())
  }
  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }
  makeSale() {
    this.viewCtrl.dismiss(this.sale.value)
  }
  saleValueChanges() {
    if (!this.sale) { return; }
    for (const field in this.errors) {
      this.errors[field] = ''
      const control: any = this.sale.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.errors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }
}
