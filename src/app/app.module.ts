import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutes } from './app.routes';
import { AppComponent, cookieConfig } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';

import { HeaderComponent } from './shared/header/header.component';
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';
import { ApiComponent } from './api/api.component';
import { ConfirmationDialogComponent } from './confirmation-dialog-component/confirmation-dialog.component';
import { BytesPipe } from './shared/bytes-pipe';
import { GisService } from './gis/gis.service';
import { FilterService } from './services/filter-service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BulkDownloadsComponent } from './bulk-downloads/bulk-downloads.component';
import { DownloadConfirmationDialogComponent } from './download-confirmation-dialog-component/download-confirmation-dialog.component';
import { NgcCookieConsentModule } from 'ngx-cookieconsent';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { ActiveFilterComponent } from './shared/active-filter/active-filter.component';
import { FilterComponent } from './shared/filter/filter.component';
import { TaxanomyComponent } from './taxanomy/taxanomy.component';
import { PhylogenyFilterComponent } from './shared/phylogeny-filter/phylogeny-filter.component';
import { DetailsComponent } from './dashboard/component/details/details.component';
import { OrganismDetailsComponent } from './dashboard/component/organism-details/organism-details.component';
import { MapComponent } from './dashboard/map/map.component';
import { MapClusterComponent } from './dashboard/map-cluster/map-cluster.component';
import { SpecimensComponent } from './dashboard/specimens/specimens.component';
import { TaxanomyService } from './taxanomy/taxanomy.service';
import { DynamicScriptLoaderService } from './phylogenetics/services/dynamic-script-loader.service';

@NgModule({
    declarations: [
        AppComponent,
        BytesPipe
    ],
    bootstrap: [AppComponent],
    imports: [BrowserModule,
        AppRoutes,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatTreeModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        NgxSpinnerModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatInputModule,
        MatRadioModule,
        MatTooltipModule,
        NgcCookieConsentModule.forRoot(cookieConfig), HeaderComponent, DownloadConfirmationDialogComponent,
        AboutComponent, ApiComponent, BulkDownloadsComponent, ConfirmationDialogComponent, HelpComponent,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        MatPaginatorModule,
        NgxSpinnerModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatTabsModule,
        MatBadgeModule,
        MatChipsModule,
        MatListModule,
        MatDialogModule,
        ActiveFilterComponent,
        FilterComponent,
        TaxanomyComponent,
        PhylogenyFilterComponent,
        DetailsComponent,
        OrganismDetailsComponent,
        MapComponent,
        MapClusterComponent,
        SpecimensComponent],
    providers: [DynamicScriptLoaderService, TaxanomyService, BytesPipe, GisService, FilterService,
        provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
