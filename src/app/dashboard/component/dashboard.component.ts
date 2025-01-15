import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';

import {ActivatedRoute, NavigationEnd, Router, RouterLink} from '@angular/router';
import {MatSort, MatSortHeader, MatSortModule} from '@angular/material/sort';

import { Title } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import 'jquery';
import 'bootstrap';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatHeaderCellDef, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {filter, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {NgClass, NgStyle} from '@angular/common';
import {MatCheckbox} from '@angular/material/checkbox';
import {NgxSpinnerModule, NgxSpinnerService} from 'ngx-spinner';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatDialog, MatDialogActions, MatDialogContent} from '@angular/material/dialog';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatButton} from '@angular/material/button';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    NgxSpinnerModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    FormsModule,
    RouterLink,
    NgStyle,
    NgClass,
    MatSort,
    MatHeaderCellDef,
    MatCheckbox,
    MatChip,
    MatChipSet,
    MatIcon,
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatProgressBar,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatSortHeader,
    MatSortModule
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit , OnDestroy {

  constructor(private titleService: Title,
              private dashboardService: DashboardService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private spinner: NgxSpinnerService) {
    this.searchUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged()).subscribe(
        value => {
          this.spinner.show();
          this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
        }
    );
  }
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
  lastPhylogenyVal = '';
  queryParams: any = {};
  isPhylogenyFilterProcessing = false; // Flag to prevent double-clicking
  phylogenyFilters: string[] = [];
  activeFilters = new Array<string>();
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
  symbiontsFilters: any[] = [];
  metagenomesFilters: any[] = [];
  experimentTypeFilters: any[] = [];
  mgnifyFilters: any[] = [];
  itemLimit = 5;
  isCollapsed = true;
  searchValue: string;
  filters = {
    sex: {},
    trackingSystem: {}
  };
  displayProgressBar = false;
  bioSampleTotalCount = 0;
  unpackedData;
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
  downloadDialogTitle = '';
  dialogRef: any;
  public downloadForm!: FormGroup;
  displayErrorMsg = false;
  @ViewChild('downloadTemplate') downloadTemplate = {} as TemplateRef<any>;
  @ViewChild('mgnifyTemplate') mgnifyTemplate = {} as TemplateRef<any>;

  protected readonly filter = filter;

  ngOnInit(): void {
    // reload page if user clicks on menu link
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects === '/data') {
          this.refreshPage();
        }
      }
    });

    this.downloadForm = new FormGroup({
      downloadOption: new FormControl('', [Validators.required]),
    });

    this.getDisplayedColumns();
    this.filterSize = 4;
    this.itemLimitBiosampleFilter = this.filterSize;
    this.itemLimitEnaFilter = this.filterSize;
    this.titleService.setTitle('Data portal');

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
          } else if (params[key].includes('searchValue - ')){
            this.searchValue = params[key].split('searchValue - ')[1];
          } else {
            this.activeFilters.push(params[key]);
          }
        }
      }
    }

    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
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
    // this.getActiveFiltersAndResult();
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
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
    if (this.activeFilters.includes(filterValue)) {
      return 'background-color: #4BBEFD;';
    } else {
      return '';
    }
  }

  onFilterClick(filterValue: string, phylogenyFilter: boolean = false) {
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

      this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);

      // Reset isPhylogenyFilterProcessing flag
      setTimeout(() => {
        this.isPhylogenyFilterProcessing = false;
      }, 500);
    } else{
      const index = this.activeFilters.indexOf(filterValue);
      index !== -1 ? this.activeFilters.splice(index, 1) :
          this.activeFilters.push(filterValue);
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
    // remove phylogenyFilters param from url
    const index = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
    if (index > -1) {
      this.queryParams.splice(index, 1);
      // Replace current parameters with new parameters.
      this.replaceUrlQueryParams();
    }
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
    this.spinner.show();

    this.dashboardService.getAllBiosample(
        'data_portal_test', this.currentClass, this.phylogenyFilters, offset, limit, sortColumn, sortOrder, this.searchValue,
        this.activeFilters
    ).subscribe(
            data => {
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

              // mgnify
              this.mgnifyFilters = [];
              if (this.aggregations.mgnify_status.buckets.length > 0) {
                this.mgnifyFilters = this.merge(this.mgnifyFilters,
                    this.aggregations.mgnify_status.buckets,
                    'mgnify_status');
              }

              // experiment type
              this.experimentTypeFilters = [];
              if (this.aggregations?.experiment.library_construction_protocol.buckets.length > 0) {
                this.experimentTypeFilters = this.merge(this.experimentTypeFilters,
                    this.aggregations?.experiment.library_construction_protocol.buckets,
                    'experimentType');
              }


              // get last phylogeny element for filter button
              this.lastPhylogenyVal = this.phylogenyFilters.slice(-1)[0];

              // add filters to URL query parameters
              this.queryParams = [...this.activeFilters];

              // add search value to URL query param
              if (this.searchValue) {
                this.queryParams.push(`searchValue - ${this.searchValue}`);
              }

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

  getNextBiosamples(currentSize, offset, limit, sortColumn?, sortOrder?) {
    this.spinner.show();
    this.dashboardService.getAllBiosample(
        'data_portal_test', this.currentClass, this.phylogenyFilters, offset, limit, sortColumn, sortOrder, this.searchValue,
        this.activeFilters)
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

  unpackData(data: any) {
    const dataToReturn = {};
    dataToReturn['id'] = data['_id'];
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if (key === 'metagenomes_records') {
        dataToReturn['mgnify_study_ids'] = data[key]
            .filter(ele => ele.mgnify_study_ids)
            .map(ele => ele.mgnify_study_ids);
        dataToReturn[key] = data[key];
      }

      if (key === 'tax_id') {
        dataToReturn['goatInfo'] = 'https://goat.genomehubs.org/records?record_id=' + data[key] +
            '&result=taxon&taxonomy=ncbi#' + dataToReturn['organism'];
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

  refreshPage() {
    this.activeFilters = [];
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    this.searchValue = '';
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
    this.router.navigate([]);
  }

  ngOnDestroy() {
    this.activeFilters = [];
    this.phylogenyFilters = [];
    this.symbiontsFilters = [];
    this.mgnifyFilters = [];
    this.metagenomesFilters = [];
    this.experimentTypeFilters = [];
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
      return {'background-color': 'gold'};
    }
    else if (status === 'Submitted') {
      return 'badge badge-pill badge-success';
    }
    else {
      return 'badge badge-pill badge-warning';
    }
  }

  getCurrentStatusColour(status: string) {
    if (['Annotation Complete', 'Done'].includes(status.trim())) {
      return 'background-color:palegreen';
    } else {
      return 'background-color:#ffc107';
    }
  }

  checkTolidExists(data) {
    return data !== undefined && data.show_tolqc !== undefined;
  }

  checkMgnifyIdsLength(data) {
    return data !== undefined && data.mgnify_study_ids !== undefined && data.mgnify_study_ids != null
        ? data.mgnify_study_ids.length
        : 0;
  }

  generateMgnifyIDLink(mgnifyId) {
    return `https://www.ebi.ac.uk/metagenomics/studies/${mgnifyId}#overview`;
  }

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


  displayActiveFilterName(filterName: string): string {
    if (!filterName) {
      return filterName;
    }
    switch (true) {
      case filterName.startsWith('symbionts_'):
        return 'Symbionts-' + filterName.split('-')[1];
      case filterName.startsWith('experimentType_'):
        return filterName.split('_')[1];
      case filterName === 'mgnify_status-true':
        return 'MGnify Analysis - Done';
      default:
        return filterName;
    }
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
    this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
  }

  downloadFile(downloadOption: string, dialog: boolean) {
    this.dashboardService.downloadData(downloadOption, this.paginator.pageIndex,
        this.paginator.pageSize, this.searchValue || '', this.sort.active, this.sort.direction, this.activeFilters,
        this.currentClass, this.phylogenyFilters, 'data_portal_test').subscribe({
      next: (response: Blob) => {
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'download.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.displayProgressBar = false;
        if (dialog) {
          // close dialog box
          setTimeout(() => {
            this.dialogRef.close();
          }, 500);
        }
      },
      error: error => {
        console.error('Error downloading the CSV file:', error);
      }
    });
  }

  onCancelDialog() {
    this.dialogRef.close();
  }

  onDownload() {
    if (this.downloadForm?.valid && this.downloadForm?.touched) {
      this.displayProgressBar = true;
      const downloadOption = this.downloadForm.value['downloadOption'];
      this.downloadFile(downloadOption, true);
    }
    this.displayErrorMsg = true;
  }

  openDownloadDialog(value: string) {
    this.downloadDialogTitle = `Download data`;
    this.dialogRef = this.dialog.open(this.downloadTemplate,
        { data: value, height: '260px', width: '400px' });
  }

  openMGnifyDialog(mgnifyUrls: any) {
    this.downloadDialogTitle = `Download data`;
    this.dialogRef = this.dialog.open(this.mgnifyTemplate,
        { data: mgnifyUrls, height: '260px', width: '400px' });
  }

  displayMGnifyFilterName(filterValue: string) {
    if (filterValue === 'true') {
      return 'MGnify Analysis - Done';
    } else {
      return filterValue;
    }
  }

  public displayError = (controlName: string, errorName: string) => {
    return this.downloadForm?.controls[controlName].hasError(errorName);
  }

  checkCurrentStatusColor(status: string) {
    if (status === 'Annotation Complete') {
      return {'background-color': 'palegreen'};
    }
    return {'background-color': 'gold'};
  }

  checkGenomeNote(data: any) {
    return data.genome_notes.length > 0;
  }
}

