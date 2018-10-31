import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { IonicPage, NavParams, ViewController } from 'ionic-angular'
import 'rxjs/add/operator/debounce'
import { Observable } from 'rxjs'

@IonicPage()
@Component({
  selector: 'new-payment',
  templateUrl: 'new-payment.html',
})
export class NewPayment implements OnInit {

  public has_description: boolean
  public payment: FormGroup
  public errors: any
  public validationMessages: {
    amount: {
      required: string
    }
    to: {
      required: string
    }
    description: {
      required: string
      maxlength: string
      minlength: string
    }
  } | any

  constructor(
    private fb: FormBuilder
    , private navParams: NavParams
    , private viewCtrl: ViewController
  ) { }

  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }

  create() {
    this.viewCtrl.dismiss(this.payment.value)
  }

  ngOnInit() {
    this.errors = {
      'amount': ''
      , 'description': ''
      , 'to': ''
    }
    this.validationMessages = {
      'amount': {
        'required': 'Please enter an amount for this payment.'
      }
      , 'description': {
        'maxlength': 'A description must be at most 250 characters long.'
        , 'minlength': 'A description must be at least 1 character long.'
      }
      , 'to': {
        'required': 'Please enter the person who this payment is being made to.'
        , 'minlength': 'A description must be at least 1 character long.'
        , 'maxlength': 'A description must be at most 50 characters long.'
      }
    }
    this.payment = this.fb.group({
      amount: ['', [Validators.required]]
      , to: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]]
    })
    if (this.navParams.get('data'))
      this.payment.setValue({
        amount: this.navParams.get('data').amount
        , to: this.navParams.get('data').to
      })
    this.payment.valueChanges.debounce(() => Observable.interval(300)).subscribe(() => this.paymentValueChanges())
  }

  paymentValueChanges() {
    if (!this.payment) { return; }
    for (const field in this.errors) {
      this.errors[field] = ''
      const control: any = this.payment.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.errors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }

  toggleDescription() {
    this.has_description = !this.has_description
    this.has_description
      ? this.payment.addControl(
        'description', new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(250)])
      )
      : this.payment.removeControl('description')
  }

}
