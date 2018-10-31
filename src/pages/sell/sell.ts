import { Component, OnInit } from '@angular/core';
// import { Storage } from '@ionic/storage'
import {
  Alert, AlertController, IonicPage, Loading, LoadingController
  , MenuController, Modal, ModalController, NavController
} from 'ionic-angular';
import { IpcRenderer, User } from '../../providers/providers'
import { Category, Good, ShoppingListItem } from '../../models/models'

@IonicPage()
@Component({
  selector: 'sell',
  templateUrl: 'sell.html',
})
export class Sell implements OnInit {
  public balance: number
  public cash: number
  public categories: Category[]
  public categorized: boolean
  public goods: Good[]
  public good_search: string
  public order: number
  public searched: Good[]
  public selected_category?: Category
  public shopping_list: ShoppingListItem[]

  constructor(
    private alertCtrl: AlertController
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , private menuCtrl: MenuController
    , private modalCtrl: ModalController
    , private navCtrl: NavController
    // , private storage: Storage
    , private user: User
  ) {
    this.balance = 0
    this.cash = 0
    this.categories = []
    this.categorized = false
    this.goods = []
    this.good_search = ''
    this.order = 0
    this.searched = []
    this.shopping_list = []
  }

  addGood(good: Good) {
    this.searched = []
    let index = this.shopping_list.map(item => { return item.good.name }).indexOf(good.name)
    if (index != -1) {
      if ((good.stock - (this.shopping_list[index].quantity + 1)) >= 0) {
        this.shopping_list[index].quantity++
        setTimeout(() => this.doEval(), 100)
      }
      else {
        this.showInsufficientStock(this.shopping_list[index])
      }
    }
    else {
      if (good.stock > 0) {
        this.shopping_list.push({
          good: good
          , quantity: 1
          , price: good.sellingprice
          , total: good.sellingprice
        })
        setTimeout(() => this.doEval(), 100)
      } else {
        this.showInsufficientStock({
          good: good
          , quantity: 1
          , price: good.sellingprice
          , total: good.sellingprice
        })
      }
    }
  }

  cancelSearch() {
    this.searched = []
    this.good_search = ''
  }

  categorize(category: Category) {
    this.searched = []
    this.categorized = true
    this.selected_category = category
  }

