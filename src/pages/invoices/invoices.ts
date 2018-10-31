import { Component, OnInit, ViewChild } from '@angular/core';
import { Alert, AlertController, IonicPage, Loading, LoadingController, MenuController, Modal, ModalController, NavController, Popover, PopoverController, Segment } from 'ionic-angular';
import { Invoice } from '../../models/models'
import { IpcRenderer, User } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'invoices',
  templateUrl: 'invoices.html'
})
export class Invoices implements OnInit {
  @ViewChild(Segment) segment: Segment
  public invoices: Invoice[]
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

  addInvoice(data?: any) {
    let modal: Modal = this.modalCtrl.create(
      'NewInvoice'
      , { data: data }
      , { enableBackdropDismiss: false }
    )
    modal.onDidDismiss((data: any) => {
      if (data == 'cancelled')
        return
      let loading: Loading = this.loadingCtrl.create({ content: `Saving ...` })
      this.ipcRenderer.send(
        `invoice:add`
        , {
          amount: parseFloat(data.amount)
          , by: this.user._user
          , description: data.description
          , to: data.to
        }
      ).subscribe(
        (res: { invoice: Invoice, message: string }) => {
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
        , (err: { message: string }) => {
          let alert: Alert = this.alertCtrl.create({
            title: `<h5 class="danger">Error!</h5>`
            , message: err.message
            , buttons: [
              {
                text: `Retry`
                , handler: () => {
                  alert.dismiss().then(() => this.addInvoice())
                  return false
                }
              }
            ]
          })
          loading.dismiss().then(() => alert.present())
        }
        )
      loading.present()
    })
    modal.present()
  }

  isManager(): boolean {
    return this.user.is_manager
  }

  ngOnInit() {
    this.update()
  }

  showInfo(invoice: Invoice) {
    let modal: Modal = this.modalCtrl.create(
      'Info'
      , { type: 'invoice', data: invoice }
      , { enableBackdropDismiss: false }
    )
    modal.onDidDismiss(data => {
      if (data == 'invoicepaid') {
        let loading: Loading = this.loadingCtrl.create({ content: `Saving ...` })
        loading.present().then(() =>
          this.ipcRenderer.send(`invoice:paid`, invoice).subscribe(
            (res: { message: string }) => {
              console.log(res)
              loading.dismiss()
            }
            , (err: { message: string }) => {
              console.log(err)
              loading.dismiss()
            }
          )
        )
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

  signOut() {
    this.user.signOut().subscribe(() => {
      this.navCtrl.setRoot('Landing')
    })
  }

  toggleMenu() {
    this.menuCtrl.toggle('mainmenu')
  }

  update() {
    this.invoices = []
    let loading: Loading = this.loadingCtrl.create({ content: `Updating ...` })
    loading.present().then(() =>
      this.ipcRenderer.send('invoice:list').subscribe(
        (res: { invoices: Invoice[] }) => {
          this.invoices = res.invoices
          loading.dismiss()
        }
        , () => loading.dismiss()
      )
    )
  }
}
