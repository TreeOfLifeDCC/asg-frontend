import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Sample} from '../../model/dashboard.model';
import {MatSort} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {DashboardService} from '../../services/dashboard.service';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MapClusterComponent} from '../../map-cluster/map-cluster.component';
import {SafeHtml, SafeResourceUrl,DomSanitizer} from '@angular/platform-browser';
import {Subject} from 'rxjs';

import {MatIcon} from '@angular/material/icon';


@Component({
  standalone: true,
  selector: 'dashboard-organism-details',
  templateUrl: './organism-details.component.html',
  imports: [
    MatTabsModule,
    MatFormFieldModule,
    MatTableModule,
    MatListModule,
    RouterLink,
    MatExpansionModule,
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    MatChip,
    MatChipSet,
    MapClusterComponent,
    MatSort,
    MatIcon,
    MatPaginator
  ],
  styleUrls: ['./organism-details.component.css']
})
export class OrganismDetailsComponent implements OnInit, AfterViewInit  {


  filterChanged = new EventEmitter<any>();
  bioSampleId: string;
  bioSampleObj: any;
  dataSourceRecords = new MatTableDataSource<any>([]);
  specBioSampleTotalCount = 0;
  specSymbiontsTotalCount = 0;
  specMetagenomesTotalCount = 0;
  dataSourceSymbiontsAssembliesCount = 0;
  dataSourceSymbiontsAssemblies: MatTableDataSource<any, MatPaginator>;
  dataSourceMetagenomesAssembliesCount: number;
  dataSourceMetagenomesAssemblies: MatTableDataSource<any, MatPaginator>;
  specDisplayedColumns = ['accession', 'organism', 'commonName', 'sex', 'organismPart', 'trackingSystem'];
  private filterSubject = new Subject<string>();
  INSDC_ID = null;
  itemLimitSexFilter: number;
  itemLimitOrgFilter: number;
  itemLimitTrackFilter: number;
  filterSize: number;
  searchText = '';
  activeFilters = [];

  filtersMap: { sex: any[]; trackingSystem: any[]; organismPart: any[]; };
  metadataFilters = {
    sex: {},
    trackingSystem: {},
    organismPart: {}
  };
   symbiontsFilters = {
    sex: {},
    trackingSystem: {},
    organismPart: {}
  };
  metagenomeFilters = {
    sex: {},
    trackingSystem: {},
    organismPart: {}
  };
  metadataSexFilters = [];
  metadataTrackingSystemFilters = [];
  metadataOrganismPartFilters = [];

  symbiontsSexFilters = [];
  symbiontsTrackingSystemFilters = [];
  symbiontsOrganismPartFilters = [];

  metagenomesSexFilters = [];
  metagenomesTrackingSystemFilters = [];
  metagenomesOrganismPartFilters = [];

