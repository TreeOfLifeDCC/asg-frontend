import { Component, OnInit } from '@angular/core';
import { SwaggerUIBundle } from 'swagger-ui-dist';

@Component({
  standalone: true,
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const ui = SwaggerUIBundle({
      dom_id: '#swagger-ui',
      layout: 'BaseLayout',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      url: 'https://portal.aquaticsymbiosisgenomics.org/api/v2/api-docs',
      operationsSorter: 'alpha'
    });
  }

}
