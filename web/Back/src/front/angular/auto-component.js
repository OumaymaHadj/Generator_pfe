import { greenText, purpleText, redText } from "../../../public/data-modal.js";
import fs from "fs";
import util from "util";
import { exec } from "child_process";
import path from "path";

const execPromise = util.promisify(exec);
const writeFileAsync = util.promisify(fs.writeFile);

export async function generateComponent(selectedTable, projectPath, database) {

  const selectedTableName = selectedTable.name
  const componentPath = path.join(projectPath, "src", "app", selectedTableName);

  if (fs.existsSync(componentPath)) {
    console.log(`\nComponent '${selectedTableName}' already exists.`);
    return;
  }

  try {
    await execPromise(`ng generate component ${selectedTableName}`, {
      cwd: projectPath,
    });

    console.log(
      greenText,
      `\n\t Component \x1b[1m${selectedTableName}\x1b[0m \x1b[32mcreated successfully \u2714.`
    );

    const fieldNames = selectedTable.fields
    .filter((field) => field.field !== "_id")
    .map((field) => field.field);
    console.log(fieldNames);
    await updataTSComponent(selectedTable, projectPath, fieldNames);
    await updateHtmlComponent(selectedTable, projectPath, database);
  } catch (error) {
    console.error(`Error generating component: ${error.message}`);
  }
}

async function updataTSComponent(selectedTable, projectPath, fieldNames) {
  const selectedTableName = selectedTable.name
  const tsFilePath = path.join(
    projectPath,
    `src/app/${selectedTableName}/${selectedTableName}.component.ts`
  );
  const fileContent = generateTSContent(selectedTable,fieldNames);
  await writeFileAsync(tsFilePath, fileContent.trim());
  console.log(
    `\n \t \x1b[1m${selectedTableName}.component.ts\x1b[0m updated \u2714.`
  );  
}

async function updateHtmlComponent(selectedTable, projectPath, database) {
  const selectedTableName = selectedTable.name
  const htmlFilePath = path.join(
    projectPath,
    `src/app/${selectedTableName}/${selectedTableName}.component.html`
  );
  const fileContent = generateHTMLContent(selectedTable);
  await writeFileAsync(htmlFilePath, fileContent.trim());
  console.log(
    `\n \t \x1b[1m${selectedTableName}.component.ts\x1b[0m updated \u2714.`
  );  
}

