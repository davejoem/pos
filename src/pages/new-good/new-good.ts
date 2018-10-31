import { Component, OnInit } from '@angular/core'
import { Validators, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { IonicPage, Loading, LoadingController, ViewController } from 'ionic-angular'
import { Category } from '../../models/models'
import { IpcRenderer } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'new-good',
  templateUrl: 'new-good.html',
})
export class NewGood implements OnInit {
  public categories: Category[]
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
  public catnames: string[]

  constructor(
    private fb: FormBuilder
    , private ipcRenderer: IpcRenderer
    , public loadingCtrl: LoadingController
    , public viewCtrl: ViewController
  ) {
    this.categories = []
    this.catnames = []
    this.has_brand_name = false
    this.has_description = false
    this.has_packages = false
    this.good = this.fb.group({
      category: ['', [Validators.required]]
      , code: ['', [Validators.required, Validators.minLength(1)]]
      , commission: ['', [Validators.required]]
      , name: ['', [Validators.required, Validators.minLength(1)]]
      , buyingprice: ['', [Validators.required]]
      , sellingprice: ['', [Validators.required]]
    })
    this.errors = {
      brand: ''
      , code: ''
      , commission: ''
      , description: ''
      , name: ''
      , buyingprice: ''
      , sellingprice: ''
    }
    this.good.valueChanges.subscribe(() => this.goodValueChanges())
  }

  ngOnInit() {
    this.getCategories().then((categories: Category[]) => {
      this.categories = categories
      this.catnames = categories.map(cat => { return cat.name })
      console.log(categories)
      this.categories.sort()
      this.errors = {
        brand: ''
        , code: ''
        , commission: ''
        , description: ''
        , name: ''
        , buyingprice: ''
        , sellingprice: ''
      }
      this.validationMessages = {
        brand: {
          required: 'Please set a name for this good.'
          , minlength: 'Brand\'s name must be at least 1 character long.'
        }
        , category: {
          required: 'Please set a category for this good.'
        }
        , code: {
          minlength: 'A description must be at least 1 character long.'
          , required: 'Please set a code for this good.'
        }
        , commission: {
          required: 'Please set a commission for this good.'
        }
        , description: {
          required: 'Please set a description for this good.'
          , minlength: 'A description must be at least 1 character long.'
          , maxlength: 'A description must be at most 250 characters long.'
        }
        , name: {
          required: 'Please set a name for this good.'
          , minlength: 'Username must be at least 1 character long.'
        }
        , sellingprice: {
          required: 'Please enter a price for this good.'
        }
        , buyingprice: {
          required: 'Please enter a price for this good.'
        }
      }
    })
  }
  cancel() {
    this.viewCtrl.dismiss('cancelled')
  }
  create() {
    this.viewCtrl.dismiss(this.good.value)
  }
  getCategories(): Promise<Category[]> {
    this.categories = []
    let loading: Loading = this.loadingCtrl.create({ content: 'Updating categories...' })
    return new Promise((resolve, reject) => {
      loading.present().then(() => {
        this.ipcRenderer.send('category:list').subscribe(
          (res: { categories: Category[] }) => {
            loading.dismiss().then(() => resolve(res.categories))
            resolve(res.categories.sort())
          }
          , () => loading.dismiss().then(() => reject())
        )
      })
    })
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
