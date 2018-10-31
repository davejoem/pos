import { Component, Input } from '@angular/core';

@Component({
  selector: 'client',
  templateUrl: 'client.html'
})
export class Client {
  @Input('teir') public teir: string
  @Input('expires') public expires: number
  public remaining_time: string
  
  constructor() {
    
  }

}
