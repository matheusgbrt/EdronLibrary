import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectChipsFilterComponent } from './multi-select-chips-filter.component';

describe('MultiSelectChipsFilterComponent', () => {
  let fixture: ComponentFixture<MultiSelectChipsFilterComponent>;
  let component: MultiSelectChipsFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectChipsFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectChipsFilterComponent);
    component = fixture.componentInstance;
  });

  it('shows only unselected options in the dropdown list', () => {
    fixture.componentRef.setInput('options', ['Armor', 'Weapon', 'Quiver']);
    fixture.componentRef.setInput('selected', ['Weapon']);

    expect(component.availableOptions()).toEqual(['Armor', 'Quiver']);
  });

  it('emits selected chips when an option is added or removed', () => {
    const emitted: string[][] = [];
    fixture.componentRef.setInput('options', ['Armor', 'Weapon', 'Quiver']);
    fixture.componentRef.setInput('selected', ['Weapon']);
    component.selectionChanged.subscribe((selection) => emitted.push(selection));

    component.selectOption('Armor');
    component.removeOption('Weapon');

    expect(emitted).toEqual([
      ['Weapon', 'Armor'],
      []
    ]);
  });
});
