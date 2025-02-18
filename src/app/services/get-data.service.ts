import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {
  
  constructor(private http: HttpClient,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  getPublicationsData(pageIndex: number, pageSize: number, searchValue: string, sortActive: string, sortDirection: string,
                      filterValue: string[], index_name: string) {

    const sortActiveESField: { [index: string]: any } = {
      title: 'title.keyword',
      study_id: 'study_id.keyword',
      organism_name: 'organism_name.keyword'
    };

    const offset = pageIndex * pageSize;
    let url = `https://portal.aquaticsymbiosisgenomics.org/api/${index_name}?limit=${pageSize}&offset=${offset}`;
    if (searchValue) {
      url += `&search=${searchValue}`;
    }
    if (sortActive && sortDirection) {
      url += `&sort=${sortActive in sortActiveESField ?  sortActiveESField[sortActive]: sortActive}:${sortDirection}`;
    }
    if (filterValue.length !== 0) {
      let filterStr = '&filter=';
      let filterItem;
      for (let i = 0; i < filterValue.length; i++) {
        const filterName = filterValue[i].split('-')[0];
        const filterVal = filterValue[i].split('-')[1];
        if (filterName === 'article_type'){
          filterItem = `articleType:${filterVal}`;
        } else if (filterName === 'pub_year') {
          filterItem = `pubYear:${filterVal}`;
        } else if (filterName === 'journal_title') {
          filterItem = `journalTitle:${filterVal}`;
        }
        filterStr === '&filter=' ? filterStr += `${filterItem}` : filterStr += `,${filterItem}`;
      }
      url += filterStr;
    }

    // will not reload the page, but will update query params
    this.router.navigate([],
        {
          relativeTo: this.activatedRoute,
          queryParams: {
            filter: filterValue,
            sortActive: sortActive in sortActiveESField ?  sortActiveESField[sortActive] : sortActive,
            sortDirection,
            searchValue,
            pageIndex,
            pageSize
          },
          queryParamsHandling: 'merge',
        });

    return this.http.get<any>(url);
  }
}
