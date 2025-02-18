import {AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef,
  MatNoDataRow, MatRow, MatRowDef, MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import {NgxSpinnerModule, NgxSpinnerService} from 'ngx-spinner';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { catchError, map, merge, startWith, switchMap } from 'rxjs';
import {GetDataService} from '../services/get-data.service';
import {NgClass} from '@angular/common';
import {TruncatePipe} from './truncate.pipe';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  standalone : true,
  imports: [
    MatTable,
    MatSort,
    MatHeaderCellDef,
    RouterLink,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatPaginator,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatCellDef,
    MatSortHeader,
    MatExpansionModule,
    MatCheckboxModule,
    NgClass,
    NgxSpinnerModule,
    TruncatePipe,
    MatFormField,
    FormsModule,
    MatInput,
    MatLabel,
    MatChipSet,
    MatChip,
    MatIcon
  ]
})
export class PublicationsComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterChanged = new EventEmitter<any>();
  data: any;
  dataCount = 0;
  searchValue: string;
  searchChanged = new EventEmitter<any>();
  pagesize = 20;
  urlAppendFilterArray = [];
  activeFilters = new Array<string>();
  columns = ['title', 'journalTitle', 'pubYear', 'organism_name', 'study_id'];
  journalNameFilters = [];
  publicationYearFilters = [];
  articleTypeFilters = [];
  isLoadingResults: boolean;
  isRateLimitReached: boolean;
  aggregations: any;
  resultsLength: any;
  timer: any;
  queryParams: any = {};

  constructor(private titleService: Title,
              private spinner: NgxSpinnerService,
              private getDataService: GetDataService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.titleService.setTitle('Publications');
    const queryParamMap: any = this.activatedRoute.snapshot['queryParamMap'];
    const params = queryParamMap['params'];

    if (Object.keys(params).length !== 0) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          if (params[key].includes('searchValue - ')) {
            this.searchValue = params[key].split('searchValue - ')[1];
          } else {
            this.activeFilters.push(params[key]);
          }

        }
      }
    }

  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.searchChanged.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterChanged.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.paginator.page, this.sort.sortChange, this.searchChanged, this.filterChanged)
        .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              return this.getDataService.getPublicationsData(this.paginator.pageIndex,
                  this.paginator.pageSize, this.searchValue, this.sort.active, this.sort.direction, this.activeFilters,
                  'articles'
              ).pipe(catchError(() => observableOf(null)));
            }),
            map(data => {
              // Flip flag to show that loading has finished.
              this.isLoadingResults = false;
              this.isRateLimitReached = data === null;

              if (data === null) {
                return [];
              }


              // Only refresh the result length if there is new metadataData. In case of rate
              // limit errors, we do not want to reset the metadataPaginator to zero, as that
              // would prevent users from re-triggering requests.
              this.resultsLength = data.count;
              this.aggregations = data.aggregations;

              this.articleTypeFilters = [];
              if (this.aggregations.articleType.buckets.length > 0) {
                this.articleTypeFilters = this.merge(this.articleTypeFilters,
                    this.aggregations.articleType.buckets,
                    'article_type');
              }

              this.journalNameFilters = [];
              if (this.aggregations.journalTitle.buckets.length > 0) {
                this.journalNameFilters = this.merge(this.journalNameFilters,
                    this.aggregations.journalTitle.buckets,
                    'journal_title');
              }

              this.publicationYearFilters = [];
              if (this.aggregations.pubYear.buckets.length > 0) {
                this.publicationYearFilters = this.merge(this.publicationYearFilters,
                    this.aggregations.pubYear.buckets,
                    'pub_year');
              }

              this.queryParams = [...this.activeFilters];

              // add search value to URL query param
              if (this.searchValue) {
                this.queryParams.push(`searchValue - ${this.searchValue}`);
              }

              this.replaceUrlQueryParams();
              return data.results;
            }),
        )
        .subscribe(data => (this.data = data));
  }

  refreshPage() {
    clearTimeout(this.timer);
    this.activeFilters = [];
    this.searchValue = '';
    this.filterChanged.emit();
    this.router.navigate([]);
  }

  replaceUrlQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.queryParams,
      replaceUrl: true,
      skipLocationChange: false
    });
  }



  merge = (first: any[], second: any[], filterLabel: string) => {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < second.length; i++) {
      second[i].label = filterLabel;
      first.push(second[i]);
    }
    return first;
  }

  getJournalName(data: any): string {
    if (data.journalTitle !== undefined) {
      return data.journalTitle;
    } else {
      return 'Wellcome Open Res';
    }
  }

  getYear(data: any): string {
    if (data.pubYear !== undefined) {
      return data.pubYear;
    } else {
      return '2022';
    }
  }

  // pageChanged(event: any): void {
  //   const offset = event.pageIndex * event.pageSize;
  //   this.getAllPublications(offset, event.pageSize);
  // }

  applyFilter(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.searchChanged.emit();
  }


  checkFilterIsActive = (filter: string) => {
    // console.log(this.filterService.activeFilters);
    if (this.activeFilters.indexOf(filter) !== -1) {
      return 'active-filter';
    }

  }
  onFilterClick(filterValue: string) {
    clearTimeout(this.timer);
    const index = this.activeFilters.indexOf(filterValue);
    index !== -1 ? this.activeFilters.splice(index, 1) : this.activeFilters.push(filterValue);
    this.filterChanged.emit();
  }


  removeFilter(): void {
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

  resetFilter(): void {
    for (const key of Object.keys(this.activeFilters)) {
      this.activeFilters[key] = [];
    }
    this.activeFilters = [];
    this.urlAppendFilterArray = [];

  }

}



function observableOf(arg0: null): any {
  throw new Error('Function not implemented.');
}

