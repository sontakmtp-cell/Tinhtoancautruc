import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { BeamInputs, CalculationResults } from '../types';
import { ARIAL_FONT_NORMAL, ARIAL_FONT_BOLD } from './pdfFonts';

interface PDFReportOptions {
  projectName?: string;
  engineer?: string;
  includeCharts?: boolean;
  chartElements?: { id: string; title: string }[];
}

// --- HELPER TYPES FOR AUTOTABLE ---
type TableColumn = {
  header: string;
  dataKey: string;
};

type TableRow = {
  [key: string]: string | number;
};

// --- STYLING CONSTANTS ---
const PRIMARY_COLOR = [0, 55, 100]; // Dark Blue
const SECONDARY_COLOR = [245, 245, 245]; // Light Gray
const TEXT_COLOR = [0, 0, 0];
const HEADER_TEXT_COLOR = [255, 255, 255];

const MARGIN = { top: 25, right: 15, bottom: 25, left: 15 };

class PDFReportService {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number = 0;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();

    // Add custom fonts
    this.pdf.addFileToVFS('arial-normal.ttf', ARIAL_FONT_NORMAL);
    this.pdf.addFileToVFS('arial-bold.ttf', ARIAL_FONT_BOLD);
    this.pdf.addFont('arial-normal.ttf', 'Arial', 'normal');
    this.pdf.addFont('arial-bold.ttf', 'Arial', 'bold');
    
