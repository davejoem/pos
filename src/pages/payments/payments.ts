import { Component, OnInit, ViewChild } from '@angular/core';
import { Alert, AlertController, IonicPage, Loading, LoadingController, MenuController, Modal, ModalController, NavController, Popover, PopoverController, Segment } from 'ionic-angular';
import { Payment } from '../../models/models'
import { IpcRenderer, User } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'payments',
  templateUrl: 'payments.html'
})
export class Payments implements OnInit {
  @ViewChild(Segment) segment: Segment
  public payments: Payment[]
  public total_invoices_value: number
  public total_invoices_value_balance: number
  public total_payments_value: number

  constructor(
    private alertCtrl: AlertController
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , private menuCtrl: MenuController
    , private modalCtrl: ModalController
    , private navCtrl: NavController
    , private popoverCtrl: PopoverController
    , private user: User
  ) { }

  addPayment(data?: any) {
    let modal: Modal = this.modalCtrl.create(
      'NewPayment'
      , { data: data }
      , { enableBackdropDismiss: false }
    )
    modal.onDidDismiss((data: any) => {
      if (data == 'cancelled')
        return
      let al: Alert = this.alertCtrl.create({
        title: `<h5 class="secondary">Set payment type</h5>`
        , message: `Is this an invoice?`
        , buttons: [
          {
            text: `No`,
            handler: () => {
              al.dismiss().then(() => proceed(false))
              return false
            }
          }
          , {
            text: `Yes`
            , handler: () => {
              al.dismiss().then(() => proceed(true))
              return false
            }
          }
        ]
      })
      al.present()
      let proceed = (isinvoice: boolean) => {
        let loading: Loading = this.loadingCtrl.create({ content: `Saving ...` })
        loading.present().then(() => {
          this.ipcRenderer.send(
            `payment:add`
            , {
              amount: parseFloat(data.amount)
              , isinvoice: isinvoice
              , by: this.user._user
              , description: data.description
              , to: data.to
            }
          ).subscribe(
            (res: { payment: Payment, message: string }) => {
              let alert: Alert = this.alertCtrl.create({
                title: `<h5 class="secondary">Success!</h5>`
                , message: res.message
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
            , () => {
              // let alert: Alert = this.alertCtrl.create({
              //   title: `<h5 class="danger">Error!</h5>`
              //   , message: err.message
              //   , buttons: [
              //     {
              //       text: `Retry`
              //       , handler: () => {
              //         alert.dismiss().then(() => this.addPayment())
              //         return false
              //       }
              //     }
              //   ]
              // })
              loading.dismiss().then(() => this.update())
            }
            )
        })
      }
    })
    modal.present()
  }

  isManager(): boolean {
    return this.user.is_manager
  }

  ngOnInit() {
    this.update()
  }

  showErrorAlert(error: any, dismissable?: any) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="danger">Error</h5>`
      , message: error.message ? error.message : error
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
    dismissable != null
      ? dismissable.dismiss().then(() => alert.present())
      : alert.present()
  }

  showInfo(payment: Payment) {
    let modal: Modal = this.modalCtrl.create(
      'Info'
      , { type: 'payment', data: payment }
      , { enableBackdropDismiss: false }
    )
    modal.onDidDismiss(data => {
      if (data == 'pay') {
        let doPay = (amount: number) => {
          if (amount > payment.amount) {
            let alert: Alert = this.alertCtrl.create({ enableBackdropDismiss: false })
            alert.setTitle(`<h5 class="warning">Warning!</h5>`)
            alert.setMessage(`You are trying to pay more than you owe.`)
            alert.addButton({
              text: `Ok`
              , role: `cancel`
              , handler: () => {
                alert.dismiss().then(() => this.showInfo(payment))
                return false
              }
            })
            alert.present()
            return
          }
          let loading: Loading = this.loadingCtrl.create({ content: `Saving ...` })
          loading.present().then(() =>
            this.ipcRenderer.send(
              `payment:pay`
              , {
                payment: payment
                , amount: amount
              }
            ).subscribe(
              res => loading.dismiss().then(() => this.showSuccessAlert(res).then(() => this.update()))
              , err => loading.dismiss().then(() => this.showErrorAlert(err))
              )
          )
        }
        let alert: Alert = this.alertCtrl.create({
          title: `<h5 class="secondary">Pay Invoice</h5>`
          , message: `Enter amount to pay`
          , inputs: [
            {
              type: `number`
              , name: `amount`
              , min: 0
              , max: payment.balance
            }
          ]
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
              text: `Pay`
              , handler: d => {
                alert.dismiss().then(() => doPay(d.amount))
                return false
              }
            }
          ]
          , enableBackdropDismiss: false
        })
        alert.present()
      }
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

  showSuccessAlert(response: any, dismissable?: Loading): Promise<any> {
    return new Promise(resolve => {
      let alert: Alert = this.alertCtrl.create({
        title: `<h5 class="secondary">Success</h5>`
        , message: response.message
        , buttons: [
          {
            text: `Ok`
            , handler: () => {
              alert.dismiss().then(() => { this.update() })
              return false
            }
          }
        ]
      })
      dismissable != null
        ? dismissable.dismiss().then(() => alert.present().then(() => resolve()))
        : alert.present().then(() => resolve())
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
          this.ipcRenderer.send('syncu:payments').subscribe(
            (res: { message: string }) => this.showSuccessAlert(res, loading)
            , (err: { message: string }) => this.showErrorAlert(err, loading)
          )
          break
        case 'down':
          this.ipcRenderer.send('syncd:payments').subscribe(
            (res: { message: string }) => this.showSuccessAlert(res, loading)
            , (err: { message: string }) => this.showErrorAlert(err, loading)
          )
          break
      }
    })
  }

  toggleMenu() {
    this.menuCtrl.toggle('mainmenu')
  }

  update() {
    this.payments = []
    this.total_payments_value = 0
    this.total_invoices_value = 0
    this.total_invoices_value_balance = 0
    let loading: Loading = this.loadingCtrl.create({ content: `Updating ...` })
    loading.present().then(() =>
      this.ipcRenderer.send('payment:list').subscribe(
        (res: { payments: Payment[] }) => {
          this.payments = res.payments
          res.payments.forEach(payment => {
            this.total_payments_value += payment.amount
            if (payment.isinvoice) {
              this.total_invoices_value += payment.amount
              this.total_invoices_value_balance += payment.balance
            }
          })
          loading.dismiss()
        }
        , () => loading.dismiss()
      )
    )
  }

}
