import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { JadeService } from '../../@core/data/jade.service';

@Component({
  selector: 'ngx-jade-trunk',
  templateUrl: './trunk.component.html',
  styleUrls: ['./trunk.component.scss'],
})
export class TrunkComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();

  private detail: any;
  private detail_create: any;

  private settings = {
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    actions: {
      add: false,
      edit: false,
      delete: true,
      columnTitle: '',
    },
    columns: {
      name: {
        title: 'Name',
        type: 'string',
      },
      status: {
        title: 'Status',
        type: 'string',
      },
      hostname: {
        title: 'Hostname',
        type: 'string',
      },
      context: {
        title: 'Context',
        type: 'string',
      },
    },
  }

  constructor(private jService: JadeService) {
    this.detail = {};
    this.detail_create = {};

    const db = this.jService.get_trunks();

    this.source.load(db().get());
    db.settings({
      onDBChange: () => { this.source.load(db().get()); this.detail = {}; },
    });
  }

  private onRowSelect(event): void {
    this.detail = Object.assign({}, event.data);
    delete this.detail.___id;
    delete this.detail.___s;
  }

  private onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.jService.delete_trunk(event.data.name);
    }
  }

  private update_handler(): void {
    this.jService.update_trunk(this.detail.name, this.detail);
  }

  private create_handler(): void {
    console.log("Fired create_handler.");

    this.jService.create_trunk(this.detail_create);
  }

  ngOnInit() {
    // get
  }


}