    this.pdf.setFont('Arial', 'normal');
  }

  // --- HEADER & FOOTER ---
  private addHeader(projectName: string) {
    const title = 'Crane Beam Structural Analysis Report';
    
    this.pdf.setFillColor(...PRIMARY_COLOR);
    this.pdf.rect(0, 0, this.pageWidth, MARGIN.top - 5, 'F');

    this.pdf.setFont('Arial', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(...HEADER_TEXT_COLOR);
    this.pdf.text(title, this.pageWidth / 2, 10, { align: 'center' });

    this.pdf.setFontSize(10);
    this.pdf.text(projectName, this.pageWidth / 2, 17, { align: 'center' });

    this.currentY = MARGIN.top;
  }

  private addFooter() {
    const pageCount = (this.pdf.internal as any).getNumberOfPages();
    const footerText = '© Smart Crane Beam Calculator | Confidential';
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(150, 150, 150);

      // Page number
      const pageNumText = `Page ${i} of ${pageCount}`;
      this.pdf.text(pageNumText, this.pageWidth / 2, this.pageHeight - MARGIN.bottom + 15, { align: 'center' });

      // Footer line
      this.pdf.setDrawColor(150, 150, 150);
      this.pdf.line(MARGIN.left, this.pageHeight - MARGIN.bottom + 10, this.pageWidth - MARGIN.right, this.pageHeight - MARGIN.bottom + 10);
      
      // Footer text
      this.pdf.text(footerText, MARGIN.left, this.pageHeight - MARGIN.bottom + 15);
    }
  }

  // --- CONTENT SECTIONS ---
  private addProjectInfo(engineer: string, date: string) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.setTextColor(...TEXT_COLOR);
    this.pdf.text('PROJECT INFORMATION', MARGIN.left, this.currentY);
    this.currentY += 6;

    const info = [
      ['Design Engineer:', engineer || 'N/A'],
      ['Calculation Date:', date],
      ['Software:', 'Smart Crane Beam Calculator'],
    ];

    autoTable(this.pdf, {
      body: info,
      startY: this.currentY,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addInputs(inputs: BeamInputs, results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text('INPUT PARAMETERS', MARGIN.left, this.currentY);
    this.currentY += 6;

    const geomData = [
      ['Beam Span (L)', inputs.L, 'cm'],
      ['Beam Width (b)', inputs.b, 'mm'],
      ['Beam Height (h)', inputs.h, 'mm'],
      ['Top Flange (t1)', inputs.t1, 'mm'],
      ['Bottom Flange (t2)', inputs.t2, 'mm'],
      ['Web Thickness (t3)', inputs.t3, 'mm'],
      ['Stiffener Spacing (b1)', inputs.b1, 'mm'],
    ];

    const loadData = [
      ['Lifting Load (P_nang)', inputs.P_nang, 'kg'],
      ['Equipment Load (P_thietbi)', inputs.P_thietbi, 'kg'],
      ['Distributed Load (q)', results.q.toFixed(4), 'kg/cm'],
      ['Allowable Stress (σ_allow)', inputs.sigma_allow, 'kg/cm²'],
      ['Yield Strength (σ_yield)', inputs.sigma_yield, 'kg/cm²'],
      ['Elastic Modulus (E)', inputs.E.toExponential(2), 'kg/cm²'],
      ["Poisson's Ratio (ν)", inputs.nu, ''],
    ];

    autoTable(this.pdf, {
      head: [['Geometric Parameters', 'Value', 'Unit']],
      body: geomData,
      startY: this.currentY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
      margin: { right: this.pageWidth / 2 + 5 },
    });

    autoTable(this.pdf, {
      head: [['Load & Material', 'Value', 'Unit']],
      body: loadData,
      startY: this.currentY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
      margin: { left: this.pageWidth / 2 + 5 },
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addResults(results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text('CALCULATION RESULTS', MARGIN.left, this.currentY);
    this.currentY += 6;

    const geomProps = [
      ['Cross-sectional Area (F)', results.F.toFixed(2), 'cm²'],
      ['Moment of Inertia (Jx)', results.Jx.toExponential(2), 'cm⁴'],
      ['Moment of Inertia (Jy)', results.Jy.toExponential(2), 'cm⁴'],
      ['Section Modulus (Wx)', results.Wx.toFixed(2), 'cm³'],
      ['Section Modulus (Wy)', results.Wy.toFixed(2), 'cm³'],
      ['Centroid (Yc)', results.Yc.toFixed(2), 'cm'],
      ['Centroid (Xc)', results.Xc.toFixed(2), 'cm'],
    ];

    const forcesStresses = [
      ['Total Bending Moment (M_x)', results.M_x.toExponential(2), 'kg.cm'],
      ['Bending Moment (M_y)', results.M_y.toExponential(2), 'kg.cm'],
      ['Calculated Stress (σ_u)', results.sigma_u.toFixed(2), 'kg/cm²'],
      ['Top Compression Stress', results.sigma_top_compression.toFixed(2), 'kg/cm²'],
      ['Bottom Tension Stress', results.sigma_bottom_tension.toFixed(2), 'kg/cm²'],
      ['Calculated Deflection (f)', results.f.toFixed(3), 'cm'],
      ['Allowable Deflection (f_allow)', results.f_allow.toFixed(3), 'cm'],
    ];

    autoTable(this.pdf, {
      head: [['Geometric Properties', 'Value', 'Unit']],
      body: geomProps,
      startY: this.currentY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 5;

    autoTable(this.pdf, {
      head: [['Internal Forces & Stresses', 'Value', 'Unit']],
      body: forcesStresses,
      startY: this.currentY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addSafetyChecks(results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text('SAFETY CHECKS', MARGIN.left, this.currentY);
    this.currentY += 6;

    const checks = [
      ['Stress Check (K_sigma)', results.K_sigma.toFixed(2), results.stress_check.toUpperCase()],
      ['Deflection Check (nf)', results.n_f.toFixed(2), results.deflection_check.toUpperCase()],
      ['Local Buckling Check (K_b)', results.K_buckling.toFixed(2), results.buckling_check.toUpperCase()],
    ];

    autoTable(this.pdf, {
      head: [['Check', 'Value', 'Status']],
      body: checks,
      startY: this.currentY,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR },
      didParseCell: (data) => {
        if (data.column.dataKey === 'Status') {
          if (data.cell.raw === 'PASS') {
            data.cell.styles.textColor = [0, 128, 0];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === 'FAIL') {
            data.cell.styles.textColor = [255, 0, 0];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addOverallAssessment(results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text('OVERALL ASSESSMENT', MARGIN.left, this.currentY);
    this.currentY += 8;

    const overallStatus = results.stress_check === 'pass' && 
                         results.deflection_check === 'pass' && 
                         results.buckling_check === 'pass';
    
    const statusText = overallStatus ? 'BEAM MEETS ALL SAFETY REQUIREMENTS' : 'BEAM DOES NOT MEET SAFETY REQUIREMENTS';
    const statusColor = overallStatus ? [0, 128, 0] : [255, 0, 0];
    const description = overallStatus 
      ? 'All checks PASSED. The beam is considered safe for the specified loads and conditions.'
      : 'One or more safety checks FAILED. The beam design requires modification.';

    this.pdf.setFillColor(overallStatus ? '#e8f5e9' : '#ffebee'); // Light green/red background
    this.pdf.rect(MARGIN.left, this.currentY - 2, this.pageWidth - MARGIN.left - MARGIN.right, 20, 'F');
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.setTextColor(...statusColor);
    this.pdf.text(statusText, this.pageWidth / 2, this.currentY + 5, { align: 'center' });

    this.pdf.setFontSize(10);
    this.pdf.setFont('Arial', 'normal');
    this.pdf.setTextColor(...TEXT_COLOR);
    this.pdf.text(description, this.pageWidth / 2, this.currentY + 12, { align: 'center' });

    this.currentY += 25;
  }

  // --- CHART/IMAGE HANDLING ---
  private async captureElement(elementId: string, title: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id "${elementId}" not found.`);
      return;
    }

    // Ensure the element is visible
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = this.pageWidth - MARGIN.left - MARGIN.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const maxHeight = 120;
    const finalHeight = Math.min(imgHeight, maxHeight);

    if (this.currentY + finalHeight + 15 > this.pageHeight - MARGIN.bottom) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('Arial', 'bold');
    this.pdf.text(title, MARGIN.left, this.currentY);
    this.currentY += 6;

    this.pdf.addImage(imgData, 'PNG', MARGIN.left, this.currentY, imgWidth, finalHeight);
    this.currentY += finalHeight + 10;
  }

  // --- PUBLIC GENERATION METHOD ---
  public async generate(
    inputs: BeamInputs,
    results: CalculationResults,
    options: PDFReportOptions
  ) {
    const { 
      projectName = 'Crane Beam Calculation', 
      engineer = 'N/A', 
      includeCharts = false,
      chartElements = []
    } = options;
    const date = new Date().toLocaleDateString('en-GB');

    this.addHeader(projectName);
    this.addProjectInfo(engineer, date);
    this.addInputs(inputs, results);
    this.addResults(results);
    this.addSafetyChecks(results);
    this.addOverallAssessment(results);

    if (includeCharts && chartElements.length > 0) {
      if (this.currentY + 20 > this.pageHeight - MARGIN.bottom) {
        this.pdf.addPage();
        this.currentY = MARGIN.top;
      }
      
      this.pdf.setFontSize(14);
      this.pdf.setFont('Arial', 'bold');
      this.pdf.text('ANALYSIS DIAGRAMS', MARGIN.left, this.currentY);
      this.currentY += 8;

      for (const chart of chartElements) {
        await this.captureElement(chart.id, chart.title);
      }
    }

    this.addFooter();
    this.pdf.save('Crane-Beam-Analysis-Report.pdf');
  }
}

export const generatePDFReport = async (
  inputs: BeamInputs,
  results: CalculationResults,
  options: PDFReportOptions = {}
): Promise<void> => {
  const pdfService = new PDFReportService();
  await pdfService.generate(inputs, results, options);
};