  changeQuantity(item: ShoppingListItem) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="secondary">Add more of ${item.good.name} to cart</h5>`
      , subTitle: `Select quantity`
      , inputs: [{
        placeholder: `Quantity`
        , type: `number`
        , name: 'quantity'
        , min: 1
        , max: item.good.stock
      }]
      , buttons: [
        {
          text: `Cancel`
          , role: 'cancel'
          , handler: () => {
            alert.dismiss()
            return false
          }
        }
        , {
          text: `Add`
          , handler: (data) => {
            alert.dismiss().then(() => {
              if (parseInt(data.quantity) > 0)
                this.shopping_list[
                  this.shopping_list.map((i) => {
                    return i.good.name
                  }).indexOf(item.good.name)
                ].quantity = parseInt(data.quantity)
              else
                this.shopping_list.splice(
                  this.shopping_list.map((i) => {
                    return i.good.name
                  }).indexOf(item.good.name)
                  , 1)
              setTimeout(() => this.doEval(), 100)
            })
            return false
          }
        }
      ]
    })
    alert.present()
  }

  decreaseQuantity(item: ShoppingListItem) {
    let index
    index = this.shopping_list.map((i) => {
      return i.good.name
    }).indexOf(item.good.name)
    if (this.shopping_list[index].quantity > 0)
      this.shopping_list[index].quantity--
    setTimeout(() => this.doEval(), 100)
  }

  doEval() {
    this.order = 0
    this.balance = 0
    this.shopping_list.map(item => {
      item.total = item.good.sellingprice * item.quantity
      return item.total
    }).forEach(total => {
      this.order += total
      this.balance = this.cash - this.order
    })
  }

  doSell(debtor?: string) {
    let loading: Loading = this.loadingCtrl.create({ content: `Saving sale ...` })
    let goods = this.shopping_list.map((item) => {
      return item.good
    })
    loading.present().then(() => {
      this.ipcRenderer.send('sale:add', {
        balance: this.balance
        , cash: this.cash
        , debt: (this.order > this.cash)
        , debtor: debtor ? debtor : null
        , total: this.order
        , employee: this.user._user
        , list: this.shopping_list
        , goods: goods
      }).subscribe(
        (res: { message: string }) => loading.dismiss().then(() => this.showSuccessAlert(res.message))
        , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
        )
    })
  }

  increaseQuantity(item: ShoppingListItem) {
    let index = this.shopping_list.map((i) => {
      return i.good.name
    }).indexOf(item.good.name)
    if ((item.good.stock - (this.shopping_list[index].quantity + 1)) >= 0)
      this.shopping_list[index].quantity++
    else
      this.showInsufficientStock(item)
    setTimeout(() => this.doEval(), 100)
  }

  isManager(): boolean {
    // return this.user.is_manager
    return this.user._user.role == 'manager'
  }

  makeSale() {
    this.doEval()
    if (this.order > this.cash) {
      let alert: Alert = this.alertCtrl.create({
        title: `<h5 class="danger">Insufficient Funds</h5>`
        , message: `<p>You've not entered cash received.<br > Is this a sale via <strong>TILL NUMBER</strong></p>?`
        , buttons: [
          {
            text: `No, Change Cash`
            , role: `cancel`
            , handler: () => {
              alert.dismiss()
              return false
            }
          }
          , {
            text: `Yes`
            , handler: () => {
              let modal: Modal = this.modalCtrl.create(
                `NewCreditSale`
                , null
                , {
                  enableBackdropDismiss: false
                }
              )
              modal.onDidDismiss((data) => {
                if (data == `cancelled`)
                  this.makeSale()
                else
                  this.doSell(data.name)
              })
              alert.dismiss().then(() => modal.present())
              return false
            }
          }
        ]
        , enableBackdropDismiss: false
      })
      alert.present()
    } else {
      this.doSell()
    }
  }

  manage() {
    this.navCtrl.pop({
      animate: true
      , direction: `bottom`
      , duration: 500
    })
  }

  ngOnInit() {
    this.update()
    setTimeout(() => this.sync('up'), (1 * 60 * 60 * 1000))
  }

  sync(direction: string, message?: string) {
    let loading: Loading = this.loadingCtrl.create({ content: message ? message : `Syncronizing ...` })
    loading.present().then(() => {
      switch (direction) {
        case 'up':
          this.ipcRenderer.send('syncu:sales').subscribe(
            (res: { message: string }) => loading.dismiss().then(() => this.showSuccessAlert(res.message))
            , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
          )
          break
        case 'down':
          this.ipcRenderer.send('syncd:sales').subscribe(
            (res: { message: string }) => loading.dismiss().then(() => this.showSuccessAlert(res.message))
            , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
          )
          break
      }
    })
  }

  removeGood(item: ShoppingListItem) {
    this.shopping_list.splice(
      this.shopping_list.map((i) => {
        return i.good.name
      }).indexOf(item.good.name)
      , 1
    )
    setTimeout(() => this.doEval(), 100)
  }

  search() {
    if (this.categorized)
      this.searched = this.selected_category!.goods!.filter((good: Good) => {
        return good.name.toLowerCase().includes(this.good_search.toLowerCase())
      })
    else
      this.searched = this.goods.filter((good: Good) => {
        return good.name.toLowerCase().includes(this.good_search.toLowerCase())
      })
  }

  showErrorAlert(message: string) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="secondary">Error!</h5>`
      , message: message
      , buttons: [
        {
          text: `Retry`
          , role: 'cancel'
          , handler: () => {
            alert.dismiss()
            return false
          }
        }
      ]
      , enableBackdropDismiss: false
    })
    alert.present()
  }

  showInsufficientStock(item: ShoppingListItem) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="warning">Warning!</h5>`
      , subTitle: `Insufficient stock`
      , message: `
        You are trying to sell more of ${item.good.name} than is available in stock.
        There ${ item.good.stock > 1 ? 'are' : 'is'} ${item.good.stock} available in stock.
      `
      , buttons: [
        {
          text: `Ok`
          , role: 'cancel'
          , handler: () => {
            alert.dismiss()
            return false
          }
        }
      ]
      , enableBackdropDismiss: false
    })
    alert.present()
  }

  showSales() {
    this.navCtrl.push(
      `Sales`
      , { personalized: true }
      , {
        animate: true
        , direction: `right`
        , duration: 300
      }
    )
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

  showSuccessAlert(message: string) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="secondary">Complete!</h5>`
      , message: message
      , buttons: [
        {
          text: `Ok`
          , role: 'cancel'
          , handler: () => {
            alert.dismiss().then(() => {
              this.shopping_list = []
              this.categorized = false
            })
            return false
          }
        }
      ]
      , enableBackdropDismiss: false
    })
    alert.present()
  }

  signOut() {
    if (this.user._user.role == 'manager') {
      this.isManager()
    } else {
      this.user.signOut().subscribe(() => {
        this.navCtrl.setRoot('Landing')
      })
    }
  }

  toggleMenu() {
    this.doEval()
    this.menuCtrl.toggle('mainmenu')
  }

  // update() {
  //   this.balance = 0
  //   this.cash = 0
  //   this.categories = []
  //   this.categorized = false
  //   this.goods = []
  //   this.order = 0
  //   this.searched = []
  //   this.shopping_list = []
  //   let loading: Loading = this.loadingCtrl.create({ content: `Loading ...` })
  //   loading.present().then(() => {
  //     this.ipcRenderer.send('good:list').subscribe(
  //       (res: { goods: Good[] }) => {
  //         this.goods = res.goods
  //         res.goods
  //           .map((good: Good) => {
  //             return good.category
  //           })
  //           .sort()
  //           .filter((category, index, array) => {
  //             return category != array[index + 1]
  //           })
  //           .forEach((category: string) => {
  //             this.categories.push({
  //               name: category
  //               , goods: this.goods.filter((good: Good) => {
  //                 return good.category == category
  //               })
  //               , expanded: false
  //             })
  //           })
  //         loading.dismiss()
  //       }
  //       , (err: { message: string, error: any }) => {
  //         loading.dismiss().then(() => this.showErrorAlert(err.message))
  //       }
  //     )
  //   })
  // }
  update() {
    this.balance = 0
    this.cash = 0
    this.categories = []
    this.categorized = false
    this.goods = []
    this.order = 0
    this.searched = []
    this.shopping_list = []
    let loading: Loading = this.loadingCtrl.create({ content: `Loading ...` })
    loading.present().then(() => {
      this.ipcRenderer.send('category:list').subscribe(
        (res: { categories: Category[] }) => {
          this.categories = res.categories
          this.categories.forEach(category => {
            category.expanded = false
            category.goods!.forEach(good => this.goods.push(good))
          })
          loading.dismiss()
        }
        , (err: { message: string, error: any }) => {
          loading.dismiss().then(() => this.showErrorAlert(err.message))
        }
      )
    })
  }
}
