import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { BeamInputs, CalculationResults } from '../types';
import { ARIAL_FONT_NORMAL, ARIAL_FONT_BOLD } from './pdfFonts';

interface PDFReportData {
  inputs: BeamInputs;
  results: CalculationResults;
  projectName?: string;
  engineer?: string;
  date?: string;
}

interface ChartCaptureConfig {
  id: string;
  title: string;
}

interface PDFReportOptions {
  projectName?: string;
  engineer?: string;
  includeCharts?: boolean;
  chartElements?: ChartCaptureConfig[];
}

export class PDFReportService {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;

  constructor() {

    this.pdf = new jsPDF('p', 'mm', 'a4');

    this.pdf.addFileToVFS('arial-normal.ttf', ARIAL_FONT_NORMAL);

    this.pdf.addFileToVFS('arial-bold.ttf', ARIAL_FONT_BOLD);

    this.pdf.addFont('arial-normal.ttf', 'Arial', 'normal');

    this.pdf.addFont('arial-bold.ttf', 'Arial', 'bold');

    this.pdf.setFont('Arial', 'normal');

    this.pdf.setFontSize(10);

    this.pdf.setTextColor(0, 0, 0);

  }

  private addNewPageIfNeeded(additionalHeight: number = 10): void {
    if (this.currentY + additionalHeight > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(title: string, fontSize: number = 16): void {
    this.addNewPageIfNeeded(10);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addSubtitle(subtitle: string, fontSize: number = 12): void {
    this.addNewPageIfNeeded(8);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text(subtitle, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string, fontSize: number = 10, isBold: boolean = false): void {

    this.addNewPageIfNeeded(6);

    this.pdf.setFontSize(fontSize);

    this.pdf.setFont('Arial', isBold ? 'bold' : 'normal');

    const lines = this.pdf.splitTextToSize(text, 170);

    for (const line of lines) {

      this.addNewPageIfNeeded(6);

      this.pdf.text(line, this.margin, this.currentY);

      this.currentY += 6;

    }

  }

  private addTableRow(label: string, value: string, unit: string): void {
    this.addNewPageIfNeeded(8);
    this.pdf.setFontSize(10);
    this.pdf.setFont('Arial', 'normal');
    this.pdf.text(label, this.margin, this.currentY);
    this.pdf.text(`${value} ${unit}`, this.margin + 100, this.currentY);
    this.currentY += 8;
  }

  private addSafetyCheck(label: string, value: string, status: 'pass' | 'fail'): void {

    this.addNewPageIfNeeded(8);

    this.pdf.setFontSize(10);

    this.pdf.setFont('Arial', 'normal');

    this.pdf.text(label, this.margin, this.currentY);

    this.pdf.text(value, this.margin + 80, this.currentY);

    if (status === 'pass') {

      this.pdf.setTextColor(0, 128, 0);

      this.pdf.text('PASS', this.margin + 140, this.currentY);

    } else {

      this.pdf.setTextColor(255, 0, 0);

      this.pdf.text('FAIL', this.margin + 140, this.currentY);

    }

    this.pdf.setTextColor(0, 0, 0);

    this.currentY += 8;

  }

  private addSeparator(): void {
    this.addNewPageIfNeeded(5);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  public async generateReport(data: PDFReportData): Promise<void> {
    const { inputs, results, projectName = 'Crane Beam Calculation Project', engineer = 'Engineer', date = new Date().toLocaleDateString('en-US') } = data;

    // Header
    this.addTitle('CRANE BEAM STRUCTURAL ANALYSIS REPORT', 18);
    this.addSeparator();

    // Project Info
    this.addSubtitle('PROJECT INFORMATION');
    this.addText(`Project name: ${projectName}`);
    this.addText(`Design engineer: ${engineer}`);
    this.addText(`Calculation date: ${date}`);
    this.addText(`Software: Smart Crane Beam Calculator`);
    this.currentY += 5;

    // Input Parameters
    this.addSubtitle('INPUT PARAMETERS');
    
    this.addText('Geometric Parameters:', 10, true);
    this.addTableRow('Beam width (b)', inputs.b.toString(), 'mm');
    this.addTableRow('Beam height (h)', inputs.h.toString(), 'mm');
    this.addTableRow('Top flange thickness (t1)', inputs.t1.toString(), 'mm');
    this.addTableRow('Bottom flange thickness (t2)', inputs.t2.toString(), 'mm');
    this.addTableRow('Web thickness (t3)', inputs.t3.toString(), 'mm');
    this.addTableRow('Web stiffener spacing (b1)', inputs.b1.toString(), 'mm');
    this.currentY += 3;

    this.addText('Load and Material Properties:', 10, true);
    this.addTableRow('Beam span (L)', inputs.L.toString(), 'cm');
    this.addTableRow('Lifting load (P_nang)', inputs.P_nang.toString(), 'kg');
    this.addTableRow('Equipment load (P_thietbi)', inputs.P_thietbi.toString(), 'kg');
    this.addTableRow('Distributed load (q)', inputs.q.toString(), 'kg/cm');
    this.addTableRow('Allowable stress (σ_allow)', inputs.sigma_allow.toString(), 'kg/cm²');
    this.addTableRow('Yield strength (σ_yield)', inputs.sigma_yield.toString(), 'kg/cm²');
    this.addTableRow('Elastic modulus (E)', inputs.E.toExponential(2), 'kg/cm²');
    this.addTableRow('Poisson ratio (ν)', inputs.nu.toString(), '');

    this.addSeparator();

    // Calculation Results
    this.addSubtitle('CALCULATION RESULTS');
    
    this.addText('Geometric Properties:', 10, true);
    this.addTableRow('Cross-sectional area (F)', results.F.toFixed(2), 'cm�');
    this.addTableRow('Moment of inertia Jx', results.Jx.toExponential(2), 'cm4');
    this.addTableRow('Moment of inertia Jy', results.Jy.toExponential(2), 'cm4');
    this.addTableRow('Section modulus Wx', results.Wx.toFixed(2), 'cm�');
    this.addTableRow('Section modulus Wy', results.Wy.toFixed(2), 'cm�');
    this.addTableRow('Centroid Yc', results.Yc.toFixed(2), 'cm');
    this.currentY += 3;

    this.addText('Internal Forces and Stresses:', 10, true);
    this.addTableRow('Total bending moment (M_x)', results.M_x.toExponential(2), 'kg.cm');
    this.addTableRow('Calculated stress (σ)', results.sigma_u.toFixed(2), 'kg/cm²');
    this.addTableRow('Calculated deflection (f)', results.f.toFixed(3), 'cm');

    this.addSeparator();

    // Safety Checks
    this.addSubtitle('SAFETY CHECKS');
    this.addSafetyCheck('Stress check (Kσ)', results.K_sigma.toFixed(2), results.stress_check);
    this.addSafetyCheck('Deflection check (nf)', results.n_f.toFixed(2), results.deflection_check);
    this.addSafetyCheck('Local buckling check (K_b)', results.K_buckling.toFixed(2), results.buckling_check);

    this.addSeparator();

    // Overall Assessment
    this.addSubtitle('OVERALL ASSESSMENT');
    const overallStatus = results.stress_check === 'pass' && 
                         results.deflection_check === 'pass' && 
                         results.buckling_check === 'pass';
    
    if (overallStatus) {
      this.pdf.setTextColor(0, 128, 0);
      this.addText('✓ BEAM MEETS SAFETY REQUIREMENTS', 12, true);
      this.pdf.setTextColor(0, 0, 0);
      this.addText('All checks PASSED. The beam can be safely used with the given parameters.');
    } else {
      this.pdf.setTextColor(255, 0, 0);
      this.addText('✗ BEAM DOES NOT MEET SAFETY REQUIREMENTS', 12, true);
      this.pdf.setTextColor(0, 0, 0);
      this.addText('One or more checks FAILED. Design modifications are required.');
    }

    this.addSeparator();

    // Footer
    this.currentY = this.pageHeight - 30;
    this.addText(`Report generated automatically on ${new Date().toLocaleString('en-US')}`, 8);
    this.addText('© Smart Crane Beam Calculator', 8);
  }

  public async captureElementToPDF(elementId: string, title: string = 'Diagram'): Promise<void> {
    console.log(`Starting capture of element: ${elementId}`);
    
    // First, try to ensure the element is visible by expanding any collapsed sections
    await this.ensureElementVisible(elementId);
    
    // Wait a bit more for potential animations to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id "${elementId}" not found in DOM`);
      this.addText(`? ${title}: Element not found (ID: ${elementId})`);
      return;
    }

    // Check if element is actually visible and has content
    const rect = element.getBoundingClientRect();
    console.log(`Element ${elementId} dimensions:`, rect.width, 'x', rect.height);
    
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`Element with id "${elementId}" has zero dimensions`);
      this.addText(`? ${title}: Element not visible (zero dimensions)`);
      return;
    }

    try {
      // Check if element contains SVG (for diagrams)
      const svgElement = element.querySelector('svg');
      if (svgElement) {
        const svgRect = svgElement.getBoundingClientRect();
        console.log(`SVG ${elementId} dimensions:`, svgRect.width, 'x', svgRect.height);
        
        if (svgRect.width === 0 || svgRect.height === 0) {
          console.warn(`SVG in element ${elementId} has zero dimensions`);
          this.addText(`? ${title}: SVG diagram not properly rendered`);
          return;
        }
      }
      
      console.log(`Capturing canvas for ${elementId}...`);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        ignoreElements: (node) => {
          // Ignore any hidden elements
          const computedStyle = window.getComputedStyle(node as Element);
          return computedStyle.display === 'none' || computedStyle.visibility === 'hidden';
        }
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty or invalid');
      }

      console.log(`Canvas created for ${elementId}: ${canvas.width}x${canvas.height}`);

      const imgData = canvas.toDataURL('image/png');
      if (!imgData || imgData === 'data:,' || imgData.length < 100) {
        throw new Error('Failed to generate image data or image is too small');
      }

      const imgWidth = 170; // PDF width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Ensure we don't exceed reasonable height
      const maxHeight = 120;
      const finalHeight = Math.min(imgHeight, maxHeight);
      
      this.addNewPageIfNeeded(finalHeight + 20);
      this.addSubtitle(title);
      this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, finalHeight);
      this.currentY += finalHeight + 10;
      
      console.log(`? Successfully captured ${title} (${elementId})`);
    } catch (error) {
      console.error(`? Error capturing element ${elementId}:`, error);
      this.addText(`? Error capturing ${title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureElementVisible(elementId: string): Promise<void> {
    try {
      // Try to find and expand any CollapsibleSection containing this element
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element ${elementId} not found in DOM`);
        return;
      }

      // Find the parent CollapsibleSection container
      let parent = element.parentElement;
      while (parent && !parent.classList.contains('bg-white')) {
        parent = parent.parentElement;
      }

      if (parent) {
        // Look for the button that controls this CollapsibleSection
        const button = parent.querySelector('button[type="button"]');
        if (button) {
          const isExpanded = button.getAttribute('aria-expanded') === 'true';

          if (!isExpanded) {
            console.log(`Expanding collapsed section for ${elementId}`);
            (button as HTMLElement).click();
            // Wait for animation to finish so the chart stays visible
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

      }

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log(`Element ${elementId} should now be visible`);
    } catch (error) {
      console.warn('Failed to ensure element visibility:', error);
    }
  }

  public async addCharts(charts: ChartCaptureConfig[]): Promise<void> {
    if (!charts.length) {
      this.addText('? No charts to include in the report.');
      return;
    }

    this.addSeparator();
    this.addSubtitle('ANALYSIS DIAGRAMS');

    let successCount = 0;
    let errorCount = 0;

    for (const chart of charts) {
      try {
        const initialY = this.currentY;
        await this.captureElementToPDF(chart.id, chart.title);
        
        // Check if anything was actually added (Y position changed significantly)
        if (this.currentY > initialY + 15) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Failed to capture chart ${chart.id}:`, error);
        this.addText(`? Failed to capture ${chart.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }
  }

  public save(filename: string = 'crane-beam-analysis-report.pdf'): void {
    this.pdf.save(filename);
  }

  public getBlob(): Blob {
    return this.pdf.output('blob');
  }
}

export const generatePDFReport = async (
  inputs: BeamInputs, 
  results: CalculationResults,
  options: PDFReportOptions = {}
): Promise<void> => {
  const pdfService = new PDFReportService();
  
  await pdfService.generateReport({
    inputs,
    results,
    projectName: options.projectName,
    engineer: options.engineer
  });

  if (options.includeCharts && options.chartElements?.length) {
    await pdfService.addCharts(options.chartElements);
  }

  pdfService.save();
};







