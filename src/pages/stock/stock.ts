import { Component, OnInit, /* ViewChild */ } from '@angular/core';
import { Alert, AlertController, IonicPage, Loading, LoadingController, MenuController, Modal, ModalController, NavController, Popover, PopoverController, /* Segment */ } from 'ionic-angular';
import { Category, Good } from '../../models/models'
import { IpcRenderer, User } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'stock',
  templateUrl: 'stock.html'
})
export class Stock implements OnInit {
  // @ViewChild(Segment) segment: Segment 
  public categories: Category[] = []
  public goods: Good[] = []
  public total_stock_value_buying: number = 0
  public total_stock_value_selling: number = 0
  public view: string = "all"
  public searched: Good[]
  public searching: boolean
  public good_search: string

  constructor(
    private alertCtrl: AlertController
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , public menuCtrl: MenuController
    , private modalCtrl: ModalController
    , private navCtrl: NavController
    , private popoverCtrl: PopoverController
    , private user: User
  ) { }

  addCategory(): void {
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
        (res: { message: string, category: Category }) =>
          this.update().then(() => this.showSuccessAlert(res.message))
        , (err: { message: string }) => this.showErrorAlert(err.message)
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
        (res: { message: string, good: Good }) =>
          this.update().then(() => this.showSuccessAlert(res.message))
        , (err: { message: string }) => this.showErrorAlert(err.message)
        )
    })
    modal.present()
  }

  addGoodStock(ev: any, good: Good) {
    let modal: Modal = this.modalCtrl.create(
      'NewStock'
      , {
        good: good.name
      }
      , {
        enableBackdropDismiss: false
      }
    )
    modal.onDidDismiss((data: any) => {
      let loading: Loading = this.loadingCtrl.create({ content: 'Saving ...' })
      if (data == 'cancelled')
        return
      loading.present().then(() =>
        this.ipcRenderer.send(
          'good:stock'
          , data
        ).subscribe(
          () => {
            let alert = this.alertCtrl.create({
              title: `<h5 class="secondary">Success</h5>`
              , message: `New stock successfully registered.`
              , enableBackdropDismiss: false
              , buttons: [
                {
                  text: `Ok`
                  , handler: () => {
                    alert.dismiss().then(() => this.update())
                    return false
                  }
                }
              ]
            })
            loading.dismiss().then(() => alert.present())
          }
          , err => {
            let alert: Alert = this.alertCtrl.create({
              title: `<h5 class="danger">Error</h5>`
              , message: err.message
              , enableBackdropDismiss: false
              , buttons: [
                {
                  text: `Ok`
                  , handler: () => {
                    alert.dismiss()
                    return false
                  }
                }
              ]
            })
            loading.dismiss().then(() => alert.present())
          }
          )
      )
    })
    modal.present({
      ev: ev
    })
  }

  addStock(ev: any) {
    let modal: Modal = this.modalCtrl.create('NewStock', null, {
      enableBackdropDismiss: false
    })
    modal.onDidDismiss((good: any) => {
      let loading: Loading = this.loadingCtrl.create({ content: 'Saving ...' })
      if (good == 'cancelled')
        return
      loading.present().then(() =>
        this.ipcRenderer.send('good:stock', good).subscribe(
          () => {
            let alert = this.alertCtrl.create({
              title: `<h5 class="secondary">Success</h5>`
              , message: `New stock successfully registered.`
              , enableBackdropDismiss: false
              , buttons: [
                {
                  text: `Ok`
                  , handler: () => {
                    alert.dismiss().then(() => this.update())
                    return false
                  }
                }
              ]
            })
            loading.dismiss().then(() => alert.present())
          }
          , err => {
            let alert: Alert = this.alertCtrl.create({
              title: `<h5 class="danger">Error</h5>`
              , message: err.message
              , enableBackdropDismiss: false
              , buttons: [
                {
                  text: `Ok`
                  , handler: () => {
                    alert.dismiss()
                    return false
                  }
                }
              ]
            })
            loading.dismiss().then(() => alert.present())
          }
        )
      )
    })
    modal.present({
      ev: ev
    })
  }

  cancelSearch() {
    this.searching = false
    this.searched = []
    this.good_search = ''
  }

  delete(good: Good) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="danger">Hold On!</h5>`
      , message: `Are you sure you want to delete ${good.name}`
      , buttons: [
        {
          text: `Cancel`
          , role: `cancel`
          , handler: () => {
            alert.dismiss()
            return false
          }
        }
        , {
          text: `Yes`
          , handler: () => {
            let loading: Loading = this.loadingCtrl.create({ content: `Deleting ..` })
            alert.dismiss().then(() => {
              loading.present().then(() => {
                this.ipcRenderer.send('good:delete', good).subscribe(
                  (res: { message: string }) =>
                    loading.dismiss().then(() => this.showSuccessAlert(res.message))
                  , err => loading.dismiss().then(() => this.showErrorAlert(err.message))
                )
              })
            })
            return false
          }
        }
      ]
    })
    alert.present()
  }

  deleteCategory(category: Category) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="danger">Hold On!</h5>`
      , message: `Are you sure you want to delete ${category.name}`
      , buttons: [
        {
          text: `Cancel`
          , role: `cancel`
          , handler: () => {
            alert.dismiss()
            return false
          }
        }
        , {
          text: `Yes`
          , handler: () => {
            let loading: Loading = this.loadingCtrl.create({ content: `Deleting ..` })
            alert.dismiss().then(() => {
              loading.present().then(() => {
                this.ipcRenderer.send('category:delete', category).subscribe(
                  (res: { message: string }) =>
                    loading.dismiss().then(() => this.showSuccessAlert(res.message))
                  , err => loading.dismiss().then(() => this.showErrorAlert(err.message))
                )
              })
            })
            return false
          }
        }
      ]
    })
    alert.present()
  }

  edit(good: Good) {
    let modal: Modal = this.modalCtrl.create(
      `EditGood`
      , { good: good }
      , { enableBackdropDismiss: false }
    )
    modal.onDidDismiss(data => {
      let loading: Loading = this.loadingCtrl.create({ content: `Updating details ...` })
      loading.present().then(() => {
        this.ipcRenderer.send(`good:edit`, { new: data, old: good }).subscribe(
          (res: { message: string, good: Good }) => {
            this.goods[this.goods.map(good => { return good.name }).indexOf(good.name)] = res.good
            loading.dismiss().then(
              () => this.showSuccessAlert(res.message).then(
                () => this.update()
              )
            )
          }
          , (err: { message: string }) => {
            loading.dismiss().then(() => this.showErrorAlert(err.message))
          }
        )
      })
    })
    modal.present()
  }

  ionViewDidEnter() {
    this.view = "all"
    this.update()
  }

  isManager(): boolean {
    return this.user.is_manager
  }

  ngOnInit() {
    this.categories = []
    this.goods = []
  }

  removeGoodStock(ev: any, good: Good) {
    let alert: Alert = this.alertCtrl.create({
      enableBackdropDismiss: false
    })
    alert.setTitle('<h5 class="warning">Remove stock</h5>')
    alert.setMessage(`Set amount of ${good.name} to remove from stock.`)
    alert.addInput({
      type: `number`
      , name: `amount`
      , min: 0
      , max: good.stock
    })
    alert.addButton({
      text: `Cancel`
      , cssClass: `danager`
      , role: `cancel`
      , handler: () => {
        alert.dismiss()
        return false
      }
    })
    alert.addButton({
      text: `Ok`
      , handler: data => {
        let loading: Loading = this.loadingCtrl.create({ content: `Saving ...` })
        alert.dismiss().then(() => {
          loading.present().then(() => {
            this.ipcRenderer.send(
              'good:unstock'
              , {
                good: good.name
                , amount: data.amount
              }
            ).subscribe(
              res => {
                loading.dismiss().then(() => {
                  this.showSuccessAlert(res.message).then(() => this.update())
                })
              }
              , err => {
                loading.dismiss().then(() => {
                  this.showErrorAlert(err.message)
                })
              }
              )
          })
        })
        return false
      }
    })
    alert.present({
      ev: ev
    })
  }
  search() {
    this.searching = true
    this.searched = this.goods.filter((good: Good) => {
      return good.name.toLowerCase().includes(this.good_search.toLowerCase())
    })
  }

  setGoodStock(ev: any, good: Good) {
    let modal: Modal = this.modalCtrl.create(
      'SetGood'
      , {
        name: good.name
      }
      , {
        enableBackdropDismiss: false
      }
    )
    modal.onDidDismiss((data: any) => {
      let loading: Loading = this.loadingCtrl.create({ content: 'Saving ...' })
      if (data == 'cancelled')
        return
      loading.present().then(() =>
        this.ipcRenderer.send(
          'good:quantity'
          , {
            quantity: data.quantity
            , name: good.name
          }
        ).subscribe(
          (res: { message: string }) => {
            let alert = this.alertCtrl.create({
              title: `<h5 class="secondary">Success</h5>`
              , message: res.message
              , enableBackdropDismiss: false
              , buttons: [
                {
                  text: `Ok`
                  , handler: () => {
                    alert.dismiss().then(() => this.update())
                    return false
                  }
                }
              ]
            })
            loading.dismiss().then(() => alert.present())
          }
          , (err: { error: Error, message: string }) => {
            let alert: Alert = this.alertCtrl.create({
              title: `<h5 class="danger">Error</h5>`
              , message: err.message
              , enableBackdropDismiss: false
              , buttons: [
                {
                  text: `Ok`
                  , handler: () => {
                    alert.dismiss()
                    return false
                  }
                }
              ]
            })
            loading.dismiss().then(() => alert.present())
          }
          )
      )
    })
    modal.present({
      ev: ev
    })
  }

  setup(): void {
    this.navCtrl.push('Setup')
  }

  showErrorAlert(message: string): Promise<any> {
    return new Promise(resolve => {
      let alert: Alert = this.alertCtrl.create({
        title: `<h5 class="secondary">Error!</h5>`
        , message: message
        , buttons: [
          {
            text: `Retry`
            , role: 'cancel'
            , handler: () => {
              alert.dismiss().then(resolve)
              return false
            }
          }
        ]
        , enableBackdropDismiss: false
      })
      alert.present()
    })
  }

  showInfo(good: Good) {
    let modal: Modal = this.modalCtrl.create(
      'Info'
      , { type: 'good', data: good }
      , { enableBackdropDismiss: false }
    )
    modal.present()
  }

  showMenu(ev: any) {
    let popover: Popover = this.popoverCtrl.create(
      'MoreMenu'
      , { settings: true }
      , {
        enableBackdropDismiss: true
        , showBackdrop: true
      }
    )
    popover.onDidDismiss((data: { page: string }) => {
      this.navCtrl.push(data.page)
    })
    popover.present({
      ev: ev
    })
  }

  showSettings() {
    this.navCtrl.push(
      `Settings`
      , null
      , {
        animate: true
        , direction: `right`
        , duration: 300
      }
    )
  }

  showSuccessAlert(message: string): Promise<any> {
    return new Promise(resolve => {
      let alert: Alert = this.alertCtrl.create({
        title: `<h5 class="secondary">Complete!</h5>`
        , message: message
        , buttons: [
          {
            text: `Ok`
            , role: 'cancel'
            , handler: () => {
              alert.dismiss().then(resolve)
              return false
            }
          }
        ]
        , enableBackdropDismiss: false
      })
      alert.present()
    })
  }

  signOut() {
    this.user.signOut().subscribe(() => {
      this.navCtrl.setRoot('Landing')
    })
  }

  sync(direction: string, message?: string) {
    let loading: Loading = this.loadingCtrl.create({ content: message ? message : `Syncronizing ...` })
    loading.present().then(() => {
      switch (direction) {
        case 'up':
          this.ipcRenderer.send('syncu:goods').subscribe(
            (res: { message: string }) => {
              loading.dismiss().then(() => this.showSuccessAlert(res.message).then(() => this.update()))
            }
            , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
          )
          break
        case 'down':
          this.ipcRenderer.send('syncd:goods').subscribe(
            (res: { message: string }) => {
              loading.dismiss().then(() => this.showSuccessAlert(res.message).then(() => this.update()))
            }
            , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
          )
          break
      }
    })
  }

  toggleCategory(category: Category) {
    category.expanded = !category.expanded
  }

  toggleMenu() {
    this.menuCtrl.toggle('mainmenu')
  }
  update(): Promise<{ categories: Category[], goods: Good[] }> {
    this.categories = []
    this.goods = []
    this.searched = []
    this.searching = false
    this.good_search = ''
    this.total_stock_value_buying = 0
    this.total_stock_value_selling = 0
    let loading: Loading = this.loadingCtrl.create({ content: 'Updating ...' })
    return new Promise((resolve, reject) => {
      loading.present().then(() => {
        this.ipcRenderer.send('category:list').subscribe(
          (res: { categories: Category[] }) => {
            this.categories = res.categories
            this.categories.sort()
            this.categories.forEach(cat => {
              if (cat.goods) {
                cat.goods.forEach(good => { this.goods.push(good) })
              }
            })
            this.goods.forEach((good: Good) => {
              this.total_stock_value_buying += (good.buyingprice * good.stock)
              this.total_stock_value_selling += (good.sellingprice * good.stock)
            })
            loading.dismiss().then(() => this.warnLowStock().then(() => resolve({ goods: this.goods, categories: this.categories })))
            resolve({ categories: this.categories, goods: this.goods })
          }
          , (err: { error: Error, message: string }) => {
            loading.dismiss().then(() => this.showErrorAlert(err.message))
            reject(err)
          })
      })
    })
  }
  // update(): Promise<Good[]> {
  //   this.categories = []
  //   this.goods = []
  //   this.searched = []
  //   this.searching = false
  //   this.good_search = ''
  //   this.total_stock_value_buying = 0
  //   this.total_stock_value_selling = 0
  //   let loading: Loading = this.loadingCtrl.create({ content: 'Updating ...' })
  //   return new Promise((resolve, reject) => {
  //     loading.present().then(() => {
  //       this.ipcRenderer.send('category:list').subscribe(
  //         (res: { categories: Category[] }) => {
  //           this.categories = res.categories.sort()
  //           console.log(res)
  //           this.ipcRenderer.send('good:list').subscribe(
  //             (res: { goods: Good[] }) => {
  //               this.goods = res.goods.sort()
  //               this.goods.sort()
  //               // res.goods
  //               //   .sort()
  //               //   .map((good: Good) => {
  //               //     return good.category
  //               //   })
  //               //   .filter((category, index, array) => {
  //               //     return category != array[index + 1]
  //               //   })
  //               //   .forEach((category: string) => {
  //               //     this.categories.push({
  //               //       name: category
  //               //       , goods: this.goods.filter((good: Good) => {
  //               //         return good.category == category
  //               //       })
  //               //       , expanded: false
  //               //     })
  //               //     this.categories.sort()
  //               //   })
  //               res.goods.sort().forEach((good: Good) => {
  //                 let index = this.categories.map(cat => { return cat.name }).indexOf(good.category)
  //                 if (index >= 0) {
  //                   this.categories[index].goods = this.goods.filter((good: Good) => {
  //                     return good.category == this.categories[index].name
  //                   })
  //                 }
  //                 else {
  //                   this.categories.push({
  //                     name: good.category
  //                     , goods: this.goods.filter((good: Good) => {
  //                       return good.category == good.category
  //                     })
  //                     , expanded: false
  //                   })
  //                 }
  //                 this.categories.sort()
  //               })
  //               res.goods.forEach((good: Good) => {
  //                 this.total_stock_value_buying += (good.buyingprice * good.stock)
  //                 this.total_stock_value_selling += (good.sellingprice * good.stock)
  //               })
  //               loading.dismiss().then(() => this.warnLowStock().then(() => resolve(this.goods)))
  //             }
  //             , () => loading.dismiss().then(() => reject())
  //           )
  //         }, (err: { message: string, error: any }) => {
  //           this.showErrorAlert(err.message)
  //         })
  //     }
  //       , (err: { message: string, error: any }) => {
  //         this.showErrorAlert(err.message)
  //       })
  //   })
  // }

  warnLowStock(): Promise<any> {
    return new Promise(resolve => {
      let goodnames: string = ``
      let low: Good[] = []
      this.goods.forEach((good: Good) => {
        if (good.stock <= 10)
          low.push(good)
      })
      if (low.length) {
        low.forEach(good => {
          goodnames += `<li><b>`
          goodnames += good.name
          goodnames += `</b>   (`
          goodnames += good.stock
          goodnames += `)</li>`
        })
        let alert: Alert = this.alertCtrl.create({ enableBackdropDismiss: false })
        alert.setTitle(`<h5 class="warning">Warning!</h5>`)
        alert.setSubTitle(`<h6>The following goods are almost depleted in stock.</h6>`)

        alert.setMessage(`
          <br>
          <ul>
            ${goodnames}
          </ul>
          <br>
          <p>Please consider restocking</p>    
        `)
        alert.addButton({
          text: `Ok`
          , role: `cancel`
          , handler: () => {
            alert.dismiss().then(resolve)
            return false
          }
        })
        alert.present()
      }
      else
        resolve()
    })
  }

}
