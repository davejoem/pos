import { Component, OnInit, ViewChild } from '@angular/core';
import { Alert, AlertController, IonicPage, ItemSliding, Loading, LoadingController, MenuController, Modal, ModalController, NavController, Popover, PopoverController, Segment } from 'ionic-angular';
import { Employee } from '../../models/models'
import { IpcRenderer, User } from '../../providers/providers'

@IonicPage()
@Component({
  selector: 'employees',
  templateUrl: 'employees.html'
})
export class Employees implements OnInit {
  @ViewChild(Segment) segment: Segment
  public employees: Employee[]
  constructor(
    private alertCtrl: AlertController
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , private navCtrl: NavController
    , private popoverCtrl: PopoverController
    , public menuCtrl: MenuController
    , private modalCtrl: ModalController
    , private user: User
  ) { }

  addEmployee(ev: any) {
    let modal: Modal = this.modalCtrl.create('NewEmployee', null, {
      enableBackdropDismiss: false
    })
    modal.onDidDismiss((employee: any) => {
      let loading: Loading = this.loadingCtrl.create({ content: 'Saving ...' })
      loading.present().then(() =>
        this.ipcRenderer.send('employee:add', employee).subscribe(
          res => {
            console.log(res)
            this.employees.push(res.employee)
            let alert = this.alertCtrl.create({
              title: `<h5 class="secondary">Success</h5>`
              , message: res.message
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

  changePassword(employee: Employee) {
    console.log(employee)
    let password_alert = this.alertCtrl.create({
      title: `<p class="salman">Change password</p>`
      , message: `
        <p><b>Please set your old password followed by the new password.</b></p>
      `
      , inputs: [
        {
          name: 'oldpassword',
          placeholder: 'Old Password',
          type: 'password'
        },
        {
          name: 'newpassword',
          placeholder: 'New Password',
          type: 'password'
        },
        {
          name: 'confirmpassword',
          placeholder: 'Confirm Password',
          type: 'password'
        }
      ]
      , buttons: [
        {
          text: 'Cancel'
          , role: `cancel`
          , handler: () => {
            password_alert.dismiss()
            return false
          }
        }
        , {
          text: 'Set',
          handler: data => {
            if (data.oldpassword != employee.password) {
              let al = this.alertCtrl.create({
                message: `<p>Incorrect old password!</p>`
                , buttons: [
                  {
                    text: 'Cancel'
                    , handler: () => {
                      al.dismiss()
                      return false
                    }
                  }
                  , {
                    text: 'Retry'
                    , handler: () => {
                      al.dismiss().then(() => this.changePassword(employee))
                      return false
                    }
                  }
                ]
              })
              password_alert.dismiss().then(() => al.present())
              return false
            }
            if (data.newpassword == data.confirmpassword) {
              let l = this.loadingCtrl.create({
                content: 'Saving ...'
              })
              password_alert.dismiss().then(() => {
                l.present().then(() => {
                  this.user.setPassword({
                    username: employee.username
                    , oldpassword: data.oldpassword
                    , newpassword: data.newpassword
                  }).subscribe(
                    () => l.dismiss().then(() => {
                      let al: Alert = this.alertCtrl.create({
                        title: `<h5 class="secondary">Success!</h5>`
                        // , subTitle: `<p>Couldn't set password.</p>`
                        , message: "Password changed!"
                        , buttons: [
                          {
                            text: `Ok`
                            , handler: () => {
                              al.dismiss().then(() => this.update())
                              return false
                            }
                          }
                        ]
                      })
                      al.present()
                    })
                    , err => {
                      let al: Alert = this.alertCtrl.create({
                        title: `<h5 class="danger">Error!</h5>`
                        // , subTitle: `<p>Couldn't set password.</p>`
                        , message: err.message
                        , buttons: [
                          {
                            text: `Retry`
                            , handler: () => {
                              this.changePassword(employee)
                              return false
                            }
                          }
                        ]
                      })
                      l.dismiss().then(() => al.present())
                    }
                    )
                })
              })
            }
            else {
              let al = this.alertCtrl.create({
                message: `<p>Passwords do not match!</p>`
                , buttons: [
                  {
                    text: 'Cancel'
                    , handler: () => {
                      al.dismiss()
                      return false
                    }
                  }
                  , {
                    text: 'Retry'
                    , handler: () => {
                      al.dismiss().then(() => this.changePassword(employee))
                      return false
                    }
                  }
                ]
              })
              password_alert.dismiss().then(() => al.present())
            }
            return false
          }
        }]
      , enableBackdropDismiss: false
    })
    password_alert.present()
  }

  delete(emp: Employee, index?: number): void {
    let del_alert: Alert = this.alertCtrl.create({
      title: `<h5 class="danger">Hold on!</h5>`
      , message: `
        <p>This account will be deleted including all record of sales they have made</p>
        <p>Are you sure you want to delete <b>${emp.username}</b>'s account?</p>
      `
      , buttons: [
        {
          text: `No`
          , role: `cancel`
          , handler: () => {
            del_alert.dismiss()
            return false
          }
        }
        , {
          text: `Yes`
          , handler: () => {
            del_alert.dismiss().then(() => {
              let loading: Loading = this.loadingCtrl.create({ content: 'Deleting user...' })
              loading.present().then(() => {
                this.ipcRenderer.send(`employee:delete`, emp).subscribe(
                  res => {
                    this.employees.splice(index ? index : this.employees.indexOf(emp), 1)
                    this.showSuccessAlert(res, loading)
                  }
                  , err => this.showErrorAlert(err, loading)
                )
              })
            })
            return false
          }
        }
      ]
    })
    del_alert.present()
  }

  ionViewDidEnter() {
    this.update()
  }

  ngOnInit() { }

  showDetails(ev: ItemSliding, employee: Employee) {
    console.log('showing details', ev, employee)
  }

  showErrorAlert(error: any, dismissable?: any): Promise<any> {
    return new Promise(resolve => {
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
        ? dismissable.dismiss().then(() => alert.present().then(resolve))
        : alert.present().then(resolve)
    })
  }

  showInfo(employee: Employee) {
    let modal: Modal = this.modalCtrl.create(
      'Info'
      , { type: 'employee', data: employee }
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

  showSuccessAlert(response: any, dismissable?: Loading) {
    let alert: Alert = this.alertCtrl.create({
      title: `<h5 class="secondary">Success</h5>`
      , message: 'message' in response ? response.message : response
      , buttons: [
        {
          text: `Ok`
          , role: `cancel`
          , handler: () => {
            alert.dismiss().then(() => this.update())
            return false
          }
        }
      ]
    })
    dismissable != null
      ? dismissable.dismiss().then(() => alert.present())
      : alert.present()
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
          this.ipcRenderer.send('syncu:employees').subscribe(
            (res: { message: string }) => this.showSuccessAlert(res, loading)
            , (err: { message: string }) => this.showErrorAlert(err, loading)
          )
          break
        case 'down':
          this.ipcRenderer.send('syncd:employees').subscribe(
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
    this.employees = []
    let loading: Loading = this.loadingCtrl.create({ content: `Updating ...` })
    loading.present().then(() => {
      this.ipcRenderer.send('employee:list').subscribe(
        res => {
          this.employees = res.employees
          loading.dismiss()
        }
        , (err: { message: string }) => {
          loading.dismiss().then(() => this.showErrorAlert(err.message))
        }
      )
    })
  }
}
