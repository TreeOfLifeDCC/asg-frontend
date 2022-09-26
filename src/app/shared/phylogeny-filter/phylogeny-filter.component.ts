import { Component, OnInit } from '@angular/core';
import {FilterService} from '../../services/filter-service';
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import {TaxanomyService} from "../../taxanomy/taxanomy.service";
import {Taxonomy} from "../../taxanomy/taxonomy.model";


@Component({
  selector: 'app-phylogeny-filter',
  templateUrl: './phylogeny-filter.component.html',
  styleUrls: ['./phylogeny-filter.component.css']
})
export class PhylogenyFilterComponent implements OnInit {
   childTaxanomy: Taxonomy;



  constructor( private activatedRoute: ActivatedRoute, private router: Router, private spinner: NgxSpinnerService,
               private taxanomyService: TaxanomyService, public filterService: FilterService
  ) { }
  currentTaxonomyTree: any;
  currentTaxonomy: any;
  isDoubleClick: Boolean;

  isFilterSelected: Boolean;

  selectedFilterValue;
  currentTaxaOnExpand;

  showElement: Boolean = true;
  // Ontology aware filter
  // Ontology aware filter
  initTaxonomyObject() {
    this.childTaxanomy = {
      cellularorganism: [{ parent: 'Root', rank: 'superkingdom', expanded: false, childData: [{ key: 'Eukaryota', doc_count: '1', commonName: {buckets:[]}, taxId: {buckets:[]} }] }],
      superkingdom: [],
      kingdom: [],
      subkingdom: [],
      superphylum: [],
      phylum: [],
      subphylum: [],
      superclass: [],
      class: [],
      subclass: [],
      infraclass: [],
      cohort: [],
      subcohort: [],
      superorder: [],
      order: [],
      parvorder: [],
      suborder: [],
      infraorder: [],
      section: [],
      subsection: [],
      superfamily: [],
      family: [],
      subfamily: [],
      tribe: [],
      subtribe: [],
      genus: [],
      series: [],
      subgenus: [],
      species_group: [],
      species_subgroup: [],
      species: [],
      subspecies: [],
      varietas: [],
      forma: []
    };
    this.filterService.taxonomies = [
      "cellularorganism",
      "superkingdom",
      "kingdom",
      "subkingdom",
      "superphylum",
      "phylum",
      "subphylum",
      "superclass",
      "class",
      "subclass",
      "infraclass",
      "cohort",
      "subcohort",
      "superorder",
      "order",
      "parvorder",
      "suborder",
      "infraorder",
      "section",
      "subsection",
      "superfamily",
      "family",
      "subfamily",
      "tribe",
      "subtribe",
      "genus",
      "series",
      "subgenus",
      "species_group",
      "species_subgroup",
      "species",
      "subspecies",
      "varietas",
      "forma"
    ];
    $('#myUL, #root-list, #Eukaryota-superkingdom').toggleClass("active");
  }

  toggleTaxanomy(rank, taxonomy) {
    $('#' + rank).toggleClass('active');
  }

  ngOnInit(): void {

    this.isFilterSelected = this.filterService.isFilterSelected;
    // this.childTaxanomy = this.filterService.childTaxanomy;
    this.selectedFilterValue = this.filterService.selectedFilterValue;
    this.currentTaxonomyTree = [];
    this.resetTaxaTree();
    this.getChildTaxonomyRank('superkingdom', 'Eukaryota', 'kingdom');
    // const treeLength = this.filterService.currentTaxonomyTree.length;
    // this.filterService.selectedTaxnomyFilter = this.filterService.currentTaxonomyTree[treeLength - 1];
    // console.log(this.filterService.selectedTaxnomyFilter);
    // this.filterService.isFilterSelected = true;
    // this.filterService.selectedTaxonomy = this.filterService.currentTaxonomyTree[treeLength - 1];
    // this.currentTaxaOnExpand='';
    this.filterService.urlAppendFilterArray.forEach(item => {
      setTimeout(() => {
        const inactiveClassName = '.' + item.name + '-inactive';
        const element = 'li:contains(\'' + item.value + '\')';
        $(element).addClass('active');
      }, 1);


    });
  }
  hideTaxaModal() {
    this.spinner.show();
    this.resetTaxaTree();
    this.getChildTaxonomyRank('superkingdom', 'Eukaryota', 'kingdom');
    $('.kingdom, .subkingdom').removeClass('active-filter');
    // setTimeout(() => {
    //   if (this.filterService.activeFilters.length !== 0 || this.filterService.currentTaxonomyTree.length != 0) {
    //     const taxa = [this.currentTaxonomyTree];
    //     // this.filterService.getFilterResults(this.filterService.activeFilters.toString(), this.filterService.sort.active, this.filterService.sort.direction, 0, this.filterService.pagesize, taxa);
    //   }
    //   else {
    //     this.router.navigate(['gis'], {});
    //     // this.dataSource.filter = undefined;
    //     // this.getFilters();
    //     // this.getAllBiosamples(0, this.pagesize, this.sort.active, this.sort.direction);
    //     this.getChildTaxonomyRank('superkingdom', 'Eukaryota', 'kingdom');
    //   }
    //   this.spinner.hide();
    // }, 250);
  }

