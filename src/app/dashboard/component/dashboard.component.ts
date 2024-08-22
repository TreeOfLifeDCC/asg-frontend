import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterLink} from '@angular/router';

import {MatSort, MatSortModule} from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import {NgxSpinnerModule, NgxSpinnerService} from 'ngx-spinner';

import { Taxonomy } from 'src/app/taxanomy/taxonomy.model';
import { TaxanomyService } from 'src/app/taxanomy/taxanomy.service';

import 'jquery';
import 'bootstrap';
import {FilterService} from '../../services/filter-service';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource, MatTableModule
} from '@angular/material/table';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {FilterComponent} from '../../shared/filter/filter.component';
import {PhylogenyFilterComponent} from '../../shared/phylogeny-filter/phylogeny-filter.component';
import {MatExpansionModule, MatExpansionPanel} from '@angular/material/expansion';
import {MatCheckbox, MatCheckboxModule} from '@angular/material/checkbox';
import {CommonModule, NgClass, NgIf, NgStyle} from '@angular/common';
import {ActiveFilterComponent} from '../../shared/active-filter/active-filter.component';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatChip, MatChipSet, MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatBadgeModule} from '@angular/material/badge';
import {MatListModule} from '@angular/material/list';
import {MatDialogModule} from '@angular/material/dialog';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    NgxSpinnerModule,
    FilterComponent,
    PhylogenyFilterComponent,
    CommonModule,
    MatExpansionPanel,
    MatCheckbox,
    NgIf,
    ActiveFilterComponent,
    MatFormField,
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
    NgClass,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatTabsModule,
    MatBadgeModule,
    MatChipsModule,
    MatListModule,
    MatDialogModule
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

  filtersMap;
  filters = {
    sex: {},
    trackingSystem: {}
  };

  bioSampleTotalCount = 0;
  unpackedData;

  childTaxanomy: Taxonomy;

  currentTaxonomyTree: any;

  phylSelectedRank = '';

  itemLimitBiosampleFilter: number;
  itemLimitEnaFilter: number;
  pagesize = 15;
  dataColumnsDefination = [
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
              private taxanomyService: TaxanomyService,
              // private dialog: MatDialog,
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
    // tslint:disable-next-line:triple-equals
    if (Object.keys(params).length != 0) {

      this.resetFilter();
      // tslint:disable-next-line:forin
      for (const key in params) {
        this.filterService.urlAppendFilterArray.push({name: key, value: params[key]});

        switch (key) {
          case 'experiment-type':
            this.addToActiveFilters(params[key], 'experimentType');
            break;
          case 'symbionts_biosamples_status':
            this.addToActiveFilters(params[key], 'symbiontsBioSamplesStatus');
            break;
          case 'symbionts_raw_data_status':
            this.addToActiveFilters(params[key], 'symbiontsRawDataStatus');
            break;
          case 'symbionts_assemblies_status':
            this.addToActiveFilters(params[key], 'symbiontsAssembliesStatus');
            break;
          case 'metagenomes_biosamples_status':
            this.addToActiveFilters(params[key], 'metagenomesBioSamplesStatus');
            break;
          case 'metagenomes_raw_data_status':
            this.addToActiveFilters(params[key], 'metagenomesRawDataStatus');
            break;
          case 'metagenomes_assemblies_status':
            this.addToActiveFilters(params[key], 'metagenomesAssembliesStatus');
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

  // tslint:disable-next-line:typedef
  addToActiveFilters(filterArr, filterPrefix) {
    const list = filterArr.split(',');
    list.forEach((value: any) => {
      this.filterService.activeFilters.push(filterPrefix + '-' + value);
    });
  }

  // tslint:disable-next-line:typedef
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisplayedColumns() {
    this.displayedColumns = [];
    this.dataColumnsDefination.forEach(obj => {
      if(obj.selected) {
        this.displayedColumns.push(obj.column)
      }
    });
  }

  expanded() {
  }

  showSelectedColumn(selectedColumn, checked) {
    let index = this.dataColumnsDefination.indexOf(selectedColumn);
    let item = this.dataColumnsDefination[index];
    item.selected = checked;
    this.dataColumnsDefination[index] = item;
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
    this.dashboardService.getFilterResults(this.filterService.activeFilters.toString(), this.sort.active, this.sort.direction, 0, this.pagesize, taxonomy)
        .subscribe(
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
              if (this.phylSelectedRank != '') {
                let taxa = { 'rank': this.phylSelectedRank.split(' - ')[0], 'taxonomy': data.aggregations.childRank.scientificName.buckets[0].key, 'commonName': data.aggregations.childRank.scientificName.buckets[0].commonName.buckets[0].key, 'taxId': data.aggregations.childRank.scientificName.buckets[0].taxId.buckets[0].key };
                this.filterService.selectedFilterValue = taxa;
              }
              for (let i = 0; i < this.filterService.urlAppendFilterArray.length; i++) {
                setTimeout(() => {
                  let inactiveClassName = '.' + this.filterService.urlAppendFilterArray[i].name + '-inactive';
                  let element = "li:contains('" + this.filterService.urlAppendFilterArray[i].value + "')";
                  $(element).addClass('active');
                }, 1);

                if (i == (this.filterService.urlAppendFilterArray.length - 1)) {
                  this.spinner.hide();
                }
              }
            },
            err => {
              console.log(err);
              this.spinner.hide();
            }
        )
  }

  // tslint:disable-next-line:typedef
  getAllBiosamples(offset, limit, sortColumn?, sortOrder?) {
    this.spinner.show();

    this.dashboardService.getAllBiosample(offset, limit, sortColumn, sortOrder, this.filterService.searchText, this.filterService.activeFilters.join(','))
        .subscribe(
            data => {
              const unpackedData = [];
              this.filterService.getFilters(data.rootSamples);
              for (const item of data.rootSamples.hits.hits) {
                unpackedData.push(this.unpackData(item));
              }
              this.bioSampleTotalCount = data.count;
              this.dataSource = new MatTableDataSource<any>(unpackedData);
              this.dataSource.sort = this.sort;
              this.dataSource.filterPredicate = this.filterPredicate;
              this.unpackedData = unpackedData;
              setTimeout(() => {
                this.spinner.hide();
              }, 100)
            },
            err => {
              console.log(err);
              this.spinner.hide();
            }
        );
  }

  getNextBiosamples(currentSize, offset, limit, sortColumn?, sortOrder?) {
    this.spinner.show();
    this.dashboardService.getAllBiosample(offset, limit, sortColumn, sortOrder, this.filterService.searchText,
        this.filterService.activeFilters.join(','))
        .subscribe(
            data => {
              const unpackedData = [];
              for (const item of data.rootSamples.hits.hits) {
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
        )
  }

  pageChanged(event) {
    let taxonomy = [this.currentTaxonomyTree];
    let pageIndex = event.pageIndex;
    let pageSize = event.pageSize;
    let previousSize = pageSize * pageIndex;

    const from = pageIndex * pageSize;
    const size = pageSize;
    this.getNextBiosamples(previousSize, from, size, this.sort.active, this.sort.direction);
  }

  customSort(event) {
    let taxonomy = [this.currentTaxonomyTree];
    this.paginator.pageIndex = 0;
    let pageIndex = this.paginator.pageIndex;
    let pageSize = this.paginator.pageSize;
    let from = pageIndex * pageSize;
    let size = 0;
    if ((from + pageSize) < this.bioSampleTotalCount) {
      size = from + pageSize;
    }
    else {
      size = this.bioSampleTotalCount;
    }
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
    dataToReturn["id"] = data["_id"]
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if(key === 'tax_id') {
        dataToReturn['goatInfo'] = "https://goat.genomehubs.org/records?record_id="+data[key]+"&result=taxon&taxonomy=ncbi#"+dataToReturn["organism"]
        dataToReturn[key] = data[key];
      }
      if (key === 'commonName' && data[key] == null) {
        dataToReturn[key] = "-"
      }
      else {
        dataToReturn[key] = data[key];
      }
    }
    return dataToReturn;
  }

  // tslint:disable-next-line:typedef
  checkFilterIsActive(filter: string) {
    if (this.filterService.activeFilters.indexOf(filter) !== -1) {
      return 'active-filter';
    }
    if (this.filterService.selectedTaxonomy.indexOf(filter) !== -1) {
      return 'active-filter';
    }

  }

  updateActiveRouteParams() {
    const params = {};
    const paramArray = this.filterService.urlAppendFilterArray.map(x => Object.assign({}, x));
    if (paramArray.length != 0) {
      for (let i = 0; i < paramArray.length; i++) {
        params[paramArray[i].name] = paramArray[i].value;
      }
      this.router.navigate(['data'], { queryParams: params });
    } else {
      this.router.navigate(['data']);
    }
  }
  // tslint:disable-next-line:typedef
  getSearchResults() {
    this.spinner.show();
    this.resetFilter();
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
    this.filterService.updateActiveRouteParams();

  }
  // tslint:disable-next-line:typedef
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
    else if (status == 'Done') {
      return 'badge badge-pill badge-success';
    }
    else if (status == 'Waiting') {
      return 'badge badge-pill badge-warning';
    }
    else if (status == 'Submitted') {
      return 'badge badge-pill badge-success';
    }
    else {
      return 'badge badge-pill badge-warning';
    }
  }
  // tslint:disable-next-line:typedef
  checkTolidExists(data) {
    return data != undefined && data.tolid != undefined && data.tolid != null && data.tolid.length > 0;
  }
  // tslint:disable-next-line:typedef
  checkGenomeExists(data) {
    return data != undefined && data.genome_notes != undefined && data.genome_notes != null && data.genome_notes.length;
  }
  // tslint:disable-next-line:typedef
  generateTolidLink(data) {
    const organismName = data.organism.split(' ').join('_');
    if (typeof(data.tolid) === 'string'){
      const clade = this.codes[data.tolid.charAt(0)];
      return `https://tolqc.cog.sanger.ac.uk/asg/${clade}/${organismName}`;

    }else {
      if (data.tolid.length > 0) {
        const clade = this.codes[data.tolid[0].charAt(0)];
        return `https://tolqc.cog.sanger.ac.uk/asg/${clade}/${organismName}`;
      }
    }
  }

  // tslint:disable-next-line:typedef
  // downloadCSV() {
  //   const taxonomy = [this.filterService.currentTaxonomyTree];
  //   this.dashboardService.downloadCSV(this.filterService.activeFilters.toString(), this.sort.active, this.sort.direction, 0, 5000, taxonomy, this.filterService.searchText).subscribe(data => {
  //     const blob = new Blob([data], { type: 'application/csv' });
  //     const downloadURL = window.URL.createObjectURL(data);
  //     const link = document.createElement('a');
  //     link.href = downloadURL;
  //     link.download = 'organism-metadata.csv';
  //     link.click();
  //   }), error => console.log('Error downloading the file'),
  //       () => console.info('File downloaded successfully');
  // }
  // // tslint:disable-next-line:typedef
  // checkElement(element: any) {
  //   return element.commonName != '-';
  // }
  // // tslint:disable-next-line:typedef
  // commonNameSourceStyle(element: any) {
  //   if (element.commonNameSource === 'UKSI') {
  //     return 'badge badge-pill badge-warning';
  //   } else {
  //     return 'badge badge-pill badge-primary-cns';
  //   }
  // }
  // tslint:disable-next-line:typedef
  // openDialog() {
  //   const dialogRef = this.dialog.open(DownloadConfirmationDialogComponent, {
  //     width: '550px',
  //     autoFocus: false,
  //     data: {
  //       message: 'Are you sure want to donload?',
  //       name: this.filterService.selectedFilterValue.taxonomy,
  //       activeFilters: this.filterService.activeFilters.toString(),
  //       sort: this.sort,
  //       taxonomy: { rank: 'superkingdom', taxonomy: 'Eukaryota', childRank: 'kingdom' },
  //       searchText: this.filterService.searchText,
  //       selectedOptions: [0, 1, 2],
  //       hideAnnotation: this.filterService.AnnotationFilters.length === 0 && this.filterService.AnnotationCompleteFilters.length === 0 ,
  //       hideAssemblies: this.filterService.AssembliesFilters.length === 0 ,
  //       hideRawData: this.filterService.RawDataFilters.length === 0
  //     }
  //   });
  // }
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
}

