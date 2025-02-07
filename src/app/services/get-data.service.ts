import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  private API_BASE_URL = 'https://portal.aquaticsymbiosisgenomics.org/api';

  constructor(private http: HttpClient) { }

  // @ts-ignore
  getAllPublications(offset, limit, filter?) {
    const filters = [];
    let url = `${this.API_BASE_URL}articles?offset=${offset}&limit=${limit}`;
    for (const key of filter) {
      if (['Genome Note', 'Research Article'].indexOf(key) !== -1) {
        filters.push(`articleType=${key}`);
      } else if (['2020', '2021', '2022', '2023', '2024'].indexOf(key) !== -1) {
        filters.push(`pubYear=${key}`);
      } else {
        filters.push(`journalTitle=${key}`);
      }
    }
    for (const key of filters) {
      url = `${url}&${key}`;
    }
    return this.http.get<any>(url);
  }
}
