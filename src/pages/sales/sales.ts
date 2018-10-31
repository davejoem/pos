import { Component, OnInit } from '@angular/core'
import {
  Alert, AlertController, IonicPage, Loading, LoadingController, MenuController,
  Modal, ModalController, NavController, NavParams, Popover, PopoverController
} from 'ionic-angular';
import { IpcRenderer, User } from '../../providers/providers'
import { Good, Sale, ShoppingListItem } from '../../models/models'
import { setTimeout } from 'timers'

@IonicPage()
@Component({
  selector: 'sales',
  templateUrl: 'sales.html',
})
export class Sales implements OnInit {
  public era: string
  public limit: number = 20;
  public personalized: boolean
  public sales: Sale[]
  public saleView: string
  public scroll_at: string = "20%";
  public total_commission: number
  public total_sales: number
  public last_update: number

  constructor(
    private alertCtrl: AlertController
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , private menuCtrl: MenuController
    , private modalCtrl: ModalController
    , private navCtrl: NavController
    , private navParams: NavParams
    , private popoverCtrl: PopoverController
    , private user: User
  ) { }

  back() {
    this.navCtrl.pop({
      animate: true
      , direction: `left`
      , duration: 300
    })
  }

  deleteOld(): Promise<any> {
    return new Promise((resolve, reject)=>{
      this.ipcRenderer.send('sale:deleteold').subscribe(
        (res: { message: string, goods: Good[] }) => {
          this.update(this.era, true, this.limit)
          resolve()
        }
        , (err: any)=> {
          let alert: Alert = this.alertCtrl.create({
            title: `<h5 class="danger">Error!</h5>`
            , subTitle: `Couldn't delete old sales.`
            , buttons: [
              {
                text: `Ok`
                , role: `cancel`
                , handler: () => {
                  alert.dismiss()
                  return false
                }
              }
            ]
          })
          alert.present().then()
        }
      )
    })
  }

  evalTotals() {
    this.total_commission = 0
    this.total_sales = 0
    this.sales.filter(sale => {
      switch (this.saleView) {
        case 'all':
          return true
        case `normal`:
          return !sale.debt
        case `credit`:
          return sale.debt
      }
    }).map(sale => {
      return sale.commission.amount
    }).forEach(amount => {
      this.total_commission += amount
    })
    this.sales.filter(sale => {
      switch (this.saleView) {
        case 'all':
          return true
        case `normal`:
          return !sale.debt
        case `credit`:
          return sale.debt
      }
    }).map(sale => {
      return sale.total
    }).forEach(amount => {
      this.total_sales += amount
    })
  }

  formatDate(time: string): String {
    let date = new Date(time)
    return `${date.toDateString()} ${date.toTimeString().split(" ")[0]}`
  }

  getMoreSales(): Promise<any> {
    return new Promise((resolve, reject) => {
      let getSales = () => {
        this.ipcRenderer.send('sale:list', {
          col: this.era
          , limit: this.limit
          , lastId: this.sales[this.sales.length - 1]._id.toString()
        }).subscribe(
          (res: { sales: Sale[] }) => {
            this.sales = res.sales
            this.sales.forEach(sale => {
              sale.debt = 'debt' in sale ? sale.debt : `debtor` in sale ? true : false
            })
            this.evalTotals()
            this.last_update = Date.now()
            this.limit += 20
            resolve()
          }
          , () => {
            let alert: Alert = this.alertCtrl.create({
              title: `<h5 class="danger">Error!</h5>`
              , subTitle: `Couldn't list sales`
              , buttons: [
                {
                  text: `Ok`
                  , role: `cancel`
                  , handler: () => {
                    alert.dismiss()
                    return false
                  }
                }
              ]
            })
            alert.present().then(reject)
          }
        )
      }
      let since_last: number = Date.now() - this.last_update
      since_last > 5000
        ? getSales()
        : setTimeout(getSales, 5000 - since_last)
    })
  }

  ionViewDidEnter() {
    if (this.personalized)
      this.update(this.era, true, this.limit)
    else
      this.update(this.era, false, this.limit)
  }

  isManager(): boolean {
    // return this.user.is_manager    
    return this.user._user.role == 'manager'
  }

  markAsPaid(sale: Sale) {
    let loading: Loading = this.loadingCtrl.create({ content: `Saving ...` })
    loading.present().then(() =>
      this.ipcRenderer.send(`sale:paid`, sale).subscribe(
        (res: { message: string }) => {
          loading.dismiss().then(() =>
            this.showSuccessAlert(res.message).then(() => this.update(this.era, false, this.limit))
          )
        }
        , (err: { message: string }) => {
          loading.dismiss().then(() =>
            this.showErrorAlert(err.message).then(() => this.update(this.era, false, this.limit))
          )
        }
      )
    )
  }

