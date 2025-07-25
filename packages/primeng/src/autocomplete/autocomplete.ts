import { AnimationEvent } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    inject,
    input,
    Input,
    NgModule,
    NgZone,
    numberAttribute,
    OnDestroy,
    Output,
    QueryList,
    signal,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals, findLastIndex, findSingle, focus, isEmpty, isNotEmpty, resolveFieldData, uuid } from '@primeuix/utils';
import { OverlayOptions, OverlayService, PrimeTemplate, ScrollerOptions, SharedModule, TranslationKeys } from 'primeng/api';
import { AutoFocus } from 'primeng/autofocus';
import { BaseInput } from 'primeng/baseinput';
import { Chip } from 'primeng/chip';
import { PrimeNG } from 'primeng/config';
import { ConnectedOverlayScrollHandler } from 'primeng/dom';
import { ChevronDownIcon, SpinnerIcon, TimesCircleIcon, TimesIcon } from 'primeng/icons';
import { InputText } from 'primeng/inputtext';
import { Overlay } from 'primeng/overlay';
import { Ripple } from 'primeng/ripple';
import { Scroller } from 'primeng/scroller';
import { Nullable } from 'primeng/ts-helpers';
import { AutoCompleteCompleteEvent, AutoCompleteDropdownClickEvent, AutoCompleteLazyLoadEvent, AutoCompleteSelectEvent, AutoCompleteUnselectEvent } from './autocomplete.interface';
import { AutoCompleteStyle } from './style/autocompletestyle';

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoComplete),
    multi: true
};
/**
 * AutoComplete is an input component that provides real-time suggestions when being typed.
 * @group Components
 */
