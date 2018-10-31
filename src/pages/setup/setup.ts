import { Component, OnInit } from '@angular/core'
import { FormBuilder, AbstractControl, FormGroup, Validators } from '@angular/forms'
import { Storage } from '@ionic/storage'
import { Alert, AlertController, IonicPage, Loading, LoadingController, Modal, ModalController, NavController } from 'ionic-angular';
import { Observable } from 'rxjs'
import 'rxjs/add/operator/debounce'
import { Category, Employee, Good } from '../../models/models'
import { IpcRenderer, User } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'setup'
  , templateUrl: 'setup.html'
})

export class Setup implements OnInit {
  public categories: Category[]
  public error_alert: Alert
  public success_alert: Alert
  public index: number
  public loading: Loading
  public setup: any
  public employees: Employee[]
  public goods: Good[]
  public managed: boolean
  public signUp: FormGroup
  public signUpErrors: any
  public validationMessages: any

  constructor(
    private alertCtrl: AlertController
    , private fb: FormBuilder
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , private modalCtrl: ModalController
    , private navCtrl: NavController
    , private storage: Storage
    , private user: User
  ) {
    this.buildSignUpForm()
  }

  addEmployee() {
    let modal: Modal = this.modalCtrl.create(`NewEmployee`, {}, { enableBackdropDismiss: false })
    modal.onDidDismiss(data => {
      if (data == 'cancelled')
        return
      this.ipcRenderer.send('employee:add', data).subscribe(
        (res: any) => {
          this.employees.push(res.employee)
          this.showSuccessAlert('Register Employee', res.message)
        }
        , (err: any) => this.showErrorAlert('Register Employee', err.message)
      )
    })
    modal.present()
  }
  addCategory() {
    let modal: Modal = this.modalCtrl.create(`NewCategory`, {}, { enableBackdropDismiss: false })
    modal.onDidDismiss(data => {
      if (data == 'cancelled')
        return
      this.ipcRenderer.send(
        'category:add'
        , {
          name: data.name
        }
      ).subscribe(
        (res: any) => {
          this.categories.push(res.category)
          this.showSuccessAlert('Register Category', res.message)
        }
        , (err: any) => this.showErrorAlert('Register Category', err.message)
        )
    })
    modal.present()
  }
  addGood() {
    let modal: Modal = this.modalCtrl.create(`NewGood`, {}, { enableBackdropDismiss: false })
    modal.onDidDismiss(data => {
      if (data == 'cancelled')
        return
      this.ipcRenderer.send(
        'good:add'
        , {
          brand: data.brand
          , buyingprice: parseFloat(data.buyingprice)
          , category: data.category
          , code: data.code
          , commission: data.commission
          , description: data.description
          , name: data.name
          , sellingprice: parseFloat(data.sellingprice)
        }
      ).subscribe(
        (res: any) => {
          this.goods.push(res.good)
          this.showSuccessAlert('Register Good', res.message)
        }
        , (err: any) => this.showErrorAlert('Register Good', err.message)
        )
    })
    modal.present()
  }
  buildSignUpForm() {
    this.signUp = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]]
        , password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]]
        , confirmpassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]]
      },
      {
        validator: (c: AbstractControl) => {
          if (c.get('password')!.value !== c.get('confirmpassword')!.value)
            return { mismatch: true }
          else
            return null
        }
      }
    )
    this.signUp.valueChanges.debounce(() => Observable.interval(1000)).subscribe(() => this.signUpValueChanges())
  }

  checkKey(ev: KeyboardEvent) {
    if (ev.which === 13) this.doSign()
  }

  doDone() {
    this.storage.set('setup', true).then(() => {
      this.navCtrl.setRoot('Landing', {}, {
        animate: true
        , direction: 'forward'
      })
    })
  }
  doSign() {
    this.loading = this.loadingCtrl.create({
      content: 'Signing Up ..'
    })
    this.loading.present().then(() => {
      this.user.signUp(this.signUp.value.username, this.signUp.value.password).subscribe(
        () => {
          this.storage.set('managed', true).then(() => {
            this.loading.dismiss().then(
              () => {
                this.showSuccessAlert(
                  `Sign Up`
                  , `We successfully registered a manager for this system.`
                  , () => this.index++
                )
              }
            )
          })
        }
        , (err: any) => {
          this.loading.dismiss().then(() => this.showErrorAlert(`Sign Up`, err.message))
        }
      )
    })
  }

  get isSetup(): boolean {
    return this.managed
  }

  ngOnInit() {
    this.index = 0
    this.setup = this.storage.get('setup')
    this.categories = []
    this.employees = []
    this.goods = []
    this.managed = false
    this.storage.get('managed').then((managed: boolean) => {
      this.managed = managed
    })
    this.signUpErrors = {
      'username': ''
      , 'password': ''
      , 'confirmpassword': ''
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
      , 'confirmpassword': {
        'maxlength': 'Confirmation password must be at most 20 characters long.'
        , 'minlength': 'Confirmation password must be at least 4 characters long.'
        , 'mismatch': 'Passwords do not match.'
        , 'required': 'Confirmation password is required.'
      }
    }
    this.ipcRenderer.send('employee:list').subscribe(
      res => {
        this.employees = res.employees
      }
      , console.log
    )
    this.ipcRenderer.send('good:list').subscribe(
      res => {
        this.goods = res.goods
      }
      , console.log
    )
    this.user.load()
  }
  next() {
    // this.index == 0
    //   ? this.setup
    //     ? this.index = 2
    //     : this.index++
    //   : 
    this.index == 1
      ? this.doSign()
      : this.index == 5
        ? this.doDone()
        : this.index++
  }
  prev() {
    if (this.index == 2 && this.managed) {
      this.index -= 2
      // or
      // this.index == 0
    }
    else
      this.index--
  }
  showErrorAlert(action?: string, message?: string) {
    this.error_alert = this.alertCtrl.create({
      title: action ? `${action} Error!` : `Error!`
      , message: message ? message : `An error occured. Please try again.`
      , buttons: [{
        text: 'Try again',
        handler: () => {
          this.error_alert.dismiss()
          return false
        }
      }]
      , enableBackdropDismiss: false
    })
    this.error_alert.present()
  }
  showSuccessAlert(action?: string, message?: string, cb?: Function) {
    this.success_alert = this.alertCtrl.create({
      title: action ? `<h5 color="secondary">${action} Success!</h5>` : `<h5 color="secondary">Success!</h5>`
      , message: message ? message : `Operation completed successfully.`
      , buttons: [{
        text: 'Ok',
        handler: () => {
          let prom: Promise<any> = this.success_alert.dismiss()
          if (cb)
            prom.then(() => cb())
          return false
        }
      }]
      , enableBackdropDismiss: false
    })
    this.success_alert.present()
  }
  signUpValueChanges() {
    if (!this.signUp) { return; }
    for (const field in this.signUpErrors) {
      this.signUpErrors[field] = ''
      const control: any = this.signUp.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.signUpErrors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }
}
