import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sample, samples } from '../../../dashboard/model/dashboard.model';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {StatusesService} from '../../services/statuses.service';
import {MatFormField} from '@angular/material/form-field';
import {MatFormFieldModule} from '@angular/material/form-field';
import {sample} from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-tracking-system-details',
  templateUrl: './details.component.html',
  imports: [
    MatFormField,
    MatFormFieldModule,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator
  ],
  styleUrls: ['./details.component.css']
})
export class TrackingDetailsComponent implements OnInit {

  bioSampleId;
  bioSampleObj;
  dataSourceFiles;
  dataSourceAssemblies;

  displayedColumnsFiles = ['study_accession', 'experiment_accession', 'run_accession', 'fastq_ftp', 'submitted_ftp',
    'instrument_platform', 'instrument_model', 'library_layout', 'library_strategy', 'library_source',
    'library_selection'];
  displayedColumnsAssemblies = ['accession', 'assembly_name', 'description', 'version'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute, private statusesService: StatusesService) {
    this.route.params.subscribe(param => this.bioSampleId = param.organism);
    this.getBiosamples();
  }

  getBiosamples() {
    this.statusesService.getBiosampleByOrganism(this.bioSampleId)
      .subscribe(
        data => {
          console.log(data)
          this.bioSampleObj = data;
          this.dataSourceFiles = new MatTableDataSource<Sample>(this.bioSampleObj.experiment);
          this.dataSourceAssemblies = new MatTableDataSource<any>(this.bioSampleObj.assemblies);
          this.dataSourceFiles.paginator = this.paginator;
          this.dataSourceFiles.sort = this.sort;
        },
        err => console.log(err)
      );
  }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:typedef
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
  }

    protected readonly sample = sample;
}
