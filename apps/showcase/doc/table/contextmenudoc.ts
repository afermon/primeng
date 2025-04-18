import { Code } from '@/domain/code';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
    selector: 'context-menu-doc',
    standalone: false,
    template: ` <app-docsectiontext>
            <p>
                Table has exclusive integration with <i>contextmenu</i> component. In order to attach a menu to a table, add <i>pContextMenuRow</i> directive to the rows that can be selected with context menu, define a local template variable for the
                menu and bind it to the <i>contextMenu</i> property of the table. This enables displaying the menu whenever a row is right clicked. Optional <i>pContextMenuRowIndex</i> property is available to access the row index. A separate
                <i>contextMenuSelection</i> property is used to get a hold of the right clicked row. For dynamic columns, setting <i>pContextMenuRowDisabled</i> property as true disables context menu for that particular row.
            </p>
        </app-docsectiontext>
        <p-deferred-demo (load)="loadDemoData()">
            <div class="card">
                <p-contextmenu #cm [model]="items" (onHide)="selectedProduct = null" />
                <p-table [value]="products" [(contextMenuSelection)]="selectedProduct" [contextMenu]="cm" dataKey="code" [tableStyle]="{ 'min-width': '50rem' }">
                    <ng-template #header>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr [pContextMenuRow]="product">
                            <td>{{ product.code }}</td>
                            <td>{{ product.name }}</td>
                            <td>{{ product.category }}</td>
                            <td>{{ product.price | currency: 'USD' }}</td>
                        </tr>
                    </ng-template>
                </p-table>
                <p-toast />
            </div>
        </p-deferred-demo>
        <app-code [code]="code" selector="table-context-menu-demo" [extFiles]="extFiles"></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService]
})
export class ContextMenuDoc {
    products!: Product[];

    selectedProduct!: Product;

    items!: MenuItem[];

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private cd: ChangeDetectorRef
    ) {}

    loadDemoData() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
            this.cd.markForCheck();
        });

        this.items = [
            { label: 'View', icon: 'pi pi-fw pi-search', command: () => this.viewProduct(this.selectedProduct) },
            { label: 'Delete', icon: 'pi pi-fw pi-times', command: () => this.deleteProduct(this.selectedProduct) }
        ];
    }

    viewProduct(product: Product) {
        this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
    }

    deleteProduct(product: Product) {
        this.products = this.products.filter((p) => p.id !== product.id);
        this.messageService.add({ severity: 'error', summary: 'Product Deleted', detail: product.name });
        this.selectedProduct = null;
    }

    code: Code = {
        basic: `<p-contextmenu #cm [model]="items" (onHide)="selectedProduct = null" />
<p-table [value]="products" [(contextMenuSelection)]="selectedProduct" [contextMenu]="cm" dataKey="code" [tableStyle]="{'min-width': '50rem'}">
    <ng-template #header>
        <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
        </tr>
    </ng-template>
    <ng-template #body let-product>
        <tr [pContextMenuRow]="product">
            <td>{{product.code}}</td>
            <td>{{product.name}}</td>
            <td>{{product.category}}</td>
            <td>{{product.price | currency: 'USD'}}</td>
        </tr>
    </ng-template>
</p-table>
<p-toast />`,
        html: `<div class="card">
    <p-contextmenu #cm [model]="items" (onHide)="selectedProduct = null" />
    <p-table [value]="products" [(contextMenuSelection)]="selectedProduct" [contextMenu]="cm" dataKey="code" [tableStyle]="{'min-width': '50rem'}">
        <ng-template #header>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
            </tr>
        </ng-template>
        <ng-template #body let-product>
            <tr [pContextMenuRow]="product">
                <td>{{product.code}}</td>
                <td>{{product.name}}</td>
                <td>{{product.category}}</td>
                <td>{{product.price | currency: 'USD'}}</td>
            </tr>
        </ng-template>
    </p-table>
    <p-toast />
</div>`,
        typescript: `import { Component, OnInit } from '@angular/core';
import { MessageService, MenuItem } from 'primeng/api';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';
import { TableModule } from 'primeng/table';
import { ContextMenuModule } from 'primeng/contextmenu';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'table-context-menu-demo',
    templateUrl: 'table-context-menu-demo.html',
    standalone: true,
    imports: [TableModule, ContextMenuModule, HttpClientModule, CommonModule, ToastModule],
    providers: [MessageService, ProductService]
})
export class TableContextMenuDemo implements OnInit{
    products!: Product[];

    selectedProduct!: Product;

    items!: MenuItem[];

    constructor(private productService: ProductService, private messageService: MessageService) {}

    ngOnInit() {
        this.productService.getProductsMini().then((data) => (this.products = data));

        this.items = [
            { label: 'View', icon: 'pi pi-fw pi-search', command: () => this.viewProduct(this.selectedProduct) },
            { label: 'Delete', icon: 'pi pi-fw pi-times', command: () => this.deleteProduct(this.selectedProduct) }
        ];
    }

    viewProduct(product: Product) {
        this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
    }

    deleteProduct(product: Product) {
        this.products = this.products.filter((p) => p.id !== product.id);
        this.messageService.add({ severity: 'error', summary: 'Product Deleted', detail: product.name });
        this.selectedProduct = null;
    }
}`,
        data: `{
    id: '1000',
    code: 'f230fh0g3',
    name: 'Bamboo Watch',
    description: 'Product Description',
    image: 'bamboo-watch.jpg',
    price: 65,
    category: 'Accessories',
    quantity: 24,
    inventoryStatus: 'INSTOCK',
    rating: 5
},
...`,
        service: ['ProductService']
    };

    extFiles = [
        {
            path: 'src/domain/product.ts',
            content: `
export interface Product {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    inventoryStatus?: string;
    category?: string;
    image?: string;
    rating?: number;
}`
        }
    ];
}