@Component({
    selector: 'p-autoComplete, p-autocomplete, p-auto-complete',
    standalone: true,
    imports: [CommonModule, Overlay, InputText, Ripple, Scroller, AutoFocus, TimesCircleIcon, SpinnerIcon, ChevronDownIcon, Chip, SharedModule, TimesIcon],
    template: `
        <input
            *ngIf="!multiple"
            #focusInput
            [pAutoFocus]="autofocus"
            pInputText
            [class]="cn(cx('pcInputText'), inputStyleClass)"
            [ngStyle]="inputStyle"
            [attr.type]="type"
            [attr.value]="inputValue()"
            [variant]="$variant()"
            [invalid]="invalid()"
            [attr.id]="inputId"
            [attr.autocomplete]="autocomplete"
            aria-autocomplete="list"
            role="combobox"
            [attr.placeholder]="placeholder"
            [attr.name]="name()"
            [attr.minlength]="minlength()"
            [pSize]="size()"
            [attr.min]="min()"
            [attr.max]="max()"
            [attr.pattern]="pattern()"
            [attr.size]="inputSize()"
            [attr.maxlength]="maxlength()"
            [attr.tabindex]="!$disabled() ? tabindex : -1"
            [attr.required]="required() ? '' : undefined"
            [attr.readonly]="readonly ? '' : undefined"
            [attr.disabled]="$disabled() ? '' : undefined"
            [attr.aria-label]="ariaLabel"
            [attr.aria-labelledby]="ariaLabelledBy"
            [attr.aria-required]="required()"
            [attr.aria-expanded]="overlayVisible ?? false"
            [attr.aria-controls]="overlayVisible ? id + '_list' : null"
            [attr.aria-activedescendant]="focused ? focusedOptionId : undefined"
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
            (change)="onInputChange($event)"
            (focus)="onInputFocus($event)"
            (blur)="onInputBlur($event)"
            (paste)="onInputPaste($event)"
            (keyup)="onInputKeyUp($event)"
            [fluid]="hasFluid"
        />
        <ng-container *ngIf="$filled() && !$disabled() && showClear && !loading">
            <svg data-p-icon="times" *ngIf="!clearIconTemplate && !_clearIconTemplate" [class]="cx('clearIcon')" (click)="clear()" [attr.aria-hidden]="true" />
            <span *ngIf="clearIconTemplate || _clearIconTemplate" [class]="cx('clearIcon')" (click)="clear()" [attr.aria-hidden]="true">
                <ng-template *ngTemplateOutlet="clearIconTemplate || _clearIconTemplate"></ng-template>
            </span>
        </ng-container>

        <ul
            *ngIf="multiple"
            #multiContainer
            [class]="cx('inputMultiple')"
            [tabindex]="-1"
            role="listbox"
            [attr.aria-orientation]="'horizontal'"
            [attr.aria-activedescendant]="focused ? focusedMultipleOptionId : undefined"
            (focus)="onMultipleContainerFocus($event)"
            (blur)="onMultipleContainerBlur($event)"
            (keydown)="onMultipleContainerKeyDown($event)"
        >
            <li
                #token
                *ngFor="let option of modelValue(); let i = index"
                [class]="cx('chipItem', { i })"
                [attr.id]="id + '_multiple_option_' + i"
                role="option"
                [attr.aria-label]="getOptionLabel(option)"
                [attr.aria-setsize]="modelValue().length"
                [attr.aria-posinset]="i + 1"
                [attr.aria-selected]="true"
            >
                <p-chip [class]="cx('pcChip')" [label]="!selectedItemTemplate && !_selectedItemTemplate && getOptionLabel(option)" [removable]="true" (onRemove)="!readonly ? removeOption($event, i) : ''">
                    <ng-container *ngTemplateOutlet="selectedItemTemplate || _selectedItemTemplate; context: { $implicit: option }"></ng-container>
                    <ng-template #removeicon>
                        <span *ngIf="!removeIconTemplate && !_removeIconTemplate" [class]="cx('chipIcon')" (click)="!readonly ? removeOption($event, i) : ''">
                            <svg data-p-icon="times-circle" [class]="cx('chipIcon')" [attr.aria-hidden]="true" />
                        </span>
                        <span *ngIf="removeIconTemplate || _removeIconTemplate" [attr.aria-hidden]="true">
                            <ng-template *ngTemplateOutlet="removeIconTemplate || _removeIconTemplate; context: { removeCallback: removeOption.bind(this), index: i, class: cx('chipIcon') }"></ng-template>
                        </span>
                    </ng-template>
                </p-chip>
            </li>
            <li [class]="cx('inputChip')" role="option">
                <input
                    #focusInput
                    [pAutoFocus]="autofocus"
                    [class]="cx('pcInputText')"
                    [ngStyle]="inputStyle"
                    [attr.type]="type"
                    [attr.id]="inputId"
                    [attr.autocomplete]="autocomplete"
                    [attr.name]="name()"
                    [attr.minlength]="minlength()"
                    [attr.maxlength]="maxlength()"
                    [attr.size]="size()"
                    [attr.min]="min()"
                    [attr.max]="max()"
                    [attr.pattern]="pattern()"
                    role="combobox"
                    [attr.placeholder]="!$filled() ? placeholder : null"
                    aria-autocomplete="list"
                    [attr.tabindex]="!$disabled() ? tabindex : -1"
                    [attr.required]="required() ? '' : undefined"
                    [attr.readonly]="readonly ? '' : undefined"
                    [attr.disabled]="$disabled() ? '' : undefined"
                    [attr.aria-label]="ariaLabel"
                    [attr.aria-labelledby]="ariaLabelledBy"
                    [attr.aria-required]="required()"
                    [attr.aria-expanded]="overlayVisible ?? false"
                    [attr.aria-controls]="overlayVisible ? id + '_list' : null"
                    [attr.aria-activedescendant]="focused ? focusedOptionId : undefined"
                    (input)="onInput($event)"
                    (keydown)="onKeyDown($event)"
                    (change)="onInputChange($event)"
                    (focus)="onInputFocus($event)"
                    (blur)="onInputBlur($event)"
                    (paste)="onInputPaste($event)"
                    (keyup)="onInputKeyUp($event)"
                />
            </li>
        </ul>
        <ng-container *ngIf="loading">
            <svg data-p-icon="spinner" *ngIf="!loadingIconTemplate && !_loadingIconTemplate" [class]="cx('loader')" [spin]="true" [attr.aria-hidden]="true" />
            <span *ngIf="loadingIconTemplate || _loadingIconTemplate" [class]="cx('loader')" [attr.aria-hidden]="true">
                <ng-template *ngTemplateOutlet="loadingIconTemplate || _loadingIconTemplate"></ng-template>
            </span>
        </ng-container>
        <button #ddBtn type="button" [attr.aria-label]="dropdownAriaLabel" [class]="cx('dropdown')" [disabled]="$disabled()" pRipple (click)="handleDropdownClick($event)" *ngIf="dropdown" [attr.tabindex]="tabindex">
            <span *ngIf="dropdownIcon" [ngClass]="dropdownIcon" [attr.aria-hidden]="true"></span>
            <ng-container *ngIf="!dropdownIcon">
                <svg data-p-icon="chevron-down" *ngIf="!dropdownIconTemplate && !_dropdownIconTemplate" />
                <ng-template *ngTemplateOutlet="dropdownIconTemplate || _dropdownIconTemplate"></ng-template>
            </ng-container>
        </button>
        <p-overlay
            #overlay
            [hostAttrSelector]="attrSelector"
            [(visible)]="overlayVisible"
            [options]="overlayOptions"
            [target]="'@parent'"
            [appendTo]="$appendTo()"
            [showTransitionOptions]="showTransitionOptions"
            [hideTransitionOptions]="hideTransitionOptions"
            (onAnimationStart)="onOverlayAnimationStart($event)"
            (onHide)="hide()"
        >
            <ng-template #content>
                <div [class]="cn(cx('overlay'), panelStyleClass)" [ngStyle]="panelStyle">
                    <ng-container *ngTemplateOutlet="headerTemplate || _headerTemplate"></ng-container>
                    <div [class]="cx('listContainer')" [style.max-height]="virtualScroll ? 'auto' : scrollHeight">
                        <p-scroller
                            *ngIf="virtualScroll"
                            #scroller
                            [items]="visibleOptions()"
                            [style]="{ height: scrollHeight }"
                            [itemSize]="virtualScrollItemSize"
                            [autoSize]="true"
                            [lazy]="lazy"
                            (onLazyLoad)="onLazyLoad.emit($event)"
                            [options]="virtualScrollOptions"
                        >
                            <ng-template #content let-items let-scrollerOptions="options">
                                <ng-container *ngTemplateOutlet="buildInItems; context: { $implicit: items, options: scrollerOptions }"></ng-container>
                            </ng-template>
                            <ng-container *ngIf="loaderTemplate || _loaderTemplate">
                                <ng-template #loader let-scrollerOptions="options">
                                    <ng-container *ngTemplateOutlet="loaderTemplate || _loaderTemplate; context: { options: scrollerOptions }"></ng-container>
                                </ng-template>
                            </ng-container>
                        </p-scroller>
                        <ng-container *ngIf="!virtualScroll">
                            <ng-container *ngTemplateOutlet="buildInItems; context: { $implicit: visibleOptions(), options: {} }"></ng-container>
                        </ng-container>
                    </div>

                    <ng-template #buildInItems let-items let-scrollerOptions="options">
                        <ul #items [class]="cn(cx('list'), scrollerOptions.contentStyleClass)" [style]="scrollerOptions.contentStyle" role="listbox" [attr.id]="id + '_list'" [attr.aria-label]="listLabel">
                            <ng-template ngFor let-option [ngForOf]="items" let-i="index">
                                <ng-container *ngIf="isOptionGroup(option)">
                                    <li [attr.id]="id + '_' + getOptionIndex(i, scrollerOptions)" [class]="cx('optionGroup')" [ngStyle]="{ height: scrollerOptions.itemSize + 'px' }" role="option">
                                        <span *ngIf="!groupTemplate">{{ getOptionGroupLabel(option.optionGroup) }}</span>
                                        <ng-container *ngTemplateOutlet="groupTemplate; context: { $implicit: option.optionGroup }"></ng-container>
                                    </li>
                                </ng-container>
                                <ng-container *ngIf="!isOptionGroup(option)">
                                    <li
                                        pRipple
                                        [ngStyle]="{ height: scrollerOptions.itemSize + 'px' }"
                                        [class]="cx('option', { option, i, scrollerOptions })"
                                        [attr.id]="id + '_' + getOptionIndex(i, scrollerOptions)"
                                        role="option"
                                        [attr.aria-label]="getOptionLabel(option)"
                                        [attr.aria-selected]="isSelected(option)"
                                        [attr.aria-disabled]="isOptionDisabled(option)"
                                        [attr.data-p-focused]="focusedOptionIndex() === getOptionIndex(i, scrollerOptions)"
                                        [attr.aria-setsize]="ariaSetSize"
                                        [attr.aria-posinset]="getAriaPosInset(getOptionIndex(i, scrollerOptions))"
                                        (click)="onOptionSelect($event, option)"
                                        (mouseenter)="onOptionMouseEnter($event, getOptionIndex(i, scrollerOptions))"
                                    >
                                        <span *ngIf="!itemTemplate && !_itemTemplate">{{ getOptionLabel(option) }}</span>
                                        <ng-container
                                            *ngTemplateOutlet="
                                                itemTemplate || _itemTemplate;
                                                context: {
                                                    $implicit: option,
                                                    index: scrollerOptions.getOptions ? scrollerOptions.getOptions(i) : i
                                                }
                                            "
                                        ></ng-container>
                                    </li>
                                </ng-container>
                            </ng-template>
                            <li *ngIf="!items || (items && items.length === 0 && showEmptyMessage)" [class]="cx('emptyMessage')" [ngStyle]="{ height: scrollerOptions.itemSize + 'px' }" role="option">
                                <ng-container *ngIf="!emptyTemplate && !_emptyTemplate; else empty">
                                    {{ searchResultMessageText }}
                                </ng-container>
                                <ng-container #empty *ngTemplateOutlet="emptyTemplate || _emptyTemplate"></ng-container>
                            </li>
                        </ul>
                    </ng-template>
                    <ng-container *ngTemplateOutlet="footerTemplate || _footerTemplate"></ng-container>
                </div>
                <span role="status" aria-live="polite" class="p-hidden-accessible">
                    {{ selectedMessageText }}
                </span>
            </ng-template>
        </p-overlay>
    `,
    providers: [AUTOCOMPLETE_VALUE_ACCESSOR, AutoCompleteStyle],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), styleClass)",
        '[style]': "sx('root')"
    }
})
export class AutoComplete extends BaseInput implements AfterViewChecked, AfterContentInit, OnDestroy {
    /**
     * Minimum number of characters to initiate a search.
     * @deprecated since v20.0.0, use `minQueryLength` instead.
     * @group Props
     */
    @Input({ transform: numberAttribute }) minLength: number = 1;
    /**
     * Minimum number of characters to initiate a search.
     * @group Props
     */
    @Input({ transform: numberAttribute }) minQueryLength: number | undefined;
    /**
     * Delay between keystrokes to wait before sending a query.
     * @group Props
     */
    @Input({ transform: numberAttribute }) delay: number = 300;
    /**
     * Inline style of the overlay panel element.
     * @group Props
     */
    @Input() panelStyle: { [klass: string]: any } | null | undefined;
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Style class of the overlay panel element.
     * @group Props
     */
    @Input() panelStyleClass: string | undefined;
    /**
     * Inline style of the input field.
     * @group Props
     */
    @Input() inputStyle: { [klass: string]: any } | null | undefined;
    /**
     * Identifier of the focus input to match a label defined for the component.
     * @group Props
     */
    @Input() inputId: string | undefined;
    /**
     * Inline style of the input field.
     * @group Props
     */
    @Input() inputStyleClass: string | undefined;
    /**
     * Hint text for the input field.
     * @group Props
     */
    @Input() placeholder: string | undefined;
    /**
     * When present, it specifies that the input cannot be typed.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) readonly: boolean | undefined;
    /**
     * Maximum height of the suggestions panel.
     * @group Props
     */
    @Input() scrollHeight: string = '200px';
    /**
     * Defines if data is loaded and interacted with in lazy manner.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) lazy: boolean = false;
    /**
     * Whether the data should be loaded on demand during scroll.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) virtualScroll: boolean | undefined;
    /**
     * Height of an item in the list for VirtualScrolling.
     * @group Props
     */
    @Input({ transform: numberAttribute }) virtualScrollItemSize: number | undefined;
    /**
     * Whether to use the scroller feature. The properties of scroller component can be used like an object in it.
     * @group Props
     */
    @Input() virtualScrollOptions: ScrollerOptions | undefined;
    /**
     * When enabled, highlights the first item in the list by default.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autoHighlight: boolean | undefined;
    /**
     * When present, autocomplete clears the manual input if it does not match of the suggestions to force only accepting values from the suggestions.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) forceSelection: boolean | undefined;
    /**
     * Type of the input, defaults to "text".
     * @group Props
     */
    @Input() type: string = 'text';
    /**
     * Whether to automatically manage layering.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autoZIndex: boolean = true;
    /**
     * Base zIndex value to use in layering.
     * @group Props
     */
    @Input({ transform: numberAttribute }) baseZIndex: number = 0;
    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;
    /**
     * Defines a string that labels the dropdown button for accessibility.
     * @group Props
     */
    @Input() dropdownAriaLabel: string | undefined;
    /**
     * Specifies one or more IDs in the DOM that labels the input field.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * Icon class of the dropdown icon.
     * @group Props
     */
    @Input() dropdownIcon: string | undefined;
    /**
     * Ensures uniqueness of selected items on multiple mode.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) unique: boolean = true;
    /**
     * Whether to display options as grouped when nested options are provided.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) group: boolean | undefined;
    /**
     * Whether to run a query when input receives focus.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) completeOnFocus: boolean = false;
    /**
     * When enabled, a clear icon is displayed to clear the value.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showClear: boolean = false;
    /**
     * Displays a button next to the input field when enabled.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) dropdown: boolean | undefined;
    /**
     * Whether to show the empty message or not.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showEmptyMessage: boolean | undefined = true;
    /**
     * Specifies the behavior dropdown button. Default "blank" mode sends an empty string and "current" mode sends the input value.
     * @group Props
     */
    @Input() dropdownMode: string = 'blank';
    /**
     * Specifies if multiple values can be selected.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) multiple: boolean | undefined;
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    @Input({ transform: numberAttribute }) tabindex: number | undefined;
    /**
     * A property to uniquely identify a value in options.
     * @group Props
     */
    @Input() dataKey: string | undefined;
    /**
     * Text to display when there is no data. Defaults to global value in i18n translation configuration.
     * @group Props
     */
    @Input() emptyMessage: string | undefined;
    /**
     * Transition options of the show animation.
     * @group Props
     */
    @Input() showTransitionOptions: string = '.12s cubic-bezier(0, 0, 0.2, 1)';
    /**
     * Transition options of the hide animation.
     * @group Props
     */
    @Input() hideTransitionOptions: string = '.1s linear';
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autofocus: boolean | undefined;
    /**
     * Used to define a string that autocomplete attribute the current element.
     * @group Props
     */
    @Input() autocomplete: string = 'off';
    /**
     * Name of the options field of an option group.
     * @group Props
     */
    @Input() optionGroupChildren: string | undefined = 'items';
    /**
     * Name of the label field of an option group.
     * @group Props
     */
    @Input() optionGroupLabel: string | undefined = 'label';
    /**
     * Options for the overlay element.
     * @group Props
     */
    @Input() overlayOptions: OverlayOptions | undefined;
    /**
     * An array of suggestions to display.
     * @group Props
     */
    @Input() get suggestions(): any[] {
        return this._suggestions();
    }
    set suggestions(value: any[]) {
        this._suggestions.set(value);
        this.handleSuggestionsChange();
    }
    /**
     * Property name or getter function to use as the label of an option.
     * @group Props
     */
    @Input() optionLabel: string | ((item: any) => string) | undefined;
    /**
     * Property name or getter function to use as the value of an option.
     * @group Props
     */
    @Input() optionValue: string | ((item: any) => string) | undefined;
    /**
     * Unique identifier of the component.
     * @group Props
     */
    @Input() id: string | undefined;
    /**
     * Text to display when the search is active. Defaults to global value in i18n translation configuration.
     * @group Props
     * @defaultValue '{0} results are available'
     */
    @Input() searchMessage: string | undefined;
    /**
     * Text to display when filtering does not return any results. Defaults to global value in i18n translation configuration.
     * @group Props
     * @defaultValue 'No selected item'
     */
    @Input() emptySelectionMessage: string | undefined;
    /**
     * Text to be displayed in hidden accessible field when options are selected. Defaults to global value in i18n translation configuration.
     * @group Props
     * @defaultValue '{0} items selected'
     */
    @Input() selectionMessage: string | undefined;
    /**
     * Whether to focus on the first visible or selected element when the overlay panel is shown.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) autoOptionFocus: boolean | undefined = false;
    /**
     * When enabled, the focused option is selected.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) selectOnFocus: boolean | undefined;
    /**
     * Locale to use in searching. The default locale is the host environment's current locale.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) searchLocale: boolean | undefined;
    /**
     * Property name or getter function to use as the disabled flag of an option, defaults to false when not defined.
     * @group Props
     */
    @Input() optionDisabled: string | ((item: any) => string) | undefined;
    /**
     * When enabled, the hovered option will be focused.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) focusOnHover: boolean | undefined = true;
    /**
     * Whether typeahead is active or not.
     * @defaultValue true
     * @group Props
     */
    @Input({ transform: booleanAttribute }) typeahead: boolean = true;
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'self'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>(undefined);
    /**
     * Callback to invoke to search for suggestions.
     * @param {AutoCompleteCompleteEvent} event - Custom complete event.
     * @group Emits
     */
    @Output() completeMethod: EventEmitter<AutoCompleteCompleteEvent> = new EventEmitter<AutoCompleteCompleteEvent>();
    /**
     * Callback to invoke when a suggestion is selected.
     * @param {AutoCompleteSelectEvent} event - custom select event.
     * @group Emits
     */
    @Output() onSelect: EventEmitter<AutoCompleteSelectEvent> = new EventEmitter<AutoCompleteSelectEvent>();
    /**
     * Callback to invoke when a selected value is removed.
     * @param {AutoCompleteUnselectEvent} event - custom unselect event.
     * @group Emits
     */
    @Output() onUnselect: EventEmitter<AutoCompleteUnselectEvent> = new EventEmitter<AutoCompleteUnselectEvent>();
    /**
     * Callback to invoke when the component receives focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onFocus: EventEmitter<Event> = new EventEmitter();
    /**
     * Callback to invoke when the component loses focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onBlur: EventEmitter<Event> = new EventEmitter();
    /**
     * Callback to invoke to when dropdown button is clicked.
     * @param {AutoCompleteDropdownClickEvent} event - custom dropdown click event.
     * @group Emits
     */
    @Output() onDropdownClick: EventEmitter<AutoCompleteDropdownClickEvent> = new EventEmitter<AutoCompleteDropdownClickEvent>();
    /**
     * Callback to invoke when clear button is clicked.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onClear: EventEmitter<Event | undefined> = new EventEmitter<Event | undefined>();
    /**
     * Callback to invoke on input key up.
     * @param {KeyboardEvent} event - Keyboard event.
     * @group Emits
     */
    @Output() onKeyUp: EventEmitter<KeyboardEvent> = new EventEmitter();
    /**
     * Callback to invoke on overlay is shown.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onShow: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke on overlay is hidden.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onHide: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke on lazy load data.
     * @param {AutoCompleteLazyLoadEvent} event - Lazy load event.
     * @group Emits
     */
    @Output() onLazyLoad: EventEmitter<AutoCompleteLazyLoadEvent> = new EventEmitter<AutoCompleteLazyLoadEvent>();

