import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage'
import { Observable, Observer } from 'rxjs'
import { IpcRenderer } from './ipc-renderer'

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class User {
  public is_manager: boolean
  private USER_KEY: string = 'user'
  public _user: any

  constructor(
    public ipcRenderer: IpcRenderer
    , public storage: Storage
  ) {
    this.is_manager = false
  }

  /**
   * Fetch user from storage
   */
  load(): Observable<any> {
    return Observable.fromPromise(this.storage.get(this.USER_KEY))
  }
  /**
   * Send a request to our user existance check endpoint with the data
   * the user entered on the form.
   */
  check(username: string): Observable<any> {
    return this.ipcRenderer.send('auth:check', { username: username })
  }

  /**
   * Send a request to our user end point to get new values
   */
  refresh(username?: string): Observable<any> {
    return this.ipcRenderer.send('auth:refresh', username ? { username: username } : { username: this._user.username })
  }

  /**
   * Send a request to our login endpoint with the data
   * the user entered on the form.
   */
  signIn(username: string, password: string): Observable<any> {
    return this.ipcRenderer.send('auth:signin', { username: username, password: password })
  }

  /**
   * Send a request to our signup endpoint with the data
   * the user entered on the form.
   */
  signUp(username: string, password: string): Observable<any> {
    return this.ipcRenderer.send('auth:signup', { username: username, password: password })
  }

  /**
   * Sign the user out, which forgets the session
   */
  signOut(): Observable<any> {
    delete this._user
    this.is_manager = false
    return this.save()
  }

  /**
   * Process a signin/signup response to store user data
   */
  _signedIn(user: any): void {
    this._user = user
    this.is_manager = this._user.role == 'manager'
  }
  save(user?: any): Observable<any> {
    if (user) this._signedIn(user)
    return Observable.create((observer: Observer<any>) => {
      this.storage.set(this.USER_KEY, user ? user : this._user)
        .then((res: any) => {
          observer.next(res)
          observer.complete()
        })
        .catch((err: any) => {
          observer.error(err)
          observer.complete()
        })
    })
  }
  setPassword(data: { username: string, newpassword: string, oldpassword: string }) {
    return this.ipcRenderer.send('auth:setpassword', data)
  }
}
