import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { NgcCookieConsentModule } from 'ngx-cookieconsent';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app/app.routes';
import { cookieConfig } from './app/app.component';
import {BytesPipe} from './app/shared/bytes-pipe';
import {appConfig} from './app/app.config';
import {DynamicScriptLoaderService} from './app/phylogenetics/services/dynamic-script-loader.service';
import {TaxanomyService} from './app/taxanomy/taxanomy.service';
import {GisService} from './app/gis/gis.service';
import {FilterService} from './app/services/filter-service';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(),
        importProvidersFrom(NgcCookieConsentModule.forRoot(cookieConfig)),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimationsAsync(),
        BytesPipe,
        DynamicScriptLoaderService,
        TaxanomyService,
        GisService,
        FilterService,
        provideHttpClient(withInterceptorsFromDi()),
        ...appConfig.providers
    ]
}).catch(err => console.error(err));