  organismName: any;
  relatedRecords: any[];
  filterJson = {
    sex: '',
    organismPart: '',
    trackingSystem: '',
    search: ''
  };
  geoLocation: boolean;
  orgGeoList: any;
  specGeoList: any;
  dataSourceFiles = new MatTableDataSource([]);
  dataSourceFilesCount: number;
  dataSourceAssemblies = new MatTableDataSource([]);
  dataSourceAssembliesCount: number;
  dataSourceAnnotation = new MatTableDataSource([]);
  dataSourceAnnotationCount: number;
  dataSourceSymbiontsRecords = new MatTableDataSource([]);
  dataSourceMetagenomesRecords = new MatTableDataSource([]);
  assembliesurls = [];
  annotationsurls = [];
  experimentColumnsDefination = [
    { column: 'study_accession', selected: true },
    { column: 'secondary_study_accession', selected: false },
    { column: 'sample_accession', selected: true },
    { column: 'secondary_sample_accession', selected: false },
    { column: 'experiment_accession', selected: true },
    { column: 'run_accession', selected: true },
    { column: 'submission_accession', selected: false },
    { column: 'tax_id', selected: false },
    { column: 'scientific_name', selected: false },
    { column: 'instrument_platform', selected: false },
    { column: 'instrument_model', selected: false },
    { column: 'library_name', selected: false },
    { column: 'nominal_length', selected: false },
    { column: 'library_layout', selected: false },
    { column: 'library_strategy', selected: false },
    { column: 'library_source', selected: false },
    { column: 'library_selection', selected: false },
    { column: 'read_count', selected: false },
    { column: 'base_count', selected: false },
    { column: 'center_name', selected: false },
    { column: 'first_public', selected: false },
    { column: 'last_updated', selected: false },
    { column: 'experiment_title', selected: false },
    { column: 'study_title', selected: false },
    { column: 'study_alias', selected: false },
    { column: 'experiment_alias', selected: false },
    { column: 'run_alias', selected: false },
    { column: 'fastq_bytes', selected: false },
    { column: 'fastq_md5', selected: false },
    { column: 'fastq_ftp', selected: true },
    { column: 'fastq_aspera', selected: false },
    { column: 'fastq_galaxy', selected: false },
    { column: 'submitted_bytes', selected: false },
    { column: 'submitted_md5', selected: false },
    { column: 'submitted_ftp', selected: true },
    { column: 'submitted_aspera', selected: false },
    { column: 'submitted_galaxy', selected: false },
    { column: 'submitted_format', selected: false },
    { column: 'sra_bytes', selected: false },
    { column: 'sra_md5', selected: false },
    { column: 'sra_ftp', selected: false },
    { column: 'sra_aspera', selected: false },
    { column: 'sra_galaxy', selected: false },
    { column: 'cram_index_ftp', selected: false },
    { column: 'cram_index_aspera', selected: false },
    { column: 'cram_index_galaxy', selected: false },
    { column: 'sample_alias', selected: false },
    { column: 'broker_name', selected: false },
    { column: 'sample_title', selected: false },
    { column: 'nominal_sdev', selected: false },
    { column: 'first_created', selected: false },
    { column: 'library_construction_protocol', selected: true }
  ];
  private ENA_PORTAL_API_BASE_URL_FASTA = 'https://www.ebi.ac.uk/ena/browser/api/fasta/';
  displayedColumnsFiles = [];
  displayedColumnsAssemblies = ['accession', 'assembly_name', 'description', 'version'];
  displayedColumnsAnnotation = ['accession', 'annotation', 'proteins', 'transcripts', 'softmasked_genome',
    'other_data', 'view_in_browser'];
  @ViewChild('tabgroup', { static: false }) tabgroup: MatTabGroup;
  @ViewChild('metadataPaginator', { static: false }) metadataPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('experimentsTablePaginator', { static: false }) experimentsTablePaginator: MatPaginator;
  @ViewChild('assembliesTablePaginator') assembliesTablePaginator: MatPaginator;
  @ViewChild('annotationTablePaginator', { static: false }) annotationTablePaginator: MatPaginator;
  @ViewChild('relatedSymbiontsPaginator', { static: false }) relatedSymbiontsPaginator: MatPaginator;
  @ViewChild('assembliesSymbiontsTablePaginator', { static: false }) assembliesSymbiontsTablePaginator: MatPaginator;
  @ViewChild('relatedMetagenomesTablePaginator', { static: false }) relatedMetagenomesTablePaginator: MatPaginator;
  @ViewChild('assembliesMetagenomesTablePaginator', { static: false }) assembliesMetagenomesTablePaginator: MatPaginator;
  dataSourceGoatInfo;
  displayedColumnsGoatInfo = ['name', 'value', 'count', 'aggregation_method', 'aggregation_source'];
  private dataTabInitialized = false;
  aggregations;
  url: SafeResourceUrl;
  isOrganismsCollapsed = true ;
  isSymbiontsCollapsed: boolean;
  isMetagenomesCollapsed: boolean;
  mgnifyIDs: any[] = [];
  mgnifyDownloadLinks: any[] = [];

  isCollapsed: { [key: string]: boolean } = {};
  constructor(private route: ActivatedRoute,
              private dashboardService: DashboardService, private cdr: ChangeDetectorRef ,
              private sanitizer: DomSanitizer) {
    this.route.params.subscribe(param => this.bioSampleId = param.id);
  }

