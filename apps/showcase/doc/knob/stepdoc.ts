import { Code } from '@/domain/code';
import { Component } from '@angular/core';

@Component({
    selector: 'step-doc',
    standalone: false,
    template: `
        <app-docsectiontext>
            <p>Size of each movement is defined with the <i>step</i> property.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-knob [(ngModel)]="value" [step]="10" />
        </div>
        <app-code [code]="code" selector="knob-step-demo"></app-code>
    `
})
export class StepDoc {
    value!: number;

    code: Code = {
        basic: `<p-knob [(ngModel)]="value" [step]="10" />`,

        html: `<div class="card flex justify-center">
    <p-knob [(ngModel)]="value" [step]="10" />
</div>`,

        typescript: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Knob } from 'primeng/knob';

@Component({
    selector: 'knob-step-demo',
    templateUrl: './knob-step-demo.html',
    standalone: true,
    imports: [FormsModule, Knob]
})
export class KnobStepDemo {
    value!: number;
}`
    };
}
