import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { TFunction } from 'i18next';
import i18n from '../src/i18n';
import type { BeamInputs, CalculationResults, Language } from '../types';
// Import from src to avoid MIME issues in Vite dev server
// Load fonts from public assets at runtime to avoid module MIME issues in dev
let fontCache: { regular?: string; bold?: string } = {};
async function loadFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as any);
  }
  return btoa(binary);
}


interface PDFReportOptions {
  projectName?: string;
  engineer?: string;
  includeCharts?: boolean;
  chartElements?: { id: string; title: string }[];
  language?: Language;
  aiRecommendation?: string;
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
const PRIMARY_COLOR: [number, number, number] = [0, 55, 100]; // Dark Blue
const SECONDARY_COLOR: [number, number, number] = [245, 245, 245]; // Light Gray
const TEXT_COLOR: [number, number, number] = [0, 0, 0];
const HEADER_TEXT_COLOR: [number, number, number] = [255, 255, 255];

const MARGIN = { top: 25, right: 15, bottom: 25, left: 15 };

// --- UNITS (use Unicode superscripts to avoid encoding issues) ---
const SUP2 = '\u00B2'; // ²
const SUP3 = '\u00B3'; // ³
const SUP4 = '\u2074'; // ⁴
const UNIT_SIGMA = `kg/cm${SUP2}`;
const UNIT_AREA = `cm${SUP2}`;
const UNIT_I = `cm${SUP4}`;
const UNIT_W = `cm${SUP3}`;

class PDFReportService {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number = 0;
  private t: TFunction<'translation', undefined>;
  private lang: Language;

  constructor(language: Language = 'en') {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.t = i18n.getFixedT(language);
    this.lang = language;

    // Font is loaded asynchronously in generate() to avoid blocking constructor
  }

  // --- HEADER & FOOTER ---
  private addHeader(projectName: string) {
    const title = this.t('reportTitle');
    
    this.pdf.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    this.pdf.rect(0, 0, this.pageWidth, MARGIN.top - 5, 'F');

    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(HEADER_TEXT_COLOR[0], HEADER_TEXT_COLOR[1], HEADER_TEXT_COLOR[2]);
    this.pdf.text(title, this.pageWidth / 2, 10, { align: 'center' });

    this.pdf.setFontSize(10);
    this.pdf.text(projectName, this.pageWidth / 2, 17, { align: 'center' });

    this.currentY = MARGIN.top;
  }

  private addFooter() {
    const pageCount = (this.pdf.internal as any).getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(150, 150, 150);

      // Page number
      const pageNumText = `${this.t('page')} ${i} ${this.t('of')} ${pageCount}`;
      this.pdf.text(pageNumText, this.pageWidth / 2, this.pageHeight - MARGIN.bottom + 15, { align: 'center' });

      // Footer line
      this.pdf.setDrawColor(150, 150, 150);
      this.pdf.line(MARGIN.left, this.pageHeight - MARGIN.bottom + 10, this.pageWidth - MARGIN.right, this.pageHeight - MARGIN.bottom + 10);
      
      // Footer text
      this.pdf.text(this.t('footerText'), MARGIN.left, this.pageHeight - MARGIN.bottom + 15);
    }
  }

