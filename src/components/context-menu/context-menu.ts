import { Component } from '@angular/core';

/**
 * Generated class for the ContextMenuComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'context-menu',
  templateUrl: 'context-menu.html'
})
export class ContextMenuComponent {

  text: string;

  constructor() {
    console.log('Hello ContextMenuComponent Component');
    this.text = 'Hello World';
  }

}
