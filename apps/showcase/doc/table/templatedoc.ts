import { Code } from '@/domain/code';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'template-doc',
    standalone: false,
    template: ` <app-docsectiontext>
            <p>Custom content at <i>header</i>, <i>body</i> and <i>footer</i> sections are supported via templating.</p>
        </app-docsectiontext>
        <p-deferred-demo (load)="loadDemoData()">
            <div class="card">
                <p-table [value]="products" [tableStyle]="{ 'min-width': '60rem' }">
                    <ng-template #caption>
                        <div class="flex items-center justify-between">
                            <span class="text-xl font-bold">Products</span>
                            <p-button icon="pi pi-refresh" rounded raised />
                        </div>
                    </ng-template>
                    <ng-template #header>
                        <tr>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Reviews</th>
                            <th>Status</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr>
                            <td>{{ product.name }}</td>
                            <td>
                                <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" class="w-24 rounded" />
                            </td>
                            <td>{{ product.price | currency: 'USD' }}</td>
                            <td>{{ product.category }}</td>
                            <td><p-rating [(ngModel)]="product.rating" [readonly]="true" [cancel]="false" /></td>
                            <td>
                                <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #footer>
                        <tr>
                            <td colspan="6">In total there are {{ products ? products.length : 0 }} products.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </p-deferred-demo>
        <app-code [code]="code" selector="table-template-demo" [extFiles]="extFiles"></app-code>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateDoc {
    products!: Product[];

    cols!: Column[];

    constructor(
        private productService: ProductService,
        private cd: ChangeDetectorRef
    ) {}

    loadDemoData() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
            this.cd.markForCheck();
        });

        this.cols = [
            { field: 'code', header: 'Code' },
            { field: 'name', header: 'Name' },
            { field: 'category', header: 'Category' },
            { field: 'quantity', header: 'Quantity' }
        ];
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
        }
    }

    code: Code = {
        basic: `<p-table [value]="products" [tableStyle]="{ 'min-width': '60rem' }">
    <ng-template #caption>
        <div class="flex items-center justify-between">
            <span class="text-xl font-bold">Products</span>
            <p-button icon="pi pi-refresh" rounded raised />
        </div>
    </ng-template>
    <ng-template #header>
        <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Price</th>
            <th>Category</th>
            <th>Reviews</th>
            <th>Status</th>
        </tr>
    </ng-template>
    <ng-template #body let-product>
        <tr>
            <td>{{ product.name }}</td>
            <td>
                <img
                    [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image"
                    [alt]="product.name"
                    class="w-24 rounded"
                />
            </td>
            <td>{{ product.price | currency: 'USD' }}</td>
            <td>{{ product.category }}</td>
            <td><p-rating [(ngModel)]="product.rating" [readonly]="true" [cancel]="false" /></td>
            <td>
                <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
            </td>
        </tr>
    </ng-template>
    <ng-template #footer>
        <tr>
            <td colspan="6">In total there are {{ products ? products.length : 0 }} products.</td>
        </tr>
    </ng-template>
</p-table>`,
        html: `<div class="card">
    <p-table [value]="products" [tableStyle]="{ 'min-width': '60rem' }">
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <span class="text-xl font-bold">Products</span>
                <p-button icon="pi pi-refresh" rounded raised />
            </div>
        </ng-template>
        <ng-template #header>
            <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Price</th>
                <th>Category</th>
                <th>Reviews</th>
                <th>Status</th>
            </tr>
        </ng-template>
        <ng-template #body let-product>
            <tr>
                <td>{{ product.name }}</td>
                <td>
                    <img
                        [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image"
                        [alt]="product.name"
                        class="w-24 rounded"
                    />
                </td>
                <td>{{ product.price | currency: 'USD' }}</td>
                <td>{{ product.category }}</td>
                <td><p-rating [(ngModel)]="product.rating" [readonly]="true" [cancel]="false" /></td>
                <td>
                    <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                </td>
            </tr>
        </ng-template>
        <ng-template #footer>
            <tr>
                <td colspan="6">In total there are {{ products ? products.length : 0 }} products.</td>
            </tr>
        </ng-template>
    </p-table>
</div>`,
        typescript: `import { Component, OnInit } from '@angular/core';
import { Product } from '@/domain/product';
import { ProductService } from '@/service/productservice';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'table-template-demo',
    templateUrl: 'table-template-demo.html',
    standalone: true,
    imports: [TableModule, TagModule, RatingModule, ButtonModule, CommonModule],
    providers: [ProductService]
})
export class TableTemplateDemo implements OnInit {
    products!: Product[];

    constructor(private productService: ProductService) {}

    ngOnInit() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
        }
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
