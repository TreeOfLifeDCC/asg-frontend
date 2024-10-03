import { Component, OnInit } from '@angular/core';
import { TaxanomyService } from './taxanomy.service';
import { Taxonomy } from './taxonomy.model';

@Component({
  standalone: true,
  selector: 'app-taxanomy',
  templateUrl: './taxanomy.component.html',
  imports: [],
  styleUrls: ['./taxanomy.component.css']
})
export class TaxanomyComponent implements OnInit {

  taxonomies: any;

  childTaxanomy: Taxonomy;
  selectedTaxonomy: any;

  constructor(private taxanomyService: TaxanomyService) { }

  ngOnInit(): void {
    this.selectedTaxonomy = [];
    // this.initTaxonomyObject();
  }

  toggleTaxanomy(rank, taxonomy) {
    $('#' + rank).toggleClass("active");
    $('#' + taxonomy).toggleClass("caret-down");
  }

  getChildTaxonomyRank(rank: string, taxonomy: string, childRank: string) {
    this.taxanomyService.getChildTaxonomyRank('',rank, taxonomy, childRank, '', 'data').subscribe(
      data => {
        this.selectedTaxonomy.push(taxonomy);
        this.parseAndPushTaxaData(rank, data);
        setTimeout(() => {
          $('.' + taxonomy).toggleClass("active");
          $('#' + taxonomy).toggleClass("caret-down");
        }, 50);
      },
      err => {
        console.log(err);
      })
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

}
