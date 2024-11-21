import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GisService {

  // private API_BASE_URL = 'https://portal.aquaticsymbiosisgenomics.org/api';
   private API_BASE_URL = 'https://asg-python-backend-733243988471.europe-west2.run.app';
  //    private API_BASE_URL = 'http://45.88.81.15';

  constructor(private http: HttpClient) { }

  public getGisData(indexName, currentClass, phylogenyFilters, searchText?, filterValue?): Observable<any> {

    let url = `${this.API_BASE_URL}/${indexName}?limit=15&offset=0`;
    const projectNames = ['DToL', '25 genomes', 'ERGA', 'CBP', 'ASG'];
    if (searchText) {
      url += `&search=${searchText}`;
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
      url += `&current_class=${currentClass}`;
    }
    url += `&action=download`;

    console.log(url);
    return this.http.get<any>(url);
  }

}
