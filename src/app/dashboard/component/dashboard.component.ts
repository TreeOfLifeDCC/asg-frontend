import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterLink} from '@angular/router';

import {MatSort, MatSortModule} from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';

import 'jquery';
import 'bootstrap';
import {FilterService} from '../../services/filter-service';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {filter, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {FilterComponent} from '../../shared/filter/filter.component';
import {PhylogenyFilterComponent} from '../../shared/phylogeny-filter/phylogeny-filter.component';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {ActiveFilterComponent} from '../../shared/active-filter/active-filter.component';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {JsonPipe, NgClass, NgStyle, UpperCasePipe} from '@angular/common';
import {MatCheckbox} from '@angular/material/checkbox';
import {NgxSpinnerModule, NgxSpinnerService} from 'ngx-spinner';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatIcon} from "@angular/material/icon";


@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    NgxSpinnerModule,
    FilterComponent,
    PhylogenyFilterComponent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    FormsModule,
    ActiveFilterComponent,
    RouterLink,
    NgStyle,
    NgClass,
    MatSort,
    MatCheckbox,
    MatChip,
    MatChipSet,
    UpperCasePipe,
    MatIcon,
    JsonPipe
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit , OnDestroy {
  codes = {
    m: 'mammals',
    d: 'dicots',
    i: 'insects',
    u: 'algae',
    p: 'protists',
    x: 'molluscs',
    t: 'other-animal-phyla',
    q: 'arthropods',
    k: 'chordates',
    f: 'fish',
    a: 'amphibians',
    b: 'birds',
    e: 'echinoderms',
    w: 'annelids',
    j: 'jellyfish',
    h: 'platyhelminths',
    n: 'nematodes',
    v: 'vascular-plants',
    l: 'monocots',
    c: 'non-vascular-plants',
    g: 'fungi',
    o: 'sponges',
    r: 'reptiles',
    s: 'sharks',
    y: 'bacteria',
    z: 'archea'
  };

  loading = true;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterSize: number;
  aggregations: any;
  currentClass = 'kingdom';
  isPhylogenyFilterProcessing = false; // Flag to prevent double-clicking
  phylogenyFilters: string[] = [];
  classes = ['superkingdom', 'kingdom', 'subkingdom', 'superphylum', 'phylum', 'subphylum', 'superclass', 'class',
    'subclass', 'infraclass', 'cohort', 'subcohort', 'superorder', 'order', 'suborder', 'infraorder', 'parvorder',
    'section', 'subsection', 'superfamily', 'family', ' subfamily', ' tribe', 'subtribe', 'genus', 'series', 'subgenus',
    'species_group', 'species_subgroup', 'species', 'subspecies', 'varietas', 'forma'];
  symbiontsFilters: any[] = [];
  metagenomesFilters: any[] = [];
  experimentTypeFilters: any[] = [];
  itemLimit = 5;
  isCollapsed = true;

  filtersMap;
  filters = {
    sex: {},
    trackingSystem: {}
  };

  bioSampleTotalCount = 0;
  unpackedData;

  phylSelectedRank = '';

  itemLimitBiosampleFilter: number;
  itemLimitEnaFilter: number;
  pagesize = 15;
  dataColumnsDefinition = [
    {name: 'Organism', column: 'organism', selected: true},
    {name: 'Common Name', column: 'commonName', selected: true},
    {name: 'Current Status', column: 'currentStatus', selected: true},
    {name: 'External references', column: 'goatInfo', selected: true},
    {name: 'Submitted to Biosamples', column: 'biosamples', selected: false},
    {name: 'Raw data submitted to ENA', column: 'raw_data', selected: false},
    {name: 'Assemblies submitted to ENA', column: 'assemblies', selected: false},
    {name: 'Annotation complete', column: 'annotation_complete', selected: false},
    {name: 'Annotation submitted to ENA', column: 'annotation', selected: false}];
  displayedColumns = [];
  searchUpdate = new Subject<string>();

  constructor(private titleService: Title,
              private dashboardService: DashboardService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private spinner: NgxSpinnerService,
              public filterService: FilterService) {
    this.searchUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged()).subscribe(
        value => {
          this.spinner.show();
          this.resetFilter();
          this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
          this.filterService.updateActiveRouteParams();
        }
    );
  }

  ngOnInit(): void {
    this.getDisplayedColumns();
    this.filterSize = 4;
    this.itemLimitBiosampleFilter = this.filterSize;
    this.itemLimitEnaFilter = this.filterSize;
    this.titleService.setTitle('Data portal');
    const queryParamMap = this.activatedRoute.snapshot['queryParamMap'];
    const params = queryParamMap['params'];

    if (Object.keys(params).length !== 0) {
      this.resetFilter();
      // tslint:disable-next-line:forin
      for (const key in params) {
        console.log(key)
        this.filterService.urlAppendFilterArray.push({name: key, value: params[key]});

        switch (key) {
          case 'experiment-type':
            this.addToActiveFilters(params[key], 'experimentType');
            break;
          case 'phylogeny':
            this.filterService.isFilterSelected = true;
            this.filterService.phylSelectedRank = params[key];
            this.filterService.activeFilters.push(params[key]);
            break;
          default:
            this.filterService.activeFilters.push(params[key]);
        }
      }
    }
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
  }

  addToActiveFilters(filterArr: string, filterPrefix: string) {
    const list = filterArr.split(',');
    list.forEach((value: any) => {
      this.filterService.activeFilters.push(filterPrefix + '-' + value);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisplayedColumns() {
    this.displayedColumns = [];
    this.dataColumnsDefinition.forEach(obj => {
      if (obj.selected) {
        this.displayedColumns.push(obj.column);
      }
    });
  }

  expanded() {
  }

  showSelectedColumn(selectedColumn, checked) {
    const index = this.dataColumnsDefinition.indexOf(selectedColumn);
    const item = this.dataColumnsDefinition[index];
    item.selected = checked;
    this.dataColumnsDefinition[index] = item;
    this.getDisplayedColumns();
    this.getActiveFiltersAndResult();
  }

  getActiveFiltersAndResult(taxa?) {
    let taxonomy;
    if (taxa) {
      taxonomy = [taxa];
    }
    else {
      taxonomy = [this.filterService.currentTaxonomyTree];
    }
    this.dashboardService.getFilterResults(
        this.filterService.activeFilters.toString(), this.sort.active,
        this.sort.direction, 0, this.pagesize, taxonomy
    ).subscribe(
            data => {
              const unpackedData = [];
              for (const item of data.hits.hits) {
                unpackedData.push(this.unpackData(item));
              }
              this.bioSampleTotalCount = data.hits.total.value;
              this.dataSource = new MatTableDataSource<any>(unpackedData);
              this.dataSource.sort = this.sort;
              this.dataSource.filterPredicate = this.filterPredicate;
              this.unpackedData = unpackedData;
              this.filtersMap = data;
              if (this.phylSelectedRank !== '') {
                let taxa = {
                  rank: this.phylSelectedRank.split(' - ')[0],
                  'taxonomy': data.aggregations.childRank.scientificName.buckets[0].key,
                  'commonName': data.aggregations.childRank.scientificName.buckets[0].commonName.buckets[0].key,
                  'taxId': data.aggregations.childRank.scientificName.buckets[0].taxId.buckets[0].key
                };
                this.filterService.selectedFilterValue = taxa;
              }
              for (let i = 0; i < this.filterService.urlAppendFilterArray.length; i++) {
                setTimeout(() => {
                  const element = 'li:contains(\'' + this.filterService.urlAppendFilterArray[i].value + '\')';
                  $(element).addClass('active');
                }, 1);

                if (i === (this.filterService.urlAppendFilterArray.length - 1)) {
                  this.spinner.hide();
                }
              }
            },
            err => {
              console.log(err);
              this.spinner.hide();
            }
        );
  }

  toggleCollapse = () => {
    if (this.isCollapsed) {
      this.itemLimit = 10000;
      this.isCollapsed = false;
    } else {
      this.itemLimit = 5;
      this.isCollapsed = true;
    }
  }

  checkStyle(filterValue: string) {
    if (this.filterService.activeFilters.includes(filterValue)) {
      return 'background-color: #4BBEFD;';
    } else {
      return '';
    }
  }

  onFilterClick(filterValue: string, phylogenyFilter: boolean = false) {
    console.log(filterValue)
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
      // this.updateQueryParams('phylogenyCurrentClass');

      // Replace current parameters with new parameters.
      // this.replaceUrlQueryParams();
      // this.filterChanged.emit();

      this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);

      // Reset isPhylogenyFilterProcessing flag
      setTimeout(() => {
        this.isPhylogenyFilterProcessing = false;
      }, 500);
    } else{
      const index = this.filterService.activeFilters.indexOf(filterValue);
      index !== -1 ? this.filterService.activeFilters.splice(index, 1) :
          this.filterService.activeFilters.push(filterValue);
      this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
    }
  }

  onHistoryClick() {
    this.phylogenyFilters.splice(this.phylogenyFilters.length - 1, 1);
    const previousClassIndex = this.classes.indexOf(this.currentClass) - 1;
    this.currentClass = this.classes[previousClassIndex];
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
  }

  onRefreshClick() {
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    // // remove phylogenyFilters param from url
    // const index = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
    // if (index > -1) {
    //   this.queryParams.splice(index, 1);
    //   // Replace current parameters with new parameters.
    //   this.replaceUrlQueryParams();
    // }
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
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

  getAllBiosamples(offset, limit, sortColumn?, sortOrder?) {
    console.log(this.currentClass)
    console.log(this.phylogenyFilters)
    console.log(this.filterService.activeFilters)
    this.spinner.show();

    this.dashboardService.getAllBiosample(
        'data_portal', this.currentClass, this.phylogenyFilters, offset, limit, sortColumn, sortOrder, this.filterService.searchText,
        this.filterService.activeFilters
    ).subscribe(
            data => {
              console.log(data)
              const unpackedData = [];
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
                    'symbionts_biosamples_status');
              }
              if (this.aggregations.metagenomes_raw_data_status.buckets.length > 0) {
                this.metagenomesFilters = this.merge(this.metagenomesFilters,
                    this.aggregations.metagenomes_raw_data_status.buckets,
                    'symbionts_raw_data_status');
              }
              if (this.aggregations.metagenomes_assemblies_status.buckets.length > 0) {
                this.metagenomesFilters = this.merge(this.metagenomesFilters,
                    this.aggregations.metagenomes_assemblies_status.buckets,
                    'symbionts_assemblies_status');
              }

              // experiment type
              this.experimentTypeFilters = [];
              if (this.aggregations?.experiment.library_construction_protocol.buckets.length > 0) {
                this.experimentTypeFilters = this.merge(this.experimentTypeFilters,
                    this.aggregations?.experiment.library_construction_protocol.buckets,
                    'experimentType');
              }

              if (data === null || !data.results?.length) {
                return [];
              }
              this.filterService.getFilters(data);
              for (const item of data.results) {
                unpackedData.push(this.unpackData(item));
              }
              this.bioSampleTotalCount = data.count;
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

  merge = (first: any[], second: any[], filterLabel: string) => {
    for (const item of second) {
      item.label = filterLabel;
      first.push(item);
    }

    return first;
  }

  getNextBiosamples(currentSize, offset, limit, sortColumn?, sortOrder?) {
    this.spinner.show();
    this.dashboardService.getAllBiosample('data_portal', offset, limit, sortColumn, sortOrder, this.filterService.searchText,
        this.filterService.activeFilters)
        .subscribe(
            data => {
              const unpackedData = [];
              for (const item of data.results) {
                unpackedData.push(this.unpackData(item));
              }
              this.dataSource = new MatTableDataSource<any>(unpackedData);
              this.dataSource.sort = this.sort;
              this.dataSource.filterPredicate = this.filterPredicate;
              this.unpackedData = unpackedData;
              this.spinner.hide();
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
    this.getNextBiosamples(previousSize, from, size, this.sort.active, this.sort.direction);
  }

  customSort(event) {
    this.paginator.pageIndex = 0;
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    this.getAllBiosamples((pageIndex).toString(), pageSize.toString(), event.active, event.direction);
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
      else if (ena_filters[0] === 'Genome Notes') {
        return data.genome === ena_filters[1];
      }
    }
  }

  // tslint:disable-next-line:typedef
  unpackData(data: any) {
    const dataToReturn = {};
    dataToReturn["id"] = data["_id"];
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if (key === 'tax_id') {
        dataToReturn['goatInfo'] = 'https://goat.genomehubs.org/records?record_id=' + data[key] +
            '&result=taxon&taxonomy=ncbi#' + dataToReturn["organism"];
        dataToReturn[key] = data[key];
      }
      if (key === 'commonName' && data[key] == null) {
        dataToReturn[key] = '-';
      }
      else {
        dataToReturn[key] = data[key];
      }
    }
    return dataToReturn;
  }

  removeFilter() {
    this.resetFilter();
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl.split('?')[0]] );
      this.spinner.show();
      setTimeout(() => {
        this.spinner.hide();
      }, 800);
    });
  }

  resetFilter = () => {
    for (const key of Object.keys(this.filterService.activeFilters)) {
      this.filterService.activeFilters[key] = [];
    }
    this.filterService.activeFilters = [];
    this.filterService.urlAppendFilterArray = [];
    this.filterService.isFilterSelected = false;
    this.filterService.phylSelectedRank = '';
    this.filterService.selectedFilterValue = '';
  }

  // tslint:disable-next-line:typedef
  ngOnDestroy() {
    this.resetFilter();
  }

  // tslint:disable-next-line:typedef
  getStatusClass(status: string) {
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
  // tslint:disable-next-line:typedef
  checkTolidExists(data) {
    return data !== undefined && data.tolid !== undefined && data.tolid != null && data.tolid.length > 0;
  }
  // tslint:disable-next-line:typedef
  generateTolidLink(data) {
    const organismName = data.organism.split(' ').join('_');
    if (typeof(data.tolid) === 'string'){
      const clade = this.codes[data.tolid.charAt(0)];
      return `https://tolqc.cog.sanger.ac.uk/asg/${clade}/${organismName}`;

    } else {
      if (data.tolid.length > 0) {
        const clade = this.codes[data.tolid[0].charAt(0)];
        return `https://tolqc.cog.sanger.ac.uk/asg/${clade}/${organismName}`;
      }
    }
  }

  // tslint:disable-next-line:typedef
  hasActiveFilters() {
    if (typeof this.filterService.activeFilters === 'undefined') {
      return false;
    }
    for (const key of Object.keys(this.filterService.activeFilters)) {
      if (this.filterService.activeFilters[key].length !== 0) {
        return true;
      }
    }
    return false;
  }

  protected readonly filter = filter;
}

