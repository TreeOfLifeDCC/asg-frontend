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
    if (filter != undefined) {
      let label = '';
      if (filter.includes('symbiontsStatus-') && filter.indexOf('symbiontsStatus-') === 0){
        label = 'symbionts-status';
      }
      if (filter.includes('metagenomesStatus-') && filter.indexOf('metagenomesStatus-') === 0){
        label = 'metagenomes-status';
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
    if (filterName.includes('symbiontsStatus-')){
      return filterName.replace(/^symbiontsStatus-/, 'Symbionts-');
    }
    if (filterName.includes('metagenomesStatus-')){
      return filterName.replace(/^metagenomesStatus-/, 'Metagenomes-');
    }
    if (filterName.includes('experimentType-')){
      return filterName.replace(/^experimentType-/, '');
    }
    return filterName;
  }

}
