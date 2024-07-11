import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ROUTES } from './routes';

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
  ],
  selector: 'app-root',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class AppComponent {

  protected readonly _routes = ROUTES.filter(({ path }) => path);

  constructor() { // this prevents the browsers default context menu
    window.addEventListener('contextmenu', mouseEvent => mouseEvent.preventDefault());
  }

}