/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchQueryWidget } from '../query';
import { Form } from '../form';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react/dont-cleanup-after-each';

export const AMINO_ACID_SEQUENCE = `MNTLWLSLWDYPGKLPLNFMVFDTKDDLQAAYWRDPYSIPLAVIFEDPQPISQRLIYEIR
TNPSYTLPPPPTKLYSAPISCRKNKTGHWMDDILSIKTGESCPVNNYLHSGFLALQMITD
ITKIKLENSDVTIPDIKLIMFPKEPYTADWMLAFRVVIPLYMVLALSQFITYLLILIVGE
KENKIKEGMKMMGLNDSVF
>SI2.2.0_13722 locus=Si_gnF.scaffold06207[1925625..1928536].pep_1 quality=100.00
MSANRLNVLVTLMLAVALLVTESGNAQVDGYLQFNPKRSAVSSPQKYCGKKLSNALQIIC
DGVYNSMFKKSGQDFPPQNKRHIAHRINGNEEESFTTLKSNFLNWCVEVYHRHYRFVFVS
EMEMADYPLAYDISPYLPPFLSRARARGMLDGRFAGRRYRRESRGIHEECCINGCTINEL
TSYCGP
`;
describe('SEARCH COMPONENT', () => {
    const getInputElement = () => screen.getByRole('textbox', { name: '' });
    test('should render the search component textarea', () => {
        render(<SearchQueryWidget onSequenceTypeChanged={() => { }
        } />);
        const el = getInputElement();
        expect(el).toHaveClass('form-control');
    });

    test('clear button should only become visible if textarea is not empty', () => {
        render(<SearchQueryWidget onSequenceTypeChanged={() => { }
        } />);
        const getButtonWrapper = () => screen.getByRole('button', { name: /clear query sequence\(s\)\./i }).parentElement;
        expect(getButtonWrapper()).toHaveClass('hidden');
        const inputEl = getInputElement();
        fireEvent.change(inputEl, { target: { value: AMINO_ACID_SEQUENCE } });
        expect(getButtonWrapper()).not.toHaveClass('hidden');
        fireEvent.change(inputEl, { target: { value: '' } });
        expect(getButtonWrapper()).toHaveClass('hidden');

    });
});
