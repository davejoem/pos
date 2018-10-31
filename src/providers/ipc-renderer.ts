import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'

@Injectable()
export class IpcRenderer {
  ipcRenderer: any
  constructor() {
    this.ipcRenderer = window.require('electron').ipcRenderer
  }
  send(event: string, data?: any): Observable<any> {
    return Observable.create((observer: Observer<any>)=>{
      this.ipcRenderer.send(event, data)
      this.ipcRenderer.once(`${event}:success`, (event: any, res: any)=>{
        event = null
        observer.next(res)
        observer.complete()
      }).once(`${event}:error`, (event: any, res: any)=>{
        event = null
        observer.error(res)
        observer.complete()
      })
    })
  }
  listen(event: string, once?: boolean, page?: any): Promise<any> {
    return new Promise(resolve=>{
      console.log(event,page, once)
      resolve()
    })
  }
}
