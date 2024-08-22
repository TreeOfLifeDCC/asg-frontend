import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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

const routes: Routes = [
  {
    path: 'documentation',
    component: ApiComponent
  },
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'about', component: AboutComponent
  },
  {
    path: 'gis', component: GisComponent
  },
  {
    path: 'help', component: HelpComponent
  },
  {
    path: 'bulk-downloads' , component: BulkDownloadsComponent
  },
  { path: 'data/specimens/details/:id', component: SpecimensComponent },
  { path: 'data/organism/details/:id', component: DetailsComponent },
  { path: 'data/root/details/:id', component: OrganismDetailsComponent },
  { path: 'data', title: 'data', component: DashboardComponent },
  {
    path: '',
    children: [
      {
        path: 'tracking', loadChildren: () => import('./tracking-system/tracking-system.module').then(
          m => m.TrackingSystemModule)
      }
    ]
  },
  { path: 'tree', component: PhylogeneticsComponent},
  {
    path: '',
    children: [
      { path: '404', component: NotFoundComponent },
      { path: '**', component: NotFoundComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
