import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhylogeneticsComponent } from './phylogenetics/phylogenetics.component';
import { PhylogeneticsRoutingModule } from './phylogenetics-routing.module';
import { DynamicScriptLoaderService } from './phylogenetics/services/dynamic-script-loader.service';
import { LOADERS } from 'ngx-spinner/lib/ngx-spinner.enum';
import {NgxSpinnerModule} from 'ngx-spinner';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';



@NgModule({
  declarations: [PhylogeneticsComponent],
    imports: [
        PhylogeneticsRoutingModule,
        CommonModule,
        NgxSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatFormFieldModule
    ],
  providers: [
    DynamicScriptLoaderService
  ]
})
export class PhylogeneticsModule { }
