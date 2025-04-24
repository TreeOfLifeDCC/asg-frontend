import { Component, OnInit } from '@angular/core';
import { NgcCookieConsentService, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

export const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: 'portal.aquaticsymbiosisgenomics.org'
  },
  position: 'bottom',
  theme: 'classic',
  palette: {
    popup: {
      background: '#333',
      text: '#ffffff',
      link: '#ffffff'
    },
    button: {
      background: '#f1d600',
      text: '#333',
      border: 'transparent'
    }
  },
  type: 'info',
  content: {
    message: 'This website requires cookies, and the limited processing of your personal data in order to function. By using the site you are agreeing to this as outlined in our',
    dismiss: 'Accept cookies',
    deny: 'Refuse cookies',
    link: 'Privacy Notice',
    href: '/assets/gdpr/erga_asg_gbdp_gdpr.pdf',
    policy: 'Cookie Policy'
  }
};

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'asg-portal';
  // @ViewChild('cookieLaw')
  cookieLawEl: any;

  constructor(private ccService: NgcCookieConsentService) {
  }

  ngOnInit() {
  }

  // dismiss(): void {
  //   this.cookieLawEl.dismiss();
  // }
}
