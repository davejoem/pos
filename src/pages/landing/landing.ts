import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { Storage } from '@ionic/storage'
import { Alert, AlertController, IonicPage, Loading, LoadingController, Modal, ModalController, NavController } from 'ionic-angular';
import {
  IpcRenderer
  // , Preferences
  , User
} from '../../providers/providers'
import { Employee } from '../../models/models'

@IonicPage()
@Component({
  selector: 'landing'
  , templateUrl: 'landing.html'
  , animations: [
    trigger('revolve', [
      state('in', style({}))
      , state('out', style({}))
      , transition('* => out', animate('1500ms ease-in', keyframes([
        style({ backgroundColor: '#fff', transform: 'rotateY(0deg) scale(1)', offset: 0 })
        , style({ transform: 'rotateY(90deg) scale(1.3)', offset: 0.25 })
        , style({ transform: 'rotateY(180deg) scale(1)', offset: 0.5 })
        , style({ transform: 'rotateY(270deg) scale(0.7)', offset: 0.75 })
        , style({ backgroundColor: '#fff', transform: 'rotateY(360deg) scale(1)', offset: 1 })
      ]))
      )
    ])
  ]
})

export class Landing implements OnInit {
  @ViewChild('action') action: ElementRef
  public clicked: boolean
  public connectionError: boolean
  public dots: string
  public error_alert: Alert
  public loading: Loading
  public password_alert: Alert
  public phase: string
  public ready: boolean
  public setup: boolean
  public stat: any | HTMLElement | null
  public status: string
  public state_interval: any

  constructor(
    private alertCtrl: AlertController
    , private ipcRenderer: IpcRenderer
    , private loadingCtrl: LoadingController
    , private modalCtrl: ModalController
    , private navCtrl: NavController
    // , private preferences: Preferences
    , private storage: Storage
    , private user: User
  ) {
    this.connectionError = false
    this.ready = false
    this.status = ''
  }

  begin() {
    this.clicked = true
    this.storage.get('managed').then(managed => {
      let m: boolean
      managed != null ? m = managed : m = false
      m
        ? this.showSign()
        : this.goToSetup()
    })
  }
  ngOnInit() {
    this.clicked = false
    this.stat = document.getElementById('status')
  }

  ionViewDidLoad() {
    this.storage.get('setup').then(val => {
      val != null ? this.setup = val : this.setup = false
    })
    this.stat.innerHTML = this.status = `Loading ...`
    this.connectionError = false
    this.ready = false
    this.load()
  }