  ngOnInit() {
    this.era = 'today'
    this.sales = []
    this.saleView = 'all'
    this.total_commission = 0
    this.total_sales = 0
    this.navParams.get('personalized')
      ? this.personalized = true
      : this.personalized = false
  }

  search() {
    let select: Alert = this.alertCtrl.create({ enableBackdropDismiss: false })
    select.setTitle(`<h5 class="secondary">View Report</h5>`)
    select.setMessage(`Select good to view report for.`)
    select.addButton({
      text: `Cancel`
      , role: `cancel`
      , handler: () => {
        select.dismiss()
        return false
      }
    })
    select.addButton({
      text: `View Report`
      , cssClass: `secondary`
      , handler: data => {
        let sales: ShoppingListItem[] = []
        this.sales.map(sale => {
          return sale.list
        }).forEach((items: ShoppingListItem[]) => {
          items.forEach((item: ShoppingListItem) => {
            if (data == item.good.name) {
              sales.push(item)
            }
          })
        })
        let total: number = 0
        let num: number = 0
        sales.forEach((sale) => {
          total += (sale.good.sellingprice * sale.quantity)
          num += sale.quantity
        })
        let report: Alert = this.alertCtrl.create({ enableBackdropDismiss: false })
        report.setTitle(`<h5 class="secondary">Total Sales</h5>`)
        report.setMessage(`<b>${num}</b> ${data} sold. Total:  <b>${total}</b>`)
        report.addButton({
          text: `Ok`
          , role: `cancel`
          , handler: () => {
            report.dismiss()
            return false
          }
        })
        select.dismiss().then(() => report.present())
        return false
      }
    })
    this.ipcRenderer.send('good:list').subscribe(
      (res: { message: string, goods: Good[] }) => {
        res.goods.forEach((good: Good) => {
          select.addInput({
            type: `radio`
            , name: `good`
            , label: good.name
            , value: good.name
          })
        })
        select.present()
      }
    )

  }

  sell() {
    this.navCtrl.push(
      `Sell`
      , { bymanager: true }
      , {
        animate: true
        , direction: `top`
        , duration: 500
      }
    )
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

  showInfo(sale: Sale) {
    let modal: Modal = this.modalCtrl.create(
      'Info'
      , { type: 'sale', data: sale }
      , { enableBackdropDismiss: false }
    )
    modal.onDidDismiss(data => {
      if (data == 'cancelled')
        return
      if (data == 'salepaid')
        this.markAsPaid(sale)
    })
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
        title: `<h5 class="secondary">Success!</h5>`
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
          this.ipcRenderer.send('syncu:sales').subscribe(
            () => {
              this.ipcRenderer.send('syncu:commissions').subscribe(
                (res: { message: string }) => {
                  loading.dismiss().then(() => this.showSuccessAlert(res.message).then(() => this.update()))
                }
                , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
              )
            }
            , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
          )
          break
        case 'down':
          this.ipcRenderer.send('syncd:sales').subscribe(
            () => {
              this.ipcRenderer.send('syncd:commissions').subscribe(
                (res: { message: string }) => {
                  loading.dismiss().then(() => {
                    this.showSuccessAlert(res.message).then(() => this.update())
                  })
                }
                , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
              )
            }
            , (err: { message: string }) => loading.dismiss().then(() => this.showErrorAlert(err.message))
          )
          break
      }
    })
  }

  toggleMenu() {
    this.menuCtrl.toggle('mainmenu')
  }

  update(col?: string, filter?: boolean, limit?: number): Promise<Sale[]> {
    this.sales = []
    this.total_commission = 0
    this.total_sales = 0
    let loading: Loading = this.loadingCtrl.create({ content: `Updating ...` })
    return new Promise((resolve, reject) => {
      loading.present().then(() => {
        this.ipcRenderer.send('sale:list', { col: this.era ? this.era : col, limit: limit ? limit : 100 }).subscribe(
          (res: { sales: Sale[] }) => {
            console.log(filter)
            if (this.personalized)
              this.sales = res.sales.filter((sale: Sale) => {
                console.log(sale)
                console.log(this.user)
                return sale.employee.username == this.user._user.username
              })
            else {
              this.sales = res.sales
            }
            this.sales.forEach(sale => {
              sale.debt = 'debt' in sale ? sale.debt : `debtor` in sale ? true : false
            })
            this.evalTotals()
            loading.dismiss().then(() => { this.last_update = Date.now(); resolve(this.sales) })
          }
          , () => {
            loading.dismiss().then(() => {
              let alert: Alert = this.alertCtrl.create({
                title: `<h5 class="danger">Error!</h5>`
                , subTitle: `Couldn't list sales`
                , buttons: [
                  {
                    text: `Ok`
                    , role: `cancel`
                    , handler: () => {
                      alert.dismiss()
                      return false
                    }
                  }
                ]
              })
              alert.present().then(reject)
            })
          }
        )
      })
    })
  }
}
