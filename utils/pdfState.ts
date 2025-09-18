// Global state to prevent UI interactions during PDF generation
let isPDFGenerating = false;

export const setGlobalPDFGenerating = (value: boolean) => {
  isPDFGenerating = value;
  console.log(`🔒 PDF Generation Lock: ${value ? 'LOCKED' : 'UNLOCKED'}`);
};

export const isGlobalPDFGenerating = () => isPDFGenerating;