    @ViewChild('focusInput') inputEL: Nullable<ElementRef>;

    @ViewChild('multiIn') multiInputEl: Nullable<ElementRef>;

    @ViewChild('multiContainer') multiContainerEL: Nullable<ElementRef>;

    @ViewChild('ddBtn') dropdownButton: Nullable<ElementRef>;

    @ViewChild('items') itemsViewChild: Nullable<ElementRef>;

    @ViewChild('scroller') scroller: Nullable<Scroller>;

    @ViewChild('overlay') overlayViewChild!: Overlay;

    itemsWrapper: Nullable<HTMLDivElement>;

    /**
     * Custom item template.
     * @group Templates
     */
    @ContentChild('item') itemTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom empty message template.
     * @group Templates
     */
    @ContentChild('empty') emptyTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom header template.
     * @group Templates
     */
    @ContentChild('header') headerTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom footer template.
     * @group Templates
     */
    @ContentChild('footer') footerTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom selected item template.
     * @group Templates
     */
    @ContentChild('selecteditem') selectedItemTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom group item template.
     * @group Templates
     */
    @ContentChild('group') groupTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom loader template.
     * @group Templates
     */
    @ContentChild('loader') loaderTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom remove icon template.
     * @group Templates
     */
    @ContentChild('removeicon') removeIconTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom loading icon template.
     * @group Templates
     */
    @ContentChild('loadingicon') loadingIconTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom clear icon template.
     * @group Templates
     */
    @ContentChild('clearicon') clearIconTemplate: Nullable<TemplateRef<any>>;

