import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { IonicPage, NavParams, ViewController } from 'ionic-angular'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/debounce'
import { IpcRenderer } from '../../providers/providers'
import { Good } from '../../models/models'

@IonicPage()
@Component({
  selector: 'new-stock',
  templateUrl: 'new-stock.html',
})
export class NewStock implements OnInit {
  public stock: FormGroup
  public errors: any
  public goods: Good[]
  public names: String[]
  public has_good: boolean
  public has_packages: boolean
  public sel_good: string
  public selected_good: Good
  public validationMessages: {
    amount: {
      required: string
    }
    good: {
      required: string
    }
    package: {
      required: string
    }
  } | any

  constructor(
    private fb: FormBuilder
    , private ipcRenderer: IpcRenderer
    , private navParams: NavParams
    , public viewCtrl: ViewController
  ) { }

  ngOnInit() {
    this.goods = []
    this.sel_good = ``
    this.has_good = false
    this.has_packages = false
    this.errors = {
      'amount': ''
      , 'good': ''
      , 'package': ''
    }
    this.validationMessages = {
      'amount': {
        'required': 'Please enter number of this good to add.'
      }
      , 'good': {
        'required': 'Please select the good you want to stock.'
      }
      , "package": {
        'required': 'Please select the package you want to stock.'
      }
    }
    this.ipcRenderer.send('good:list').subscribe(
      (res: { goods: Good[] }) => {
        this.goods = res.goods
        this.names = res.goods.map(good => { return good.name }).sort()
      }
    )
    this.stock = this.fb.group({
      amount: ['', [Validators.required]]
      , good: ['', [Validators.required]]
    })
    this.stock.valueChanges.debounce(() => Observable.interval(300)).subscribe(() => this.stockValueChanges())

  }

  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }

  create() {
    this.viewCtrl.dismiss(this.stock.value)
  }

  ionViewDidEnter() {
    console.log(this.navParams.get('good'))
    console.log(this.navParams.data.good)
    if (this.navParams.get('good')) {
      this.has_good = true
      this.sel_good = this.navParams.get('good')
      this.selected_good = this.goods[
        this.goods.map(good => { return good.name }).indexOf(this.navParams.get('good'))
      ]
      this.stock.setValue({
        amount: 0
        , good: this.navParams.get('good')
      })
    }
  }

  stockValueChanges() {
    if (!this.stock) { return; }
    // this.selected_good = this.goods.filter((good: Good) => {
    //   return good.name = this.stock.get('good')!.value
    // })[0]
    // this.selected_good.packages
    //   ? this.has_packages = this.selected_good.packages.length > 0
    //   : this.has_packages = false
    for (const field in this.errors) {
      this.errors[field] = ''
      const control: any = this.stock.get(field)
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.errors[field] += this.validationMessages[field][key] + ' '
        }
      }
    }
  }

  togglePackages() {
    this.has_packages = !this.has_packages
    this.has_packages
      ? this.stock.addControl(
        'package', new FormControl('', [Validators.required])
      )
      : this.stock.removeControl('package')
  }
}
