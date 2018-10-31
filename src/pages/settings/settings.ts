import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'settings',
  templateUrl: 'settings.html',
})
export class Settings implements OnInit {
  public view: string
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  ngOnInit() {
    this.view = 'database'
  }
  ionViewDidLoad() {}

}
