import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Sample } from '../../model/dashboard.model';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DashboardService } from '../../services/dashboard.service';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MapClusterComponent} from '../../map-cluster/map-cluster.component';
import {SafeResourceUrl} from '@angular/platform-browser';
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
    MatIcon
  ],
  styleUrls: ['./organism-details.component.css']
})
export class OrganismDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  bioSampleId: string;
  bioSampleObj: any;
  dataSourceRecords;
  specBioSampleTotalCount = 0;
  specSymbiontsTotalCount = 0;
  specMetagenomesTotalCount = 0;
  dataSourceSymbiontsAssembliesCount = 0;
  dataSourceSymbiontsAssemblies;
  dataSourceMetagenomesAssembliesCount: number;
  dataSourceMetagenomesAssemblies: MatTableDataSource<any, MatPaginator>;
  specDisplayedColumns = ['accession', 'organism', 'commonName', 'sex', 'organismPart', 'trackingSystem'];
  INSDC_ID = null;
  itemLimitSexFilter: number;
  itemLimitOrgFilter: number;
  itemLimitTrackFilter: number;
  filterSize: number;
  searchText = '';
  activeFilters = [];
  filters = {
    sex: {},
    trackingSystem: {},
    organismPart: {}
  };
  sexFilters = [];
  trackingSystemFilters = [];
  organismPartFilters = [];
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
  @ViewChild('relatedMetagenomes') metPaginator: MatPaginator;
  @ViewChild('assembliesMetagenomesTable') asMetPaginator: MatPaginator;
  dataSourceGoatInfo;
  displayedColumnsGoatInfo = ['name', 'value', 'count', 'aggregation_method', 'aggregation_source'];
  private dataTabInitialized = false;
  aggregations;
  url: SafeResourceUrl;
  mgnifyIDs: any[] = [];
  mgnifyDownloadLinks: any[] = [];


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
  }

  ngAfterViewChecked() {
    const tabs = this.tabgroup._tabs.toArray();
    const dataTabIndex = tabs.findIndex((tab) => tab.textLabel === "Data");

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

              // get MGnify IDs in metagenomes records
              this.mgnifyIDs = data['metagenomes_records']
                  .filter( obj => obj.hasOwnProperty('mgnify_study_ids'))
                  .map(obj => obj['mgnify_study_ids']);

              for (const studyId of this.mgnifyIDs) {
                this.fetchMGnifyDownloadLinks(studyId);
              }


              setTimeout(() => {
                this.organismName = data.organism;
                this.dataSourceRecords = new MatTableDataSource<any>(unpackedData);
                this.dataSourceSymbiontsRecords = new MatTableDataSource<any>(unpackedSymbiontsData);
                this.dataSourceMetagenomesRecords = new MatTableDataSource<any>(unpackedMetagenomesData);
                this.specBioSampleTotalCount = unpackedData?.length;
                this.specSymbiontsTotalCount = unpackedSymbiontsData?.length;
                this.specMetagenomesTotalCount = unpackedMetagenomesData?.length;
                this.dataSourceRecords.paginator = this.paginator;

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
              }, 50);
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
    const filters = {
      sex: {},
      trackingSystem: {},
      organismPart: {}
    };
    this.sexFilters = [];
    this.trackingSystemFilters = [];
    this.organismPartFilters = [];

    this.filters = filters;
    for (const item of data) {
      if (item.sex != null) {
        if (item.sex in filters.sex) {
          filters.sex[item.sex] += 1;
        } else {
          filters.sex[item.sex] = 1;
        }
      }
      if (item.trackingSystem != null) {
        if (item.trackingSystem in filters.trackingSystem) {
          filters.trackingSystem[item.trackingSystem] += 1;
        } else {
          filters.trackingSystem[item.trackingSystem] = 1;
        }
      }

      if (item.organismPart != null) {
        if (item.organismPart in filters.organismPart) {
          filters.organismPart[item.organismPart] += 1;
        } else {
          filters.organismPart[item.organismPart] = 1;
        }
      }
    }
    this.filters = filters;
    const sexFilterObj = Object.entries(this.filters.sex);
    const trackFilterObj = Object.entries(this.filters.trackingSystem);
    const orgFilterObj = Object.entries(this.filters.organismPart);
    const j = 0;
    for (let i = 0; i < sexFilterObj.length; i++) {
      const jsonObj = { key: sexFilterObj[i][j], doc_count: sexFilterObj[i][j + 1] };
      this.sexFilters.push(jsonObj);
    }
    for (let i = 0; i < trackFilterObj.length; i++) {
      const jsonObj = { key: trackFilterObj[i][j], doc_count: trackFilterObj[i][j + 1] };
      this.trackingSystemFilters.push(jsonObj);
    }
    for (let i = 0; i < orgFilterObj.length; i++) {
      const jsonObj = { key: orgFilterObj[i][j], doc_count: orgFilterObj[i][j + 1] };
      this.organismPartFilters.push(jsonObj);
    }
  }

  getFilters(organism) {
    this.sexFilters = this.aggregations.filters.sex_filter.buckets;
    this.trackingSystemFilters = this.aggregations.filters.tracking_status_filter.buckets;
    this.organismPartFilters = this.aggregations.filters.
        organism_part_filter.buckets;
  }

  getSearchResults(from?, size?) {
    $('.sex-inactive').removeClass('non-disp active');
    $('.tracking-status-inactive').removeClass('non-disp active');
    $('.org-part-inactive').removeClass('non-disp active');
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
      }) as (PeriodicElement, string) => boolean;
      this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
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
}
