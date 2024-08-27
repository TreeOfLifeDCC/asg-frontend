import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';


@Component({
  standalone: true,
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    // set title
    this.titleService.setTitle('Not Found');
  }

}
