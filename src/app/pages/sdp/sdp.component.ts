import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { JadeService } from '../../@core/data/jade.service';

@Component({
  selector: 'ngx-jade-sdp',
  templateUrl: './sdp.component.html',
  styleUrls: ['./sdp.component.scss'],
})
export class SdpComponent implements OnInit {
  source: LocalDataSource = new LocalDataSource();
  source_contents: LocalDataSource = new LocalDataSource();

  private detail: any;
  private detail_create: any;

  private settings = {
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    actions: {
      add: true,
      edit: false,
      delete: true,
      columnTitle: '',
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true,
    },
    columns: {
      name: {
        title: 'Name',
        type: 'string',
      },
    },
  }

  private settings_contents = {
    actions: {
      add: true,
      edit: true,
      delete: true,
      columnTitle: 'Actions',
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
    },
    columns: {
      sequence: {
        title: 'Sequence',
        type: 'number',
      },
      type: {
        title: 'Type',
        type: 'string',
      },
      content: {
        title: 'Content',
        type: 'string',
      },
    },
  }

  constructor(private jService: JadeService) {
    this.detail = {};
    this.detail_create = {};

    // main
    const db = this.jService.get_sdialplans();

    this.source.load(db().get());
    db.settings({
      onDBChange: () => { 
        // this.source.empty();
        this.source.load(db().get()); 
        this.detail = {}; 
      },
    });
  }

  private onRowSelect(event): void {
    this.detail = Object.assign({}, event.data);
    delete this.detail.___id;
    delete this.detail.___s;

    this.source_contents.empty();
    this.source_contents.refresh();

    let seq = 0;
    for(let i = 0; i < this.detail.contents.length; i++) {
      const content = this.detail.contents[i];

      const type = Object.keys(content)[0];
      
      const j_tmp = {
        sequence: seq,
        type: type,
        content: content[type],
      }
      // this.source_contents.add(j_tmp);
      this.source_contents.append(j_tmp);
      seq++;

      console.log("Add data. " + seq + ', ' + type + ', ' + content[type]);
    }
  }

  private onCreateConfirm(event): void {
    console.log("Fired onCreateConfirm.");
    const j_data = {
      name: event.newData.name,
      contents: [],
    }

    this.jService.create_sdialplan(j_data);
    event.confirm.resolve();
  }

  private onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.jService.delete_sdialplan(event.data.name);
    }
  }

  private onRowSelectContents(event): void {

  }

  private onCreateConfirmContents(event): void {
    console.log("Fired onCreateConfirmContents.");
    event.confirm.resolve(event.newData);
        
    console.log("Count: " + event.source.count());    
  }

  private onDeleteConfirmContents(event): void {

  }

  private update_handler(): void {

    this.source_contents.setSort([{ field: 'sequence', direction: 'asc' }]);

    this.source_contents.getElements().then(
      data => {
        const j_contents = [];
        for(let i = 0; i < data.length; i++) {
          const j_tmp = {
            type: data[i].type,
            content: data[i].content,
          }

          j_contents.push(j_tmp);
        }

        console.log(j_contents);

        const j_data = {
          name: this.detail.name,
          contents: j_contents,
        }

        console.log("update data: " + j_data);

        this.jService.update_sdialplan(j_data.name, j_data);
      },
    );
 }

  private create_handler(): void {
    console.log("Fired create_handler.");

    this.jService.create_trunk(this.detail_create);
  }

  ngOnInit() {
    // get
  }


}
