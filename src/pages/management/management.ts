import { Component } from '@angular/core'
import { IonicPage } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'management',
  templateUrl: 'management.html',
})
export class Management {
  public tab1Root: string
  public tab2Root: string
  public tab3Root: string
  public tab4Root: string
  public tab5Root: string

  public tab1Title: string
  public tab2Title: string
  public tab3Title: string
  public tab4Title: string
  public tab5Title: string

  constructor() {
    this.tab1Root = 'Sales'
    this.tab2Root = 'Stock'
    this.tab3Root = 'Payments'
    this.tab4Root = 'Invoices'
    this.tab5Root = 'Employees'

    this.tab1Title = 'Sales'
    this.tab2Title = 'Stock'
    this.tab3Title = 'Payments'
    this.tab4Title = 'Invoices'
    this.tab5Title = 'Employees'
  }
}
