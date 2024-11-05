import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { GisService } from './gis.service';
import {NgxSpinnerModule, NgxSpinnerService} from 'ngx-spinner';
import {FormsModule, UntypedFormControl} from '@angular/forms';
import {MatRadioButton, MatRadioChange, MatRadioGroup} from '@angular/material/radio';
import {ActivatedRoute, Router} from '@angular/router';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {PhylogenyFilterComponent} from '../shared/phylogeny-filter/phylogeny-filter.component';
import {FilterComponent} from '../shared/filter/filter.component';
import {ActiveFilterComponent} from '../shared/active-filter/active-filter.component';
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {filter, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  standalone: true,
  selector: 'app-gis',
  templateUrl: './gis.component.html',
  imports: [
    FormsModule,
    NgxSpinnerModule,
    MatAutocomplete,
    MatOption,
    MatFormField,
    MatFormFieldModule,
    MatInputModule,
    MatRadioGroup,
    MatRadioButton,
    MatAutocompleteTrigger,
    PhylogenyFilterComponent,
    FilterComponent,
    ActiveFilterComponent,
    MatIcon
  ],
  styleUrls: ['./gis.component.css']
})
export class GisComponent implements AfterViewInit , OnDestroy {
  private map;
  private tiles;
  private markers;
  toggleSpecimen = new UntypedFormControl();
  unpackedData;
  isPhylogenyFilterProcessing = false; // Flag to prevent double-clicking
  phylogenyFilters: string[] = [];
  activeFilters = new Array<string>();
  currentClass = 'kingdom';
  searchValue: string;
  aggregations: any;
  lastPhylogenyVal = '';
  queryParams: any = {};
  experimentTypeFilters: any[] = [];
  itemLimit = 5;
  isCollapsed = true;
  classes: string[] = [
    'cellularorganism',
    'superkingdom',
    'kingdom',
    'subkingdom',
    'superphylum',
    'phylum',
    'subphylum',
    'superclass',
    'class',
    'subclass',
    'infraclass',
    'cohort',
    'subcohort',
    'superorder',
    'order',
    'parvorder',
    'suborder',
    'infraorder',
    'section',
    'subsection',
    'superfamily',
    'family',
    'subfamily',
    'tribe',
    'subtribe',
    'genus',
    'series',
    'subgenus',
    'species_group',
    'species_subgroup',
    'species',
    'subspecies',
    'varietas',
    'forma'
  ];
  searchUpdate = new Subject<string>();
  myControl = new UntypedFormControl('');
  filteredOptions: string[];
  radioOptions = 1;
  coordinateControl: any = null;

