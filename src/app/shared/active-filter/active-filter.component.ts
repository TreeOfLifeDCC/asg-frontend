import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FilterService} from '../../services/filter-service';

@Component({
  selector: 'app-active-filter',
  templateUrl: './active-filter.component.html',
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
      if (filter.startsWith('symbiontsBioSamplesStatus-')){
        label = 'symbionts_biosamples_status';
      }
      if (filter.startsWith('symbiontsRawDataStatus-')){
        label = 'symbionts_raw_data_status';
      }
      if (filter.startsWith('symbiontsAssembliesStatus-')){
        label = 'symbionts_assemblies_status';
      }
      if (filter.startsWith('metagenomesBioSamplesStatus-')){
        label = 'metagenomes_biosamples_status';
      }
      if (filter.startsWith('metagenomesRawDataStatus-')){
        label = 'metagenomes_raw_data_status';
      }
      if (filter.startsWith('metagenomesAssembliesStatus-')){
        label = 'metagenomes_assemblies_status';
      }
      if (filter.startsWith('experimentType-') && filter.indexOf('experimentType-') === 0){
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
