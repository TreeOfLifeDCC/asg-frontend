import {AfterViewInit, booleanAttribute, Component, Input, numberAttribute, OnInit} from '@angular/core';

import {FilterService} from '../../services/filter-service';
import {JsonPipe, NgClass} from '@angular/common';
import {filter, of} from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  imports: [
    NgClass,
    JsonPipe
  ],
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, AfterViewInit {
  @Input() title: string;
  @Input({transform: booleanAttribute}) isShowCount: boolean;
  @Input({transform: numberAttribute}) filterSize: number;

  isCollapsed = true;
  itemLimit = 0;


  constructor(public filterService: FilterService
            ) { }

  ngOnInit(): void {
    this.itemLimit = this.filterSize;
  }

  checkFilterIsActive = (filterVal: string) => {
    console.log(filterVal)
    console.log(this.filterService.activeFilters)
    if (this.filterService.activeFilters.indexOf(filterVal) !== -1) {
      return 'active-filter';
    }
  }

  onFilterClick = (event, label: string, filterVal: string) => {
    if (label.includes('symbionts_') || label.includes('metagenomes_')){
      filterVal = `${label}-` + filterVal;
    } else if (label === 'experiment-type') {
      filterVal = 'experimentType-' + filterVal;
    }
    const filterIndex = this.filterService.activeFilters.indexOf(filterVal);
    if (filterIndex !== -1) {
      this.removeFilter(label, filterVal);
    } else {
      this.filterService.selectedFilterArray(label, filterVal);
      this.filterService.activeFilters.push(filterVal);
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


  protected readonly filter = filter;
  protected readonly of = of;
}
