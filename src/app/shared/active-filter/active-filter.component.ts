import { Component } from '@angular/core';
import { FilterService } from '../../services/filter-service';

@Component({
  standalone: true,
  selector: 'app-active-filter',
  templateUrl: './active-filter.component.html',
  imports: [],
  styleUrls: ['./active-filter.component.css']
})
export class ActiveFilterComponent {
  aggs = [];
  data = {};
  phylSelectedRank = '';
  constructor(public filterService: FilterService) { }

  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.aggs = this.filterService.activeFilters;
    this.data = this.filterService.data;
    console.log(this.filterService.phylSelectedRank);
    this.phylSelectedRank = this.filterService.phylSelectedRank;
    this.filterService.field.subscribe(data => {
      this.aggs = this.filterService.activeFilters;
      this.data = this.filterService.data;
    });
  }

  // tslint:disable-next-line:typedef
  clearFilter(filter: string) {
    if (filter !== undefined) {
      let label = '';
      if (filter.includes('symbiontsBioSamplesStatus-') && filter.indexOf('symbiontsBioSamplesStatus-') === 0){
        label = 'symbionts_biosamples_status';
      }
      if (filter.includes('symbiontsRawDataStatus-') && filter.indexOf('symbiontsRawDataStatus-') === 0){
        label = 'symbionts_raw_data_status';
      }
      if (filter.includes('symbiontsAssembliesStatus-') && filter.indexOf('symbiontsAssembliesStatus-') === 0){
        label = 'symbionts_assemblies_status';
      }
      if (filter.includes('metagenomesBioSamplesStatus-') && filter.indexOf('metagenomesBioSamplesStatus-') === 0){
        label = 'metagenomes_biosamples_status';
      }
      if (filter.includes('metagenomesRawDataStatus-') && filter.indexOf('metagenomesRawDataStatus-') === 0){
        label = 'metagenomes_raw_data_status';
      }
      if (filter.includes('metagenomesAssembliesStatus-') && filter.indexOf('metagenomesAssembliesStatus-') === 0){
        label = 'metagenomes_assemblies_status';
      }
      if (filter.includes('experimentType-') && filter.indexOf('experimentType-') === 0){
        label = 'experiment-type';
      }
      this.filterService.updateDomForRemovedFilter(filter);
      const filterIndex = this.filterService.activeFilters.indexOf(filter);
      this.filterService.activeFilters.splice(filterIndex, 1);
      this.filterService.isFilterSelected = false;
      this.filterService.updateActiveRouteParams();

    }
  }

  // tslint:disable-next-line:typedef
  displayActiveFilterName(filterName: string){
    if (filterName.includes('symbiontsBioSamplesStatus-')){
      return filterName.replace(/^symbiontsBioSamplesStatus-/, 'Symbionts-');
    }
    if (filterName.includes('symbiontsRawDataStatus-')){
      return filterName.replace(/^symbiontsRawDataStatus-/, 'Symbionts-');
    }
    if (filterName.includes('symbiontsAssembliesStatus-')){
      return filterName.replace(/^symbiontsAssembliesStatus-/, 'Symbionts-');
    }
    if (filterName.includes('metagenomesBioSamplesStatus-')){
      return filterName.replace(/^metagenomesBioSamplesStatus-/, 'Metagenomes-');
    }
    if (filterName.includes('metagenomesRawDataStatus-')){
      return filterName.replace(/^metagenomesRawDataStatus-/, 'Metagenomes-');
    }
    if (filterName.includes('metagenomesAssembliesStatus-')){
      return filterName.replace(/^metagenomesAssembliesStatus-/, 'Metagenomes-');
    }
    if (filterName.includes('experimentType-')){
      return filterName.replace(/^experimentType-/, '');
    }
    return filterName;
  }

}