    /**
     * Custom dropdown icon template.
     * @group Templates
     */
    @ContentChild('dropdownicon') dropdownIconTemplate: Nullable<TemplateRef<any>>;

    @HostListener('click', ['$event'])
    onHostClick(event: MouseEvent) {
        this.onContainerClick(event);
    }

    private primeng = inject(PrimeNG);

    value: string | any;

    _suggestions = signal<any>(null);

    timeout: Nullable<any>;

    overlayVisible: boolean | undefined;

    suggestionsUpdated: Nullable<boolean>;

    highlightOption: any;

    highlightOptionChanged: Nullable<boolean>;

    focused: boolean = false;

    loading: Nullable<boolean>;

    scrollHandler: Nullable<ConnectedOverlayScrollHandler>;

    listId: string | undefined;

    searchTimeout: any;

    dirty: boolean = false;

    _itemTemplate: TemplateRef<any>;

    _groupTemplate: TemplateRef<any>;

    _selectedItemTemplate: TemplateRef<any>;

    _headerTemplate: TemplateRef<any>;

    _emptyTemplate: TemplateRef<any>;

    _footerTemplate: TemplateRef<any>;

    _loaderTemplate: TemplateRef<any>;

    _removeIconTemplate: TemplateRef<any>;

    _loadingIconTemplate: TemplateRef<any>;

