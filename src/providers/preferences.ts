import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { Observable, Observer } from 'rxjs'
/**
 * A simple settings/config class for storing key/value pairs with persistence.
 */
@Injectable()
export class Preferences {
  private PREFERENCES_KEY: string = 'preferences';

  preferences: any;

  _defaults: any;
  _readyPromise: Promise<any>;

  constructor(
    public storage: Storage
    , defaults?: any
  ) {
    if (defaults) this._defaults = defaults;
  }
  
  _mergeDefaults(defaults: any): Observable<any> {
    for (let k in defaults) {
      if (!(k in this.preferences)) {
        this.preferences[k] = defaults[k];
      }
    }
    return this.setAll(this.preferences);
  }

  get allSettings(): any {
    return this.preferences;
  }
  
  getValue(key: string): Observable<any> {
    return Observable.create((observer: Observer<any>)=>
      this.storage.get(this.PREFERENCES_KEY)
        .then(preferences =>{
          observer.next(preferences[key])
          observer.complete()
        }).catch((err: any)=>{
          observer.error(err)
          observer.complete()
        })
    )
  }
  
  load(): Observable<any> {
    return Observable.create((observer: Observer<any>)=>{
      this.storage.get(this.PREFERENCES_KEY).then(
        (value: any) => {
          if (value) {
            this.preferences = value
            this._mergeDefaults(this._defaults).subscribe(()=>{
              observer.next(this.preferences)
              observer.complete()
            })
          } else {
            this.setAll(this._defaults).subscribe((val: any) => {
              this.preferences = val
              observer.next(this.preferences)
              observer.complete()
            })
          }
        }
        , (err: any)=>{
          observer.error(err)
          observer.complete()
        }
      )
    })
  }

  merge(preferences: any): Observable<any> {
    for (let k in preferences) {
      this.preferences[k] = preferences[k];
    }
    return this.save();
  }

  save(): Observable<any> {
    return this.setAll(this.preferences);
  }

  setAll(value: any): Observable<any> {
    return Observable.create((observer: Observer<any>)=>
      this.storage.set(this.PREFERENCES_KEY, value)
        .then((value: any)=>{
          observer.next(value)
          observer.complete()
        }).catch((err: any)=>{
          observer.error(err)
          observer.complete()
        })
    )
  }

  setValue(key: string, value: any): Observable<any> {
    this.preferences[key] = value;
    return Observable.create((observer: Observer<any>)=>{
      this.storage.set(this.PREFERENCES_KEY, this.preferences)
        .then((res: any)=>{
          observer.next(res)
          observer.complete()
        }).catch((err: any)=>{
          observer.error(err)
          observer.complete()
        })
    })
  }
}
