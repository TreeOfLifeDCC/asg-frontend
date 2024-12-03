import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { StatusesService } from '../services/statuses.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import 'jquery';
import {
  MatCell,
  MatCellDef, MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {filter, Subject} from 'rxjs';
import {JsonPipe, NgClass, NgStyle, UpperCasePipe} from '@angular/common';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';


@Component({
  standalone: true,
  selector: 'app-tracking-system',
  templateUrl: './tracking-system.component.html',
  imports: [
    NgxSpinnerModule,
    NgClass,
    MatFormField,
    MatFormFieldModule,
    FormsModule,
    MatTable,
    MatSort,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    RouterLink,
    MatChipSet,
    MatChip,
    NgStyle,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    UpperCasePipe,
    MatInputModule,
    MatColumnDef,
    MatSortHeader,
    JsonPipe,
    MatIcon
  ],
  styleUrls: ['./tracking-system.component.css']
})
export class TrackingSystemComponent implements OnInit, AfterViewInit {
  displayedColumns = ['organism', 'commonName', 'metadata_submitted_to_biosamples',
    'raw_data_submitted_to_ena',  'assemblies_submitted_to_ena',
    'annotation_complete', 'annotation_submitted_to_ena'];
  loading = true;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  aggregations: any;
  isPhylogenyFilterProcessing = false; // Flag to prevent double-clicking
  phylogenyFilters: string[] = [];
  lastPhylogenyVal = '';
  queryParams: any = {};
  currentClass = 'kingdom';
  classes: string[] = ['cellularorganism',
    'superkingdom',
    'kingdom',
    'subkingdom',
    'superphylum',
    'phylum',
    'subphylum',
    'superclass',
    'class',
    'subclass',
    'infraclass',
    'cohort',
    'subcohort',
    'superorder',
    'order',
    'parvorder',
    'suborder',
    'infraorder',
    'section',
    'subsection',
    'superfamily',
    'family',
    'subfamily',
    'tribe',
    'subtribe',
    'genus',
    'series',
    'subgenus',
    'species_group',
    'species_subgroup',
    'species',
    'subspecies',
    'varietas',
    'forma'
  ];
  displayProgressBar = false;

  searchValue: string;

  itemLimitBiosampleFilter: number;
  itemLimitEnaFilter: number;
  filterSize: number;
  urlAppendFilterArray = [];

  symbiontsFilters = [];
  metagenomesFilters = [];
  activeFilters = [];
  statusesTotalCount = 0;
  unpackedData;
  showOrganismTable: boolean;
  searchUpdate = new Subject<string>();

  constructor(private titleService: Title,
              private statusesService: StatusesService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private spinner: NgxSpinnerService) {

    this.searchUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged()).subscribe(
        value => {
          this.spinner.show();
          this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
        }
    );

  }

  ngOnInit(): void {
    this.spinner.show();
    this.showOrganismTable = false;
    this.activeFilters = [];
    this.urlAppendFilterArray = [];
    this.filterSize = 3;
    this.itemLimitBiosampleFilter = this.filterSize;
    this.itemLimitEnaFilter = this.filterSize;
    this.titleService.setTitle('Status tracking');

    // get url parameters
    const queryParamMap = this.activatedRoute.snapshot['queryParamMap'];
    const params = queryParamMap['params'];
    if (Object.keys(params).length !== 0) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          if (params[key].includes('phylogenyFilters - ')) {
            const phylogenyFilters = params[key].split('phylogenyFilters - ')[1];
            // Remove square brackets and split by comma
            this.phylogenyFilters = phylogenyFilters.slice(1, -1).split(',');
          } else if (params[key].includes('phylogenyCurrentClass - ')) {
            const phylogenyCurrentClass = params[key].split('phylogenyCurrentClass - ')[1];
            this.currentClass = phylogenyCurrentClass;
          } else {
            this.activeFilters.push(params[key]);
          }

        }
      }
    }
    this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
  }


  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  getTrackingData(offset, limit, sortColumn?, sortOrder?) {
    this.spinner.show();
    this.statusesService.getTrackingData('tracking_status_index_test', this.currentClass, this.phylogenyFilters, offset, limit,
        sortColumn, sortOrder, this.searchValue, this.activeFilters)
      .subscribe(
        data => {
          console.log(data);
          this.aggregations = data.aggregations;

          // symbionts
          this.symbiontsFilters = [];
          if (this.aggregations.symbionts_biosamples_status.buckets.length > 0) {
            this.symbiontsFilters = this.merge(this.symbiontsFilters,
                this.aggregations.symbionts_biosamples_status.buckets,
                'symbionts_biosamples_status');
          }
          if (this.aggregations.symbionts_raw_data_status.buckets.length > 0) {
            this.symbiontsFilters = this.merge(this.symbiontsFilters,
                this.aggregations.symbionts_raw_data_status.buckets,
                'symbionts_raw_data_status');
          }
          if (this.aggregations.symbionts_assemblies_status.buckets.length > 0) {
            this.symbiontsFilters = this.merge(this.symbiontsFilters,
                this.aggregations.symbionts_assemblies_status.buckets,
                'symbionts_assemblies_status');
          }

          // metagenomes
          this.metagenomesFilters = [];
          if (this.aggregations.metagenomes_biosamples_status.buckets.length > 0) {
            this.metagenomesFilters = this.merge(this.metagenomesFilters,
                this.aggregations.metagenomes_biosamples_status.buckets,
                'metagenomes_biosamples_status');
          }
          if (this.aggregations.metagenomes_raw_data_status.buckets.length > 0) {
            this.metagenomesFilters = this.merge(this.metagenomesFilters,
                this.aggregations.metagenomes_raw_data_status.buckets,
                'metagenomes_raw_data_status');
          }
          if (this.aggregations.metagenomes_assemblies_status.buckets.length > 0) {
            this.metagenomesFilters = this.merge(this.metagenomesFilters,
                this.aggregations.metagenomes_assemblies_status.buckets,
                'metagenomes_assemblies_status');
          }

          // get last phylogeny element for filter button
          this.lastPhylogenyVal = this.phylogenyFilters.slice(-1)[0];

          // add filters to URL query parameters
          this.queryParams = [...this.activeFilters];
          if (this.phylogenyFilters && this.phylogenyFilters.length) {
            const index = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
            if (index > -1) {
              this.queryParams[index] = `phylogenyFilters - [${this.phylogenyFilters}]`;
            } else {
              this.queryParams.push(`phylogenyFilters - [${this.phylogenyFilters}]`);
            }
          }

          // update url with the value of the phylogeny current class
          this.updateQueryParams('phylogenyCurrentClass');

          this.replaceUrlQueryParams();

          const unpackedData = [];
          for (const item of data.results) {
            unpackedData.push(this.unpackData(item));
          }
          this.statusesTotalCount = data.count;
          this.dataSource = new MatTableDataSource<any>(unpackedData);
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = this.filterPredicate;
          this.unpackedData = unpackedData;
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
        },
        err => {
          console.log(err);
          this.spinner.hide();
        }
      );
  }

  onRefreshClick() {
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    // remove phylogenyFilters param from url
    const index = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
    if (index > -1) {
      this.queryParams.splice(index, 1);
      // Replace current parameters with new parameters.
      this.replaceUrlQueryParams();
    }
    this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
  }

  onHistoryClick() {
    this.phylogenyFilters.splice(this.phylogenyFilters.length - 1, 1);
    const previousClassIndex = this.classes.indexOf(this.currentClass) - 1;
    this.currentClass = this.classes[previousClassIndex];
    this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
  }

  updateQueryParams(urlParam: string){
    if (urlParam === 'phylogenyCurrentClass'){
      const queryParamIndex = this.queryParams.findIndex((element: any) => element.includes('phylogenyCurrentClass - '));
      if (queryParamIndex > -1) {
        this.queryParams[queryParamIndex] = `phylogenyCurrentClass - ${this.currentClass}`;
      } else {
        this.queryParams.push(`phylogenyCurrentClass - ${this.currentClass}`);
      }
    }
  }

  replaceUrlQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.queryParams,
      replaceUrl: true,
      skipLocationChange: false
    });
  }

  getNextStatuses(currentSize, offset, limit, sortColumn?, sortOrder?) {
    this.spinner.show();
    this.statusesService.getTrackingData('tracking_status_index_test', this.currentClass, this.phylogenyFilters, offset,
        limit, sortColumn, sortOrder, this.searchValue, this.activeFilters)
      .subscribe(
        data => {
          const unpackedData = [];
          for (const item of data.results) {
            unpackedData.push(this.unpackData(item));
          }
          this.statusesTotalCount = data.count;
          this.dataSource = new MatTableDataSource<any>(unpackedData);
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = this.filterPredicate;
          this.unpackedData = unpackedData;
          this.spinner.hide();
          setTimeout(() => {
            this.spinner.hide();
          }, 100);
        },
        err => {
          console.log(err);
          this.spinner.hide();
        }
      );
  }

  pageChanged(event) {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;
    const previousSize = pageSize * pageIndex;
    const from = pageIndex * pageSize;
    const size = pageSize;
    this.getNextStatuses(previousSize, from, size, this.sort.active, this.sort.direction);
  }

  getSortColum(sortCol){
    const sortMappings: {[index: string]: any} = {
      metadata_submitted_to_biosamples: 'biosamples',
      raw_data_submitted_to_ena: 'raw_data',
      assemblies_submitted_to_ena: 'assemblies_status',
      annotation_submitted_to_ena: 'annotation_status',
    };

    if (sortMappings.hasOwnProperty(sortCol)) {
      return sortMappings[sortCol];
    }
    return sortCol;
  }

  customSort(event) {
    console.log(event.active, event.direction)
    console.log(this.sort.active, this.sort.direction)

    this.getTrackingData(0, 15, this.getSortColum(this.sort.active), this.sort.direction);
  }

  // tslint:disable-next-line:typedef
  filterPredicate(data: any, filterValue: any): boolean {
    const filters = filterValue.split('|');
    if (filters[1] === 'Metadata submitted to BioSamples') {
      return data.biosampleStatus === filters[0].split(' - ')[1];
    } else {
      const ena_filters = filters[0].split(' - ');
      if (ena_filters[0] === 'Raw Data') {
        return data.raw_data === ena_filters[1];
      } else if (ena_filters[0] === 'Assemblies') {
        return data.assemblies === ena_filters[1];
      } else if (ena_filters[0] === 'Annotation complete') {
        return data.annotation_complete === ena_filters[1];
      } else if (ena_filters[0] === 'Annotation') {
        return data.annotation === ena_filters[1];
      }
    }
  }

  // tslint:disable-next-line:typedef
  unpackData(data: any) {
    const dataToReturn = {};
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'object') {
        if (key === 'organism') {
          dataToReturn[key] = data.organism.text;
        }
      } else {
        dataToReturn[key] = data[key];
      }
    }
    return dataToReturn;
  }

  // tslint:disable-next-line:typedef
  checkFilterIsActive(filterValue: string) {
    if (this.activeFilters.indexOf(filterValue) !== -1) {
      return 'active-filter';
    }
  }


  onFilterClick(filterValue: string, phylogenyFilter: boolean = false) {
    console.log(filterValue);
    if (phylogenyFilter) {
      if (this.isPhylogenyFilterProcessing) {
        return;
      }
      // Set flag to prevent further clicks
      this.isPhylogenyFilterProcessing = true;

      this.phylogenyFilters.push(`${this.currentClass}:${filterValue}`);
      const index = this.classes.indexOf(this.currentClass) + 1;
      this.currentClass = this.classes[index];

      // update url with the value of the phylogeny current class
      this.updateQueryParams('phylogenyCurrentClass');

      // Replace current parameters with new parameters.
      this.replaceUrlQueryParams();

      this.getTrackingData(0, 15, this.sort.active, this.sort.direction);

      // Reset isPhylogenyFilterProcessing flag
      setTimeout(() => {
        this.isPhylogenyFilterProcessing = false;
      }, 500);
    } else{
      const index = this.activeFilters.indexOf(filterValue);
      index !== -1 ? this.activeFilters.splice(index, 1) :
          this.activeFilters.push(filterValue);
      this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
    }
  }

  checkStyle(filterValue: string) {
    if (this.activeFilters.includes(filterValue)) {
      return 'background-color: #4BBEFD;';
    } else {
      return '';
    }
  }

  merge = (first: any[], second: any[], filterLabel: string) => {
    for (const item of second) {
      item.label = filterLabel;
      first.push(item);
    }

    return first;
  }

  getStatusCount(data: any) {
    if (data) {
      for (const item of data) {
        if (item.key.includes('Done')) {
          return item.doc_count;
        }
      }
    }
  }

  displayActiveFilterName(filterName: string) {
    if (filterName && filterName.startsWith('symbionts_')) {
      return 'Symbionts-' + filterName.split('-')[1];
    }
    if (filterName && filterName.startsWith('experimentType_')) {
      return  filterName.split('_')[1];
    }
    return filterName;
  }

  removePhylogenyFilters() {
    // update url with the value of the phylogeny current class
    const queryParamPhyloIndex = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
    if (queryParamPhyloIndex > -1) {
      this.queryParams.splice(queryParamPhyloIndex, 1);
    }

    const queryParamCurrentClassIndex = this.queryParams.findIndex(element => element.includes('phylogenyCurrentClass - '));
    if (queryParamCurrentClassIndex > -1) {
      this.queryParams.splice(queryParamCurrentClassIndex, 1);
    }
    // Replace current url parameters with new parameters.
    this.replaceUrlQueryParams();
    // reset phylogeny variables
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
  }

  removeFilter() {
    this.activeFilters = [];
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    this.getTrackingData(0, 15, this.sort.active, this.sort.direction);
    this.router.navigate([]);
  }

  downloadFile(downloadOption: string, dialog: boolean) {
    this.statusesService.downloadData(downloadOption, this.paginator.pageIndex,
        this.paginator.pageSize, this.searchValue || '', this.sort.active, this.sort.direction, this.activeFilters,
        this.currentClass, this.phylogenyFilters, 'tracking_status_index_test').subscribe({
      next: (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'download.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.displayProgressBar = false;
      },
      error: error => {
        console.error('Error downloading the CSV file:', error);
      }
    });
  }

  getBadgeColor(status: string) {
    if (status === 'Done') {
      return {'background-color': 'palegreen'};
    } else {
      return {'background-color': 'gold'};
    }
  }

  protected readonly filter = filter;
}