    _clearIconTemplate: TemplateRef<any>;

    _dropdownIconTemplate: TemplateRef<any>;

    focusedMultipleOptionIndex = signal<number>(-1);

    focusedOptionIndex = signal<number>(-1);

    _componentStyle = inject(AutoCompleteStyle);

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    visibleOptions = computed(() => {
        return this.group ? this.flatOptions(this._suggestions()) : this._suggestions() || [];
    });

    inputValue = computed(() => {
        const modelValue = this.modelValue();
        const selectedOption = this.optionValueSelected ? (this.suggestions || []).find((item: any) => resolveFieldData(item, this.optionValue) === modelValue) : modelValue;

        if (isNotEmpty(modelValue)) {
            if (typeof modelValue === 'object' || this.optionValueSelected) {
                const label = this.getOptionLabel(selectedOption);

                return label != null ? label : modelValue;
            } else {
                return modelValue;
            }
        } else {
            return '';
        }
    });

    get focusedMultipleOptionId() {
        return this.focusedMultipleOptionIndex() !== -1 ? `${this.id}_multiple_option_${this.focusedMultipleOptionIndex()}` : null;
    }

    get focusedOptionId() {
        return this.focusedOptionIndex() !== -1 ? `${this.id}_${this.focusedOptionIndex()}` : null;
    }

    get searchResultMessageText() {
        return isNotEmpty(this.visibleOptions()) && this.overlayVisible ? this.searchMessageText.replaceAll('{0}', this.visibleOptions().length) : this.emptySearchMessageText;
    }

    get searchMessageText() {
        return this.searchMessage || this.config.translation.searchMessage || '';
    }

    get emptySearchMessageText() {
        return this.emptyMessage || this.config.translation.emptySearchMessage || '';
    }

    get selectionMessageText() {
        return this.selectionMessage || this.config.translation.selectionMessage || '';
    }

    get emptySelectionMessageText() {
        return this.emptySelectionMessage || this.config.translation.emptySelectionMessage || '';
    }

    get selectedMessageText() {
        return this.hasSelectedOption() ? this.selectionMessageText.replaceAll('{0}', this.multiple ? this.modelValue()?.length : '1') : this.emptySelectionMessageText;
    }

    get ariaSetSize() {
        return this.visibleOptions().filter((option) => !this.isOptionGroup(option)).length;
    }

    get listLabel(): string {
        return this.config.getTranslation(TranslationKeys.ARIA)['listLabel'];
    }

    get virtualScrollerDisabled() {
        return !this.virtualScroll;
    }

    get optionValueSelected() {
        return typeof this.modelValue() === 'string' && this.optionValue;
    }

    chipItemClass(index) {
        return this._componentStyle.classes.chipItem({ instance: this, i: index });
    }

    constructor(
        public overlayService: OverlayService,
        private zone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        this.id = this.id || uuid('pn_id_');
        this.cd.detectChanges();
    }

    @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | undefined;

