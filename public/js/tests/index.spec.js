import { render, screen } from '@testing-library/react';
import { SearchQueryWidget } from '../query';


describe('SEARCH', () => {
  it('should render the search component textarea', () => {
      render(<SearchQueryWidget />);
      const el = screen.getByPlaceholderText('Paste query sequence(s) or drag file containing query sequence(s) in FASTA format here ...');
      expect(el).toHaveClass('form-control');
  });
  it('should correctly guess database type', () => {
    
  })
})