  // --- CONTENT SECTIONS ---
  private addProjectInfo(engineer: string, date: string) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    this.pdf.text(this.t('projectInformation'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const info = [
      [this.t('designEngineer'), engineer || this.t('pdf.notAvailable')],
      [this.t('calculationDate'), date],
      [this.t('software'), this.t('softwareName')],
      [this.t('pdf.appliedStandards'), this.t('pdf.tcvnStandards')],
      [this.t('pdf.loadTestConditions'), this.t('pdf.tcvnTestConditions')],
    ];

    autoTable(this.pdf, {
      body: info,
      startY: this.currentY,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1, font: 'NotoSans' },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addInputs(inputs: BeamInputs, results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('inputParameters'), MARGIN.left, this.currentY);
    this.currentY += 6;

    let geomData: (string | number)[][];
    if ((results as any).calculationMode === 'i-beam') {
      geomData = [
        [this.t('beamSpan'), inputs.L, 'cm'],
        [this.t('Flange width b'), inputs.b, 'mm'],
        [this.t('Beam height H'), inputs.h, 'mm'],
        [this.t('Flange thickness t1'), inputs.t1, 'mm'],
        [this.t('Web thickness t2'), inputs.t3, 'mm'], // UI label uses t2; underlying field is inputs.t3 (web thickness)
      ];
    } else {
      geomData = [
        [this.t('beamSpan'), inputs.L, 'cm'],
        [this.t('beamWidth'), inputs.b, 'mm'],
        [this.t('calculator.topFlangeWidthB3'), (inputs as any).b3 ?? inputs.b, 'mm'],
        [this.t('beamHeight'), inputs.h, 'mm'],
        [this.t('calculator.bottomFlangeThicknessT2'), inputs.t2, 'mm'],
        [this.t('calculator.topFlangeThicknessT1'), inputs.t1, 'mm'],
        [this.t('calculator.webThicknessT3'), inputs.t3, 'mm'],
        [this.t('calculator.bodyWidthB3'), inputs.b1, 'mm'],
        [this.t('endCarriageWheelCenterA'), inputs.A, 'mm'],
        [this.t('endInclinedSegmentC'), inputs.C, 'mm'],
      ];
    }

    const loadData = [
      [this.t('materialType'), (inputs as any).materialType ? String((inputs as any).materialType) : this.t('pdf.customMaterial') || 'Custom', ''],
      [this.t('liftingLoad'), inputs.P_nang, 'kg'],
      [this.t('equipmentLoad'), inputs.P_thietbi, 'kg'],
      [this.t('distributedLoad'), results.q.toFixed(4), 'kg/cm'],
      [this.t('allowableStress'), inputs.sigma_allow, 'kg/cm²'],
      [this.t('yieldStrength'), inputs.sigma_yield, 'kg/cm²'],
      [this.t('elasticModulus'), inputs.E.toExponential(2), 'kg/cm²'],
      [this.t('poissonsRatio'), inputs.nu, ''],
    ];

    autoTable(this.pdf, {
      head: [[this.t('geometricParameters'), this.t('value'), this.t('unit')]],
      body: geomData,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 8;
    if (this.currentY > this.pageHeight - MARGIN.bottom - 50) { // Check if space is enough for next table
        this.pdf.addPage();
        this.currentY = MARGIN.top;
    }

    autoTable(this.pdf, {
      head: [[this.t('loadAndMaterial'), this.t('value'), this.t('unit')]],
      body: loadData,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addResults(results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('calculationResults'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const geomProps = [
      [this.t('crossSectionalArea'), results.F.toFixed(2), 'cm²'],
      [this.t('momentOfInertiaX'), results.Jx.toExponential(2), 'cm⁴'],
      [this.t('momentOfInertiaY'), results.Jy.toExponential(2), 'cm⁴'],
      [this.t('sectionModulusX'), results.Wx.toFixed(2), 'cm³'],
      [this.t('sectionModulusY'), results.Wy.toFixed(2), 'cm³'],
      [this.t('centroidY'), results.Yc.toFixed(2), 'cm'],
      [this.t('centroidX'), results.Xc.toFixed(2), 'cm'],
    ];

    const forcesStresses = [
      [this.t('totalBendingMomentX'), results.M_x.toExponential(2), 'kg.cm'],
      [this.t('bendingMomentY'), results.M_y.toExponential(2), 'kg.cm'],
      [this.t('calculatedStress'), results.sigma_u.toFixed(2), 'kg/cm²'],
      [this.t('topCompressionStress'), results.sigma_top_compression.toFixed(2), 'kg/cm²'],
      [this.t('bottomTensionStress'), results.sigma_bottom_tension.toFixed(2), 'kg/cm²'],
      [this.t('calculatedDeflection'), results.f.toFixed(3), 'cm'],
      [this.t('allowableDeflection'), results.f_allow.toFixed(3), 'cm'],
    ];

    autoTable(this.pdf, {
      head: [[this.t('geometricProperties'), this.t('value'), this.t('unit')]],
      body: geomProps,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 5;

    // Check if there's enough space for the next table, if not, add a new page
    // Estimate next table height: header + 7 rows * ~6mm/row = ~50mm
    if (this.currentY > this.pageHeight - MARGIN.bottom - 50) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    autoTable(this.pdf, {
      head: [[this.t('internalForcesAndStresses'), this.t('value'), this.t('unit')]],
      body: forcesStresses,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addGeometricBalance(inputs: BeamInputs) {
    // Ensure space
    if (this.currentY + 20 > this.pageHeight - MARGIN.bottom) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('geometricBalance'), MARGIN.left, this.currentY);
    this.currentY += 6;

    // Convert to cm where needed
    const H_cm = inputs.h / 10; // mm -> cm
    const L_cm = inputs.L;      // already cm
    const b1_cm = inputs.b / 10; // bottom flange width (b1) mm -> cm
    const body_cm = inputs.b1 / 10; // b3 spacing mm -> cm
    const A_cm = inputs.A / 10; // A mm -> cm
    const C_cm = inputs.C / 10; // C mm -> cm

    type Row = [string, string];
    const rows: Row[] = [];

    const assess = (label: string, actual: number, ref: number, rMin: number, rMax: number) => {
      const minVal = rMin * ref;
      const maxVal = rMax * ref;
      let result: string;
      if (actual > 0 && actual < minVal) {
        const pct = ((minVal - actual) / actual) * 100;
        result = this.t('increaseByPct', { pct: pct.toFixed(1) });
      } else if (actual > maxVal) {
        const pct = ((actual - maxVal) / actual) * 100;
        result = this.t('decreaseByPct', { pct: pct.toFixed(1) });
      } else if (actual === 0) {
        result = this.t('increaseByPct', { pct: '100.0' });
      } else {
        result = this.t('meetsCriterion');
      }
      rows.push([label, result]);
    };

    // Localized labels via i18n keys for consistency with UI
    assess(this.t('Beam height H'), H_cm, L_cm, 1 / 18, 1 / 14);
    assess(this.t('bottomFlangeWidthB1'), b1_cm, H_cm, 1 / 3, 1 / 2);
    assess(this.t('calculator.bodyWidthB3'), body_cm, L_cm, 1 / 50, 1 / 40);
    assess(this.t('endCarriageWheelCenterA'), A_cm, L_cm, 1 / 7, 1 / 5);
    assess(this.t('endInclinedSegmentC'), C_cm, L_cm, 0.10, 0.15);

    autoTable(this.pdf, {
      head: [[this.t('geometricBalance'), this.t('status')]],
      body: rows,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addSafetyChecks(results: CalculationResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('safetyChecks'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const checks = [
      [this.t('stressCheck'), results.K_sigma.toFixed(2), results.stress_check === 'pass' ? this.t('pass') : this.t('fail')],
      [this.t('deflectionCheck'), results.n_f.toFixed(2), results.deflection_check === 'pass' ? this.t('pass') : this.t('fail')],
      [this.t('localBucklingCheck'), results.K_buckling.toFixed(2), results.buckling_check === 'pass' ? this.t('pass') : this.t('fail')],
    ];

    autoTable(this.pdf, {
      head: [[this.t('check'), this.t('value'), this.t('status')]],
      body: checks,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.column.dataKey === 'Status') {
          if (data.cell.raw === this.t('pass')) {
            data.cell.styles.textColor = [0, 128, 0];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === this.t('fail')) {
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
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('overallAssessment'), MARGIN.left, this.currentY);
    this.currentY += 8;

    const overallStatus = results.stress_check === 'pass' && 
                         results.deflection_check === 'pass' && 
                         results.buckling_check === 'pass';
    
    const statusText = overallStatus ? this.t('beamPass') : this.t('beamFail');
    const statusColor: [number, number, number] = overallStatus ? [0, 128, 0] : [255, 0, 0];
    const description = overallStatus ? this.t('passDescription') : this.t('failDescription');

    this.pdf.setFillColor(overallStatus ? '#e8f5e9' : '#ffebee'); // Light green/red background
    this.pdf.rect(MARGIN.left, this.currentY - 2, this.pageWidth - MARGIN.left - MARGIN.right, 20, 'F');
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    this.pdf.text(statusText, this.pageWidth / 2, this.currentY + 5, { align: 'center' });

    this.pdf.setFontSize(10);
    this.pdf.setFont('NotoSans', 'normal');
    this.pdf.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    this.pdf.text(description, this.pageWidth / 2, this.currentY + 12, { align: 'center' });

    this.currentY += 25;
  }

  // --- AI RECOMMENDATIONS SECTION ---
  private addAIRecommendations(text: string) {
    const title = this.t('pdf.aiRecommendationsTitle');

    if (this.currentY + 30 > this.pageHeight - MARGIN.bottom) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    this.pdf.text(title, MARGIN.left, this.currentY);
    this.currentY += 6;

    this.pdf.setFont('NotoSans', 'normal');
    this.pdf.setFontSize(10);
    const maxWidth = this.pageWidth - MARGIN.left - MARGIN.right;

    // Remove leading markdown heading like "### ..." to avoid duplicating the section title
    let normalized = (text || '').replace(/\r\n/g, '\n');
    normalized = normalized.replace(/^(?:\s*#{1,6}[^\n]*\n+)+/, '');

    const lines = this.pdf.splitTextToSize(normalized, maxWidth);

    // Render lines with simple page-break handling
    for (const line of lines as string[]) {
      if (this.currentY > this.pageHeight - MARGIN.bottom) {
        this.pdf.addPage();
        this.currentY = MARGIN.top;
      }
      this.pdf.text(line, MARGIN.left, this.currentY);
      this.currentY += 5;
    }

    this.currentY += 5;
  }

  // --- REFERENCES SECTION ---
  private addReferences() {
    const title = this.t('pdf.referencesTitle');

    // Ensure space for header and at least one line
    if (this.currentY + 20 > this.pageHeight - MARGIN.bottom) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    this.pdf.text(title, MARGIN.left, this.currentY);
    this.currentY += 6;

    const refs = this.t('pdf.references', { returnObjects: true }) as string[];

    this.pdf.setFont('NotoSans', 'normal');
    this.pdf.setFontSize(10);
    const maxWidth = this.pageWidth - MARGIN.left - MARGIN.right - 4; // indent for bullet

    for (const ref of refs) {
      const lines = this.pdf.splitTextToSize(ref, maxWidth) as string[];
      for (let i = 0; i < lines.length; i++) {
        if (this.currentY > this.pageHeight - MARGIN.bottom) {
          this.pdf.addPage();
          this.currentY = MARGIN.top;
        }
        const text = (i === 0 ? '• ' : '  ') + lines[i];
        this.pdf.text(text, MARGIN.left, this.currentY);
        this.currentY += 5;
      }
    }

    this.currentY += 3;
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
    this.pdf.setFont('NotoSans', 'bold');
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
      projectName = this.t('pdf.defaultProjectName'), 
      engineer = 'N/A', 
      includeCharts = false,
      chartElements = [],
      language = 'en'
    } = options;
    const date = new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB');

    // Ensure on-screen diagrams (captured as images) use the same language as the PDF
    const prevLang = i18n.language;
    if (language && language !== prevLang) {
      try { await i18n.changeLanguage(language); } catch {}
    }

    try {
      // Ensure Noto Sans is loaded into VFS (supports Vietnamese diacritics)
      if (!fontCache.regular) {
        fontCache.regular = await loadFontBase64('/fonts/NotoSans-Regular.ttf');
      }
      if (!fontCache.bold) {
        fontCache.bold = await loadFontBase64('/fonts/NotoSans-Bold.ttf');
      }
      this.pdf.addFileToVFS('NotoSans-Regular.ttf', fontCache.regular);
      this.pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      this.pdf.addFileToVFS('NotoSans-Bold.ttf', fontCache.bold);
      this.pdf.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
      this.pdf.setFont('NotoSans', 'normal');

      this.addHeader(projectName);
      this.addProjectInfo(engineer, date);
      this.addInputs(inputs, results);
      this.addResults(results);
      if ((results as any).calculationMode !== 'i-beam') {
        // Check for space before adding the geometric balance table
        if (this.currentY > this.pageHeight - MARGIN.bottom - 60) { // Estimate height
          this.pdf.addPage();
          this.currentY = MARGIN.top;
        }
        this.addGeometricBalance(inputs);
      }
      this.addSafetyChecks(results);
      this.addOverallAssessment(results);
      if (options.aiRecommendation && options.aiRecommendation.trim().length > 0) {
        this.addAIRecommendations(options.aiRecommendation);
      }

      if (includeCharts && chartElements.length > 0) {
        if (this.currentY + 20 > this.pageHeight - MARGIN.bottom) {
          this.pdf.addPage();
          this.currentY = MARGIN.top;
        }
        
        this.pdf.setFontSize(14);
        this.pdf.setFont('NotoSans', 'bold');
        this.pdf.text(this.t('analysisDiagrams'), MARGIN.left, this.currentY);
        this.currentY += 8;

        for (const chart of chartElements) {
          // Force deflection diagram to a new page if it's not already on one
          if (chart.id === 'deflection-diagram') {
            // If we are still on page 1, move to page 2
            if (this.pdf.internal.pages.length === 1) {
              this.pdf.addPage();
              this.currentY = MARGIN.top;

              // Re-add title for the new page of diagrams
              this.pdf.setFontSize(14);
              this.pdf.setFont('NotoSans', 'bold');
              this.pdf.text(this.t('analysisDiagrams'), MARGIN.left, this.currentY);
              this.currentY += 8;
            }
          }
          await this.captureElement(chart.id, chart.title);
        }
      }

      // Append references at the end
      this.addReferences();

      this.addFooter();
      this.pdf.save('Crane-Beam-Analysis-Report.pdf');
    } finally {
      if (language && language !== prevLang) {
        try { await i18n.changeLanguage(prevLang); } catch {}
      }
    }
  }
}

export const generatePDFReport = async (
  inputs: BeamInputs,
  results: CalculationResults,
  options: PDFReportOptions = {}
): Promise<void> => {
  const pdfService = new PDFReportService(options.language);
  await pdfService.generate(inputs, results, options);
};

