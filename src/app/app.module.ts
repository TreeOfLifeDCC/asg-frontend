import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CookieLawModule } from 'angular2-cookie-law';
import { HttpClientModule } from '@angular/common/http';

import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
// import { MatTableExporterModule } from 'mat-table-exporter';

import { HeaderComponent } from './shared/header/header.component';
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';
import { ApiComponent } from './api/api.component';
import {PhylogeneticsModule} from './phylogenetics/phylogenetics.module';
import {ConfirmationDialogComponent} from './confirmation-dialog-component/confirmation-dialog.component';
import {BytesPipe} from './shared/bytes-pipe';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {GisComponent} from './gis/gis.component';
import {GisService} from './gis/gis.service';
import {FilterService} from "./services/filter-service";
import {FilterComponent} from './shared/filter/filter.component';
import {ActiveFilterComponent} from './shared/active-filter/active-filter.component';
import {PhylogenyFilterComponent} from './shared/phylogeny-filter/phylogeny-filter.component';
import {NgxSpinnerModule} from 'ngx-spinner';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {BulkDownloadsComponent} from './bulk-downloads/bulk-downloads.component';
import {DownloadConfirmationDialogComponent} from './download-confirmation-dialog-component/download-confirmation-dialog.component';
import {DashboardModule} from './dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AboutComponent,
    HelpComponent,
    HomeComponent,
    ApiComponent,
    ConfirmationDialogComponent,
    BytesPipe,
    GisComponent,
    DownloadConfirmationDialogComponent,
    BulkDownloadsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    // CookieLawModule,
    HttpClientModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    // MatTableExporterModule,
    PhylogeneticsModule,
    MatDialogModule,
    NgxSpinnerModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatInputModule,
    MatRadioModule,
    MatTooltipModule,
    DashboardModule
  ],
  providers: [BytesPipe, GisService, FilterService],
  bootstrap: [AppComponent]
})
export class AppModule { }