  constructor(private gisService: GisService, private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.searchUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged()).subscribe(
        value => {
          this.spinner.show();
          this.getGisData();
          this.getDropDownOptions();
        }
    );
  }

  ngOnInit(): void {
    this.toggleSpecimen.setValue(false);
    this.radioOptions = 1;

    // get url parameters
    const queryParamMap = this.activatedRoute.snapshot['queryParamMap'];
    const params = queryParamMap['params'];
    if (Object.keys(params).length !== 0) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          if (params[key].includes('phylogenyFilters - ')) {
            const phylogenyFilters = params[key].split('phylogenyFilters - ')[1];
            // Remove square brackets and split by comma
            this.phylogenyFilters = phylogenyFilters.slice(1, -1).split(',');
          } else if (params[key].includes('phylogenyCurrentClass - ')) {
            const phylogenyCurrentClass = params[key].split('phylogenyCurrentClass - ')[1];
            this.currentClass = phylogenyCurrentClass;
          } else {
            this.activeFilters.push(params[key]);
          }

        }
      }
    }
    this.getGisData();
    this.initMap();
  }

  displayActiveFilterName(filterName: string) {
    if (filterName && filterName.startsWith('symbionts_')) {
      return 'Symbionts-' + filterName.split('-')[1];
    }
    if (filterName && filterName.startsWith('experimentType_')) {
      return  filterName.split('_')[1];
    }
    return filterName;
  }

  removePhylogenyFilters() {
    // update url with the value of the phylogeny current class
    const queryParamPhyloIndex = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
    if (queryParamPhyloIndex > -1) {
      this.queryParams.splice(queryParamPhyloIndex, 1);
    }

    const queryParamCurrentClassIndex = this.queryParams.findIndex(element => element.includes('phylogenyCurrentClass - '));
    if (queryParamCurrentClassIndex > -1) {
      this.queryParams.splice(queryParamCurrentClassIndex, 1);
    }
    // Replace current url parameters with new parameters.
    this.replaceUrlQueryParams();
    // reset phylogeny variables
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    this.getGisData();
  }


  ngAfterViewInit(): void {
  }

  getDropDownOptions() {
    if (this.searchValue !== '' && this.searchValue.length > 1) {
      const filterValue = this.searchValue.toLowerCase();
      this.filteredOptions = this.unpackedData.filter(option => {
        if (option.id !== undefined) {
          if (option.id.toLowerCase().includes(filterValue)) {
            return option;
          }
        }
      });
      console.log("this.filteredOptions: ", this.filteredOptions)
    }
  }

  removeFilter() {
    this.activeFilters = [];
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    this.getGisData();
    this.router.navigate([]);
  }

  onHistoryClick() {
    this.phylogenyFilters.splice(this.phylogenyFilters.length - 1, 1);
    const previousClassIndex = this.classes.indexOf(this.currentClass) - 1;
    this.currentClass = this.classes[previousClassIndex];
    this.getGisData();
  }

  onRefreshClick() {
    this.phylogenyFilters = [];
    this.currentClass = 'kingdom';
    // remove phylogenyFilters param from url
    const index = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
    if (index > -1) {
      this.queryParams.splice(index, 1);
      // Replace current parameters with new parameters.
      this.replaceUrlQueryParams();
    }
    this.getGisData();
  }

  toggleSpecimens(event: MatRadioChange) {
    if (event.value === 3) {
      // this.radioOptions = 3;
      this.spinner.show();
      this.refreshMapLayers();
      setTimeout(() => {
        this.setMarkers();
        this.getAllLatLong();
        this.map.addLayer(this.markers);
        if (this.myControl.value === ''){
          this.resetMapView();
        }
        this.spinner.hide();
      }, 50);
    } else  if (event.value === 1) {
      // this.radioOptions = 1;
      this.spinner.show();
      this.refreshMapLayers();
      setTimeout(() => {
        this.setMarkers();
        this.getSpecicesLatLong();
        this.map.addLayer(this.markers);
        if (this.myControl.value == ''){
          this.resetMapView();
        }
        this.spinner.hide();
      }, 50);
    }
  }

  getGisData() {
    console.log("this.phylogenyFilters: ", this.phylogenyFilters)
    console.log("this.searchValue: ", this.searchValue)
    console.log("this.activeFilters: ", this.activeFilters)
    this.spinner.show();
    this.gisService.getGisData('gis_filter_data', this.currentClass, this.phylogenyFilters, this.searchValue,
        this.activeFilters)
      .subscribe(
        data => {
          console.log(data)
          this.aggregations = data.aggregations;

          // experiment type
          this.experimentTypeFilters = [];
          if (this.aggregations?.experiment.library_construction_protocol.buckets.length > 0) {
            this.experimentTypeFilters = this.merge(this.experimentTypeFilters,
                this.aggregations?.experiment.library_construction_protocol.buckets,
                'experimentType');
          }

          // get last phylogeny element for filter button
          this.lastPhylogenyVal = this.phylogenyFilters.slice(-1)[0];

          // add filters to URL query parameters
          this.queryParams = [...this.activeFilters];
          if (this.phylogenyFilters && this.phylogenyFilters.length) {
            const index = this.queryParams.findIndex(element => element.includes('phylogenyFilters - '));
            if (index > -1) {
              this.queryParams[index] = `phylogenyFilters - [${this.phylogenyFilters}]`;
            } else {
              this.queryParams.push(`phylogenyFilters - [${this.phylogenyFilters}]`);
            }
          }

          // update url with the value of the phylogeny current class
          this.updateQueryParams('phylogenyCurrentClass');

          this.replaceUrlQueryParams();

          const unpackedData = [];
          for (const item of  data.results) {
            unpackedData.push(this.unpackData(item));
          }
          this.unpackedData = unpackedData;
          this.refreshMapLayers();
          setTimeout(() => {
            this.spinner.hide();
            this.populateMap();
            if (this.searchValue && this.unpackedData.length > 0) {
              const lat = this.unpackedData[0].organisms[0].lat;
              const lng = this.unpackedData[0].organisms[0].lng;
              this.map.setView([lat, lng], 6);
            }
            else {
              this.resetMapView();
            }
            this.spinner.hide();
            this.showCursorCoordinates();
          }, 300);
        },
        err => {
          console.log(err);
          this.spinner.hide();
        }
      );
  }

  merge = (first: any[], second: any[], filterLabel: string) => {
    for (const item of second) {
      item.label = filterLabel;
      first.push(item);
    }
    return first;
  }

  updateQueryParams(urlParam: string){
    if (urlParam === 'phylogenyCurrentClass'){
      const queryParamIndex = this.queryParams.findIndex((element: any) => element.includes('phylogenyCurrentClass - '));
      if (queryParamIndex > -1) {
        this.queryParams[queryParamIndex] = `phylogenyCurrentClass - ${this.currentClass}`;
      } else {
        this.queryParams.push(`phylogenyCurrentClass - ${this.currentClass}`);
      }
    }
  }

  replaceUrlQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.queryParams,
      replaceUrl: true,
      skipLocationChange: false
    });
  }

  toggleCollapse = () => {
    if (this.isCollapsed) {
      this.itemLimit = 10000;
      this.isCollapsed = false;
    } else {
      this.itemLimit = 5;
      this.isCollapsed = true;
    }
  }

  getStatusCount(data: any) {
    if (data) {
      for (const item of data) {
        if (item.key.includes('Done')) {
          return item.doc_count;
        }
      }
    }
  }

  checkStyle(filterValue: string) {
    if (this.activeFilters.includes(filterValue)) {
      return 'background-color: #4BBEFD;';
    } else {
      return '';
    }
  }

  onFilterClick(filterValue: string, phylogenyFilter: boolean = false) {
    console.log(filterValue);
    if (phylogenyFilter) {
      if (this.isPhylogenyFilterProcessing) {
        return;
      }
      // Set flag to prevent further clicks
      this.isPhylogenyFilterProcessing = true;

      this.phylogenyFilters.push(`${this.currentClass}:${filterValue}`);
      const index = this.classes.indexOf(this.currentClass) + 1;
      this.currentClass = this.classes[index];

      // update url with the value of the phylogeny current class
      this.updateQueryParams('phylogenyCurrentClass');

      // Replace current parameters with new parameters.
      this.replaceUrlQueryParams();

      this.getGisData();

      // Reset isPhylogenyFilterProcessing flag
      setTimeout(() => {
        this.isPhylogenyFilterProcessing = false;
      }, 500);
    } else{
      const index = this.activeFilters.indexOf(filterValue);
      index !== -1 ? this.activeFilters.splice(index, 1) :
          this.activeFilters.push(filterValue);
      this.getGisData();
    }
  }

  unpackData(data: any) {
    data = data._source;
    return data;
  }

  private initMap(): void {
    this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const latlng = L.latLng(50.000, 3.923);

    this.map = L.map('map', {
      center: latlng,
      zoom: 6,
      layers: [this.tiles],
    });
  }

  populateMap() {
    this.setMarkers();
    this.getSpecicesLatLong();
    this.map.addLayer(this.markers);
  }

  setMarkers() {
    this.markers = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: false
    });

    this.markers.on('clusterclick', function(a) {
      const childCluster = a.layer._childClusters;
      if (childCluster.length <= 1) {
        a.layer.spiderfy();
      }
    });
  }

  getSpecicesLatLong(): any {
    const orgGeoSize = this.unpackedData.length;
    for (let i = 0; i < orgGeoSize; i++) {
      if (Object.keys(this.unpackedData[i]).length !== 0) {

        const tempArr = this.unpackedData[i].organisms;

        const tempArrSize = tempArr === undefined ? 0 : tempArr.length;

        for (let j = 0; j < tempArrSize; j++) {
          if (tempArr[j].lat !== 'not collected' && tempArr[j].lat !== 'not provided') {
            let llat: any;
            let llng: any;
            if (tempArr[j].lat === '67.34.07' && tempArr[j].lng === '68.07.30') {
              llat = '67.3407';
              llng = '68.0730';
            }else if(tempArr[j].lat === '23.4423s' && tempArr[j].lng === '151.9148e') {
              llat = '23.4423';
              llng = '151.9148';
            } else {
              llat = tempArr[j].lat;
              llng = tempArr[j].lng;
            }

            const latlng = L.latLng(llat, llng);

            let alreadyExists = false;
            if ((this.markers !== undefined && this.markers.getLayers() !== undefined)) {
              this.markers.getLayers().forEach((layer) => {
                if (!alreadyExists && layer instanceof L.Marker && (layer.getLatLng().equals(latlng)) &&
                    layer.options.title === tempArr[j].organism) {
                  alreadyExists = true;
                }
              });
            }
            let popupcontent = '';
            if (!alreadyExists) {
              const m = L.marker(latlng);
              const organismString = encodeURIComponent(tempArr[j].organism.toString());
              const organism = `<div><a target="_blank" href=/data/root/details/${organismString}>${tempArr[j].organism}</a></div>`;
              const commonName = tempArr[j].commonName != null ? `<div>${tempArr[j].commonName}</div>` : '';
              popupcontent = organism + commonName ;
              const popup = L.popup({
                closeOnClick: false,
                autoClose: true,
                closeButton: false
              }).setContent(popupcontent);
              m.options.title = tempArr[j].organism;
              m.bindPopup(popup);
              this.markers.addLayer(m);
              // }
              // });
            }
          }
        }
      }
    }
  }
  getAllLatLong(): any {
    const orgGeoSize = this.unpackedData.length;

    for (let i = 0; i < orgGeoSize; i++) {
      if (Object.keys(this.unpackedData[i]).length !== 0) {
        const tempArr = this.unpackedData[i].organisms;

        const tempArrSize = tempArr === undefined ? 0 : tempArr.length;
        for (let j = 0; j < tempArrSize; j++) {
          if (tempArr[j].lat !== 'not collected' && tempArr[j].lat !== 'not provided') {
            let llat: any;
            let llng: any;
            if (tempArr[j].lat === '67.34.07' && tempArr[j].lng === '68.07.30') {
              llat = '67.3407';
              llng = '68.0730';
            }else if (tempArr[j].lat === '23.4423s' && tempArr[j].lng === '151.9148e') {
              llat = '23.4423';
              llng = '151.9148';
            }
            else {
              llat = tempArr[j].lat;
              llng = tempArr[j].lng;
            }
            const latlng = L.latLng(llat, llng);
            let popupcontent = '';
            const m = L.marker(latlng);
            const organismString = encodeURIComponent(tempArr[j].organism.toString());
            const organism = `<div><a target="_blank" href=/data/root/details/${organismString}>${tempArr[j].organism}</a></div>`;
            const commonName = tempArr[j].commonName != null ? `<div>${tempArr[j].commonName}</div>` : '';
            popupcontent = organism + commonName ;
            const popup = L.popup({
              closeOnClick: false,
              autoClose: true,
              closeButton: false
            }).setContent(popupcontent);
            m.options.title = tempArr[j].organism;
            m.bindPopup(popup);
            this.markers.addLayer(m);
            // }
            // });

          }
        }
      }
    }

    const specGeoSize = this.unpackedData.length;
    for (let i = 0; i < specGeoSize; i++) {
      if (Object.keys(this.unpackedData[i]).length !== 0 ) {
        const tempspecArr = this.unpackedData[i].specimens;
        const tempspecArrSize = tempspecArr === undefined ? 0 : tempspecArr.length;
        for (let j = 0; j < tempspecArrSize; j++) {
          if (tempspecArr[j].lat !== 'not collected' && tempspecArr[j].lat !== 'not provided') {
            let llat: any;
            let llng: any;
            if (tempspecArr[j].lat === '67.34.07' && tempspecArr[j].lng === '68.07.30') {
              llat = '67.3407';
              llng = '68.0730';
            }
            else {
              llat = tempspecArr[j].lat;
              llng = tempspecArr[j].lng;
            }
            const latlng = L.latLng(llat, llng);
            const m = L.marker(latlng);
            const accession = `<div><a target="_blank" href=/data/specimens/details/${tempspecArr[j].accession}>${tempspecArr[j].accession}</a></div>`;
            const organism = tempspecArr[j].organism != null ? `<div>${tempspecArr[j].organism}</div>` : '';
            const commonName = tempspecArr[j].commonName != null ? `<div>${tempspecArr[j].commonName}</div>` : '';
            const organismPart = `<div>${tempspecArr[j].organismPart}</div>`;
            const popupcontent = accession + organism + commonName + organismPart;
            const popup = L.popup({
              closeOnClick: false,
              autoClose: true,
              closeButton: false
            }).setContent(popupcontent);
            m.bindPopup(popup);
            this.markers.addLayer(m);
          }
        }
      }
    }
  }

  showCursorCoordinatesOLD() {
    const Coordinates = L.Control.extend({
      onAdd: map => {
        const container = L.DomUtil.create('div');
        container.style.backgroundColor = 'rgba(255,255,255,.8)';
        map.addEventListener('mousemove', e => {
          container.innerHTML = `Lat: ${e.latlng.lat.toFixed(4)} Lng: ${e.latlng.lng.toFixed(4)}`;
        });
        return container;
      }
    });
    this.map.addControl(new Coordinates({ position: 'bottomright' }));
  }

  showCursorCoordinates() {
    this.removeCursorCoordinates();
    const CoordinateControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: map => {
        const container = L.DomUtil.create('div');
        container.style.backgroundColor = 'rgba(255,255,255,.8)';
        map.addEventListener('mousemove', e => {
          container.innerHTML = `Lat: ${e.latlng.lat.toFixed(4)} Lng: ${e.latlng.lng.toFixed(4)}`;
        });
        return container;
      }
    });
    // Add the control to the map and store the instance
    this.coordinateControl = new CoordinateControl();
    this.map.addControl(this.coordinateControl);
  }

  removeCursorCoordinates() {
    // Check if coordinates control exists and remove it
    if (this.coordinateControl) {
      this.map.removeControl(this.coordinateControl);
      this.coordinateControl = null;
    }
  }

  refreshMapLayers() {
    this.map.eachLayer(layer => {
      this.map.removeLayer(layer);
    });
    this.map.addLayer(this.tiles);
  }

  resetMapView = () => {
    this.map.setView([53.4862, -1.8904], 6);
  }

  ngOnDestroy() {
    this.activeFilters = [];
    this.phylogenyFilters = [];
    this.experimentTypeFilters = [];

  }

  protected readonly filter = filter;
}
