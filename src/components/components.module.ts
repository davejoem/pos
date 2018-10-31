import { NgModule } from '@angular/core'
import { ClientModule } from './client/client.module'
import { MoreMenuModule } from './more-menu/more-menu.module'

@NgModule({
  imports: [
    ClientModule,
    MoreMenuModule
  ],
  exports: [
    ClientModule,
    MoreMenuModule
  ]
})
export class ComponentsModule {}