  load() {
    this.state_interval = setInterval(() => {
      this.phase == 'in'
        ? this.phase = 'out'
        : this.phase = 'in'
    }, 1500)
    let proceed = (preferences: any) => {
      this.action.nativeElement.innerHTML = `Loading user ...`
      this.user.load().subscribe(
        (user: any) => {
          if (user != null) {
            // this.user._signedIn(user)
            this.user._user = user
            this.action.nativeElement.innerHTML = `Refreshing user details ...`
            this.user.refresh(user.username).subscribe(
              (res: any) => {
                res.user.preferences = preferences
                this.action.nativeElement.innerHTML = `Saving user ...`
                this.user.save(res.user).subscribe(() => {
                  this.stat.innerHTML = this.status = `Ready`
                  this.ready = true
                  clearInterval(this.state_interval)
                  this.phase = 'in'
                })
              }
              , () => {
                this.ready = true
                clearInterval(this.state_interval)
              }
            )
          }
          else {
            this.ready = true
            clearInterval(this.state_interval)
            this.user.signOut().subscribe()
          }
        }
        , () => {
          this.ready = true
          clearInterval(this.state_interval)
          this.user.signOut().subscribe()
        }
      )
    }
    this.action.nativeElement.innerHTML = `Readying application ...`
    this.ipcRenderer.send('app:start').subscribe(() => {
      this.action.nativeElement.innerHTML = `Loading settings ...`
      // this.preferences.load().subscribe(
      //   (preferences: any) => {
      //     this.action.nativeElement.innerHTML = `Connecting to database ...`
      //     switch (preferences.database) {
      //       case 'Local':
      //         this.ipcRenderer.send('database:connect', { database: 'offline' }).subscribe(() => {
      //           proceed(preferences)
      //         })
      //         break
      //       case 'Online':
      //         this.ipcRenderer.send('database:connect', { database: 'online' }).subscribe(() => {
      //           proceed(preferences)
      //         })
      //         break
      //     }
      //   }
      //   , () => {
      //     this.ipcRenderer.send('database:connect', { database: 'offline' }).subscribe(() => {
      //       proceed(null)
      //     })
      //   }
      // )
      this.storage.get('portaltype').then((type: string) => {
        this.action.nativeElement.innerHTML = `Connecting to database ...`
        let dberr = (err: Error) => {
          this.alertCtrl.create({
            title: `Database Connection`
            , subTitle: `Error`
            , message: err.message
            , enableBackdropDismiss: false
            , buttons: [
              {
                text: `Ok`
                , handler: () => {
                  return false
                }
              }
            ]
          })
        }
        switch (type) {
          case `sale`:
            this.ipcRenderer.send('database:connect', { database: 'offline' }).subscribe(() => {
              proceed(null)
            }, dberr)
            break
          case `management`:
            this.ipcRenderer.send('database:connect', { database: 'online' }).subscribe(() => {
              proceed(null)
            }, dberr)
            break
          default:
            this.ipcRenderer.send('database:connect', { database: 'offline' }).subscribe(() => {
              proceed(null)
            }, dberr)
            break
        }
      })
      this.ipcRenderer.ipcRenderer.on('database:closed', () => {
        this.stat.innerHTML = this.status = `Reconnecting`
        this.ready = false
      }).on(`offline`, () => {
        this.stat.innerHTML = this.status = `Offline`
        this.ready = false
      }).on('reconnecting', () => {
        this.status = `Reconnecting `
        this.dots.length >= 3 ? this.dots = `` : this.dots += `.`
        this.stat.innerHTML = this.status + this.dots
      })
    })
  }
  goToManagerPortal() {
    this.navCtrl.setRoot('Management')
  }
  goToSetup() {
    this.storage.get('portaltype').then(type => {
      if (type == null || type == 'undefined') {
        let alert: Alert = this.alertCtrl.create({
          title: `<h5 class="secondary">Set type of till</h5>`
          , buttons: [{
            text: `Set`
            , handler: data => {
              this.storage.set('portaltype', data).then(() => {
                alert.dismiss().then(() =>
                  this.navCtrl.setRoot('Setup', {}, {
                    animate: true
                    , direction: 'forward'
                  })
                )
              })
              return false
            }
          }]
          , enableBackdropDismiss: false
        })
        alert.addInput({
          type: `radio`
          , label: `Sales Till`
          , value: `sale`
          , checked: true
          , name: `type`
        })
        alert.addInput({
          type: `radio`
          , label: `Management Till`
          , value: `management`
          , checked: false
          , name: `type`
        })
        alert.present()
      }
      else {
        this.navCtrl.setRoot('Setup', {}, {
          animate: true
          , direction: 'forward'
        })
      }
    })
  }
  goToSalesPortal() {
    this.navCtrl.setRoot('Sell')
  }
  showSign() {
    let modal: Modal = this.modalCtrl.create(`Sign`, null, { enableBackdropDismiss: false })
    modal.onDidDismiss(details => {
      if (details == 'cancelled') {
        this.clicked = false
        return
      }
      this.loading = this.loadingCtrl.create({
        content: 'Signing In ..'
      })
      this.loading.present().then(() => {
        this.stat.innerHTML = this.status = `Signing In ...`
        this.user.signIn(details.username, details.password).subscribe(
          (data: any) => {
            if (data.token == 'unsetpassword') {
              this.loading.dismiss().then(() => this.showSetPasswordAlert(details.username, details.username))
              return
            }
            this.stat.innerHTML = this.status = `Signed In!`
            // this.user._signedIn(<Employee>JSON.parse(window.atob(data.token.split('.')[1])))
            this.user._user = <Employee>JSON.parse(window.atob(data.token.split('.')[1]))
            data.is_manager
              ? this.storage.get('setup').then(setup => {
                setup
                  ? this.loading.dismiss().then(() => this.goToManagerPortal())
                  : this.loading.dismiss().then(() => this.goToSetup())
              })
              : this.loading.dismiss().then(() => this.goToSalesPortal())
          }
          , (err: any) => {
            this.stat.innerHTML = this.status = `Sign In Error!`
            this.loading.dismiss().then(() => this.showErrorAlert(`Sign In`, err.message))
          }
        )
      })
    })
    modal.present()
  }
  onSignIn(googleUser: any) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }
  showErrorAlert(action?: string, message?: string) {
    this.error_alert = this.alertCtrl.create({
      title: action ? `${action} Error!` : `Error!`
      , message: message ? message : `An error occured. Please try again.`
      , buttons: [{
        text: 'Try again',
        handler: () => {
          this.error_alert.dismiss().then(() => {
            if (action == 'Sign In')
              this.showSign()
            else
              this.showSign()
          })
          return false
        }
      }]
      , enableBackdropDismiss: false
    })
    this.error_alert.present()
  }
  showSetPasswordAlert(username: string, oldpassword: string) {
    this.password_alert = this.alertCtrl.create({
      title: `<p class="salman">Unset password</p>`
      , message: `
        <p>You have not set your password yet.</p>
        <p><b>Please set your password now.</b></p>
      `
      , inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        },
        {
          name: 'confirmpassword',
          placeholder: 'Confirm Password',
          type: 'password'
        }
      ]
      , buttons: [{
        text: 'Set',
        handler: data => {
          if (data.password === data.confirmpassword) {
            let l = this.loadingCtrl.create({
              content: 'Saving ...'
            })
            this.password_alert.dismiss().then(() => {
              l.present().then(() => {
                this.user.setPassword({
                  username: username
                  , oldpassword: oldpassword
                  , newpassword: data.password
                }).subscribe(
                  () => l.dismiss().then(() => this.showSign())
                  , err => {
                    let l: Alert = this.alertCtrl.create({
                      title: `<h5 class="danger">Error!</h5>`
                      // , subTitle: `<p>Couldn't set password.</p>`
                      , message: err.message
                      , buttons: [
                        {
                          text: `Retry`
                          , handler: () => {
                            this.showSetPasswordAlert(username, oldpassword)
                            return false
                          }
                        }
                      ]
                    })
                    l.dismiss().then(() => l.present())
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
                  text: 'Retry'
                  , handler: () => {
                    al.dismiss().then(() => this.showSetPasswordAlert(username, oldpassword))
                    return false
                  }
                }
              ]
            })
            this.password_alert.dismiss().then(() => al.present())
          }
          return false
        }
      }]
      , enableBackdropDismiss: false
    })
    this.password_alert.present()
  }
}