    ngAfterContentInit() {
        (this.templates as QueryList<PrimeTemplate>).forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this._itemTemplate = item.template;
                    break;

                case 'group':
                    this._groupTemplate = item.template;
                    break;

                case 'selecteditem':
                    this._selectedItemTemplate = item.template;
                    break;

                case 'selectedItem':
                    this._selectedItemTemplate = item.template;
                    break;

                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'empty':
                    this._emptyTemplate = item.template;
                    break;

                case 'footer':
                    this._footerTemplate = item.template;
                    break;

                case 'loader':
                    this._loaderTemplate = item.template;
                    break;

                case 'removetokenicon':
                    this._removeIconTemplate = item.template;
                    break;

                case 'loadingicon':
                    this._loadingIconTemplate = item.template;
                    break;

                case 'clearicon':
                    this._clearIconTemplate = item.template;
                    break;

                case 'dropdownicon':
                    this._dropdownIconTemplate = item.template;
                    break;

                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    ngAfterViewChecked() {
        //Use timeouts as since Angular 4.2, AfterViewChecked is broken and not called after panel is updated
        if (this.suggestionsUpdated && this.overlayViewChild) {
            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    if (this.overlayViewChild) {
                        this.overlayViewChild.alignOverlay();
                    }
                }, 1);
                this.suggestionsUpdated = false;
            });
        }
    }

    handleSuggestionsChange() {
        if (this.loading) {
            this._suggestions()?.length > 0 || this.showEmptyMessage || !!this.emptyTemplate ? this.show() : this.hide();
            const focusedOptionIndex = this.overlayVisible && this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : -1;
            this.focusedOptionIndex.set(focusedOptionIndex);
            this.suggestionsUpdated = true;
            this.loading = false;
            this.cd.markForCheck();
        }
    }

    flatOptions(options) {
        return (options || []).reduce((result, option, index) => {
            result.push({ optionGroup: option, group: true, index });

            const optionGroupChildren = this.getOptionGroupChildren(option);

            optionGroupChildren && optionGroupChildren.forEach((o) => result.push(o));

            return result;
        }, []);
    }

    isOptionGroup(option) {
        return this.optionGroupLabel && option.optionGroup && option.group;
    }

    findFirstOptionIndex() {
        return this.visibleOptions().findIndex((option) => this.isValidOption(option));
    }

    findLastOptionIndex() {
        return findLastIndex(this.visibleOptions(), (option) => this.isValidOption(option));
    }

    findFirstFocusedOptionIndex() {
        const selectedIndex = this.findSelectedOptionIndex();

        return selectedIndex < 0 ? this.findFirstOptionIndex() : selectedIndex;
    }

    findLastFocusedOptionIndex() {
        const selectedIndex = this.findSelectedOptionIndex();

        return selectedIndex < 0 ? this.findLastOptionIndex() : selectedIndex;
    }

    findSelectedOptionIndex() {
        return this.hasSelectedOption() ? this.visibleOptions().findIndex((option) => this.isValidSelectedOption(option)) : -1;
    }

    findNextOptionIndex(index) {
        const matchedOptionIndex =
            index < this.visibleOptions().length - 1
                ? this.visibleOptions()
                      .slice(index + 1)
                      .findIndex((option) => this.isValidOption(option))
                : -1;

        return matchedOptionIndex > -1 ? matchedOptionIndex + index + 1 : index;
    }

    findPrevOptionIndex(index) {
        const matchedOptionIndex = index > 0 ? findLastIndex(this.visibleOptions().slice(0, index), (option) => this.isValidOption(option)) : -1;

        return matchedOptionIndex > -1 ? matchedOptionIndex : index;
    }

    isValidSelectedOption(option) {
        return this.isValidOption(option) && this.isSelected(option);
    }

    isValidOption(option) {
        return option && !(this.isOptionDisabled(option) || this.isOptionGroup(option));
    }

    isOptionDisabled(option) {
        return this.optionDisabled ? resolveFieldData(option, this.optionDisabled) : false;
    }

    isSelected(option) {
        if (this.multiple) {
            return this.unique ? (this.modelValue() as string[])?.find((model) => equals(model, this.getOptionValue(option), this.equalityKey())) : false;
        }
        return equals(this.modelValue(), this.getOptionValue(option), this.equalityKey());
    }

    isOptionMatched(option, value) {
        return this.isValidOption(option) && this.getOptionLabel(option).toLocaleLowerCase(this.searchLocale) === value.toLocaleLowerCase(this.searchLocale);
    }

    isInputClicked(event) {
        return event.target === this.inputEL.nativeElement;
    }
    isDropdownClicked(event) {
        return this.dropdownButton?.nativeElement ? event.target === this.dropdownButton.nativeElement || this.dropdownButton.nativeElement.contains(event.target) : false;
    }
    equalityKey() {
        return this.dataKey; // TODO: The 'optionValue' properties can be added.
    }

    onContainerClick(event) {
        if (this.$disabled() || this.loading || this.isInputClicked(event) || this.isDropdownClicked(event)) {
            return;
        }

        if (!this.overlayViewChild || !this.overlayViewChild.overlayViewChild?.nativeElement.contains(event.target)) {
            focus(this.inputEL.nativeElement);
        }
    }

    handleDropdownClick(event) {
        let query = undefined;

        if (this.overlayVisible) {
            this.hide(true);
        } else {
            focus(this.inputEL.nativeElement);
            query = this.inputEL.nativeElement.value;

            if (this.dropdownMode === 'blank') this.search(event, '', 'dropdown');
            else if (this.dropdownMode === 'current') this.search(event, query, 'dropdown');
        }

        this.onDropdownClick.emit({ originalEvent: event, query });
    }

    onInput(event) {
        if (this.typeahead) {
            const _minLength = this.minQueryLength || this.minLength;

            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            let query = event.target.value;
            if (this.maxlength() !== null) {
                query = query.split('').slice(0, this.maxlength()).join('');
            }

            if (!this.multiple && !this.forceSelection) {
                this.updateModel(query);
            }

            if (query.length === 0 && !this.multiple) {
                this.onClear.emit();

                setTimeout(() => {
                    this.hide();
                }, this.delay / 2);
            } else {
                if (query.length >= _minLength) {
                    this.focusedOptionIndex.set(-1);

                    this.searchTimeout = setTimeout(() => {
                        this.search(event, query, 'input');
                    }, this.delay);
                } else {
                    this.hide();
                }
            }
        }
    }

    onInputChange(event) {
        if (this.forceSelection) {
            let valid = false;

            if (this.visibleOptions()) {
                const matchedValue = this.visibleOptions().find((option) => this.isOptionMatched(option, this.inputEL.nativeElement.value || ''));

                if (matchedValue !== undefined) {
                    valid = true;
                    !this.isSelected(matchedValue) && this.onOptionSelect(event, matchedValue);
                }
            }

            if (!valid) {
                this.inputEL.nativeElement.value = '';
                !this.multiple && this.updateModel(null);
            }
        }
    }

    onInputFocus(event) {
        if (this.$disabled()) {
            // For ScreenReaders
            return;
        }

        if (!this.dirty && this.completeOnFocus) {
            this.search(event, event.target.value, 'focus');
        }
        this.dirty = true;
        this.focused = true;
        const focusedOptionIndex = this.focusedOptionIndex() !== -1 ? this.focusedOptionIndex() : this.overlayVisible && this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : -1;
        this.focusedOptionIndex.set(focusedOptionIndex);
        this.overlayVisible && this.scrollInView(this.focusedOptionIndex());
        this.onFocus.emit(event);
    }

    onMultipleContainerFocus(event) {
        if (this.$disabled()) {
            // For ScreenReaders
            return;
        }

        this.focused = true;
    }

    onMultipleContainerBlur(event) {
        this.focusedMultipleOptionIndex.set(-1);
        this.focused = false;
    }

    onMultipleContainerKeyDown(event) {
        if (this.$disabled()) {
            event.preventDefault();

            return;
        }

        switch (event.code) {
            case 'ArrowLeft':
                this.onArrowLeftKeyOnMultiple(event);
                break;

            case 'ArrowRight':
                this.onArrowRightKeyOnMultiple(event);
                break;

            case 'Backspace':
                this.onBackspaceKeyOnMultiple(event);
                break;

            default:
                break;
        }
    }

    onInputBlur(event) {
        this.dirty = false;
        this.focused = false;
        this.focusedOptionIndex.set(-1);
        this.onModelTouched();
        this.onBlur.emit(event);
    }

    onInputPaste(event) {
        this.onKeyDown(event);
    }

    onInputKeyUp(event) {
        this.onKeyUp.emit(event);
    }

    onKeyDown(event) {
        if (this.$disabled()) {
            event.preventDefault();

            return;
        }

        switch (event.code) {
            case 'ArrowDown':
                this.onArrowDownKey(event);
                break;

            case 'ArrowUp':
                this.onArrowUpKey(event);
                break;

            case 'ArrowLeft':
                this.onArrowLeftKey(event);
                break;

            case 'ArrowRight':
                this.onArrowRightKey(event);
                break;

            case 'Home':
                this.onHomeKey(event);
                break;

            case 'End':
                this.onEndKey(event);
                break;

            case 'PageDown':
                this.onPageDownKey(event);
                break;

            case 'PageUp':
                this.onPageUpKey(event);
                break;

            case 'Enter':
            case 'NumpadEnter':
                this.onEnterKey(event);
                break;

            case 'Escape':
                this.onEscapeKey(event);
                break;

            case 'Tab':
                this.onTabKey(event);
                break;

            case 'Backspace':
                this.onBackspaceKey(event);
                break;

            case 'ShiftLeft':
            case 'ShiftRight':
                //NOOP
                break;

            default:
                break;
        }
    }

    onArrowDownKey(event) {
        if (!this.overlayVisible) {
            return;
        }

        const optionIndex = this.focusedOptionIndex() !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex()) : this.findFirstFocusedOptionIndex();

        this.changeFocusedOptionIndex(event, optionIndex);

        event.preventDefault();
        event.stopPropagation();
    }

    onArrowUpKey(event) {
        if (!this.overlayVisible) {
            return;
        }

        if (event.altKey) {
            if (this.focusedOptionIndex() !== -1) {
                this.onOptionSelect(event, this.visibleOptions()[this.focusedOptionIndex()]);
            }

            this.overlayVisible && this.hide();
            event.preventDefault();
        } else {
            const optionIndex = this.focusedOptionIndex() !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex()) : this.findLastFocusedOptionIndex();

            this.changeFocusedOptionIndex(event, optionIndex);

            event.preventDefault();
            event.stopPropagation();
        }
    }

    onArrowLeftKey(event) {
        const target = event.currentTarget;
        this.focusedOptionIndex.set(-1);
        if (this.multiple) {
            if (isEmpty(target.value) && this.hasSelectedOption()) {
                focus(this.multiContainerEL.nativeElement);
                this.focusedMultipleOptionIndex.set(this.modelValue().length);
            } else {
                event.stopPropagation(); // To prevent onArrowLeftKeyOnMultiple method
            }
        }
    }

    onArrowRightKey(event) {
        this.focusedOptionIndex.set(-1);

        this.multiple && event.stopPropagation(); // To prevent onArrowRightKeyOnMultiple method
    }

    onHomeKey(event) {
        const { currentTarget } = event;
        const len = currentTarget.value.length;

        currentTarget.setSelectionRange(0, event.shiftKey ? len : 0);
        this.focusedOptionIndex.set(-1);

        event.preventDefault();
    }

    onEndKey(event) {
        const { currentTarget } = event;
        const len = currentTarget.value.length;

        currentTarget.setSelectionRange(event.shiftKey ? 0 : len, len);
        this.focusedOptionIndex.set(-1);

        event.preventDefault();
    }

    onPageDownKey(event) {
        this.scrollInView(this.visibleOptions().length - 1);
        event.preventDefault();
    }

    onPageUpKey(event) {
        this.scrollInView(0);
        event.preventDefault();
    }

    onEnterKey(event) {
        if (!this.typeahead) {
            if (this.multiple) {
                this.updateModel([...(this.modelValue() || []), event.target.value]);
                this.inputEL.nativeElement.value = '';
            }
        }
        if (!this.overlayVisible) {
            return;
        } else {
            if (this.focusedOptionIndex() !== -1) {
                this.onOptionSelect(event, this.visibleOptions()[this.focusedOptionIndex()]);
            }

            this.hide();
        }

        event.preventDefault();
    }

    onEscapeKey(event) {
        this.overlayVisible && this.hide(true);
        event.preventDefault();
    }

    onTabKey(event) {
        if (this.focusedOptionIndex() !== -1) {
            this.onOptionSelect(event, this.visibleOptions()[this.focusedOptionIndex()]);
        }

        this.overlayVisible && this.hide();
    }

    onBackspaceKey(event) {
        if (this.multiple) {
            if (isNotEmpty(this.modelValue()) && !this.inputEL.nativeElement.value) {
                const removedValue = this.modelValue()[this.modelValue().length - 1];
                const newValue = this.modelValue().slice(0, -1);
                this.updateModel(newValue);
                this.onUnselect.emit({ originalEvent: event, value: removedValue });
            }

            event.stopPropagation(); // To prevent onBackspaceKeyOnMultiple method
        }

        if (!this.multiple && this.showClear && this.findSelectedOptionIndex() != -1) {
            this.clear();
        }
    }

    onArrowLeftKeyOnMultiple(event) {
        const optionIndex = this.focusedMultipleOptionIndex() < 1 ? 0 : this.focusedMultipleOptionIndex() - 1;
        this.focusedMultipleOptionIndex.set(optionIndex);
    }

    onArrowRightKeyOnMultiple(event) {
        let optionIndex = this.focusedMultipleOptionIndex();
        optionIndex++;

        this.focusedMultipleOptionIndex.set(optionIndex);
        if (optionIndex > this.modelValue().length - 1) {
            this.focusedMultipleOptionIndex.set(-1);
            focus(this.inputEL.nativeElement);
        }
    }

    onBackspaceKeyOnMultiple(event) {
        if (this.focusedMultipleOptionIndex() !== -1) {
            this.removeOption(event, this.focusedMultipleOptionIndex());
        }
    }

    onOptionSelect(event, option, isHide = true) {
        const value = this.getOptionValue(option);

        if (this.multiple) {
            this.inputEL.nativeElement.value = '';

            if (!this.isSelected(option)) {
                this.updateModel([...(this.modelValue() || []), value]);
            }
        } else {
            this.updateModel(value);
        }

        this.onSelect.emit({ originalEvent: event, value: option });

        isHide && this.hide(true);
    }

    onOptionMouseEnter(event, index) {
        if (this.focusOnHover) {
            this.changeFocusedOptionIndex(event, index);
        }
    }

    search(event, query, source) {
        //allow empty string but not undefined or null
        if (query === undefined || query === null) {
            return;
        }

        //do not search blank values on input change
        if (source === 'input' && query.trim().length === 0) {
            return;
        }
        this.loading = true;
        this.completeMethod.emit({ originalEvent: event, query });
    }

    removeOption(event, index) {
        event.stopPropagation();

        const removedOption = this.modelValue()[index];
        const value = (this.modelValue() as string[]).filter((_, i) => i !== index);

        this.updateModel(value);
        this.onUnselect.emit({ originalEvent: event, value: removedOption });
        focus(this.inputEL.nativeElement);
    }

    updateModel(value) {
        this.value = value;
        this.writeModelValue(value);
        this.onModelChange(value);
        this.updateInputValue();
        this.cd.markForCheck();
    }

    updateInputValue() {
        if (this.inputEL && this.inputEL.nativeElement) {
            if (!this.multiple) {
                this.inputEL.nativeElement.value = this.inputValue();
            } else {
                this.inputEL.nativeElement.value = '';
            }
        }
    }

    autoUpdateModel() {
        if ((this.selectOnFocus || this.autoHighlight) && this.autoOptionFocus && !this.hasSelectedOption()) {
            const focusedOptionIndex = this.findFirstFocusedOptionIndex();
            this.focusedOptionIndex.set(focusedOptionIndex);
            this.onOptionSelect(null, this.visibleOptions()[this.focusedOptionIndex()], false);
        }
    }

    scrollInView(index = -1) {
        const id = index !== -1 ? `${this.id}_${index}` : this.focusedOptionId;
        if (this.itemsViewChild && this.itemsViewChild.nativeElement) {
            const element = findSingle(this.itemsViewChild.nativeElement, `li[id="${id}"]`);
            if (element) {
                element.scrollIntoView && element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            } else if (!this.virtualScrollerDisabled) {
                setTimeout(() => {
                    this.virtualScroll && this.scroller?.scrollToIndex(index !== -1 ? index : this.focusedOptionIndex());
                }, 0);
            }
        }
    }

    changeFocusedOptionIndex(event, index) {
        if (this.focusedOptionIndex() !== index) {
            this.focusedOptionIndex.set(index);
            this.scrollInView();

            if (this.selectOnFocus) {
                this.onOptionSelect(event, this.visibleOptions()[index], false);
            }
        }
    }

    show(isFocus = false) {
        this.dirty = true;
        this.overlayVisible = true;
        const focusedOptionIndex = this.focusedOptionIndex() !== -1 ? this.focusedOptionIndex() : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : -1;
        this.focusedOptionIndex.set(focusedOptionIndex);
        isFocus && focus(this.inputEL.nativeElement);
        if (isFocus) {
            focus(this.inputEL.nativeElement);
        }
        this.onShow.emit();
        this.cd.markForCheck();
    }

    hide(isFocus = false) {
        const _hide = () => {
            this.dirty = isFocus;
            this.overlayVisible = false;
            this.focusedOptionIndex.set(-1);
            isFocus && focus(this.inputEL.nativeElement);
            this.onHide.emit();
            this.cd.markForCheck();
        };

        setTimeout(() => {
            _hide();
        }, 0); // For ScreenReaders
    }

    clear() {
        this.updateModel(null);
        this.inputEL.nativeElement.value = '';
        this.onClear.emit();
    }

    hasSelectedOption() {
        return isNotEmpty(this.modelValue());
    }

    getAriaPosInset(index) {
        return (
            (this.optionGroupLabel
                ? index -
                  this.visibleOptions()
                      .slice(0, index)
                      .filter((option) => this.isOptionGroup(option)).length
                : index) + 1
        );
    }

    getOptionLabel(option: any) {
        return this.optionLabel ? resolveFieldData(option, this.optionLabel) : option && option.label != undefined ? option.label : option;
    }

    getOptionValue(option) {
        return this.optionValue ? resolveFieldData(option, this.optionValue) : option && option.value != undefined ? option.value : option;
    }

    getOptionIndex(index, scrollerOptions) {
        return this.virtualScrollerDisabled ? index : scrollerOptions && scrollerOptions.getItemOptions(index)['index'];
    }

    getOptionGroupLabel(optionGroup: any) {
        return this.optionGroupLabel ? resolveFieldData(optionGroup, this.optionGroupLabel) : optionGroup && optionGroup.label != undefined ? optionGroup.label : optionGroup;
    }

    getOptionGroupChildren(optionGroup: any) {
        return this.optionGroupChildren ? resolveFieldData(optionGroup, this.optionGroupChildren) : optionGroup.items;
    }

    onOverlayAnimationStart(event: AnimationEvent) {
        if (event.toState === 'visible') {
            this.itemsWrapper = <any>findSingle(this.overlayViewChild.overlayViewChild?.nativeElement, this.virtualScroll ? '.p-scroller' : '.p-autocomplete-panel');

            if (this.virtualScroll) {
                this.scroller?.setContentEl(this.itemsViewChild?.nativeElement);
                this.scroller.viewInit();
            }
            if (this.visibleOptions() && this.visibleOptions().length) {
                if (this.virtualScroll) {
                    const selectedIndex = this.modelValue() ? this.focusedOptionIndex() : -1;

                    if (selectedIndex !== -1) {
                        this.scroller?.scrollToIndex(selectedIndex);
                    }
                } else {
                    let selectedListItem = findSingle(this.itemsWrapper, '.p-autocomplete-item.p-highlight');

                    if (selectedListItem) {
                        selectedListItem.scrollIntoView({ block: 'nearest', inline: 'center' });
                    }
                }
            }
        }
    }

    /**
     * @override
     *
     * @see {@link BaseEditableHolder.writeControlValue}
     * Writes the value to the control.
     */
    writeControlValue(value: any, setModelValue: (value: any) => void): void {
        this.value = value;
        setModelValue(value);
        this.updateInputValue();
        this.cd.markForCheck();
    }

    ngOnDestroy() {
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }

        super.ngOnDestroy();
    }
}

@NgModule({
    imports: [AutoComplete],
    exports: [AutoComplete, SharedModule]
})
export class AutoCompleteModule {}
