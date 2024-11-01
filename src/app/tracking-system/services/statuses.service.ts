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

  public getTrackingDataOLD(offset, limit, sortColumn?, sortOrder?, searchText?): Observable<any> {
    const indexName = 'tracking_status_index';
    let url = `http://localhost:8000/${indexName}?limit=${limit}&offset=${offset}`;

    if (searchText) {
      url += `&search=${searchText}`;
    }
    if (sortColumn && sortOrder) {
      url += `&sort=${sortColumn}:${sortOrder}`;
    }
    return this.http.get<any>(url);
  }


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

  public getStatusesFilters(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/statuses/filters`);
  }

  public getSearchResults(search: any, sortColumn?, sortOrder?, from?, size?): Observable<any> {
    let requestURL = `${this.API_BASE_URL}/statuses/search?filter=${search}&from=${from}&size=${size}`;
    if (sortColumn != undefined) {
      requestURL = requestURL + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`
    }
    return this.http.get(`${requestURL}`);
  }

  public getFilterResults(filter: any, sortColumn?, sortOrder?, from?, size?, taxonomyFilter?): Observable<any> {
    let requestURL = `${this.API_BASE_URL}/statuses/filter/results?from=${from}&size=${size}`;
    if (sortColumn != undefined) {
      requestURL = requestURL + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
    }
    if(taxonomyFilter != undefined) {
      let taxa = encodeURIComponent(JSON.stringify(taxonomyFilter[0]));
      requestURL = requestURL + `&taxonomyFilter=${taxa}`
    }
    return this.http.post(`${requestURL}`, filter);
  }

  public findBioSampleByOrganismName(name: any, sortColumn?, sortOrder?, from?, size?): Observable<any> {
    let requestURL = `${this.API_BASE_URL}/statuses/organism?name=${name}&from=${from}&size=${size}`;
    if (sortColumn != undefined) {
      requestURL = requestURL + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`
    }
    return this.http.get(`${requestURL}`);
  }

}
