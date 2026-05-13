import {
  Component,
  DoCheck,
  HostBinding,
  Input,
  OnDestroy,
  Optional,
  Self,
  computed,
  effect,
  input,
  signal,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NgControl, FormsModule } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

export interface SelectOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-multi-select-chips',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    DragDropModule,
    FormsModule
  ],
  templateUrl: './multi-select-chips.component.html',
  styleUrls: ['./multi-select-chips.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: MultiSelectChipsComponent }
  ]
})
export class MultiSelectChipsComponent<T> implements ControlValueAccessor, MatFormFieldControl<T[]>, OnDestroy, DoCheck {
  static nextId = 0;

  options = input<SelectOption<T>[]>([]);
  placeholderInput = input<string>('', { alias: 'placeholder' });
  get placeholder(): string { return this.placeholderInput(); }
  
  selectedItems = signal<T[]>([]);
  isDisabled = signal<boolean>(false);
  
  searchQuery = signal<string>('');
  
  stateChanges = new Subject<void>();
  id = `app-multi-select-chips-${MultiSelectChipsComponent.nextId++}`;
  
  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }
  
  ngControl: NgControl | null = null;
  focused = false;
  
  get empty() {
    return this.selectedItems().length === 0 && !this.searchQuery();
  }

  errorState = false;

  requiredInput = input<boolean, unknown>(false, { alias: 'required', transform: booleanAttribute });
  get required(): boolean { return this.requiredInput(); }

  disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  get disabled(): boolean { return this.disabledInput() || this.isDisabled(); }

  get value(): T[] | null {
    return this.selectedItems().length ? this.selectedItems() : null;
  }

  set value(val: T[] | null) {
    this.selectedItems.set(val || []);
    this.stateChanges.next();
  }

  filteredOptions = computed(() => {
    const currentOptions = this.options();
    const selected = this.selectedItems();
    const query = (this.searchQuery() || '').toLowerCase();

    return currentOptions.filter(opt => {
      if (selected.includes(opt.value)) {
        return false;
      }
      return opt.label.toLowerCase().includes(query);
    });
  });

  selectedOptions = computed(() => {
    const currentOptions = this.options();
    const selected = this.selectedItems();
    return selected.map(val => {
      const opt = currentOptions.find(o => o.value === val);
      return opt ? opt : { value: val, label: String(val) };
    });
  });

  onChange: (val: T[] | null) => void = () => {};
  onTouched: () => void = () => {};

  constructor(@Optional() @Self() ngControl: NgControl) {
    if (ngControl) {
      this.ngControl = ngControl;
      ngControl.valueAccessor = this;
    }

    effect(() => {
      this.selectedItems();
      this.isDisabled();
      this.searchQuery();
      this.placeholderInput();
      this.requiredInput();
      this.disabledInput();
      this.updateErrorState();
      this.stateChanges.next();
    });
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  updateErrorState() {
    const oldState = this.errorState;
    const newState = !!(this.ngControl && this.ngControl.invalid && (this.ngControl.touched || this.ngControl.dirty));
    if (oldState !== newState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  setDescribedByIds(ids: string[]) {}

  onContainerClick(event: MouseEvent) {}

  writeValue(val: T[] | null): void {
    this.selectedItems.set(val || []);
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  remove(val: T): void {
    const current = this.selectedItems();
    const index = current.indexOf(val);
    if (index >= 0) {
      const newItems = [...current];
      newItems.splice(index, 1);
      this.updateValue(newItems);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const newValue = event.option.value as T;
    const current = this.selectedItems();
    if (!current.includes(newValue)) {
      this.updateValue([...current, newValue]);
    }
    this.searchQuery.set('');
  }

  drop(event: CdkDragDrop<T[]>) {
    const current = [...this.selectedItems()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.updateValue(current);
  }

  private updateValue(newValue: T[]) {
    this.selectedItems.set(newValue);
    this.onChange(newValue.length ? newValue : null);
    this.onTouched();
    this.stateChanges.next();
  }

  onFocus() {
    this.focused = true;
    this.stateChanges.next();
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
    this.stateChanges.next();
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
}
