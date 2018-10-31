import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormGroup } from '@angular/forms'
import { IonicPage, LoadingController, NavParams, ViewController } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'set-good',
  templateUrl: 'set-good.html',
})
export class SetGood implements OnInit {
  public good: FormGroup
  public errors: {
    quantity: string
  } | any
  public validationMessages: {
    quantity: { required: string }
  } | any
  public name: string

  constructor(
    private fb: FormBuilder
    , public loadingCtrl: LoadingController
    , private navParams: NavParams
    , public viewCtrl: ViewController
  ) {
    this.good = this.fb.group({
      quantity: ['', [Validators.required, Validators.minLength(1)]]
    })
    this.errors = {
      quantity: ''
    }
    this.good.valueChanges.subscribe(() => this.goodValueChanges())
  }

  ngOnInit() {
    this.name = this.navParams.get("name")
    this.errors = {
      quantity: ''
    }
    this.validationMessages = {
      quantity: {
        required: 'Please set a new quantity for this good.'
        , minlength: `Quantity's name must be at least 1 character long.`
      }
    }
  }
  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }
  setQuantity() {
    this.viewCtrl.dismiss(this.good.value)
  }
  goodValueChanges() {
    if (!this.good) { return; }
    for (const field in this.errors) {
      this.errors[field] = ''
      const control: any = this.good.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.errors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }
}
