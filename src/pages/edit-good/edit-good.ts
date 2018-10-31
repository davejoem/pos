import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { IonicPage, NavParams, ViewController } from 'ionic-angular'
import { Good } from '../../models/models'
// import { IpcRenderer } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'edit-good',
  templateUrl: 'edit-good.html',
})
export class EditGood implements OnInit {
  public editable: Good
  public categories: string[]
  public good: FormGroup
  public has_brand_name: boolean
  public has_description: boolean
  public has_packages: boolean
  public errors: {
    brand: string
    commission: string
    description: string
    name: string
    sellingprice: string
    buyingprice: string
  } | any
  public validationMessages: {
    brand: {
      minlength: string
      required: string
    }
    category: { required: string }
    commission: { required: string }
    description: {
      required: string
      minlength: string
      maxlength: string
    }
    name: {
      required: string
      minlength: string
    }
    buyingprice: { required: string }
    sellingprice: { required: string }
  } | any

  constructor(
    private fb: FormBuilder
    // , private ipcRenderer: IpcRenderer
    , private navParams: NavParams
    , public viewCtrl: ViewController
  ) { }

  ngOnInit() {
    this.categories = [
      'Batteries'
      , 'Cosmetics'
      , 'Confectionaries'
      , 'Soaps & Detergents'
      , 'Medication / Drugs'
      , 'Food & Drink'
      , 'Kitchen Appliances'
      , 'Others'
      , 'Perishables'
      , 'Sanitaries / Toiletries'
    ]
    this.has_brand_name = false
    this.has_description = false
    this.errors = {
      'brand': ''
      , 'code': ''
      , 'commission': ''
      , 'description': ''
      , 'name': ''
      , 'buyingprice': ''
      , 'sellingprice': ''
    }
    this.validationMessages = {
      'brand': {
        'required': 'Please set a name for this good.'
        , 'minlength': 'Brand\'s name must be at least 1 character long.'
      }
      , 'category': {
        'required': 'Please set a category for this good.'
      }
      , 'code': {
        'minlength': 'A description must be at least 1 character long.'
        , 'required': 'Please set a code for this good.'
      }
      , 'commission': {
        'required': 'Please set a commission for this good.'
      }
      , 'description': {
        'required': 'Please set a description for this good.'
        , 'minlength': 'A description must be at least 1 character long.'
        , 'maxlength': 'A description must be at most 250 characters long.'
      }
      , 'name': {
        'required': 'Please set a name for this good.'
        , 'minlength': 'Username must be at least 1 character long.'
      }
      , 'sellingprice': {
        'required': 'Please enter a price for this good.'
      }
      , 'buyingprice': {
        'required': 'Please enter a price for this good.'
      }
    }
    this.good = this.fb.group({
      category: ['', [Validators.required]]
      , code: ['', [Validators.required, Validators.minLength(1)]]
      , commission: ['', [Validators.required]]
      , name: ['', [Validators.required, Validators.minLength(1)]]
      , buyingprice: ['', [Validators.required]]
      , sellingprice: ['', [Validators.required]]
    })
    this.good.valueChanges.subscribe(() => this.goodValueChanges())
    this.editable = this.navParams.get('good')
    this.good.setValue({
      name: this.editable.name
      , category: this.editable.category
      , buyingprice: this.editable.buyingprice
      , sellingprice: this.editable.sellingprice
      , code: this.editable.code
      , commission: this.editable.commission
    })
    // if (this.has_brand_name)
    //   this.good.setValue({ brand: this.editable.brand })
    // if (this.has_description)
    //   this.good.setValue({ description: this.editable.description })
  }
  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }
  create() {
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
  toggleBrandName() {
    this.has_brand_name = !this.has_brand_name
    this.has_brand_name
      ? this.good.addControl(
        'brand', new FormControl('', [Validators.required, Validators.minLength(1)])
      )
      : this.good.removeControl('brand')
  }
  toggleDescription() {
    this.has_description = !this.has_description
    this.has_description
      ? this.good.addControl(
        'description', new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(250)])
      )
      : this.good.removeControl('description')
  }
  togglePackaging() {
    this.has_packages = !this.has_packages
    this.has_packages
      ? this.good.addControl(
        'description', new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(250)])
      )
      : this.good.removeControl('description')
  }
}