function generateTSContent(selectedTable,fieldNames) {

  const selectedTableName = capitalizeFirstLetter(selectedTable.name);
  const lowerTableName = selectedTableName.charAt(0).toLowerCase() + selectedTableName.slice(1);
  const nameService = `${lowerTableName}Service`;

  return `

import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ImportsModule } from '../imports';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ${lowerTableName} } from '../../model/${lowerTableName}';
import { ${nameService} } from '../../service/${lowerTableName}/${lowerTableName}.service';

@Component({
  selector: 'app-${lowerTableName}',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './${lowerTableName}.component.html',
  styleUrls: ['./${lowerTableName}.component.css'],
  providers: [MessageService, ConfirmationService]
})

export class ${selectedTableName}Component implements OnInit {

  ${lowerTableName}s: ${lowerTableName}[] = [];
  ${lowerTableName}!: any;
  searchValue!: any;
  tableHeaders:any 
  first = 0;
  rows = 5;
  submitted: boolean = false;
  ${lowerTableName}Dialog: boolean = false;
  pkFiled:any;
  isAutoIncrement:any;

  constructor(private ${lowerTableName}Service: ${lowerTableName}Service, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.get${selectedTableName}s();
  }

  get${selectedTableName}s(): void {
    this.${lowerTableName}Service.getAll().pipe(
      catchError(error => {
        this.handleError('loading ${lowerTableName}s', error);
        return of([]);
      })
    ).subscribe((data:any) => {
      this.${lowerTableName}s = data.data;
      this.pkFiled = data.primaryKey;
      this.isAutoIncrement = data.isAutoIncrement;

    this.tableHeaders = ${JSON.stringify(fieldNames)};
    });
  }

  add${selectedTableName}() {
   // if (this.isValid${selectedTableName}(this.new${selectedTableName})) {
      this.submitted = true
      this.${lowerTableName}Service.create(this.${lowerTableName}).pipe(
        catchError(error => {
          this.handleError('creating ${lowerTableName}', error);
          return of(null);
        })
      ).subscribe((createdItem: any) => {
        if (createdItem) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: '${selectedTableName} created successfully!' });
          this.get${selectedTableName}s()
        }else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields!' });
        }
      });
      this.submitted = true
      this.hideDialog();
      //}
  }

  update${selectedTableName}(${lowerTableName}: any) {
    this.${lowerTableName}Service.update(${lowerTableName}[this.pkFiled], ${lowerTableName}).pipe(
      catchError(error => {
        this.handleError('updating ${lowerTableName}', error);
        return of(null);
      })
    ).subscribe(updatedItem => {
      if (updatedItem) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: '${selectedTableName} is updated' });
        this.get${selectedTableName}s()
      }else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields!' });
      }
      this.get${selectedTableName}s()
    });
  }
  
  delete${selectedTableName}(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this ${lowerTableName}',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.${lowerTableName}Service.delete(id).pipe(
          catchError(error => {
            this.handleError('deleting ${lowerTableName}', error);
            return of(null);
          })
        ).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: '${selectedTableName} is deleted' });
            this.get${selectedTableName}s()
        });
      }
    }); 
  }

  onFilter(event: Event, dt: any) {
    const inputElement = event.target as HTMLInputElement;
    dt.filterGlobal(inputElement.value, 'contains');
  }

  openDialog() {
    this.${lowerTableName} = {};
    this.submitted = false;
    this.${lowerTableName}Dialog = true;
  }

  hideDialog(){
    this.${lowerTableName}Dialog = false;
    this.submitted = false;
  }

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.${lowerTableName}s ? this.first === this.${lowerTableName}s.length - this.rows : true;
  }

  isFirstPage(): boolean {
    return this.${lowerTableName}s ? this.first === 0 : true;
  }

  private handleError(action: string, error: any): void {
    console.error(error);
  }

}
  `;
}

