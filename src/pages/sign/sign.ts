import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { IonicPage, NavParams, ViewController } from 'ionic-angular'
import { Storage } from '@ionic/storage'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/debounce'

@IonicPage()
@Component({
  selector: 'sign',
  templateUrl: 'sign.html',
})
export class Sign implements OnInit {
  public action: any
  public signIn: FormGroup
  public validationMessages: any
  public signInErrors: any

  public managed: boolean
  constructor(
    private fb: FormBuilder
    , private navParams: NavParams
    , private storage: Storage
    , private viewCtrl: ViewController
  ) {
    this.buildSignInForm()
  }
  ngOnInit() {
    this.signInErrors = {
      'username': ''
      , 'password': ''
    }
    this.validationMessages = {
      'username': {
        'required': 'Username is required.'
        , 'minlength': 'Username must be at least 4 characters long.'
        , 'maxlength': 'Username cannot be more than 10 characters long.'
      }
      , 'password': {
        'maxlength': 'Confirmation password must be at most 20 characters long.'
        , 'minlength': 'Password must be at least 4 characters long.'
        , 'required': 'Password is required.'
      }
    }
    this.action = this.navParams.get('starton')
    this.storage.get('managed').then(managed =>
      managed != null ? this.managed = managed : this.managed = false
    )
    // document.addEventListener('keyup', (ev: KeyboardEvent) => {
    //   if (ev.which === 13) this.doSign()
    // })
  }

  buildSignInForm() {
    this.signIn = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]]
      , password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]]
    })
    this.signIn.valueChanges.debounce(() => Observable.interval(1000)).subscribe(() => this.signInValueChanges())
  }

  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }

  changedView(action: string) {
    this.action = action
  }

  checkKey(ev: KeyboardEvent) {
    if (ev.which === 13) this.doSign()
  }

  doSign() {
    this.viewCtrl.dismiss(this.signIn.value)
  }

  signInValueChanges() {
    if (!this.signIn) { return; }
    for (const field in this.signInErrors) {
      this.signInErrors[field] = ''
      const control: any = this.signIn.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.signInErrors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }
}
