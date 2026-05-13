import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgxTolgeeModule} from '@tolgee/ngx';
import {newInstance} from '@jsplumb/browser-ui';
import { MultiSelectChipsComponent, SelectOption } from './multi-select-chips/multi-select-chips.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [NgxTolgeeModule, MultiSelectChipsComponent, MatFormFieldModule, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'testowe';
  
  myOptions: SelectOption<number>[] = [
    { value: 1, label: 'Jabłko' },
    { value: 2, label: 'Banan' },
    { value: 3, label: 'Pomarańcza' },
    { value: 4, label: 'Gruszka' },
    { value: 5, label: 'Śliwka' },
    { value: 6, label: 'Truskawka' },
    { value: 7, label: 'Malina' },
  ];
  
  selectedFruits: number[] = [2, 4];

  ngOnInit() {
    const inst = newInstance();

    // inst.getConnections().forEach((connection) => connection.)
  }
}