function generateHTMLContent(selectedTable) {
  const selectedTableName = capitalizeFirstLetter(selectedTable.name);
  const lowerTableName =
    selectedTableName.charAt(0).toLowerCase() + selectedTableName.slice(1);

  return `
<div class="card">
  <p-toast></p-toast>

  <p-confirmDialog [style]="{ width: '450px' }"></p-confirmDialog>

  <p-toolbar styleClass="mb-4 gap-2 p-fluid">
    <ng-template pTemplate="left">
      <p-button severity="success" label="New" icon="pi pi-plus" class="mr-2 p-fluid" (onClick)="openDialog()"></p-button>
    </ng-template>

    <ng-template pTemplate="right">
      <p-fileUpload mode="basic" accept="image/*" [maxFileSize]="1000000" label="Import" chooseLabel="Import"
        class="mr-2 inline-block p-fluid"></p-fileUpload>
      <p-button severity="help" label="Export" icon="pi pi-upload" class="mr-2 inline-block p-fluid"></p-button>
    </ng-template>
  </p-toolbar>

  <p-table #dt [value]="${lowerTableName}s" dataKey="id" editMode="row" [paginator]="true" [rows]="5" [first]="first" (onPage)="pageChange($event)"
    [rowsPerPageOptions]="[5, 10, 20]" styleClass="p-fluid" [globalFilterFields]="tableHeaders" [rowHover]="true">

    <!-- Caption -->
    <ng-template pTemplate="caption">
      <div class="flex align-items-center justify-content-between">
        <h4>Manage ${selectedTableName}s</h4>
        <div>
          <p-button type="button" icon="pi pi-chevron-left" (onClick)="prev()" [disabled]="isFirstPage()" styleClass="p-button-text"></p-button>
          <p-button type="button" icon="pi pi-refresh" (onClick)="reset()" styleClass="p-button-text"></p-button>
          <p-button type="button" icon="pi pi-chevron-right" (onClick)="next()" [disabled]="isLastPage()" styleClass="p-button-text"></p-button>
        </div>
        <span class="p-input-icon-left search-container">
          <i class="pi pi-search"></i>
          <input pInputText type="text" (input)="onFilter($event, dt)" placeholder="Search..." class="search-input" />
        </span>
      </div>
    </ng-template>

    <!-- Table Header -->
    <ng-template pTemplate="header">
      <tr class="custom-header">
        <th *ngFor="let header of tableHeaders">{{ header | titlecase }}</th>
        <th>Actions</th>
      </tr>
    </ng-template>

    <!-- Table Body -->
    <ng-template pTemplate="body" let-${lowerTableName} let-editing="editing" let-ri="rowIndex">
      <tr [pEditableRow]="${lowerTableName}" [pEditableRowDisabled]="!${lowerTableName}.isEditing">

        <!-- Dynamic Columns -->
        <td *ngFor="let key of tableHeaders">
          <p-cellEditor>
            <ng-template pTemplate="input">
              <input *ngIf="key === pkFiled && isAutoIncrement" pInputText class="rounded-input" type="text" [(ngModel)]="${lowerTableName}[key]" disabled />
              <input *ngIf="key !== pkFiled" pInputText class="rounded-input" type="text" [(ngModel)]="${lowerTableName}[key]" />
            </ng-template>
            <ng-template pTemplate="output">{{ ${lowerTableName}[key] }}</ng-template>
          </p-cellEditor>
        </td>

        <!-- Actions Column -->
        <td>
          <div class="flex align-items-center justify-content-center gap-2">
            <button *ngIf="!${lowerTableName}.isEditing" pButton pRipple type="button" pInitEditableRow icon="pi pi-pencil"
              (click)="${lowerTableName}.isEditing = true" class="p-button-rounded p-button-text"></button>

            <button *ngIf="!${lowerTableName}.isEditing" pButton pRipple type="button" icon="pi pi-trash"
              (click)="delete${selectedTableName}(${lowerTableName}[pkFiled])" class="p-button-rounded p-button-text" severity="danger"></button>

            <button *ngIf="${lowerTableName}.isEditing" pButton pRipple type="button" pSaveEditableRow icon="pi pi-check"
              (click)="update${selectedTableName}(${lowerTableName}); ${lowerTableName}.isEditing = false" class="p-button-rounded p-button-text p-button-success mr-2"></button>

            <button *ngIf="${lowerTableName}.isEditing" pButton pRipple type="button" pCancelEditableRow icon="pi pi-times"
              (click)="${lowerTableName}.isEditing = false" class="p-button-rounded p-button-text p-button-danger"></button>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog for Adding New ${selectedTableName} -->
  <p-dialog [(visible)]="${lowerTableName}Dialog" [style]="{ width: '450px' }" [modal]="true" header="New ${selectedTableName}" styleClass="p-fluid">
    <ng-template pTemplate="content">
      <div class="field" *ngFor="let header of tableHeaders">
        <div *ngIf="header !== pkFiled">
          <label for="{{ header }}">{{ header | titlecase }}</label>
          <input type="text" pInputText class="rounded-input" [(ngModel)]="${lowerTableName}[header]" id="{{ header }}" required autofocus />
        </div>
      </div>
    </ng-template>

    <ng-template pTemplate="footer">
      <p-button label="Cancel" icon="pi pi-times" [text]="true" (onClick)="hideDialog()"></p-button>
      <p-button label="Save" icon="pi pi-check" [text]="true" (onClick)="add${selectedTableName}()"></p-button>
    </ng-template>
  </p-dialog>
</div>
`;
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}