  ngOnInit(): void {
    this.initializeCollapsedState('metadataTab', this.metadataSexFilters, 'sex');
    this.initializeCollapsedState('symbiontsTab', this.symbiontsSexFilters, 'sex');
    this.initializeCollapsedState('metagenomeTab', this.metagenomesSexFilters, 'sex');
    this.initializeCollapsedState('metadataTab', this.metadataOrganismPartFilters, 'organismPart');
    this.initializeCollapsedState('symbiontsTab', this.symbiontsOrganismPartFilters, 'organismPart');
    this.initializeCollapsedState('metagenomeTab', this.metagenomesOrganismPartFilters, 'organismPart');
    this.initializeCollapsedState('metadataTab', this.metadataTrackingSystemFilters, 'trackingSystem');
    this.initializeCollapsedState('symbiontsTab', this.symbiontsTrackingSystemFilters, 'trackingSystem');
    this.initializeCollapsedState('metagenomeTab', this.metagenomesTrackingSystemFilters, 'trackingSystem');
  }

  getDisplayedColumns() {
    this.displayedColumnsFiles = [];
    this.experimentColumnsDefination.forEach(obj => {
      if (obj.selected) {
        this.displayedColumnsFiles.push(obj.column);
      }
    });
  }

  expanded() {
  }

  showSelectedColumn(selectedColumn, checked) {
    const index = this.experimentColumnsDefination.indexOf(selectedColumn);
    const item = this.experimentColumnsDefination[index];
    item.selected = checked;
    this.experimentColumnsDefination[index] = item;
    this.getDisplayedColumns();
    this.getBiosampleByOrganism();

  }

  ngAfterViewInit(): void {
    this.getDisplayedColumns();
    this.getBiosampleByOrganism();

    this.cdr.detectChanges();
  }

  getBiosampleByOrganism() {
    this.dashboardService.getRootOrganismById(this.bioSampleId, 'data_portal')
        .subscribe(
            data => {
              this.aggregations = data.aggregations;
              data = data['results'][0]['_source'];

              this.bioSampleObj = data;
              this.orgGeoList = data.orgGeoList;
              this.specGeoList = data.specGeoList;
              if (this.orgGeoList !== undefined && this.orgGeoList.length !== 0) {
                this.geoLocation = true;
                const tabGroup = this.tabgroup;
                const selected = this.tabgroup.selectedIndex;
                tabGroup.selectedIndex = 4;
                setTimeout(() => {
                  tabGroup.selectedIndex = selected;
                }, 100);
              }
              this.getFilters();
              if (data.goat_info) {
                this.dataSourceGoatInfo = data.goat_info.attributes;
              }
              // get MGnify IDs in metagenomes records
              this.mgnifyIDs = data['metagenomes_records']
                  .filter( obj => obj.hasOwnProperty('mgnify_study_ids'))
                  .map(obj => obj['mgnify_study_ids']);

              for (const studyId of this.mgnifyIDs) {
                this.fetchMGnifyDownloadLinks(studyId);
              }

              this.organismName = data.organism;
              setTimeout(() => {
                this.dataSourceRecords = new MatTableDataSource<any>(data.records);
                this.dataSourceSymbiontsRecords = new MatTableDataSource<any>(data.symbionts_records);
                this.dataSourceMetagenomesRecords = new MatTableDataSource<any>(data.metagenomes_records);
                this.specBioSampleTotalCount = data.records?.length;
                this.specSymbiontsTotalCount = data.symbionts_records?.length;
                this.specMetagenomesTotalCount = data.metagenomes_records?.length;

                if (data.experiment != null) {
                  this.dataSourceFiles = new MatTableDataSource<Sample>(data.experiment);
                  this.dataSourceFilesCount = data.experiment?.length;
                  this.dataSourceFiles.paginator = this.experimentsTablePaginator;
                }
                if (data.experiment?.length > 0) {
                  this.INSDC_ID = data.experiment[0].study_accession;
                } else {
                  this.dataSourceFiles = new MatTableDataSource<Sample>();
                  this.dataSourceFilesCount = 0;
                }
                if (data.assemblies != null) {
                  this.dataSourceAssemblies = new MatTableDataSource<any>(data.assemblies);
                  this.dataSourceAssembliesCount = data.assemblies?.length;
                  this.dataSourceAssemblies.paginator = this.assembliesTablePaginator;
                  // tslint:disable-next-line:prefer-for-of
                  for (let i = 0; i < data.assemblies.length; i++) {
                    this.assembliesurls.push(
                        this.ENA_PORTAL_API_BASE_URL_FASTA + data.assemblies[i].accession + '?download=true&gzip=true'
                    );
                  }
                } else {
                  this.dataSourceAssemblies = new MatTableDataSource<Sample>();
                  this.dataSourceAssembliesCount = 0;
                }
                if (data.annotation != null) {
                  this.dataSourceAnnotation = new MatTableDataSource<any>(data.annotation);
                  this.dataSourceAnnotationCount = data.annotation?.length;
                  this.dataSourceAnnotation.paginator = this.annotationTablePaginator;
                  // tslint:disable-next-line:prefer-for-of
                  for (let i = 0; i < data.annotation.length; i++) {
                    this.annotationsurls.push(
                        this.ENA_PORTAL_API_BASE_URL_FASTA + data.annotation[i].accession + '?download=true&gzip=true'
                    );
                  }
                } else {
                  this.dataSourceAnnotation = new MatTableDataSource<Sample>();
                  this.dataSourceAnnotationCount = 0;
                }
                if (data.symbionts_assemblies != null) {
                  this.dataSourceSymbiontsAssemblies = new MatTableDataSource<any>(data.symbionts_assemblies);
                  this.dataSourceSymbiontsAssembliesCount = data.symbionts_assemblies?.length;
                  this.dataSourceSymbiontsAssemblies.paginator = this.assembliesSymbiontsTablePaginator;
                } else {
                  this.dataSourceSymbiontsAssemblies = new MatTableDataSource<Sample>();
                  this.dataSourceSymbiontsAssembliesCount = 0;
                }
                if (data.metagenomes_assemblies != null) {
                  this.dataSourceMetagenomesAssemblies = new MatTableDataSource<any>(data.metagenomes_assemblies);
                  this.dataSourceMetagenomesAssembliesCount = data.metagenomes_assemblies?.length;
                  this.dataSourceMetagenomesAssemblies.paginator = this.assembliesMetagenomesTablePaginator;
                } else {
                  this.dataSourceMetagenomesAssemblies = new MatTableDataSource<Sample>();
                  this.dataSourceMetagenomesAssembliesCount = 0;
                }
                this.dataSourceRecords.paginator = this.metadataPaginator;
                this.dataSourceSymbiontsRecords.paginator = this.relatedSymbiontsPaginator;
                this.dataSourceMetagenomesRecords.paginator = this.relatedMetagenomesTablePaginator;

                this.dataSourceRecords.sort = this.sort;
                this.dataSourceFiles.sort = this.sort;
                this.dataSourceAssemblies.sort = this.sort;
                this.dataSourceAnnotation.sort = this.sort;


              }, 300);
        });
  }

