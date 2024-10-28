import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Sample } from '../model/dashboard.model';
import {ConfirmationDialogComponent} from '../../confirmation-dialog-component/confirmation-dialog.component';
import {BytesPipe} from '../../shared/bytes-pipe';
import {tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private API_BASE_URL = 'https://portal.aquaticsymbiosisgenomics.org/api';
  // private API_BASE_URL = 'http://45.88.81.97/backend';
  // private API_BASE_URL = 'http://localhost:8000';
  private ENA_PORTAL_API_BASE_URL = 'https://www.ebi.ac.uk/ena/portal/api/files';

  constructor(private http: HttpClient, private bytesPipe: BytesPipe,  private dialog: MatDialog) { }

  public getAllBiosample(indexName, offset, limit, sortColumn?, sortOrder? , searchText?, filterValue?): Observable<any> {

    let url = `http://localhost:8000/${indexName}?limit=${limit}&offset=${offset}`;
    const projectNames = ['DToL', '25 genomes', 'ERGA', 'CBP', 'ASG'];

    if (searchText) {
      url += `&search=${searchText}`;
    }
    if (sortColumn && sortOrder) {
      url += `&sort=${sortColumn}:${sortOrder}`;
    }
    console.log("sortColumn: ", sortColumn)
    console.log("sortOrder: ", sortOrder)
    console.log("filter: ", filterValue)

    if (filterValue.length !== 0) {
      let filterStr = '&filter=';
      let filterItem;
      for (let i = 0; i < filterValue.length; i++) {
        if (projectNames.indexOf(filterValue[i]) !== -1) {
          filterValue[i] === 'DToL' ? filterItem = 'project_name:dtol' : filterItem = `project_name:${filterValue[i]}`;
        } else if (filterValue[i].includes('-') && !filterValue[i].startsWith('experimentType')) {
          if (filterValue[i].startsWith('symbionts')) {
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
          // filterItem = `${currentClass}:${filterValue[i]}`;
        }

        filterStr === '&filter=' ? filterStr += `${filterItem}` : filterStr += `,${filterItem}`;

      }
      url += filterStr;
    }
    console.log(url);



    let requestParams = `?offset=${offset}&limit=${limit}`;
    if (sortColumn !== undefined) {
      requestParams = requestParams + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
    }
    if (searchText) {
      requestParams = requestParams + `&searchText=${searchText}`;
    }
    return this.http.post(`${this.API_BASE_URL}/root_organisms${requestParams}`, filterValue);
  }

  public getDistinctOrganisms(size, sortColumn?, sortOrder?, afterKey?): Observable<any> {
    let requestParams = `?size=${size}`;
    if (sortColumn !== undefined) {
      requestParams = requestParams + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
    }
    if (afterKey !== undefined) {
      requestParams = requestParams + `&afterKey=${afterKey}`;
    }
    return this.http.get(`${this.API_BASE_URL}/root_organisms${requestParams}`);
  }

  public getBiosampleByAccession(accession: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/organisms/${accession}`);
  }

  public getSpecimenByAccession(accession: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/organisms/specimen/${accession}`);
  }

  public getRootOrganismByOrganism(organism: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/${organism}`);
  }

  public getRootOrganismById(organism: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/root?id=${organism}`);
  }

  public getRootOrganismByAccession(accession: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/accession/${accession}`);
  }

  public getOrganismFilters(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/root/filters`);
  }

  public getRootOrganismFilters(organism): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/filters?organism=${organism}`);
  }

  public getDetailTableOrganismFilters(organism): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/secondary/filters?organism=${organism}`);
  }

  public getSpecimenFilters(accession): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/organisms/filters?accession=${accession}`);
  }

  // public getSearchResults(search: any, from?, size?): Observable<any> {
  //   let requestURL = `${this.API_BASE_URL}/root_organisms/search?filter=${search}&from=${from}&size=${size}`;
  //   return this.http.get(`${requestURL}`);
  // }

  public getRootSearchResults(search: any, sortColumn?, sortOrder?, from?, size?): Observable<any> {
    let requestParams = `?filter=${search}&from=${from}&size=${size}`;
    if (sortColumn !== undefined) {
      requestParams = requestParams + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
    }
    let requestURL = `${this.API_BASE_URL}/root_organisms/search${requestParams}`;
    return this.http.get(`${requestURL}`);
  }

  public getFilterResults(filter: any, sortColumn?, sortOrder?, from?, size?, taxonomyFilter?, searchText?): Observable<any> {
    let requestParams = `?from=${from}&size=${size}`;
    if (sortColumn !== undefined) {
      requestParams = requestParams + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
    }
    if (taxonomyFilter !== undefined) {
      let taxa = encodeURIComponent(JSON.stringify(taxonomyFilter[0]));
      requestParams = requestParams + `&taxonomyFilter=${taxa}`;
    }
    if(searchText) {
      requestParams = requestParams + `&searchText=${searchText}`;
    }
    const requestURL = `${this.API_BASE_URL}/root_organisms/root/filter/results${requestParams}`;
    return this.http.post(`${requestURL}`, filter);
  }

  public getExperimentTypeFilters(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/root/experiment-type/filters`);
  }

  public downloadFastaq(accession: any): any {
    const result = 'read_run';
    const field = 'fastq_ftp';
    const body = `result=${result}&accession=${accession}&field=${field}&count=true`;

    const requestURL = this.ENA_PORTAL_API_BASE_URL;
    return this.http.post(`${requestURL}`, body, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).pipe(
        tap((response: any) => {
          this.dialog.open(ConfirmationDialogComponent, {
            width: '550px',
            autoFocus: false,
            data: {
              field: 'fastq_ftp',
              fileCount: response.totalFiles,
              fileSize: this.bytesPipe.transform(response.totalFileSize),
              accession,
              url: this.ENA_PORTAL_API_BASE_URL
            }
          });
        })).subscribe();
  }
  public download(filter: any, sortColumn?, sortOrder?, from?, size?, taxonomyFilter?, searchText? , downloadOption?): any {
    let requestParams = `?from=${from}&size=${size}`;
    if (sortColumn !== undefined) {
      requestParams = requestParams + `&z=${sortColumn}&sortOrder=${sortOrder}`;
    }
    if (taxonomyFilter !== undefined) {
      let taxa = encodeURIComponent(JSON.stringify(taxonomyFilter[0]));
      requestParams = requestParams + `&taxonomyFilter=${taxa}`;
    }
    if (searchText) {
      requestParams = requestParams + `&searchText=${searchText}`;
    }
    let requestURL = `${this.API_BASE_URL}/root_organisms/data-files/csv${requestParams}&downloadOption=` + downloadOption;
    return this.http.post(`${requestURL}`, filter, {responseType: 'blob'});
  }

}
