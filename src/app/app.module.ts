import { enableProdMode, NgModule, ErrorHandler } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Storage, IonicStorageModule } from '@ionic/storage'
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular'
import { Salman } from './app.component'
import { IpcRenderer, Preferences, User } from '../providers/providers'
import { ContextMenuComponent } from '../components/context-menu/context-menu';

enableProdMode()

export function providePreferences(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Preferences(storage, {
    appname: 'Salman'
    , database: 'Local'
    , split_view: false
  })
}

export function providers() {
  return [
    IpcRenderer
    , User
    , { provide: Preferences, useFactory: providePreferences, deps: [ Storage ] }
    // Keep this to enable Ionic's runtime error handling during development
    , { provide: ErrorHandler, useClass: IonicErrorHandler }
  ];
}

@NgModule({
  declarations: [
    Salman,
    ContextMenuComponent
  ]
  , imports: [
    BrowserModule
    , BrowserAnimationsModule
    , IonicModule.forRoot(Salman)
    , IonicStorageModule.forRoot()
  ]
  , bootstrap: [IonicApp]
  , entryComponents: [
    Salman
  ]
  , providers: providers()
})
export class AppModule {}
