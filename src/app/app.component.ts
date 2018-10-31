import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Alert, AlertController, Menu, Nav } from 'ionic-angular';
import { IpcRenderer, Preferences, User } from '../providers/providers'
import { Storage } from '@ionic/storage'

@Component({
  templateUrl: 'app.html'
})
export class Salman implements OnInit {
  @ViewChild(Menu) menu: Menu
  @ViewChild(Nav) nav: Nav
  @ViewChild('controls') controls: ElementRef
  @ViewChild('status') stat: ElementRef
  rootPage: any = 'Landing'
  public split_view: boolean

  constructor(
    private ipcRenderer: IpcRenderer
    , private alertCtrl: AlertController
    , private preferences: Preferences
    , private storage: Storage
    , public user: User
  ) { }

  close(): void {
    this.ipcRenderer.send('window:close').subscribe()
  }
  ngOnInit(): void {
    // this.platform.ready().then(() => {
    document.addEventListener("keydown", (e) => {
      if (e.which === 123) {
        this.ipcRenderer.send('window:devtools', null).subscribe()
      } else if (e.which === 116) {
        location.reload();
      }
    })
    document.addEventListener('mousemove', (event) => {
      if (event.y < 20 && event.x > window.innerWidth - 165) {
        this.controls.nativeElement.style.opacity = '1'
        this.controls.nativeElement.style.top = '0'
        this.stat.nativeElement.style.opacity = '1'
        this.stat.nativeElement.style.bottom = '0'
      } else {
        this.controls.nativeElement.style.opacity = '0'
        this.controls.nativeElement.style.top = '-35px'
        this.stat.nativeElement.style.opacity = '0'
        this.stat.nativeElement.style.bottom = '-35px'
      }
      // })
      this.preferences.load().subscribe(
        (preferences: any) => {
          preferences.split_view != null ? this.split_view = preferences.split_view : this.split_view = false
        }
        , () => {
          this.split_view = false
        }
      )
    })
    this.ipcRenderer.ipcRenderer.on('internet:online', () => {
      console.log(`internet online`)
      this.sync()
    })
    this.ipcRenderer.ipcRenderer.on('internet:offline', () => {
      console.log(`internet offline`)
    })
  }

  maximize() {
    this.ipcRenderer.send('window:maximize', null).subscribe()
  }

  minimize() {
    this.ipcRenderer.send('window:minimize', null).subscribe()
  }

  resize(width: number, height: number) {
    this.ipcRenderer.send('window:resize', { height: height, width: width }).subscribe()
  }

  signOut() {
    this.split_view = false
    this.user.signOut().subscribe(() => {
      this.nav.setRoot('Landing')
      this.menu.close()
    })
  }

  sync() {
    this.storage.get('portaltype').then(type => {
      let sub
      if (type && type == `sale`)
        sub = this.ipcRenderer.send('database:sync', 'up')
      else if (type && type == `management`)
        sub = this.ipcRenderer.send('database:sync', 'down')
      else
        sub = this.ipcRenderer.send('database:sync', 'both')
      sub.subscribe(
        () => {
          let alert: Alert = this.alertCtrl.create({
            enableBackdropDismiss: false
          })
          alert.setTitle(`<h5 class="secondary">Success</h5>`)
          alert.setMessage(`Sync finished!`)
          alert.addButton({
            text: `Ok`
            , handler: () => {
              alert.dismiss()
              return false
            }
          })
          alert.present()
        }
        , () => {
          let alert: Alert = this.alertCtrl.create({
            enableBackdropDismiss: false
          })
          alert.setTitle(`<h5 class="danger">Failure</h5>`)
          alert.setMessage(`Sync failed!`)
          alert.addButton({
            text: `Ok`
            , handler: () => {
              alert.dismiss()
              return false
            }
          })
          alert.addButton({
            text: `Retry`
            , handler: () => {
              alert.dismiss().then(() => this.sync())
              return false
            }
          })
          alert.present()
        }
      )
    })
  }
}
