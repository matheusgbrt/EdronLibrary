import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { TibiaItem } from '../../models';
import { ItemCardComponent } from './item-card.component';

const translations = {
  itemCard: {
    attack: 'Attack',
    armor: 'Armor',
    bonuses: 'Bonuses',
    classification: 'Classification',
    imbuementSlots: 'Imbuement slots',
    level: 'Level',
    maxTier: 'Max tier',
    protections: 'Protections',
    range: 'Range',
    slots: 'Slots',
    unrestricted: 'Unrestricted',
    vocations: 'Vocations',
    weight: 'Weight'
  }
};

describe('ItemCardComponent', () => {
  let fixture: ComponentFixture<ItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: translations },
          preloadLangs: true,
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en'
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCardComponent);
  });

  it('renders armor as a primary stat tile before meta chips', async () => {
    fixture.componentRef.setInput('item', {
      id: 'alicorn-headguard',
      name: 'Alicorn Headguard',
      kind: 'armor',
      level: 400,
      vocations: ['Paladin'],
      weight: 39,
      marketable: true,
      imbuementSlots: 2,
      classification: 4,
      maxTier: null,
      bonuses: { Distance: 3 },
      protections: { Physical: 5 },
      specialEffects: [],
      dropsFrom: { normal: [], boss: [], invasion: [], quest: [], other: [] },
      sources: { primary: 'manual', urls: {}, confidence: 'high' },
      assets: { imagePath: '' },
      metadata: { tags: [], dataQuality: 'complete' },
      armor: { slot: 'Helmet', arm: 11, def: null, twoHanded: false }
    } satisfies TibiaItem);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.primary-stat')?.textContent).toContain('Armor');
    expect(element.querySelector('.primary-stat')?.textContent).toContain('11');
    expect([...element.querySelectorAll('.meta-chip')].some((chip) => chip.textContent?.includes('Level 400'))).toBe(true);
    expect(element.querySelector('.bonus-chip')?.textContent).toContain('+3 Distance');
    expect(element.querySelector('.protection-chip')?.textContent).toContain('Physical 5%');
  });
});