  createfilterPredicateForSearch(dataSource){
    dataSource.filterPredicate = ((data, filter) => {
      const accession = !filter || (data.accession && data.accession.toLowerCase().includes(filter.toLowerCase()));
      const commonName = !filter || (data.commonName && data.commonName.toLowerCase().includes(filter.toLowerCase()));
      const organism = !filter || (data.organism.text && data.organism.text.toLowerCase().includes(filter.toLowerCase()));
      return accession || commonName || organism;
    }) as (PeriodicElement, string) => boolean;
  }

  filesSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
  }

  assembliesSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAssemblies.filter = filterValue.trim().toLowerCase();
  }

  annotationSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAnnotation.filter = filterValue.trim().toLowerCase();
  }

  relatedSymbiontsSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length === 0) {
      this.getBiosampleByOrganism();
      this.filterJson.search = '';
      this.searchText = '';
    }
    else {
      this.activeFilters = [];
      this.createfilterPredicateForSearch(this.dataSourceSymbiontsRecords);
      this.dataSourceSymbiontsRecords.filter = filterValue.trim();
      this.getFiltersForSelectedFilterForSymbionts(this.dataSourceSymbiontsRecords.filteredData);
    }

  }

  symbiontsAssembliesSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSymbiontsAssemblies.filter = filterValue.trim().toLowerCase();
  }

  metagenomesRecordsSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.length === 0) {
      this.filterJson.search = '';
      this.searchText = '';
      this.getBiosampleByOrganism();
    }
    else {
      this.activeFilters = [];
      this.createfilterPredicateForSearch(this.dataSourceMetagenomesRecords);
      this.dataSourceMetagenomesRecords.filter = filterValue.trim();
      this.getFiltersForSelectedFilterForMetaGenome(this.dataSourceMetagenomesRecords.filteredData);
    }
  }

  metagenomesAssembliesSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceMetagenomesAssemblies.filter = filterValue.trim().toLowerCase();
  }

  getFiltersForSelectedFilterForMetaData(data: any) {
    const metadataFilters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    this.metadataSexFilters = [];
    this.metadataTrackingSystemFilters = [];
    this.metadataOrganismPartFilters = [];

    this.metadataFilters = metadataFilters;
    for (const item of data) {
      if (item.sex != null) {
        if (item.sex in metadataFilters.sex) {
          metadataFilters.sex[item.sex] += 1;
        } else {
          metadataFilters.sex[item.sex] = 1;
        }
      }
      if (item.trackingSystem != null) {
        if (item.trackingSystem in metadataFilters.trackingSystem) {
          metadataFilters.trackingSystem[item.trackingSystem] += 1;
        } else {
          metadataFilters.trackingSystem[item.trackingSystem] = 1;
        }
      }

      if (item.organismPart != null) {
        if (item.organismPart in metadataFilters.organismPart) {
          metadataFilters.organismPart[item.organismPart] += 1;
        } else {
          metadataFilters.organismPart[item.organismPart] = 1;
        }
      }
    }
    this.metadataFilters = metadataFilters;
    const sexFilterObj = Object.entries(this.metadataFilters.sex);
    const trackFilterObj = Object.entries(this.metadataFilters.trackingSystem);
    const orgFilterObj = Object.entries(this.metadataFilters.organismPart);
    const j = 0;
    for (const item of sexFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.metadataSexFilters.push(jsonObj);
    }
    for (const item of trackFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.metadataTrackingSystemFilters.push(jsonObj);
    }
    for (const item of orgFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.metadataOrganismPartFilters.push(jsonObj);
    }
  }

  getFiltersForSelectedFilterForSymbionts(data: any) {
    const symbiontsFilters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    this.symbiontsSexFilters = [];
    this.symbiontsTrackingSystemFilters = [];
    this.symbiontsOrganismPartFilters = [];

    this.symbiontsFilters = symbiontsFilters;
    for (const item of data) {
      if (item.sex != null) {
        if (item.sex in symbiontsFilters.sex) {
          symbiontsFilters.sex[item.sex] += 1;
        } else {
          symbiontsFilters.sex[item.sex] = 1;
        }
      }
      if (item.trackingSystem != null) {
        if (item.trackingSystem in symbiontsFilters.trackingSystem) {
          symbiontsFilters.trackingSystem[item.trackingSystem] += 1;
        } else {
          symbiontsFilters.trackingSystem[item.trackingSystem] = 1;
        }
      }

      if (item.organismPart != null) {
        if (item.organismPart in symbiontsFilters.organismPart) {
          symbiontsFilters.organismPart[item.organismPart] += 1;
        } else {
          symbiontsFilters.organismPart[item.organismPart] = 1;
        }
      }
    }
    this.symbiontsFilters = symbiontsFilters;
    const sexFilterObj = Object.entries(this.symbiontsFilters.sex);
    const trackFilterObj = Object.entries(this.symbiontsFilters.trackingSystem);
    const orgFilterObj = Object.entries(this.symbiontsFilters.organismPart);
    const j = 0;
    for (const item of sexFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.symbiontsSexFilters.push(jsonObj);
    }
    for (const item of trackFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.symbiontsTrackingSystemFilters.push(jsonObj);
    }
    for (const item of orgFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.symbiontsOrganismPartFilters.push(jsonObj);
    }
  }

  getFiltersForSelectedFilterForMetaGenome(data: any) {
    const metagenomeFilters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    this.metagenomesSexFilters = [];
    this.metagenomesTrackingSystemFilters = [];
    this.metagenomesOrganismPartFilters = [];

    this.metagenomeFilters = metagenomeFilters;
    for (const item of data) {
      if (item.sex != null) {
        if (item.sex in metagenomeFilters.sex) {
          metagenomeFilters.sex[item.sex] += 1;
        } else {
          metagenomeFilters.sex[item.sex] = 1;
        }
      }
      if (item.trackingSystem != null) {
        if (item.trackingSystem in metagenomeFilters.trackingSystem) {
          metagenomeFilters.trackingSystem[item.trackingSystem] += 1;
        } else {
          metagenomeFilters.trackingSystem[item.trackingSystem] = 1;
        }
      }

      if (item.organismPart != null) {
        if (item.organismPart in metagenomeFilters.organismPart) {
          metagenomeFilters.organismPart[item.organismPart] += 1;
        } else {
          metagenomeFilters.organismPart[item.organismPart] = 1;
        }
      }
    }
    this.metadataFilters = metagenomeFilters;
    const sexFilterObj = Object.entries(this.metagenomeFilters.sex);
    const trackFilterObj = Object.entries(this.metagenomeFilters.trackingSystem);
    const orgFilterObj = Object.entries(this.metagenomeFilters.organismPart);
    const j = 0;
    for (const item of sexFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.metagenomesSexFilters.push(jsonObj);
    }
    for (const item of trackFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.metagenomesTrackingSystemFilters.push(jsonObj);
    }
    for (const item of orgFilterObj) {
      const jsonObj = { key: item[j], doc_count: item[j + 1] };
      this.metagenomesOrganismPartFilters.push(jsonObj);
    }
  }

  getFilters() {

    this.metadataSexFilters = this.aggregations.metadata_filters.sex_filter.buckets;
    this.metadataTrackingSystemFilters = this.aggregations.metadata_filters.tracking_status_filter.buckets;
    this.metadataOrganismPartFilters = this.aggregations.metadata_filters.
        organism_part_filter.buckets;

    this.symbiontsSexFilters = this.aggregations.symbionts_filters.sex_filter.buckets;
    this.symbiontsTrackingSystemFilters = this.aggregations.symbionts_filters.tracking_status_filter.buckets;
    this.symbiontsOrganismPartFilters = this.aggregations.symbionts_filters.
        organism_part_filter.buckets;

    this.metagenomesSexFilters = this.aggregations.metagenomes_filters.sex_filter.buckets;
    this.metagenomesTrackingSystemFilters = this.aggregations.metagenomes_filters.tracking_status_filter.buckets;
    this.metagenomesOrganismPartFilters = this.aggregations.metagenomes_filters.
        organism_part_filter.buckets;
  }

  getSearchResults(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  if (filterValue.length === 0) {
      this.getBiosampleByOrganism();
  }
  else {
    this.activeFilters = [];
    this.createfilterPredicateForSearch(this.dataSourceRecords);
    this.dataSourceRecords.filter = filterValue.trim();
    this.getFiltersForSelectedFilterForMetaData(this.dataSourceRecords.filteredData);
  }
  }

  checkFilterIsActive(filterValue: string) {
    if (this.activeFilters.includes(filterValue)) {
      return 'active';
    } else {
      return '';
    }

  }
  removeFilter(filter: string, dataSource: MatTableDataSource<any>, tabName: string) {
    if (filter !== undefined) {
      const filterIndex = this.activeFilters.indexOf(filter);
      if (this.activeFilters.length !== 0) {
        this.spliceFilterArray(filter);
        this.activeFilters.splice(filterIndex, 1);
        dataSource.filter = JSON.stringify(this.filterJson);
        if (tabName === 'metadataTab'){
          this.getFiltersForSelectedFilterForMetaData(dataSource.filteredData);
        }else if (tabName === 'metagenomeTab'){
          this.getFiltersForSelectedFilterForMetaGenome(dataSource.filteredData);
        }else if (tabName === 'symbiontsTab'){
          this.getFiltersForSelectedFilterForSymbionts(dataSource.filteredData);
        }

      } else {
        this.filterJson.sex = '';
        this.filterJson.organismPart = '';
        this.filterJson.trackingSystem = '';
        dataSource.filter = JSON.stringify(this.filterJson);
        this.getBiosampleByOrganism();
      }
    }
  }
  spliceFilterArray(filter: string) {
    if (this.filterJson.sex === filter) {
      this.filterJson.sex = '';
    }
    else if (this.filterJson.organismPart === filter) {
      this.filterJson.organismPart = '';
    }else if (this.filterJson.trackingSystem === filter) {
      this.filterJson.trackingSystem = '';
    }
  }
  removeAllFilters() {
    $('.sex-inactive').removeClass('non-disp');
    $('.org-part-inactive').removeClass('non-disp');
    $('.tracking-status-inactive').removeClass('non-disp');
    this.activeFilters = [];
    this.filterJson.sex = '';
    this.filterJson.organismPart = '';
    this.filterJson.trackingSystem = '';
    this.searchText = '';
    this.filterChanged.emit();
    this.mgnifyIDs = [];
    this.mgnifyDownloadLinks = [];
    this.getBiosampleByOrganism();
  }
  createFilterJson(key, value, dataSource) {
    if (key === 'sex') {
      this.filterJson.sex = value;
    }
    else if (key === 'organismPart') {
      this.filterJson.organismPart = value;
    }
    else if (key === 'trackingSystem') {
      this.filterJson.trackingSystem = value;
    }
    dataSource.filterPredicate =  ((data, filter) => {
      const filterObj: {sex: string, organismPart: string, trackingSystem: string, search: string} = JSON.parse(filter);
      const sex = !filterObj.sex || data.sex === filterObj.sex;
      const organismPart = !filterObj.organismPart || data.organismPart === filterObj.organismPart;
      const trackingSystem = !filterObj.trackingSystem || data.trackingSystem === filterObj.trackingSystem;
      return sex && organismPart && trackingSystem ;
    }) as (PeriodicElement, string) => boolean;
  }
  applyFilter(label: string,  filterValue: string, dataSource: MatTableDataSource<any>, tabName: string): void {
    const index = this.activeFilters.indexOf(filterValue);
    this.createFilterJson(label, filterValue, dataSource);
    this.searchText = '';
    const inactiveClassName = label.toLowerCase().replace(' ', '-') + '-inactive';
    if (index !== -1) {
      $('.' + inactiveClassName).removeClass('non-disp');
      this.removeFilter(filterValue, dataSource, tabName);
    }else {
      this.activeFilters.push(filterValue);
      dataSource.filter = JSON.stringify(this.filterJson);
      if (tabName === 'metadataTab'){
        this.getFiltersForSelectedFilterForMetaData(dataSource.filteredData);
      }else if (tabName === 'metagenomeTab') {
        this.getFiltersForSelectedFilterForMetaGenome(dataSource.filteredData);
      }else if (tabName === 'symbiontsTab'){
        this.getFiltersForSelectedFilterForSymbionts(dataSource.filteredData);
      }
    }
  }
  checkCurrentStatusColor(status: string) {
      if (status === 'Annotation Complete') {
        return {'background-color': 'palegreen'};
      }
      return {'background-color': 'gold'};
    }
  fetchMGnifyDownloadLinks(mgnifyID: string) {
      this.dashboardService.getMGnifyDownloadLinks(mgnifyID).subscribe({
        next: data => {
          const dataObj = {};
          // dataObj['mgnifyID'] = mgnifyID;

          data['data'].forEach((obj, index) => {
            const groupType = obj['attributes']['group-type'];
            if (groupType in dataObj) {
              dataObj[groupType].push(obj);
            } else {
              dataObj[groupType] = [obj];
            }
          });

          this.mgnifyDownloadLinks.push({mgnifyid: mgnifyID,
                                         dataobj: dataObj});
        },
        error: error => {
          console.log(error);
        }
      });
    }
  toggleCollapse(tabKey: string, filterKey: string): void {
      const key = `${tabKey}_${filterKey}`; // Create a unique key
      this.isCollapsed[key] = !this.isCollapsed[key];

    }
  initializeCollapsedState(tabKey: string, filters: any[], filterKey: string): void {
      const key = `${tabKey}_${filterKey}`;
      this.isCollapsed[key] = true; // Default to collapsed
    }
  getLimitedFilters(filters: any[], filterKey: string, tabKey: string): any[] {
      const key = `${tabKey}_${filterKey}`;
      if (this.isCollapsed[key]) {
        return filters.slice(0, 3);
      }
      return filters;
    }
  tabClick({$event}: { $event: any }) {
    if ($event.tab.textLabel === 'Metadata' || $event.tab.textLabel === 'Metagenomes' || $event.tab.textLabel === 'Symbionts' ){
      this.searchText = '';
      if (this.activeFilters.length > 0 ){
        this.removeAllFilters();
      }
    }
  }

  sanitizeHTML(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

}
