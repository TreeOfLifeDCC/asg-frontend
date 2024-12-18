import {AfterViewInit, Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
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
import {SafeResourceUrl} from '@angular/platform-browser';
import {MatCard, MatCardActions, MatCardTitle} from '@angular/material/card';
import {Subject} from 'rxjs';
import {MatIcon} from '@angular/material/icon';


@Component({
  standalone: true,
  selector: 'dashboard-organism-details',
  templateUrl: './organism-details.component.html',
  imports: [
    MatTabsModule,
    MatFormFieldModule,
    MatPaginatorModule,
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
    MatIcon
  ],
  styleUrls: ['./organism-details.component.css']
})
export class OrganismDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild('metadataPaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  filterChanged = new EventEmitter<any>();
  bioSampleId: string;
  bioSampleObj: any;
  dataSourceRecords = new MatTableDataSource<any>([]);
  specBioSampleTotalCount = 0;
  specSymbiontsTotalCount = 0;
  specMetagenomesTotalCount = 0;
  dataSourceSymbiontsAssembliesCount = 0;
  dataSourceSymbiontsAssemblies;

  dataSourceMetagenomesAssembliesCount: number;
  dataSourceMetagenomesAssemblies: MatTableDataSource<any, MatPaginator>;
  specDisplayedColumns = ['accession', 'organism', 'commonName', 'sex', 'organismPart', 'trackingSystem'];
  private filterSubject = new Subject<string>();
  INSDC_ID = null;
  isSexFilterCollapsed = true;
  isTrackCollapsed = true;
  isOrganismPartCollapsed = true;
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
    trackingSystem: ''
  };
  geoLocation: boolean;
  orgGeoList: any;
  specGeoList: any;
  dataSourceFiles: MatTableDataSource<Sample, MatPaginator>;
  dataSourceFilesCount: number;
  dataSourceAssemblies: MatTableDataSource<any, MatPaginator>;
  dataSourceAssembliesCount: number;
  dataSourceAnnotation: MatTableDataSource<any, MatPaginator>;
  dataSourceAnnotationCount: number;
  dataSourceSymbiontsRecords: MatTableDataSource<any, MatPaginator>;
  dataSourceMetagenomesRecords: MatTableDataSource<any, MatPaginator>;
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
  @ViewChild('experimentsTable') exPaginator: MatPaginator;
  @ViewChild('assembliesTable') asPaginator: MatPaginator;
  @ViewChild('annotationTable') anPaginator: MatPaginator;

  @ViewChild('relatedSymbionts') symPaginator: MatPaginator;
  @ViewChild('assembliesSymbiontsTable') asSymPaginator: MatPaginator;
  @ViewChild('relatedMetagenomesTable') metPaginator: MatPaginator;
  @ViewChild('assembliesMetagenomesTable') asMetPaginator: MatPaginator;
  dataSourceGoatInfo;
  displayedColumnsGoatInfo = ['name', 'value', 'count', 'aggregation_method', 'aggregation_source'];
  private dataTabInitialized = false;
  aggregations;
  url: SafeResourceUrl;
  isOrganismsCollapsed = true ;
  isSymbiontsCollapsed: boolean;
  isMetagenomesCollapsed: boolean;

  constructor(private route: ActivatedRoute,
              private dashboardService: DashboardService) {
    this.route.params.subscribe(param => this.bioSampleId = param.id);
  }

  ngOnInit(): void {
    this.geoLocation = false;
    this.activeFilters = [];
    this.filterSize = 3;
    this.itemLimitSexFilter = this.filterSize;
    this.itemLimitOrgFilter = this.filterSize;
    this.itemLimitTrackFilter = this.filterSize;
    this.relatedRecords = [];
    this.filterJson.sex = '';
    this.filterJson.organismPart = '';
    this.filterJson.trackingSystem = '';
    this.getDisplayedColumns();
    this.getBiosampleByOrganism();
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
    this.filterChanged.subscribe(() => (this.paginator.pageIndex = 0));
  }

  ngAfterViewChecked() {
    const tabs = this.tabgroup._tabs.toArray();
    const dataTabIndex = tabs.findIndex((tab) => tab.textLabel === 'Data');

    if (
        !this.dataTabInitialized &&
        (this.dataSourceAnnotation?.data?.length ||
            this.dataSourceAssemblies?.data?.length ||
            this.dataSourceFiles?.data?.length)
    ) {
      this.tabgroup.selectedIndex = dataTabIndex;
      this.dataTabInitialized = true;
    }
  }

  getBiosampleByOrganism() {
    this.dashboardService.getRootOrganismById(this.bioSampleId, 'data_portal_test')
        .subscribe(
            data => {
              this.aggregations = data.aggregations;
              data = data['results'][0]['_source'];
              const unpackedData = [];
              const unpackedSymbiontsData = [];
              const unpackedMetagenomesData = [];
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
              if (data.goat_info) {
                this.dataSourceGoatInfo = data.goat_info.attributes;
              }
              for (const item of data.records) {
                unpackedData.push(this.unpackData(item));
              }
              if (data.symbionts_records && data.symbionts_records.length) {
                for (const item of data.symbionts_records) {
                  unpackedSymbiontsData.push(this.unpackData(item));
                }
              }
              if (data.metagenomes_records && data.metagenomes_records.length) {
                for (const item of data.metagenomes_records) {
                  unpackedMetagenomesData.push(this.unpackData(item));
                }
              }
              if (unpackedData.length > 0) {
                this.getFilters();
              }
              setTimeout(() => {
                this.organismName = data.organism;
                this.dataSourceRecords = new MatTableDataSource<any>(unpackedData);
                this.dataSourceSymbiontsRecords = new MatTableDataSource<any>(unpackedSymbiontsData);
                this.dataSourceMetagenomesRecords = new MatTableDataSource<any>(unpackedMetagenomesData);
                this.specBioSampleTotalCount = unpackedData?.length;
                this.specSymbiontsTotalCount = unpackedSymbiontsData?.length;
                this.specMetagenomesTotalCount = unpackedMetagenomesData?.length;


                if (data.experiment != null) {
                  this.dataSourceFiles = new MatTableDataSource<Sample>(data.experiment);
                  this.dataSourceFilesCount = data.experiment?.length;
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
                } else {
                  this.dataSourceSymbiontsAssemblies = new MatTableDataSource<Sample>();
                  this.dataSourceSymbiontsAssembliesCount = 0;
                }

                if (data.metagenomes_assemblies != null) {
                  this.dataSourceMetagenomesAssemblies = new MatTableDataSource<any>(data.metagenomes_assemblies);
                  this.dataSourceMetagenomesAssembliesCount = data.metagenomes_assemblies?.length;
                } else {
                  this.dataSourceMetagenomesAssemblies = new MatTableDataSource<Sample>();
                  this.dataSourceMetagenomesAssembliesCount = 0;
                }
                this.dataSourceRecords.paginator = this.paginator;
                this.dataSourceFiles.paginator = this.exPaginator;
                this.dataSourceAssemblies.paginator = this.asPaginator;
                this.dataSourceAnnotation.paginator = this.anPaginator;

                this.dataSourceSymbiontsRecords.paginator = this.symPaginator;
                this.dataSourceSymbiontsAssemblies.paginator = this.asSymPaginator;
                this.dataSourceMetagenomesRecords.paginator = this.metPaginator;
                this.dataSourceMetagenomesAssemblies.paginator = this.asMetPaginator;

                this.dataSourceRecords.sort = this.sort;
                this.dataSourceFiles.sort = this.sort;
                this.dataSourceAssemblies.sort = this.sort;
                this.dataSourceAnnotation.sort = this.sort;
              }, 100);
            },
            err => console.log(err)
        );
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
    this.dataSourceSymbiontsRecords.filter = filterValue.trim().toLowerCase();
  }

  symbiontsAssembliesSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSymbiontsAssemblies.filter = filterValue.trim().toLowerCase();
  }

  metagenomesRecordsSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceMetagenomesRecords.filter = filterValue.trim().toLowerCase();
  }

  metagenomesAssembliesSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceMetagenomesAssemblies.filter = filterValue.trim().toLowerCase();
  }

  unpackData(data: any) {
    const dataToReturn = {};
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if (key === 'organism') {
        dataToReturn[key] = data.organism.text;
      } else {
        if (key === 'commonName' && data[key] == null) {
          dataToReturn[key] = '-';
        } else {
          dataToReturn[key] = data[key];
        }
      }
    }
    return dataToReturn;
  }

  getFiltersForSelectedFilter(data: any) {
    const metadataFilters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    const symbiontsFilters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    const metagenomeFilters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    this.metadataSexFilters = [];
    this.metadataTrackingSystemFilters = [];
    this.metadataOrganismPartFilters = [];

    this.symbiontsSexFilters = [];
    this.symbiontsTrackingSystemFilters = [];
    this.symbiontsOrganismPartFilters = [];

    this.metagenomesSexFilters = [];
    this.metagenomesTrackingSystemFilters = [];
    this.metagenomesOrganismPartFilters = [];

    this.metadataFilters = metadataFilters;
    this.metagenomeFilters = metagenomeFilters;
    this.metagenomeFilters = metagenomeFilters;
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

      this.metadataFilters = metadataFilters;
      const sexFilterObj = Object.entries(this.metadataFilters.sex);
      const trackFilterObj = Object.entries(this.metadataFilters.trackingSystem);
      const orgFilterObj = Object.entries(this.metadataFilters.organismPart);
      const j = 0;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < sexFilterObj.length; i++) {
        const jsonObj = {key: sexFilterObj[i][j], doc_count: sexFilterObj[i][j + 1]};
        this.metadataSexFilters.push(jsonObj);
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < trackFilterObj.length; i++) {
        const jsonObj = {key: trackFilterObj[i][j], doc_count: trackFilterObj[i][j + 1]};
        this.metadataTrackingSystemFilters.push(jsonObj);
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < orgFilterObj.length; i++) {
        const jsonObj = {key: orgFilterObj[i][j], doc_count: orgFilterObj[i][j + 1]};
        this.metadataOrganismPartFilters.push(jsonObj);
      }

      this.symbiontsFilters = symbiontsFilters;
      const symbiontsSexFilterObj = Object.entries(this.symbiontsFilters.sex);
      const symbiontsTrackFilterObj = Object.entries(this.symbiontsFilters.trackingSystem);
      const symbiontsOrgFilterObj = Object.entries(this.symbiontsFilters.organismPart);
      const k = 0;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < symbiontsSexFilterObj.length; i++) {
        const jsonObj = {key: symbiontsSexFilterObj[i][k], doc_count: symbiontsSexFilterObj[i][k + 1]};
        this.symbiontsSexFilters.push(jsonObj);
        console.log(jsonObj);
      }

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < symbiontsTrackFilterObj.length; i++) {
        const jsonObj = {key: symbiontsTrackFilterObj[i][k], doc_count: symbiontsTrackFilterObj[i][k + 1]};
        this.symbiontsTrackingSystemFilters.push(jsonObj);
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < symbiontsOrgFilterObj.length; i++) {
        const jsonObj = {key: symbiontsOrgFilterObj[i][k], doc_count: symbiontsOrgFilterObj[i][k + 1]};
        this.symbiontsOrganismPartFilters.push(jsonObj);
      }

      this.metagenomeFilters = metagenomeFilters;
      const metagenomeSexFilterObj = Object.entries(this.metagenomeFilters.sex);
      const metagenomeTrackFilterObj = Object.entries(this.metagenomeFilters.trackingSystem);
      const metagenomeOrgFilterObj = Object.entries(this.metagenomeFilters.organismPart);
      const l = 0;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < metagenomeSexFilterObj.length; i++) {
        const jsonObj = {key: metagenomeSexFilterObj[i][l], doc_count: metagenomeSexFilterObj[i][l + 1]};
        this.metagenomesSexFilters.push(jsonObj);
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < metagenomeTrackFilterObj.length; i++) {
        const jsonObj = {key: metagenomeTrackFilterObj[i][l], doc_count: metagenomeTrackFilterObj[i][l + 1]};
        this.metadataTrackingSystemFilters.push(jsonObj);
      }
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < metagenomeOrgFilterObj.length; i++) {
        const jsonObj = {key: metagenomeOrgFilterObj[i][l], doc_count: metagenomeOrgFilterObj[i][l + 1]};
        this.metagenomesOrganismPartFilters.push(jsonObj);
      }

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

  getSearchResults(from?, size?) {
    $('.sex-inactive').removeClass('non-disp active');
    $('.tracking-status-inactive').removeClass('non-disp active');
    $('.org-part-inactive').removeClass('non-disp active');
    // tslint:disable-next-line:triple-equals
    if (this.searchText.length == 0) {
      this.getBiosampleByOrganism();
    } else {
      this.activeFilters = [];
      this.dataSourceRecords.filter = this.searchText.trim();
      this.dataSourceRecords.filterPredicate = ((data, filter) => {
        const a = !filter || data.sex.toLowerCase().includes(filter.toLowerCase());
        const b = !filter || data.organismPart.toLowerCase().includes(filter.toLowerCase());
        const c = !filter || data.trackingSystem.toLowerCase().includes(filter.toLowerCase());
        const d = !filter || data.accession.toLowerCase().includes(filter.toLowerCase());
        const e = !filter || data.commonName.toLowerCase().includes(filter.toLowerCase());
        return a || b || c || d || e;
        // tslint:disable-next-line:variable-name
      }) as (PeriodicElement, string) => boolean;
      this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
    }
  }

  checkFilterIsActive(filterValue: string) {
    if (this.activeFilters.includes(filterValue)) {
      return 'active';
    } else {
      return '';
    }

  }


  removeFilter(filter: string) {
    if (filter !== undefined) {
      const filterIndex = this.activeFilters.indexOf(filter);
      if (this.activeFilters.length !== 0) {
        this.spliceFilterArray(filter);
        this.activeFilters.splice(filterIndex, 1);
        // this.dataSourceRecords.filter = this.filterJson;
        this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
      } else {
        this.filterJson.sex = '';
        this.filterJson.organismPart = '';
        // this.dataSourceRecords.filter = this.filterJson;
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
    }
  }

  // onFilterClick(event, label: string, filter: string) {
  //   this.searchText = '';
  //   // const inactiveClassName = label.toLowerCase().replace(' ', '-') + '-inactive';
  //   // this.createFilterJson(label.toLowerCase().replace(' ', ''), filter);
  //   // const filterIndex = this.activeFilters.indexOf(filter);
  //   //
  //   // if (filterIndex !== -1) {
  //   //   $('.' + inactiveClassName).removeClass('non-disp');
  //   //   this.removeFilter(filter);
  //   // } else {
  //   //   this.activeFilters.push(filter);
  //   //   this.dataSourceRecords.filter = this.filterJson;
  //   //   this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
  //   //   $('.' + inactiveClassName).addClass('non-disp');
  //   //   $(event.target).removeClass('non-disp');
  //   //   $(event.target).addClass('disp');
  //   //   $(event.target).addClass('active');
  //   // }
  //   this.filterChanged.emit();
  // }
  createFilterJson(key, value) {
    if (key === 'sex') {
      this.filterJson.sex = value;
    }
    else if (key === 'organismpart') {
      this.filterJson.organismPart = value;
    }
    this.dataSourceRecords.filterPredicate = ((data, filter) => {
      const a = !filter.sex || data.sex === filter.sex;
      const b = !filter.organismPart || data.organismPart === filter.organismPart;
      return a && b;
      // tslint:disable-next-line:variable-name
    }) as (PeriodicElement, string) => boolean;
  }


  toggleCollapse(table: string): void {
    switch (table) {
      case 'organisms':
        this.isOrganismsCollapsed = !this.isOrganismsCollapsed;
        break;
      case 'symbionts':
        this.isSymbiontsCollapsed = !this.isSymbiontsCollapsed;
        break;
      case 'metagenomes':
        this.isMetagenomesCollapsed = !this.isMetagenomesCollapsed;
        break;
    }
  }


  removeAllFilters() {
    $('.sex-inactive').removeClass('non-disp');
    $('.org-part-inactive').removeClass('non-disp');
    this.activeFilters = [];
    this.filterJson.sex = '';
    this.filterJson.organismPart = '';
    // this.dataSourceRecords.filter = this.filterJson;
    this.filterChanged.emit();
    this.getBiosampleByOrganism();
  }

  applyFilter(filterValue: string, dataSource: MatTableDataSource<any>): void {
    const index = this.activeFilters.indexOf(filterValue);
    index !== -1 ? this.activeFilters.splice(index, 1) : this.activeFilters.push(filterValue);
    dataSource.filter = filterValue.toLowerCase();
  }

  onFilterClick(filterValue: string) {
    //   const index = this.activeFilters.indexOf(filterValue);
    //   index !== -1 ? this.activeFilters.splice(index, 1) : this.activeFilters.push(filterValue);
    //
    //   this.filterChanged.pipe(debounceTime(300)).subscribe(filterValue => {
    //     this.dataSourceRecords = this.dataSourceRecords.filter((item: { name: string; }) =>
    //         console.log(item ));
    // });
      // this.filterChanged.emit();
    }

  checkStyle(filterValue: string) {
    if (this.activeFilters.includes(filterValue)) {
      return 'background-color: #4BBEFD;';
    } else {
      return '';
    }
  }

}
