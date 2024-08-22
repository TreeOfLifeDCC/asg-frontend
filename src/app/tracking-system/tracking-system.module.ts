import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingSystemComponent } from './tracking-system/tracking-system.component';
import {TrackingSystemRoutingModule} from './tracking-system-routing.module';
import {FormsModule} from '@angular/forms';

import {MatIconModule} from '@angular/material/icon';
import {MatSortModule} from '@angular/material/sort';

import { DetailsComponent } from './tracking-system/details/details.component';

import { NgxSpinnerModule } from 'ngx-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TrackingSystemRoutingModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    NgxSpinnerModule,
    MatChipsModule,
    TrackingSystemComponent,
    DetailsComponent,
  ]
})
export class TrackingSystemModule { }
