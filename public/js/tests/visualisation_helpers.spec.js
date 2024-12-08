// Import the necessary functions
import { tick_formatter, formatNumberUnits } from '../visualisation_helpers';

describe('tick_formatter', () => {
    test('formats tick for amino_acid sequence', () => {
        const formatter = tick_formatter(null, 'amino_acid');
        expect(formatter(1_000)).toBe('1 kaa');
        expect(formatter(25_286_936)).toBe('25.3 Maa');
    });

    test('formats tick for nucleic_acid sequence', () => {
        const formatter = tick_formatter(null, 'nucleic_acid');
        expect(formatter(1_000)).toBe('1 kbp');
        expect(formatter(25_965_000)).toBe('26 Mbp');
    });
});

describe('formatNumberUnits', () => {
    test('formats number with units correctly', () => {
        expect(formatNumberUnits('1.9k')).toBe('1.9 k');
        expect(formatNumberUnits('1.5k')).toBe('1.5 k');
    });

    test('rounds up correctly based on threshold', () => {
        expect(formatNumberUnits('2.95k')).toBe('3 k');
        expect(formatNumberUnits('2.94k')).toBe('2.9 k');
    });
});
