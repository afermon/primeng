import { Code } from '@/domain/code';
import { NodeService } from '@/service/nodeservice';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'reactive-forms-doc',
    standalone: false,
    template: `
        <app-docsectiontext>
            <p>TreeSelect can also be used with reactive forms. In this case, the <i>formControlName</i> property is used to bind the component to a form control.</p>
        </app-docsectiontext>
        <div class="card">
            <form class="flex justify-center" [formGroup]="formGroup">
                <p-treeselect class="md:w-80 w-full" containerStyleClass="w-full" formControlName="selectedNodes" [options]="nodes" placeholder="Select Item" />
            </form>
        </div>
        <app-code [code]="code" selector="tree-select-reactive-forms-demo"></app-code>
    `
})
export class ReactiveFormsDoc implements OnInit {
    nodes!: any[];

    formGroup!: FormGroup;

    constructor(private nodeService: NodeService) {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            selectedNodes: new FormControl()
        });
    }

    code: Code = {
        basic: `<form [formGroup]="formGroup">
    <p-treeselect class="md:w-80 w-full" containerStyleClass="w-full" formControlName="selectedNodes" [options]="nodes" placeholder="Select Item" />
</form>`,

        html: `<div class="card flex justify-center">
    <form [formGroup]="formGroup">
        <p-treeselect class="md:w-80 w-full" containerStyleClass="w-full" formControlName="selectedNodes" [options]="nodes" placeholder="Select Item" />
    </form>
</div>`,

        typescript: `import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NodeService } from '@/service/nodeservice';

@Component({
    selector: 'tree-select-reactive-forms-demo',
    templateUrl: './tree-select-reactive-forms-demo.html',
    standalone: true,
    imports: [ReactiveFormsModule, TreeSelect],
    providers: [NodeService]
})
export class TreeSelectReactiveFormsDemo implements OnInit {
    nodes!: any[];

    formGroup!: FormGroup;

    constructor(private nodeService: NodeService) {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }

    ngOnInit() {
        this.formGroup = new FormGroup({
            selectedNodes: new FormControl()
        });
    }
}`,
        service: ['NodeService'],
        data: `
    /* NodeService */
{
    key: '0',
    label: 'Documents',
    data: 'Documents Folder',
    icon: 'pi pi-fw pi-inbox',
    children: [
        {
            key: '0-0',
            label: 'Work',
            data: 'Work Folder',
            icon: 'pi pi-fw pi-cog',
            children: [
                { key: '0-0-0', label: 'Expenses.doc', icon: 'pi pi-fw pi-file', data: 'Expenses Document' },
                { key: '0-0-1', label: 'Resume.doc', icon: 'pi pi-fw pi-file', data: 'Resume Document' }
            ]
        },
        {
            key: '0-1',
            label: 'Home',
            data: 'Home Folder',
            icon: 'pi pi-fw pi-home',
            children: [{ key: '0-1-0', label: 'Invoices.txt', icon: 'pi pi-fw pi-file', data: 'Invoices for this month' }]
        }
    ]
},
...`
    };
}
