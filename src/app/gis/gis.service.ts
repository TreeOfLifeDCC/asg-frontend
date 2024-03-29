import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GisService {

  private API_BASE_URL = 'https://portal.aquaticsymbiosisgenomics.org/api';
  // private API_BASE_URL = 'http://localhost:8080';
  //    private API_BASE_URL = 'http://45.88.81.15';

  constructor(private http: HttpClient) { }

  public getGisData(filter: any, searchText?): Observable<any> {
    let requestParams = `?`;
    if (searchText) {
      requestParams = requestParams + `&searchText=${searchText}`;
    }
    return this.http.post(`${this.API_BASE_URL}/root_organisms/gis-filter${requestParams}`, filter);

  }

  public getGisSearchData(search: any): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/root_organisms/gis/search?filter=${search}`);
  }
}
