import {AfterViewInit, Component, Input, OnInit} from '@angular/core';

import {FilterService} from '../../services/filter-service';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  imports: [
    NgIf,
    NgForOf,
    NgClass
  ],
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, AfterViewInit {
  @Input() title: string;
  @Input() isShowCount: boolean;
  @Input() filterSize: number;

  isCollapsed = true;
  itemLimit = 0;


  constructor(public filterService: FilterService
            ) { }

  ngOnInit(): void {
    this.itemLimit = this.filterSize;
  }

  checkFilterIsActive = (filter: string) => {
    if (this.filterService.activeFilters.indexOf(filter) !== -1) {
      return 'active-filter';
    }

  }

  onFilterClick = (event, label: string, filter: string) => {
    if (label === 'symbionts_biosamples_status'){
      filter = 'symbiontsBioSamplesStatus-' + filter;
    } else if (label === 'symbionts_raw_data_status'){
      filter = 'symbiontsRawDataStatus-' + filter;
    } else if (label === 'symbionts_assemblies_status'){
      filter = 'symbiontsAssembliesStatus-' + filter;
    } else if (label === 'metagenomes_biosamples_status'){
      filter = 'metagenomesBioSamplesStatus-' + filter;
    } else if (label === 'metagenomes_raw_data_status'){
      filter = 'metagenomesRawDataStatus-' + filter;
    } else if (label === 'metagenomes_assemblies_status'){
      filter = 'metagenomesAssembliesStatus-' + filter;
    } else if (label === 'experiment-type') {
      filter = 'experimentType-' + filter;
    }
    const filterIndex = this.filterService.activeFilters.indexOf(filter);
    if (filterIndex !== -1) {
      this.removeFilter(label, filter);
    } else {
      this.filterService.selectedFilterArray(label, filter);
      this.filterService.activeFilters.push(filter);
      this.filterService.updateActiveRouteParams();

      }
    }

  // tslint:disable-next-line:typedef
  removeFilter(label: string, filter: string) {
    if (filter !== undefined) {

      this.filterService.updateDomForRemovedFilter(filter);
      const filterIndex = this.filterService.activeFilters.indexOf(filter);
      this.filterService.activeFilters.splice(filterIndex, 1);
      this.filterService.isFilterSelected = false;
      this.filterService.updateActiveRouteParams();

    }
  }

  getStatusClass = (status: string) => {
    if (status === 'Annotation Complete') {
      return 'badge badge-pill badge-success';
    }
    else if (status === 'Done') {
      return 'badge badge-pill badge-success';
    }
    else if (status === 'Waiting') {
      return 'badge badge-pill badge-warning';
    }
    else if (status === 'Submitted') {
      return 'badge badge-pill badge-success';
    }
    else {
      return 'badge badge-pill badge-warning';
    }
  }

  toggleCollapse = () => {
    if (this.isCollapsed) {
      this.itemLimit = 10000;
      this.isCollapsed = false;
    } else {
      this.itemLimit = this.filterSize;
      this.isCollapsed = true;
    }
  }

  ngAfterViewInit(): void {
  }


}
