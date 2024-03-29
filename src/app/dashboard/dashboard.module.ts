import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './component/dashboard.component';
import { SpecimensComponent } from './specimens/specimens.component';
import { DetailsComponent } from './component/details/details.component';

import {FormsModule} from '@angular/forms';

import {MatIconModule} from '@angular/material/icon';
import {MatSortModule} from '@angular/material/sort';

import { NgxSpinnerModule } from "ngx-spinner";
// import { MatTableExporterModule } from 'mat-table-exporter';
import {MatExpansionModule} from '@angular/material/expansion';


import { DashboardService } from './services/dashboard.service';
import { OrganismDetailsComponent } from './component/organism-details/organism-details.component'
import { TaxanomyComponent } from '../taxanomy/taxanomy.component';
import { TaxanomyService } from '../taxanomy/taxanomy.service';

import {MapComponent} from './map/map.component';
import {MapClusterComponent} from './map-cluster/map-cluster.component';
import {FilterComponent} from '../shared/filter/filter.component';
import {ActiveFilterComponent} from '../shared/active-filter/active-filter.component';
import {PhylogenyFilterComponent} from '../shared/phylogeny-filter/phylogeny-filter.component';
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTabsModule} from "@angular/material/tabs";
import {MatBadgeModule} from "@angular/material/badge";
import {MatChipsModule} from "@angular/material/chips";
import {MatListModule} from "@angular/material/list";
import {MatDialogModule} from "@angular/material/dialog";

@NgModule({
  declarations: [DashboardComponent, SpecimensComponent, DetailsComponent, OrganismDetailsComponent, TaxanomyComponent, MapComponent, MapClusterComponent,
    FilterComponent, PhylogenyFilterComponent, ActiveFilterComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    NgxSpinnerModule,
    // MatTableExporterModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatTabsModule,
    MatBadgeModule,
    MatChipsModule,
    MatListModule,
    MatDialogModule
  ],
  exports: [
    FilterComponent, PhylogenyFilterComponent, ActiveFilterComponent
  ],
  providers: [DashboardService, TaxanomyService]
})
export class DashboardModule { }
