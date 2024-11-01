import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StatusesService {

  private API_BASE_URL = 'https://portal.aquaticsymbiosisgenomics.org/api';
  // private API_BASE_URL = 'http://45.88.81.97/backend';
  // private API_BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  public getTrackingData(indexName, currentClass, phylogenyFilters, offset, limit, sortColumn?, sortOrder? , searchText?, filterValue?): Observable<any> {

    let url = `http://localhost:8000/${indexName}?limit=${limit}&offset=${offset}`;
    const projectNames = ['DToL', '25 genomes', 'ERGA', 'CBP', 'ASG'];

    if (searchText) {
      url += `&search=${searchText}`;
    }
    if (sortColumn && sortOrder) {
      url += `&sort=${sortColumn}:${sortOrder}`;
    }
    if (filterValue.length !== 0) {
      let filterStr = '&filter=';
      let filterItem;
      for (let i = 0; i < filterValue.length; i++) {
        if (projectNames.indexOf(filterValue[i]) !== -1) {
          filterValue[i] === 'DToL' ? filterItem = 'project_name:dtol' : filterItem = `project_name:${filterValue[i]}`;
        } else if (filterValue[i].includes('-') && !filterValue[i].startsWith('experimentType')) {
          if (filterValue[i].startsWith('symbionts') || filterValue[i].startsWith('metagenomes')) {
            filterItem = filterValue[i].replace('-', ':');
          } else {
            filterItem = filterValue[i].split(' - ')[0].toLowerCase().split(' ').join('_');
            if (filterItem === 'assemblies') {
              filterItem = 'assemblies_status:Done';
            }else if (filterItem === 'genome_notes') {
              filterItem = 'genome_notes:Submitted';
            } else {
              filterItem = `${filterItem}:Done`;
            }
          }
        }else if (filterValue[i].includes('_') && filterValue[i].startsWith('experimentType')) {
          filterItem = filterValue[i].replace('_', ':');

        }
        else {
          filterItem = `${currentClass}:${filterValue[i]}`;
        }

        filterStr === '&filter=' ? filterStr += `${filterItem}` : filterStr += `,${filterItem}`;

      }
      url += filterStr;
    }

    if (phylogenyFilters.length !== 0) {
      let filterStr = '&phylogeny_filters=';
      for (const filter of phylogenyFilters) {
        filterStr = filterStr === '&phylogeny_filters=' ? `${filterStr}${filter}` : `${filterStr}-${filter}`;
      }

      url += filterStr;
    }
    url += `&current_class=${currentClass}`;
    console.log(url);
    return this.http.get<any>(url);
  }


  public getBiosampleByOrganism(organism: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/statuses/detail/${organism}`);
  }

  downloadData(downloadOption: string, pageIndex: number, pageSize: number, searchValue: string, sortActive: string,
               sortDirection: string, filterValue: string[], currentClass: string, phylogenyFilters: string[],
               indexName: string) {

    const url = `http://127.0.0.1:8000/data-download`;
    const projectNames = ['DToL', '25 genomes', 'ERGA', 'CBP', 'ASG'];

    // phylogeny
    const phylogenyStr = phylogenyFilters.length ? phylogenyFilters.join('-') : '';

    // Filter string
    let filterStr = '';

    if (filterValue.length !== 0) {
      const filterItems = [];

      for (const item of filterValue) {
        let filterItem = '';

        if (projectNames.includes(item)) {
          filterItem = item === 'DToL' ? 'project_name:dtol' : `project_name:${item}`;
        } else if (item.includes('-') && !item.startsWith('experimentType')) {
          if (item.startsWith('symbionts') || item.startsWith('metagenomes')) {
            filterItem = item.replace('-', ':');
          } else {
            filterItem = item.split(' - ')[0].toLowerCase().replace(/\s+/g, '_');
            filterItem = (filterItem === 'assemblies') ? 'assemblies_status:Done' :
                (filterItem === 'genome_notes') ? 'genome_notes:Submitted' :
                    `${filterItem}:Done`;
          }
        } else if (item.includes('_') && item.startsWith('experimentType')) {
          filterItem = item.replace('_', ':');
        } else {
          filterItem = `${currentClass}:${item}`;
        }

        filterItems.push(filterItem);
      }

      filterStr = filterItems.join(',');
    }

    const payload = {
      pageIndex,
      pageSize,
      searchValue,
      sortValue: `${sortActive}:${sortDirection}`,
      filterValue: filterStr || '',
      currentClass,
      phylogenyFilters: phylogenyStr,
      indexName,
      downloadOption
    };

    console.log(payload);

    return this.http.post(url, payload, { responseType: 'blob' });
  }

}
