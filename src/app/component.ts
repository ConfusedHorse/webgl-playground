import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    RouterOutlet
  ],
  selector: 'app-root',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class AppComponent {

  constructor() { // this prevents the browsers default context menu
    window.addEventListener('contextmenu', mouseEvent => mouseEvent.preventDefault());
  }

}