  showTaxonomyModal(event: any, rank: string, taxonomy: string, childRank: string) {

    this.filterService.searchText = "";
    this.isDoubleClick = false;
    setTimeout(() => {
      if (!this.isDoubleClick) {
        $('#myUL').css('display', 'none');
        this.filterService.modalTaxa = taxonomy;
        if ($(event.target).hasClass('active-filter')) {
          let taxa = { 'rank': 'superkingdom', 'taxonomy': 'Eukaryota', 'childRank': 'kingdom' };
          this.currentTaxonomyTree = [];
          this.currentTaxonomyTree = [taxa];
          this.currentTaxonomy = taxa;
          this.selectedFilterValue = '';
          this.isFilterSelected = false;
          this.filterService.phylSelectedRank = '';
          $(event.target).removeClass('active-filter');
          // this.getActiveFiltersAndResult();
          setTimeout(() => {
            this.isFilterSelected = false;
            $('#myUL').css('display', 'block');
          }, 250);
        }
        else {
          this.spinner.show();
          this.resetTaxaTree();
          this.getChildTaxonomyRank('superkingdom', 'Eukaryota', 'kingdom');
          $('.kingdom, .subkingdom').removeClass('active-filter');
          setTimeout(() => {
            this.getChildTaxonomyRank(rank, taxonomy, childRank);
            $(event.target).addClass('active-filter');
            this.filterService.modalTaxa = taxonomy;
          }, 150);

          setTimeout(() => {
            $('#myUL').css('display', 'block');
            $('.subkingdom').addClass('active');
            $('#taxonomyModal').modal({ backdrop: 'static', keyboard: false });
            $('#taxonomyModal').modal('show');
            $(".modal-backdrop").show();
            this.spinner.hide();
          }, 900);
        }
      }
    }, 250);
  }

  getChildTaxonomyRank(rank: string, taxonomy: string, childRank: string) {
    let taxa = { 'rank': rank, 'taxonomy': taxonomy, 'childRank': childRank };
    this.currentTaxonomy = taxa;
    this.createTaxaTree(rank, taxa);
    if (this.showElement) {
      this.taxanomyService.getChildTaxonomyRank(this.filterService.activeFilters, rank, taxonomy, childRank, this.currentTaxonomyTree, 'data', this.filterService.searchText).subscribe(
          data => {
            this.parseAndPushTaxaData(rank, data);
            setTimeout(() => {
              let childRankIndex = this.filterService.taxonomies.findIndex(x => x === data[rank].rank);
              let childData = data[rank].childData;
              if (childData.length == 1 && childData[0].key === 'Other') {
                if (this.filterService.taxonomies[childRankIndex + 1] != undefined) {
                  let taxa = { 'rank': data[rank].rank, 'taxonomy': 'Other', 'childRank': this.filterService.taxonomies[childRankIndex + 1] };
                  this.getChildTaxonomyRank(taxa.rank, taxa.taxonomy, taxa.childRank);
                }
              }
              else {
                this.currentTaxaOnExpand = this.currentTaxonomy;
                if ((childData.length > 1 && childData.filter(function (e) { return e.key === 'Other'; }).length > 0) || (childData.length == 1 && this.currentTaxaOnExpand.taxonomy === 'Other')) {
                  let childClass = 'Other-' + this.currentTaxaOnExpand.childRank;
                  $('ul.' + childClass).css('padding-inline-start', '40px');
                }
              }
              setTimeout(() => {
                $('.' + taxonomy + '-' + childRank).addClass("active");
              }, 120);
            }, 100);
          },
          err => {
            console.log(err);
          });
    }
  }

