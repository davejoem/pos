import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { Sale, Commission } from '../../models/models'
// import { IpcRenderer } from '../../providers/ipc-renderer'

@IonicPage()
@Component({
  selector: 'info',
  templateUrl: 'info.html'
})
export class Info implements OnInit {
  public data: any
  public era: string
  public type: string
  public total_commission: number
  public total_sales: number
  public sales: Sale[]
  public commissions: Commission[]
  public view: string

  constructor(
    private navParams: NavParams
    , private viewCtrl: ViewController
  ) { }

  close() {
    this.viewCtrl.dismiss()
  }

  evalTotals() {
    this.total_commission = 0
    this.total_sales = 0
    this.commissions.map((com: Commission) => {
      return com.amount
    }).forEach((amount: number) => {
      this.total_commission += amount
    })
    this.sales.map((sale: Sale) => {
      return sale.total
    }).forEach((amount: number) => {
      this.total_sales += amount
    })
  }

  filter(selected: string) {
    switch (selected) {
      case `today`:
        this.sales = this.data.sales.filter((sale: Sale) => {
          let date = new Date(sale.date)
          let now = new Date(Date.now())
          return (
            date.getDate() == now.getDate()
            && date.getMonth() == now.getMonth()
            && date.getFullYear() == now.getFullYear()
          )
        })
        this.commissions = this.data.commissions.filter((com: Commission) => {
          return (
            this.data.sales.filter((sale: Sale) => {
              let date = new Date(sale.date)
              let now = new Date(Date.now())
              return (
                date.getDate() == now.getDate()
                && date.getMonth() == now.getMonth()
                && date.getFullYear() == now.getFullYear()
              )
            }).map((sale: Sale) => { return sale.commission }).indexOf(com._id) != -1)
        })
        this.evalTotals()
        break
      case `yesterday`:
        this.sales = this.data.sales.filter((sale: Sale) => {
          let date = new Date(sale.date)
          let now = new Date(Date.now())
          return (
            date.getDate() == now.getDate() - 1
            && date.getMonth() == now.getMonth()
            && date.getFullYear() == now.getFullYear()
          )
        })
        this.commissions = this.data.commissions.filter((com: Commission) => {
          return (
            this.data.sales.filter((sale: Sale) => {
              let date = new Date(sale.date)
              let now = new Date(Date.now())
              return (
                date.getDate() == now.getDate() - 1
                && date.getMonth() == now.getMonth()
                && date.getFullYear() == now.getFullYear()
              )
            }).map((sale: Sale) => { return sale.commission }).indexOf(com._id) != -1
          )
        })
        this.evalTotals()
        break
      case `week`:
        this.sales = this.data.sales.filter((sale: Sale) => {
          let date = new Date(sale.date)
          let now = new Date(Date.now())
          function getWeek(d: Date): number {
            var week: number = 1
            if (d.getDate() >= 1 && d.getDate() < 8)
              week = 1
            if (d.getDate() >= 8 && d.getDate() < 15)
              week = 2
            if (d.getDate() >= 15 && d.getDate() < 22)
              week = 3
            if (d.getDate() >= 22 && d.getDate() < 32)
              week = 4
            return week
          }
          return (
            getWeek(date) == getWeek(now)
            && date.getMonth() == now.getMonth()
            && date.getFullYear() == now.getFullYear()
          )
        })
        this.commissions = this.data.commissions.filter((com: Commission) => {
          return (
            this.data.sales.filter((sale: Sale) => {
              let date = new Date(sale.date)
              let now = new Date(Date.now())
              function getWeek(d: Date): number {
                var week: number = 1
                if (d.getDate() >= 1 && d.getDate() < 8)
                  week = 1
                if (d.getDate() >= 8 && d.getDate() < 15)
                  week = 2
                if (d.getDate() >= 15 && d.getDate() < 22)
                  week = 3
                if (d.getDate() >= 22 && d.getDate() < 32)
                  week = 4
                return week
              }
              return (
                getWeek(date) == getWeek(now)
                && date.getMonth() == now.getMonth()
                && date.getFullYear() == now.getFullYear()
              )
            }).map((sale: Sale) => { return sale.commission }).indexOf(com._id) != -1)
        })
        this.evalTotals()
        break
      case `month`:
        this.sales = this.data.sales.filter((sale: Sale) => {
          let date = new Date(sale.date)
          let now = new Date(Date.now())
          return (
            date.getMonth() == now.getMonth()
            && date.getFullYear() == now.getFullYear()
          )
        })
        this.commissions = this.data.commissions.filter((com: Commission) => {
          return (this.data.sales.filter((sale: Sale) => {
            let date = new Date(sale.date)
            let now = new Date(Date.now())
            return (
              date.getMonth() == now.getMonth()
              && date.getFullYear() == now.getFullYear()
            )
          }).map((sale: Sale) => { return sale.commission }).indexOf(com._id) != -1)
        })
        this.evalTotals()
        break
      case `all`:
        this.sales = this.data.sales
        this.commissions = this.data.commissions.filter((com: Commission) => {
          return (this.data.sales.map((sale: Sale) => { return sale.commission }).indexOf(com._id) != -1)
        })
        this.evalTotals()
        break
    }
  }

  formatDate(time: string): String {
    let date = new Date(time)
    return `${date.toDateString()} ${date.toTimeString().split(" ")[0]}`
  }

  ionViewDidEnter() {
    this.evalTotals()
  }

  markAsPaid() {
    this.type == 'sale'
      ? this.viewCtrl.dismiss('salepaid')
      : this.viewCtrl.dismiss('invoicepaid')
  }

  ngOnInit() {
    this.data = this.navParams.get('data')
    this.type = this.navParams.get('type')
    this.sales = this.data.sales
    this.commissions = this.data.commissions
    this.era = 'today'
    this.view = 'sales'
  }

  pay() {
    this.viewCtrl.dismiss('pay')
  }
}
