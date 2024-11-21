import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';
import { ApiComponent } from './api/api.component';
import { GisComponent } from './gis/gis.component';
import { BulkDownloadsComponent } from './bulk-downloads/bulk-downloads.component';
import { SpecimensComponent } from './dashboard/specimens/specimens.component';
import { DetailsComponent } from './dashboard/component/details/details.component';
import { OrganismDetailsComponent } from './dashboard/component/organism-details/organism-details.component';
import { DashboardComponent } from './dashboard/component/dashboard.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PhylogeneticsComponent } from './phylogenetics/phylogenetics.component';
import { TrackingSystemComponent } from './tracking-system/tracking-system/tracking-system.component';
import { TrackingDetailsComponent } from './tracking-system/tracking-system/details/details.component';

export const routes: Routes = [
  { path: 'documentation', component: ApiComponent, title: 'Documentation' },
  { path: '', component: HomeComponent, pathMatch: 'full', title: '' },
  { path: 'about', component: AboutComponent, title: 'About' },
  { path: 'gis', component: GisComponent, title: 'Gis' },
  { path: 'help', component: HelpComponent, title: 'Help' },
  { path: 'bulk-downloads' , component: BulkDownloadsComponent, title: 'Bulk-downloads' },

  {
    path: 'data/specimens/details/:id',
    loadComponent: () => import('./dashboard/specimens/specimens.component').then(m => m.SpecimensComponent),
    title: 'Specimens'
  },
  {
    path: 'data/organism/details/:id',
    loadComponent: () => import('./dashboard/component/details/details.component').then(m => m.DetailsComponent),
    title: 'Organism'
  },
  {
    path: 'data/root/details/:id',
    loadComponent: () => import('./dashboard/component/organism-details/organism-details.component').then(m => m.OrganismDetailsComponent),
    title: 'Details'
  },
  {
    path: 'data',
    loadComponent: () => import('./dashboard/component/dashboard.component').then(m => m.DashboardComponent),
    title: 'Data'
  },

  {
    path: 'tracking/:id',
    loadComponent: () => import('./tracking-system/tracking-system/details/details.component').then(m => m.TrackingDetailsComponent),
    title: 'Tracking Id'
  },
  {
    path: 'tracking/details/:organism',
    loadComponent: () => import('./tracking-system/tracking-system/details/details.component').then(m => m.TrackingDetailsComponent),
    title: 'Tracking Details'
  },
  {
    path: 'tracking',
    loadComponent: () => import('./tracking-system/tracking-system/tracking-system.component').then(m => m.TrackingSystemComponent),
    title: 'Tracking'
  },

  {
    path: 'tree',
    loadComponent: () => import('./phylogenetics/phylogenetics.component').then(m => m.PhylogeneticsComponent),
    title: 'Tree'
  },
  {
    path: '',
    children: [
      { path: '404', component: NotFoundComponent, title: 'Not Found 404' },
      { path: '**', component: NotFoundComponent, title: 'Not Found' }
    ]
  }
];
