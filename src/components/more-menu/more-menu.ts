import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController  } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'more-menu',
  templateUrl: 'more-menu.html'
})
export class MoreMenu {
  public settings: boolean
  constructor(
    private navParams: NavParams
    , private viewCtrl: ViewController
  ) {
    this.settings = this.navParams.get('settings') || true
  }
  goTo(page:string) {
    switch (page) {
      case 'settings':
        this.viewCtrl.dismiss({ page: 'Settings' })
        break
    }
  }
}
