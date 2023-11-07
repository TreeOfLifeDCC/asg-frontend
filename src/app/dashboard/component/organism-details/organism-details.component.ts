import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Sample, samples } from '../../model/dashboard.model';
import { MatSort } from '@angular/material/sort';


import { DashboardService } from '../../services/dashboard.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {MatPaginator} from "@angular/material/paginator";
import {MatTabGroup} from "@angular/material/tabs";
import {MatTableDataSource} from "@angular/material/table";


@Component({
  selector: 'dashboard-organism-details',
  templateUrl: './organism-details.component.html',
  styleUrls: ['./organism-details.component.css']
})
export class OrganismDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  bioSampleId: string;
  bioSampleObj;
  dataSourceRecords;
  specBioSampleTotalCount;
  specSymbiontsTotalCount;
  specMetagenomesTotalCount;
  dataSourceSymbiontsAssembliesCount;
  dataSourceSymbiontsAssemblies;

  dataSourceMetagenomesAssembliesCount;
  dataSourceMetagenomesAssemblies;
  specDisplayedColumns = ['accession', 'organism', 'commonName', 'sex', 'organismPart', 'trackingSystem'];

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
  filtersMap;
  filters = {
    sex: {},
    trackingSystem: {},
    organismPart: {}
  };
  sexFilters = [];
  trackingSystemFilters = [];
  organismPartFilters = [];
  unpackedData;
  unpackedSymbiontsData
  unpackedMetagenomesData
  organismName;
  relatedRecords;
  filterJson = {
    sex: "",
    organismPart: "",
    trackingSystem: ""
  };
  geoLocation: Boolean;
  orgGeoList: any
  specGeoList: any
  dataSourceFiles;
  dataSourceFilesCount;
  dataSourceAssemblies;
  dataSourceAssembliesCount;
  dataSourceAnnotation;
  dataSourceAnnotationCount;
  dataSourceSymbiontsRecords;
  dataSourceMetagenomesRecords;
  assembliesurls =[]
  annotationsurls =[]
  experimentColumnsDefination = [{column: "study_accession", selected: true},
    {column: "secondary_study_accession", selected: false},
    {column: "sample_accession", selected: true},
    {column: "secondary_sample_accession", selected: false},
    {column: "experiment_accession", selected: true},
    {column: "run_accession", selected: true},
    {column: "submission_accession", selected: false},
    {column: "tax_id", selected: false},
    {column: "scientific_name", selected: false},
    {column: "instrument_platform", selected: false},
    {column: "instrument_model", selected: false},
    {column: "library_name", selected: false},
    {column: "nominal_length", selected: false},
    {column: "library_layout", selected: false},
    {column: "library_strategy", selected: false},
    {column: "library_source", selected: false},
    {column: "library_selection", selected: false},
    {column: "read_count", selected: false},
    {column: "base_count", selected: false},
    {column: "center_name", selected: false},
    {column: "first_public", selected: false},
    {column: "last_updated", selected: false},
    {column: "experiment_title", selected: false},
    {column: "study_title", selected: false},
    {column: "study_alias", selected: false},
    {column: "experiment_alias", selected: false},
    {column: "run_alias", selected: false},
    {column: "fastq_bytes", selected: false},
    {column: "fastq_md5", selected: false},
    {column: "fastq_ftp", selected: true},
    {column: "fastq_aspera", selected: false},
    {column: "fastq_galaxy", selected: false},
    {column: "submitted_bytes", selected: false},
    {column: "submitted_md5", selected: false},
    {column: "submitted_ftp", selected: true},
    {column: "submitted_aspera", selected: false},
    {column: "submitted_galaxy", selected: false},
    {column: "submitted_format", selected: false},
    {column: "sra_bytes", selected: false},
    {column: "sra_md5", selected: false},
    {column: "sra_ftp", selected: false},
    {column: "sra_aspera", selected: false},
    {column: "sra_galaxy", selected: false},
    {column: "cram_index_ftp", selected: false},
    {column: "cram_index_aspera", selected: false},
    {column: "cram_index_galaxy", selected: false},
    {column: "sample_alias", selected: false},
    {column: "broker_name", selected: false},
    {column: "sample_title", selected: false},
    {column: "nominal_sdev", selected: false},
    {column: "first_created", selected: false},
    {column: "library_construction_protocol", selected: true}]
  private ENA_PORTAL_API_BASE_URL_FASTA = "https://www.ebi.ac.uk/ena/browser/api/fasta/"
  displayedColumnsFiles = [];
  displayedColumnsAssemblies = ['accession', 'assembly_name', 'description', 'version'];
  displayedColumnsAnnotation = ['accession', 'annotation', 'proteins', 'transcripts', 'softmasked_genome',
    'other_data', 'view_in_browser'];
  @ViewChild("tabgroup", { static: false }) tabgroup: MatTabGroup;
  @ViewChild('experimentsTable') exPaginator: MatPaginator;
  @ViewChild('assembliesTable') asPaginator: MatPaginator;
  @ViewChild('annotationTable') anPaginator: MatPaginator;

  @ViewChild('relatedSymbionts') symPaginator: MatPaginator;
  @ViewChild('assembliesSymbiontsTable') asSymPaginator: MatPaginator;
  @ViewChild('relatedMetagenomes') metPaginator: MatPaginator;
  @ViewChild('assembliesMetagenomesTable') asMetPaginator: MatPaginator;

  constructor(private route: ActivatedRoute,
              private dashboardService: DashboardService,
              private spinner: NgxSpinnerService,
              private router: Router) {
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
    this.filterJson['sex'] = '';
    this.filterJson['organismPart'] = '';
    this.filterJson['trackingSystem'] = '';
    this.getDisplayedColumns();
    this.getBiosampleByOrganism();

  }

  getDisplayedColumns() {
    this.displayedColumnsFiles = [];
    this.experimentColumnsDefination.forEach(obj => {
      if(obj.selected) {
        this.displayedColumnsFiles.push(obj.column)
      }
    });
  }

  expanded() {
  }

  showSelectedColumn(selectedColumn, checked) {
    let index = this.experimentColumnsDefination.indexOf(selectedColumn);
    let item = this.experimentColumnsDefination[index];
    item.selected = checked;
    this.experimentColumnsDefination[index] = item;
    this.getDisplayedColumns();
    this.getBiosampleByOrganism();
  }

  ngAfterViewInit(): void {
  }

  getBiosampleByOrganism() {
    this.dashboardService.getRootOrganismById(this.bioSampleId)
      .subscribe(
        data => {
          const unpackedData = [];
          const unpackedSymbiontsData = [];
          const unpackedMetagenomesData = [];
          this.bioSampleObj = data;
          this.orgGeoList = data.orgGeoList;
          this.specGeoList = data.specGeoList;
          if (this.orgGeoList!= undefined && this.orgGeoList.length != 0) {
            this.geoLocation = true;
            setTimeout(() => {
              const tabGroup = this.tabgroup;
              const selected = this.tabgroup.selectedIndex
              tabGroup.selectedIndex = 4
              setTimeout(() => {
                tabGroup.selectedIndex = selected;
              }, 1);
            }, 400);
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
            this.getFilters(data.organism);
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
            }
            else {
              this.dataSourceFiles = new MatTableDataSource<Sample>();
              this.dataSourceFilesCount = 0;
            }
            if (data.assemblies != null) {
              this.dataSourceAssemblies = new MatTableDataSource<any>(data.assemblies);
              this.dataSourceAssembliesCount = data.assemblies?.length;
              for (let i = 0; i < data.assemblies.length ; i++) {
                this.assembliesurls.push(
                    this.ENA_PORTAL_API_BASE_URL_FASTA+data.assemblies[i].accession+"?download=true&gzip=true");
              }
            }
            else {
              this.dataSourceAssemblies = new MatTableDataSource<Sample>();
              this.dataSourceAssembliesCount = 0;
            }
            if (data.annotation != null) {
              this.dataSourceAnnotation = new MatTableDataSource<any>(data.annotation);
              this.dataSourceAnnotationCount = data.annotation?.length;
              for (let i = 0; i < data.annotation.length ; i++) {
                this.annotationsurls.push(
                    this.ENA_PORTAL_API_BASE_URL_FASTA+data.annotation[i].accession+"?download=true&gzip=true");
              }
            }
            else {
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
          }, 50)
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRecords.filter = filterValue.trim().toLowerCase();
  }

  unpackData(data: any) {
    const dataToReturn = {};
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if (key === 'organism') {
        dataToReturn[key] = data.organism.text;
      }
      else {
        if (key === 'commonName' && data[key] == null) {
          dataToReturn[key] = "-"
        }
        else {
          dataToReturn[key] = data[key];
        }
      }
    }
    return dataToReturn;
  }

  checkFilterIsActive(filter: string) {
    if (this.activeFilters.indexOf(filter) !== -1) {
      return 'active';
    }

  }

  onFilterClick(event, label: string, filter: string) {
    this.searchText = '';
    let inactiveClassName = label.toLowerCase().replace(" ", "-") + '-inactive';
    this.createFilterJson(label.toLowerCase().replace(" ", ""), filter);
    const filterIndex = this.activeFilters.indexOf(filter);

    if (filterIndex !== -1) {
      $('.' + inactiveClassName).removeClass('non-disp');
      this.removeFilter(filter);
    } else {
      this.activeFilters.push(filter);
      this.dataSourceRecords.filter = this.filterJson;
      this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
      $('.' + inactiveClassName).addClass('non-disp');
      $(event.target).removeClass('non-disp');
      $(event.target).addClass('disp');
      $(event.target).addClass('active');
    }
  }

  createFilterJson(key, value) {
    if (key === 'sex') {
      this.filterJson['sex'] = value;
    }
    else if (key === 'organismpart') {
      this.filterJson['organismPart'] = value;
    }
    else if (key === 'trackingstatus') {
      this.filterJson['trackingSystem'] = value;
    }
    this.dataSourceRecords.filterPredicate = ((data, filter) => {
      const a = !filter.sex || data.sex === filter.sex;
      const b = !filter.organismPart || data.organismPart === filter.organismPart;
      const c = !filter.trackingSystem || data.trackingSystem === filter.trackingSystem;
      return a && b && c;
    }) as (PeriodicElement, string) => boolean;
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
    let j = 0;
    for (let i = 0; i < sexFilterObj.length; i++) {
      let jsonObj = { "key": sexFilterObj[i][j], doc_count: sexFilterObj[i][j + 1] };
      this.sexFilters.push(jsonObj);
    }
    for (let i = 0; i < trackFilterObj.length; i++) {
      let jsonObj = { "key": trackFilterObj[i][j], doc_count: trackFilterObj[i][j + 1] };
      this.trackingSystemFilters.push(jsonObj);
    }
    for (let i = 0; i < orgFilterObj.length; i++) {
      let jsonObj = { "key": orgFilterObj[i][j], doc_count: orgFilterObj[i][j + 1] };
      this.organismPartFilters.push(jsonObj);
    }
  }

  removeAllFilters() {
    $('.sex-inactive').removeClass('non-disp');
    $('.tracking-status-inactive').removeClass('non-disp');
    $('.org-part-inactive').removeClass('non-disp');
    this.activeFilters = [];
    this.filterJson['sex'] = '';
    this.filterJson['organismPart'] = '';
    this.filterJson['trackingSystem'] = '';
    this.dataSourceRecords.filter = this.filterJson;
    this.getBiosampleByOrganism();
  }

  removeFilter(filter: string) {
    if (filter != undefined) {
      const filterIndex = this.activeFilters.indexOf(filter);
      if (this.activeFilters.length !== 0) {
        this.spliceFilterArray(filter);
        this.activeFilters.splice(filterIndex, 1);
        this.dataSourceRecords.filter = this.filterJson;
        this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
      } else {
        this.filterJson['sex'] = '';
        this.filterJson['organismPart'] = '';
        this.filterJson['trackingSystem'] = '';
        this.dataSourceRecords.filter = this.filterJson;
        this.getBiosampleByOrganism();
      }
    }
  }

  spliceFilterArray(filter: string) {
    if (this.filterJson['sex'] === filter) {
      this.filterJson['sex'] = '';
    }
    else if (this.filterJson['organismPart'] === filter) {
      this.filterJson['organismPart'] = '';
    }
    else if (this.filterJson['trackingSystem'] === filter) {
      this.filterJson['trackingSystem'] = '';
    }
  }

  // tslint:disable-next-line:typedef
  getFilters(organism) {
    this.dashboardService.getDetailTableOrganismFilters(organism).subscribe(
      data => {
        this.filtersMap = data;
        this.sexFilters = this.filtersMap.sex.filter(i => i !== "");
        this.trackingSystemFilters = this.filtersMap.trackingSystem.filter(i => i !== "");
        this.organismPartFilters = this.filtersMap.organismPart.filter(i => i !== "");
      },
      err => console.log(err)
    );


  }

  getStatusClass(status: string) {
    if (status === 'Annotation Complete') {
      return 'badge badge-pill badge-success';
    } else {
      return 'badge badge-pill badge-warning'
    }
  }

  getSearchResults(from?, size?) {
    $('.sex-inactive').removeClass('non-disp active');
    $('.tracking-status-inactive').removeClass('non-disp active');
    $('.org-part-inactive').removeClass('non-disp active');
    if (this.searchText.length == 0) {
      this.getBiosampleByOrganism();
    }
    else {
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

  toggleCollapse(filterKey) {
    if (filterKey == 'Sex') {
      if (this.isSexFilterCollapsed) {
        this.itemLimitSexFilter = 10000;
        this.isSexFilterCollapsed = false;
      } else {
        this.itemLimitSexFilter = 3;
        this.isSexFilterCollapsed = true;
      }
    }
    else if (filterKey == 'Tracking Status') {
      if (this.isTrackCollapsed) {
        this.itemLimitTrackFilter = 10000;
        this.isTrackCollapsed = false;
      } else {
        this.itemLimitTrackFilter = 3;
        this.isTrackCollapsed = true;
      }
    }
    else if (filterKey == 'Organism Part') {
      if (this.isOrganismPartCollapsed) {
        this.itemLimitOrgFilter = 10000;
        this.isOrganismPartCollapsed = false;
      } else {
        this.itemLimitOrgFilter = 3;
        this.isOrganismPartCollapsed = true;
      }
    }
  }

  redirectTo(accession: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(["/data/root/details/" + accession]));
  }

  downloadRawFiles(): void {
    this.dashboardService.downloadFastaq(this.INSDC_ID);
  }

  downloadAnnotation(): void {
    this.download_files(this.annotationsurls);

  }

  downloadAssemblies(): void {
    this.download_files(this.assembliesurls);
  }

  download_files(files) {
    function download_next(i) {
      if (i >= files.length) {
        return;
      }
      var a = document.createElement('a');
      a.href = files[i];
      a.target = '_parent';
      // Use a.download if available, it prevents plugins from opening.
      if ('download' in a) {
        a.download = files[i].filename;
      }
      // Add a to the doc for click to work.
      (document.body || document.documentElement).appendChild(a);
      if (a.click) {
        a.click(); // The click method is supported by most browsers.
      } else {
        $(a).click(); // Backup using jquery
      }
      // Delete the temporary link.
      a.parentNode.removeChild(a);
      // Download the next file with a small timeout. The timeout is necessary
      // for IE, which will otherwise only download the first file.
      setTimeout(function() {
        download_next(i + 1);
      }, 500);
    }
    // Initiate the first download.
    download_next(0);
  }
}
