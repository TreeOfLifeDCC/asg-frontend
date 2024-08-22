import { Component, OnInit } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  standalone: true,
  selector: 'app-bulk-downloads',
  templateUrl: './bulk-downloads.component.html',
  imports: [
    NgxSpinnerModule
  ],
  styleUrls: ['./bulk-downloads.component.css']
})
export class BulkDownloadsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
