import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource, MatTableModule
} from '@angular/material/table';
import { DashboardService } from '../../services/dashboard.service';
import { NgClass } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


interface BioSample {
  accession: string;
  organism: string;
  commonName?: string;
  sex?: string;
  organismPart?: string;
  specimens?: any[];
  [key: string]: any;
}

interface Filter {
  key: string;
  doc_count: number;
}

@Component({
  standalone: true,
  selector: 'app-details',
  templateUrl: './details.component.html',
  imports: [
    MatFormField,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    RouterLink,
    MatTable,
    MatHeaderRow,
    MatRow,
    MatPaginator,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderCellDef,
    NgClass,
    MatInputModule
  ],
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  bioSampleId: string;
  bioSampleObj: BioSample | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSourceRecords = new MatTableDataSource<BioSample>([]);
  specBioSampleTotalCount = 0;
  specDisplayedColumns: string[] = ['accession', 'organism', 'commonName', 'sex', 'organismPart'];

  isSexFilterCollapsed = true;
  isOrganismPartCollapsed = true;
  itemLimitSexFilter!: number;
  itemLimitOrgFilter!: number;
  filterSize!: number;
  searchText = '';
  activeFilters: string[] = [];
  filtersMap: { sex: Filter[]; organismPart: Filter[] } = { sex: [], organismPart: [] };
  filters = {
    sex: {} as Record<string, number>,
    organismPart: {} as Record<string, number>
  };
  sexFilters: Filter[] = [];
  organismPartFilters: Filter[] = [];
  organismName: string | undefined;
  relatedRecords: any[] = [];
  filterJson = {
    sex: '',
    organismPart: ''
  };

  constructor(
      private route: ActivatedRoute,
      private dashboardService: DashboardService,
      private router: Router
  ) {
    this.route.params.subscribe(param => (this.bioSampleId = param.id));
  }

  ngOnInit(): void {
    this.activeFilters = [];
    this.filterSize = 3;
    this.itemLimitSexFilter = this.filterSize;
    this.itemLimitOrgFilter = this.filterSize;
    this.relatedRecords = [];
    this.filterJson.sex = '';
    this.filterJson.organismPart = '';
    this.getBiosamples();
  }

  getBiosamples(): void {
    this.dashboardService.getBiosampleByAccession(this.bioSampleId).subscribe(
        (data: any) => {
          const unpackedData: BioSample[] = [];
          for (const item of data.hits.hits) {
            unpackedData.push(this.unpackData(item));
          }
          this.bioSampleObj = unpackedData[0];
          if (this.bioSampleObj.specimens?.length > 0) {
            this.bioSampleObj.specimens.filter(obj => {
              if (obj.commonName == null) {
                obj.commonName = '-';
              }
            });
            this.getFiltersForSelectedFilter(this.bioSampleObj.specimens);
          }
          setTimeout(() => {
            this.organismName = data.organism;
            this.dataSourceRecords = new MatTableDataSource<BioSample>(this.bioSampleObj?.specimens ?? []);
            this.specBioSampleTotalCount = unpackedData?.length;
            this.dataSourceRecords.paginator = this.paginator;
            this.dataSourceRecords.sort = this.sort;
          }, 50);
        },
        err => console.log(err)
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRecords.filter = filterValue.trim().toLowerCase();
  }

  unpackData(data: any): BioSample {
    const dataToReturn: BioSample = {} as BioSample;
    if (data.hasOwnProperty('_source')) {
      data = data._source;
    }
    for (const key of Object.keys(data)) {
      if (key === 'organism') {
        dataToReturn[key] = data.organism.text;
      } else {
        dataToReturn[key] = data[key] != null ? data[key] : '-';
      }
    }
    return dataToReturn;
  }

  checkFilterIsActive(filter: string): string {
    return this.activeFilters.indexOf(filter) !== -1 ? 'active' : '';
  }

  onFilterClick(event: Event, label: string, filter: string): void {
    this.searchText = '';
    const inactiveClassName = label.toLowerCase().replace(' ', '-') + '-inactive';
    this.createFilterJson(label.toLowerCase().replace(' ', ''), filter);
    const filterIndex = this.activeFilters.indexOf(filter);

    if (filterIndex !== -1) {
      $('.' + inactiveClassName).removeClass('non-disp');
      this.removeFilter(filter);
    } else {
      this.activeFilters.push(filter);
      this.dataSourceRecords.filter = JSON.stringify(this.filterJson);
      this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
      $('.' + inactiveClassName).addClass('non-disp');
      $(event.target).removeClass('non-disp');
      $(event.target).addClass('disp');
      $(event.target).addClass('active');
    }
  }

  createFilterJson(key: string, value: string): void {
    if (key === 'sex') {
      this.filterJson.sex = value;
    } else if (key === 'organismpart') {
      this.filterJson.organismPart = value;
    }
    this.dataSourceRecords.filterPredicate = ((data: BioSample, filter: string) => {
      const parsedFilter = JSON.parse(filter);
      const a = !parsedFilter.sex || data.sex === parsedFilter.sex;
      const b = !parsedFilter.organismPart || data.organismPart === parsedFilter.organismPart;
      return a && b;
    }) as (PeriodicElement: BioSample, string) => boolean;
  }

  getFiltersForSelectedFilter(data: BioSample[]): void {
    const filters = {
      sex: {} as Record<string, number>,
      organismPart: {} as Record<string, number>
    };
    this.sexFilters = [];
    this.organismPartFilters = [];

    this.filters = filters;
    for (const item of data) {
      if (item.sex != null) {
        filters.sex[item.sex] = filters.sex[item.sex] ? filters.sex[item.sex] + 1 : 1;
      }
      if (item.organismPart != null) {
        filters.organismPart[item.organismPart] = filters.organismPart[item.organismPart]
            ? filters.organismPart[item.organismPart] + 1
            : 1;
      }
    }
    this.filters = filters;
    this.sexFilters = Object.entries(this.filters.sex)
        .map(([key, doc_count]) => ({ key, doc_count }))
        .filter(filter => filter.key !== '');
    this.organismPartFilters = Object.entries(this.filters.organismPart)
        .map(([key, doc_count]) => ({ key, doc_count }))
        .filter(filter => filter.key !== '');
  }

  removeAllFilters(): void {
    $('.sex-inactive').removeClass('non-disp');
    $('.org-part-inactive').removeClass('non-disp');
    this.activeFilters = [];
    this.filterJson.sex = '';
    this.filterJson.organismPart = '';
    this.dataSourceRecords.filter = JSON.stringify(this.filterJson);
    this.getBiosamples();
  }

  removeFilter(filter: string): void {
    if (filter !== undefined) {
      const filterIndex = this.activeFilters.indexOf(filter);
      if (this.activeFilters.length !== 0) {
        this.spliceFilterArray(filter);
        this.activeFilters.splice(filterIndex, 1);
        this.dataSourceRecords.filter = JSON.stringify(this.filterJson);
        this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
      } else {
        this.filterJson.sex = '';
        this.filterJson.organismPart = '';
        this.dataSourceRecords.filter = JSON.stringify(this.filterJson);
        this.getBiosamples();
      }
    }
  }

  spliceFilterArray(filter: string): void {
    if (this.filterJson.sex === filter) {
      this.filterJson.sex = '';
    } else if (this.filterJson.organismPart === filter) {
      this.filterJson.organismPart = '';
    }
  }

  getFilters(accession: string): void {
    this.dashboardService.getSpecimenFilters(accession).subscribe(
        (data: { sex: Filter[]; organismPart: Filter[] }) => {
          this.filtersMap = data;
          this.sexFilters = this.filtersMap.sex.filter(i => i.key !== '');
          this.organismPartFilters = this.filtersMap.organismPart.filter(i => i.key !== '');
        },
        err => console.log(err)
    );
  }

  getStatusClass(status: string): string {
    return status === 'Annotation Complete' ? 'badge badge-pill badge-success' : 'badge badge-pill badge-warning';
  }

  getSearchResults(from?: number, size?: number): void {
    $('.sex-inactive').removeClass('non-disp active');
    $('.org-part-inactive').removeClass('non-disp active');
    if (this.searchText.length === 0) {
      this.getBiosamples();
    } else {
      this.activeFilters = [];
      this.dataSourceRecords.filter = this.searchText.trim();
      this.dataSourceRecords.filterPredicate = ((data: BioSample, filter: string) => {
        const a = !filter || data.sex?.toLowerCase().includes(filter.toLowerCase());
        const b = !filter || data.organismPart?.toLowerCase().includes(filter.toLowerCase());
        const c = !filter || data.accession.toLowerCase().includes(filter.toLowerCase());
        const d = !filter || data.commonName?.toLowerCase().includes(filter.toLowerCase());
        return a || b || c || d;
      }) as (PeriodicElement: BioSample, string) => boolean;
      this.getFiltersForSelectedFilter(this.dataSourceRecords.filteredData);
    }
  }

  toggleCollapse(filterKey: string): void {
    if (filterKey === 'Sex') {
      this.isSexFilterCollapsed = !this.isSexFilterCollapsed;
      this.itemLimitSexFilter = this.isSexFilterCollapsed ? 3 : 10000;
    } else if (filterKey === 'Organism Part') {
      this.isOrganismPartCollapsed = !this.isOrganismPartCollapsed;
      this.itemLimitOrgFilter = this.isOrganismPartCollapsed ? 3 : 10000;
    }
  }

  redirectTo(accession: string): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/data/root/details/' + accession])
    );
  }

  exportTableToCSV(filename: string): void {
    const csvData = this.convertToCSV(this.dataSourceRecords.data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  convertToCSV(objArray: BioSample[]): string {
    const array: string[][] = [Object.keys(objArray[0])].concat(
        objArray.map(item => Object.values(item).map(String))
    );

    return array
        .map(it => {
          return it.join(',');
        })
        .join('\n');
  }
}