  getChildTaxonomyRankEvent(event, rank: string, taxonomy: string, childRank: string) {
    this.spinner.show();
    $('#myUL').css('display', 'none');
    setTimeout(() => {
      let taxa = { 'rank': rank, 'taxonomy': taxonomy, 'childRank': childRank };
      this.currentTaxaOnExpand = taxa;
      if ($(event.target).hasClass('fa-plus-circle')) {
        this.getChildTaxonomyRank(rank, taxonomy, childRank);
        setTimeout(() => {
          $(event.target).removeClass('fa-plus-circle');
          $(event.target).addClass('fa-minus-circle');
          setTimeout(() => {
            $('#myUL').css('display', 'block');
            this.spinner.hide();
          }, 850);
        }, 100);
      }
      else if ($(event.target).hasClass('fa-minus-circle')) {
        this.spinner.show();
        $(event.target).removeClass('fa-minus-circle');
        $(event.target).addClass('fa-plus-circle');
        this.removeRankFromTaxaTree(taxa);
        setTimeout(() => {
          $('#myUL').css('display', 'block');
          this.spinner.hide();
        }, 200);
      }
    }, 250);
  }

  filterTaxonomy(rank: string, taxonomy: string, childRank: string, commonName, taxId) {

    this.isDoubleClick = true;
    let taxa = { 'rank': rank, 'taxonomy': taxonomy, 'childRank': childRank, 'commonName': commonName };
    this.selectedFilterValue = taxa;
    const filterObj = rank + ' - ' + taxId;
    this.filterService.selectedFilterArray('phylogeny', filterObj);
    this.filterService.updateActiveRouteParams();

    this.isDoubleClick = true;
    this.createTaxaTree(rank, taxa);
    this.filterService.selectedTaxonomy.push(taxa);
    $('#taxonomyModal').modal('hide');
    $('.modal-backdrop').hide();
    setTimeout(() => {
      const treeLength = this.currentTaxonomyTree.length;
      this.currentTaxonomy = this.currentTaxonomyTree[treeLength - 1];
      // this.getActiveFiltersAndResult(this.currentTaxonomyTree);
    }, 300);
    setTimeout(() => {
      this.isFilterSelected = true;
      $('#' + this.filterService.modalTaxa + '-kingdom').addClass('active-filter');
      this.isDoubleClick = false;
    }, 350);

  }
  resetTaxaTree() {
    $('.nested').removeClass('active');
    this.filterService.selectedTaxonomy = [];
    this.currentTaxonomyTree = [];
    this.filterService.modalTaxa = '';
    this.currentTaxaOnExpand = '';
    this.initTaxonomyObject();
  }



  createTaxaTree(rank, taxa) {
    let temp = this.currentTaxonomyTree;
    if (temp.length > 0) {
      if (!(temp.filter(function (e) { return e.rank === taxa.rank; }).length > 0)) {
        if (!(temp.filter(function (e) { return (e.taxonomy === taxa.taxonomy && e.rank === taxa.rank) }).length > 0)) {
          this.currentTaxonomyTree.push(taxa);
        }
      }
      else {
        if (!(temp.filter(function (e) { return (e.taxonomy === taxa.taxonomy && e.rank === taxa.rank) }).length > 0)) {
          let index = temp.findIndex(x => x.rank === taxa.rank);
          let itemsToremove = this.currentTaxonomyTree;
          let prevTaxaToRemove = this.currentTaxonomyTree[this.currentTaxonomyTree.length - 1];
          this.currentTaxonomyTree = this.currentTaxonomyTree.slice(0, index);
          itemsToremove = itemsToremove.splice(index);
          itemsToremove.forEach(element => {
            $('.' + element.taxonomy + '-' + element.childRank).removeClass("active");
          });
          let taxaIndex = this.filterService.taxonomies.findIndex(x => x === taxa.rank) + 1;

          for (let i = taxaIndex; i < this.filterService.taxonomies.length; i++) {
            this.childTaxanomy[this.filterService.taxonomies[i]] = [];
          }
          this.currentTaxonomyTree.push(taxa);
          this.showElement = true;
          $('#' + prevTaxaToRemove.taxonomy + '-' + prevTaxaToRemove.rank).prev().removeClass('fa-minus-circle');
          $('#' + prevTaxaToRemove.taxonomy + '-' + prevTaxaToRemove.rank).prev().addClass('fa-plus-circle');
        }
        else {
          let index = temp.findIndex(x => x.rank === taxa.rank);
          let itemsToremove = this.currentTaxonomyTree;
          let prevTaxaToRemove = this.currentTaxonomyTree[this.currentTaxonomyTree.length - 1];
          this.currentTaxonomyTree = this.currentTaxonomyTree.slice(0, index);
          itemsToremove = itemsToremove.splice(index);
          itemsToremove.forEach(element => {
            $('.' + element.taxonomy + '-' + element.childRank).removeClass("active");
          });
          let taxaIndex = this.filterService.taxonomies.findIndex(x => x === taxa.rank) + 1;
          for (let i = taxaIndex; i < this.filterService.taxonomies.length; i++) {
            this.childTaxanomy[this.filterService.taxonomies[i]] = [];
          }
          if (this.isDoubleClick) {
            this.currentTaxonomyTree.push(taxa);
          }
          this.showElement = true;
          $('#' + prevTaxaToRemove.taxonomy + '-' + prevTaxaToRemove.rank).prev().removeClass('fa-minus-circle');
          $('#' + prevTaxaToRemove.taxonomy + '-' + prevTaxaToRemove.rank).prev().addClass('fa-plus-circle');
        }
      }
    }
    else {
      this.currentTaxonomyTree.push(taxa);
    }
  }


