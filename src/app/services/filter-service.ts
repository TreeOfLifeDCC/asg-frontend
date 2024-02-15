import {Injectable, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ActivatedRoute, Router} from '@angular/router';

import {Subject} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    loading = true;
    dataSource = new MatTableDataSource<any>();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    filterSize: number;
    urlAppendFilterArray = [];
    activeFilters = [];
    filtersMap;
    filters = {
        sex: {},
        trackingSystem: {}
    };

    searchText = '';
    // childTaxanomy: Taxonomy;
    selectedTaxonomy: any;
    isSingleClick: Boolean = true;
    currentTaxonomyTree: any;
    currentTaxonomy: any;
    modalTaxa = '';
    isFilterSelected = false;
    isDoubleClick: Boolean;
    selectedFilterValue;

    bioSampleTotalCount = 0;
    BiosamplesFilters = [];
    RawDataFilters = [];

    AssembliesFilters = [];
    AnnotationFilters = [];
    AnnotationCompleteFilters = [];
    GenomeFilters = [];
    selectedTaxnomyFilter = '';
    taxonomies = [];
    experimentTypeFilters = [];
    symbiontsFilters = [];
    metagenomesFilters = [];

    phylSelectedRank = '';
    filterArray = [];

    data = new Subject();
    field = new Subject();

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private spinner: NgxSpinnerService, ) { }

    ngOnInit(): void {
        this.selectedTaxonomy = [];
    }



    removeTaxaFilter(taxonomy: any) {
        this.spinner.show();
        const filter = this.selectedFilterValue.rank + ' - ' + this.selectedFilterValue.taxId;
        const filterIndex = this.activeFilters.indexOf(filter);
        if (filterIndex !== -1) {
            this.activeFilters.splice(filterIndex);
        }

        this.isFilterSelected = false;
        this.phylSelectedRank = '';
        setTimeout(() => {
            this.updateDomForRemovedPhylogenyFilter(filter);
            this.updateActiveRouteParams();
        }, 100);
        const taxa = { rank: 'superkingdom', taxonomy: 'Eukaryota', childRank: 'kingdom' };
        this.currentTaxonomyTree = [];
        this.currentTaxonomyTree = [taxa];
        this.currentTaxonomy = taxa;
        this.selectedFilterValue = '';
        $(taxonomy + '-kingdom').removeClass('active-filter');
        $('#myUL').css('display', 'block');
        setTimeout(() => {
            this.spinner.hide();
        }, 400);
    }


    // tslint:disable-next-line:typedef
    filterPredicate(data: any, filterValue: any): boolean {
        const filters = filterValue.split('|');
        if (filters[1] === 'Metadata submitted to BioSamples') {
            return data.biosampleStatus === filters[0].split(' - ')[1];
        } else {
            const ena_filters = filters[0].split(' - ');
            if (ena_filters[0] === 'Raw Data') {
                return data.raw_data === ena_filters[1];
            }  else if (ena_filters[0] === 'Assemblies') {
                return data.assemblies === ena_filters[1];
            } else if (ena_filters[0] === 'Annotation complete') {
                return data.annotation_complete === ena_filters[1];
            } else if (ena_filters[0] === 'Annotation') {
                return data.annotation === ena_filters[1];
            }
            else if (ena_filters[0] === 'Genome Notes') {
                return data.genome === ena_filters[1];
            }
        }
    }
    updateDomForRemovedPhylogenyFilter = (filter: string) => {
        if (this.urlAppendFilterArray.length !== 0) {
            this.urlAppendFilterArray.filter(obj => {
                if (obj.value === filter) {
                    const filterIndex = this.urlAppendFilterArray.indexOf(obj);
                    this.urlAppendFilterArray.splice(filterIndex, 1);
                }
            });
        }
    }

    // tslint:disable-next-line:typedef
    checkFilterIsActive(filter: string) {
        if (this.activeFilters.indexOf(filter) !== -1) {
            return 'active-filter';
        }
        if (this.selectedTaxonomy.indexOf(filter) !== -1) {
            return 'active-filter';
        }

    }
    selectedFilterArray = (key: string, filterValue: string) => {
        let jsonObj: {};
        if (key.toLowerCase() === 'biosamples') {
            jsonObj = { name: 'biosamples', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        } else if (key.toLowerCase() === 'raw-data') {
            jsonObj = { name: 'raw_data', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        }  else if (key.toLowerCase() === 'assemblies') {
            jsonObj = { name: 'assemblies', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        } else if (key.toLowerCase() === 'annotation-complete') {
            jsonObj = { name: 'annotation_complete', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        } else if (key.toLowerCase() === 'annotation') {
            jsonObj = { name: 'annotation', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        }
        else if (key.toLowerCase() === 'genome') {
            jsonObj = { name: 'genome', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        }
        else if (key.toLowerCase() === 'phylogeny') {
            jsonObj = { name: 'phylogeny', value: filterValue };
            this.urlAppendFilterArray.push(jsonObj);
        } else if (key.toLowerCase() === 'experiment-type') {
            filterValue = filterValue.replace(/^experimentType-/, '');
            this.addSimpleFilter(filterValue, 'experiment-type', jsonObj);
        } else if (key.toLowerCase() === 'symbionts_biosamples_status') {
            filterValue = filterValue.replace(/^symbiontsBioSamplesStatus-/, '');
            this.addSimpleFilter(filterValue, key.toLowerCase(), jsonObj);
        } else if (key.toLowerCase() === 'symbionts_raw_data_status') {
            filterValue = filterValue.replace(/^symbiontsRawDataStatus-/, '');
            this.addSimpleFilter(filterValue, key.toLowerCase(), jsonObj);
        } else if (key.toLowerCase() === 'symbionts_assemblies_status') {
            filterValue = filterValue.replace(/^symbiontsAssembliesStatus-/, '');
            this.addSimpleFilter(filterValue, key.toLowerCase(), jsonObj);
        }

        else if (key.toLowerCase() === 'metagenomes-status') {
            filterValue = filterValue.replace(/^metagenomesStatus-/, '');
            this.addSimpleFilter(filterValue, 'metagenomes-status', jsonObj);
        }

    }

    addSimpleFilter = (filterValue: string, filterTerm: string, jsonObj: object) => {
        const retainedFilters = [];
        this.urlAppendFilterArray.forEach(obj => {
            if (obj.name === filterTerm) {
                retainedFilters.push(obj.value);
            }
        });
        jsonObj = retainedFilters === undefined || retainedFilters.length === 0 ? {
            name: filterTerm,
            value: filterValue
        } : {
            name: filterTerm,
            value: retainedFilters[retainedFilters.length - 1] + ',' + filterValue
        };
        console.log("jsonObj: ", jsonObj)
        this.urlAppendFilterArray.push(jsonObj);
    }

    removeSimpleFilter = (filterTitle: string, filter: string) => {
        const retainedFilters = [];
        let jsonObj: {};
        // tslint:disable-next-line:prefer-const
        let result = this.urlAppendFilterArray.filter(obj => {
            if (obj !== undefined) {
                return obj.name === filterTitle;
            }
        });
        result[0].value.split(',').forEach(item => {
             if (filter.includes('symbiontsBioSamplesStatus-') && filter.indexOf('symbiontsBioSamplesStatus-') === 0){
                filter = filter.replace(/^symbiontsBioSamplesStatus-/, '');
            }
            if (filter.includes('symbiontsRawDataStatus-') && filter.indexOf('symbiontsRawDataStatus-') === 0){
                filter = filter.replace(/^symbiontsRawDataStatus-/, '');
            }
            if (filter.includes('symbiontsAssembliesStatus-') && filter.indexOf('symbiontsAssembliesStatus-') === 0){
                filter = filter.replace(/^symbiontsAssembliesStatus-/, '');
            }

            if (filter.includes('metagenomesStatus-') && filter.indexOf('metagenomesStatus-') === 0){
                filter = filter.replace(/^metagenomesStatus-/, '');
            }
            if (filter.includes('experimentType-') && filter.indexOf('experimentType-') === 0){
                filter = filter.replace(/^experimentType-/, '');
            }

            if (item !== filter) {
                retainedFilters.push(item);
            }
        });
        if (retainedFilters.length > 0 ){
            jsonObj = {
                name: filterTitle,
                value:  retainedFilters.join(',')
            };
        }
        let inactiveClassName: string;
        this.urlAppendFilterArray.filter(obj => {
            if (obj.name.toLowerCase() === filterTitle) {

                const filterIndex = this.urlAppendFilterArray.indexOf(obj);
                this.urlAppendFilterArray.splice(filterIndex, 1);
                inactiveClassName = obj.name + '-inactive';
                $('.' + inactiveClassName).removeClass('active');
                if (jsonObj !== undefined){
                    this.urlAppendFilterArray.push(jsonObj);
                }

             }
        });
    }

    updateDomForRemovedFilter = (filter: string) => {
        // tslint:disable-next-line:triple-equals
        if (this.urlAppendFilterArray.length != 0) {
            let inactiveClassName: string;

          if (filter.includes('symbiontsBioSamplesStatus-') && filter.indexOf('symbiontsBioSamplesStatus-') === 0) {
                this.urlAppendFilterArray.filter(obj => {
                    if (obj.name.toLowerCase() === 'symbionts_biosamples_status') {
                        this.removeSimpleFilter('symbionts_biosamples_status', filter);
                    }
                });
            } else if (filter.includes('symbiontsRawDataStatus-') && filter.indexOf('symbiontsRawDataStatus-') === 0) {
                this.urlAppendFilterArray.filter(obj => {
                    if (obj.name.toLowerCase() === 'symbionts_raw_data_status') {
                        this.removeSimpleFilter('symbionts_raw_data_status', filter);
                    }
                });
            } else if (filter.includes('symbiontsAssembliesStatus-') && filter.indexOf('symbiontsAssembliesStatus-') === 0) {
                this.urlAppendFilterArray.filter(obj => {
                    if (obj.name.toLowerCase() === 'symbionts_assemblies_status') {
                        this.removeSimpleFilter('symbionts_assemblies_status', filter);
                    }
                });
            }

            else if (filter.includes('metagenomesStatus-') && filter.indexOf('metagenomesStatus-') === 0) {
                this.urlAppendFilterArray.filter(obj => {
                    if (obj.name.toLowerCase() === 'metagenomes-status') {
                        this.removeSimpleFilter('metagenomes-status', filter);
                    }
                });
            } else  if (filter.includes('experimentType-') && filter.indexOf('experimentType-') === 0) {
                this.urlAppendFilterArray.filter(obj => {
                    if (obj.name.toLowerCase() === 'experiment-type') {
                        this.removeSimpleFilter('experiment-type', filter);
                    }
                });
            } else {
                this.urlAppendFilterArray.filter(obj => {
                    if (obj.value === filter) {
                        inactiveClassName = obj.name + '-inactive';
                        $('.' + inactiveClassName).removeClass('active');
                        const filterIndex = this.urlAppendFilterArray.indexOf(obj);
                        this.urlAppendFilterArray.splice(filterIndex, 1);
                    }
                });
            }

        }
    }

    // tslint:disable-next-line:typedef
    getFilters(data) {
        this.parseFilterAggregation(data);
        if (this.phylSelectedRank !== '') {
            this.selectedFilterValue = {
                rank: this.phylSelectedRank.split(' - ')[0],
                taxonomy: data.aggregations.childRank.scientificName.buckets[0].key,
                commonName: data.aggregations.childRank.scientificName.buckets[0].commonName.buckets[0].key,
                taxId: data.aggregations.childRank.scientificName.buckets[0].taxId.buckets[0].key
            };
        }
    }

    parseFilterAggregation = (data: any) => {
        console.log("parseFilterAggregation data: ", data)
        this.filterArray = [] ;
        this.symbiontsFilters = [];
        this.filtersMap = data;
        let biosamplesFiltersCount = 0;
        this.BiosamplesFilters = this.filtersMap.aggregations.biosamples.buckets.filter(i => {
            if (i !== '' && i.key.toLowerCase() === 'done') {
                const obj = i;
                obj.key = 'Biosamples - ' + obj.key;
                biosamplesFiltersCount = obj.doc_count;
                return obj;
            }
        });

        this.filterArray.push({
            title: 'Biosamples - Submitted',
            key: 'Biosamples - Done',
            label: 'biosamples',
            count:  biosamplesFiltersCount
        });
        let rawDataFiltersCount = 0;
        this.RawDataFilters = this.filtersMap.aggregations.raw_data.buckets.filter(i => {
            if (i !== '' && i.key.toLowerCase() === 'done') {
                const obj = i;
                obj.key = 'Raw data - ' + obj.key;
                rawDataFiltersCount = obj.doc_count;
                return obj;
            }
        });

        this.filterArray.push({
            title: 'Raw Data - Submitted',
            key: 'Raw data - Done',
            label: 'raw-data',
            count:  rawDataFiltersCount
        });

        let assembliesFiltersCount = 0;
        this.AssembliesFilters = this.filtersMap.aggregations.assemblies.buckets.filter(i => {
            if (i !== '' && i.key.toLowerCase() === 'done') {
                const obj = i;
                obj.key = 'Assemblies - ' + obj.key;
                assembliesFiltersCount = obj.doc_count;
                return obj;
            }
        });
        this.filterArray.push({
            title: 'Assemblies - Submitted',
            key: 'Assemblies - Done',
            label: 'assemblies',
            count:  assembliesFiltersCount
        });
        let annotationCompleteFiltersCount = 0;
        this.AnnotationCompleteFilters = this.filtersMap.aggregations.annotation_complete.buckets.filter(i => {
            if (i !== '' && i.key.toLowerCase() === 'done') {
                const obj = i;
                obj.key = 'Annotation complete - ' + obj.key;
                annotationCompleteFiltersCount = obj.doc_count;
                return obj;
            }
        });
        this.filterArray.push({
            title: 'Annotation Complete - Done',
            key: 'Annotation complete - Done',
            label: 'annotation-complete',
            count: annotationCompleteFiltersCount
        });
        let annotationFiltersCount = 0;
        this.AnnotationFilters = this.filtersMap.aggregations.annotation.buckets.filter(i => {
            if (i !== '' && i.key.toLowerCase() === 'done') {
                const obj = i;
                obj.key = 'Annotation - ' + obj.key;
                annotationFiltersCount = obj.doc_count;
                return obj;
            }
        });
        if(annotationFiltersCount > 0){
            this.filterArray.push({
                title: 'Annotation - Submitted',
                key: 'Annotation - Done',
                label: 'annotation',
                count: annotationFiltersCount
            });
        }

        const genome = this.filtersMap.aggregations.genome.doc_count;
        this.GenomeFilters = [{key: 'Genome Notes - Submitted', doc_count: genome}];
        this.filterArray.push({
            title: 'Genome Notes - Submitted',
            key: 'Genome Notes - Submitted',
            label: 'genome',
            count:  genome
        });

        this.experimentTypeFilters = this.filtersMap.aggregations.experiment.library_construction_protocol.buckets;

        //todelete
        if (this.filtersMap.aggregations.symbionts_status) {
            // this.symbiontsFilters = this.filtersMap.aggregations.symbionts_status.buckets;
        }

        if (this.filtersMap.aggregations.symbionts_biosamples_status) {
            this.symbiontsFilters = this.merge(this.symbiontsFilters,
                this.filtersMap.aggregations.symbionts_biosamples_status.buckets, 'symbionts_biosamples_status', 'symbiontsBioSamplesStatus');
        }
        if (this.filtersMap.aggregations.symbionts_raw_data_status) {
            this.symbiontsFilters = this.merge(this.symbiontsFilters,
                this.filtersMap.aggregations.symbionts_raw_data_status.buckets, 'symbionts_raw_data_status', 'symbiontsRawDataStatus');
        }
        if (this.filtersMap.aggregations.symbionts_assemblies_status) {
            this.symbiontsFilters = this.merge(this.symbiontsFilters,
                this.filtersMap.aggregations.symbionts_assemblies_status.buckets, 'symbionts_assemblies_status', 'symbiontsAssembliesStatus');
        }


        if (this.filtersMap.aggregations.metagenomes_status) {
            this.metagenomesFilters = this.filtersMap.aggregations.metagenomes_status.buckets;
        }

        this.bioSampleTotalCount = data.hits.total.value;
        if (data.aggregations.childRank !== undefined) {
            this.selectedTaxonomy.push(data.aggregations.childRank.scientificName.buckets[0]);
        }
    }


    merge = (first: any[], second: any[], filterLabel, filterPrefix) => {
        for (let i = 0; i < second.length; i++) {
            second[i].label = filterLabel;
            second[i].filterPrefix = filterPrefix;
            first.push(second[i]);
        }
        return first;
    }


    updateActiveRouteParams = () => {
        const params = {};
        const currentUrl = this.router.url;
        const paramArray = this.urlAppendFilterArray.map(x => Object.assign({}, x));
        if (paramArray.length !== 0) {
            paramArray.forEach(item => {
                params[item.name] = item.value;
            });
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                this.router.navigate([currentUrl.split('?')[0]], { queryParams: params } );
            });
        }
        else {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                this.router.navigate([currentUrl.split('?')[0]] );
            });
        }
    }




}
