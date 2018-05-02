import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { JadeService } from '../../@core/data/jade.service';

@Component({
  selector: 'ngx-jade-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();

  private detail: any;
  private detail_is_perm_admin = false;
  private detail_is_perm_user = false;

  private detail_create: any;
  private create_is_perm_admin = false;
  private create_is_perm_user = true;

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
      username: {
        title: 'Username',
        type: 'string',
      },
      name: {
        title: 'Name',
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

    const db = this.jService.get_users();

    this.source.load(db().get());
    db.settings({
      onDBChange: () => { this.source.load(db().get()); this.detail = {}; },
    });
  }

  private onRowSelect(event): void {
    this.detail = Object.assign({}, event.data);
    delete this.detail.___id;
    delete this.detail.___s;

    this.detail_is_perm_admin = false;
    this.detail_is_perm_user = false;

    for(const k in this.detail.permissions) {
      if(this.detail.permissions[k].permission === 'admin') {
        this.detail_is_perm_admin = true;
      }

      if(this.detail.permissions[k].permission === 'user') {
        this.detail_is_perm_user = true;
      }
    }
  }

  private onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.jService.delete_user(event.data.uuid);
    }
  }

  private update_handler(): void {
    this.detail.permissions = [];

    // permission checks
    if(this.detail_is_perm_admin === true) {
      const tmp = {permission: 'admin'};
      this.detail.permissions.push(tmp);
    }
    if(this.detail_is_perm_user === true) {
      const tmp = {permission: 'user'};
      this.detail.permissions.push(tmp);
    }

    this.jService.update_user(this.detail.uuid, this.detail);
  }

  private create_handler(): void {
    console.log("Fired create_handler.");

    this.detail_create['permissions'] = [];

    // permissino checks
    if(this.create_is_perm_admin === true) {
      const tmp = {permission: 'admin'};
      this.detail_create.permissions.push(tmp);
    }

    if(this.create_is_perm_user === true) {
      const tmp = {permission: 'user'};
      this.detail_create.permissions.push(tmp);
    }

    this.jService.create_user(this.detail_create);
  }

  ngOnInit() {
    // get
  }


}