  parseAndPushTaxaData(rank, data) {
    const temp = this.childTaxanomy[rank];

    if (temp.length > 0) {
      if (!(temp.filter(function(e) { return e.parent === data[rank].parent; }).length > 0)) {
        this.childTaxanomy[rank].push(data[rank]);
      }
    }
    else {
      this.childTaxanomy[rank].push(data[rank]);
    }
  }
  // filterTaxonomy = (rank: string, taxonomy: string, childRank: string, commonName, taxId) => {
  //   const taxa = { rank, taxonomy, childRank, commonName, taxId };
  //   this.filterService.selectedFilterValue = taxa;
  //   this.selectedFilterValue = taxa;
  //   const filterObj = rank + ' - ' + taxId;
  //   this.filterService.phylSelectedRank = filterObj;
  //   this.filterService.selectedFilterArray('phylogeny', filterObj);
  //   this.filterService.updateActiveRouteParams();
  //   this.isDoubleClick = true;
  //   this.createTaxaTree(rank, taxa);
  //   this.filterService.selectedTaxonomy.push(taxa);
  //   $('#taxonomyModal').modal('hide');
  //   $('.modal-backdrop').hide();
  //   setTimeout(() => {
  //     const treeLength = this.currentTaxonomyTree.length;
  //     this.currentTaxonomy = this.currentTaxonomyTree[treeLength - 1];
  //   }, 300);
  //   setTimeout(() => {
  //     this.isFilterSelected = true;
  //     $('#' + taxonomy + '-kingdom').addClass('active-filter');
  //     this.isDoubleClick = false;
  //   }, 350);
  //
  // }
  removeRankFromTaxaTree(taxa) {
    const temp = this.currentTaxonomyTree;
    const index = temp.findIndex(x => x.rank === taxa.rank);
    let itemsToremove = this.currentTaxonomyTree;
    this.currentTaxonomyTree = this.currentTaxonomyTree.slice(0, index);
    itemsToremove = itemsToremove.splice(index);
    const taxaIndex = this.filterService.taxonomies.findIndex(x => x === taxa.rank);
    for (let i = taxaIndex; i < this.filterService.taxonomies.length; i++) {
      const taxRank = this.filterService.taxonomies[i];
      this.childTaxanomy[taxRank] = [];
    }
    setTimeout(() => {
      this.filterService.currentTaxonomy = this.currentTaxonomyTree[this.currentTaxonomyTree.length - 1];
    }, 50);
  }

  // getChildTaxonomyRankEvent(event, rank: string, taxonomy: string, childRank: string) {
  //   this.spinner.show();
  //   $('#myUL').css('display', 'none');
  //   setTimeout(() => {
  //     let taxa = { 'rank': rank, 'taxonomy': taxonomy, 'childRank': childRank };
  //     this.currentTaxaOnExpand = taxa;
  //     if ($(event.target).hasClass('fa-plus-circle')) {
  //       this.getChildTaxonomyRank(rank, taxonomy, childRank);
  //       setTimeout(() => {
  //         $(event.target).removeClass('fa-plus-circle');
  //         $(event.target).addClass('fa-minus-circle');
  //         setTimeout(() => {
  //           $('#myUL').css('display', 'block');
  //           this.spinner.hide();
  //         }, 850);
  //       }, 100);
  //     }
  //     else if ($(event.target).hasClass('fa-minus-circle')) {
  //       this.spinner.show();
  //       $(event.target).removeClass('fa-minus-circle');
  //       $(event.target).addClass('fa-plus-circle');
  //       this.removeRankFromTaxaTree(taxa);
  //       setTimeout(() => {
  //         $('#myUL').css('display', 'block');
  //         this.spinner.hide();
  //       }, 200);
  //     }
  //   }, 250);
  // }


}