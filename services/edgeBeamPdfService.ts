import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { TFunction } from 'i18next';
import i18n from '../src/i18n';
import type { EdgeBeamInputs, EdgeBeamResults, Language } from '../types';

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

interface EdgeBeamPDFOptions {
  projectName?: string;
  engineer?: string;
  includeCharts?: boolean;
  chartElements?: { id: string; title: string }[];
  language?: Language;
  aiRecommendation?: string;
}

// Styling constants
const PRIMARY_COLOR: [number, number, number] = [0, 55, 100]; // Dark Blue
const SECONDARY_COLOR: [number, number, number] = [245, 245, 245]; // Light Gray
const TEXT_COLOR: [number, number, number] = [0, 0, 0];
const HEADER_TEXT_COLOR: [number, number, number] = [255, 255, 255];

const MARGIN = { top: 25, right: 15, bottom: 25, left: 15 };

class EdgeBeamPDFService {
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
  }

  // Header & Footer
  private addHeader(projectName: string) {
    const title = this.t('Edge Beam Drive System Analysis Report');
    
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

  // Project Information
  private addProjectInfo(engineer: string, date: string) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    this.pdf.text(this.t('projectInformation'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const info = [
      [this.t('designEngineer'), engineer || this.t('pdf.notAvailable')],
      [this.t('calculationDate'), date],
      [this.t('software'), this.t('Edge Beam Analysis Software')],
      [this.t('Analysis Type'), this.t('Crane Edge Beam Drive System')],
      [this.t('Standards Applied'), this.t('TCVN Standards')],
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

  // Input Parameters
  private addInputs(inputs: EdgeBeamInputs) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('inputParameters'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const basicParams = [
      [this.t('Crane span S'), inputs.S, 'm'],
      [this.t('Trolley position x'), inputs.x, 'm'],
      [this.t('Rated load Q'), inputs.Q, 'kg'],
      [this.t('Trolley weight Gx'), inputs.Gx, 'kg'],
      [this.t('Main beam self-weight Gc'), inputs.Gc, 'kg'],
      [this.t('Number of wheels per end z'), inputs.z, '-'],
      [this.t('Number of driving wheels b'), inputs.b, '-'],
      [this.t('Wheel diameter D'), inputs.D, 'mm'],
      [this.t('Wheel rim width B'), inputs.B, 'mm'],
      [this.t('Travel speed v'), inputs.v, 'm/min'],
    ];

    const motorParams = [
      [this.t('Allowable contact stress'), inputs.sigma_H_allow, 'kg/cm²'],
      [this.t('Allowable shear stress'), inputs.tau_allow, 'MPa'],
      [this.t('Motor rated speed'), inputs.n_dc, 'rpm'],
      [this.t('Cyclo gearbox ratio'), inputs.i_cyclo, '-'],
      [this.t('Overall efficiency η'), inputs.eta, '-'],
      [this.t('Rail resistance coefficient m'), inputs.m, '-'],
      [this.t('Rolling coefficient f'), inputs.f, '-'],
      [this.t('Rail slope a'), inputs.a, '-'],
      [this.t('Dynamic factor K_dyn'), inputs.K_dyn, '-'],
    ];

    autoTable(this.pdf, {
      head: [[this.t('Basic Parameters'), this.t('value'), this.t('unit')]],
      body: basicParams,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 8;
    
    if (this.currentY > this.pageHeight - MARGIN.bottom - 50) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    autoTable(this.pdf, {
      head: [[this.t('Motor & Drive Parameters'), this.t('value'), this.t('unit')]],
      body: motorParams,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  // Calculation Results
  private addResults(results: EdgeBeamResults) {
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('calculationResults'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const wheelLoads = [
      [this.t('Concentrated load P'), results.P.toFixed(0), 'kg'],
      [this.t('Left reaction R_L'), results.R_L.toFixed(0), 'kg'],
      [this.t('Right reaction R_R'), results.R_R.toFixed(0), 'kg'],
      [this.t('Load per left wheel N_L'), results.N_L.toFixed(0), 'kg'],
      [this.t('Load per right wheel N_R'), results.N_R.toFixed(0), 'kg'],
      [this.t('Max wheel load N_max'), results.N_max.toFixed(0), 'kg'],
      [this.t('Dynamic wheel load N_t'), results.N_t.toFixed(0), 'kg'],
    ];

    const contactStress = [
      [this.t('Contact stress σ_H'), results.sigma_H.toFixed(1), 'kg/cm²'],
      [this.t('Contact stress safety factor n_H'), results.n_H.toFixed(2), '-'],
      [this.t('Contact stress check'), results.contact_stress_check === 'pass' ? this.t('pass') : this.t('fail'), ''],
    ];

    const powerResults = [
      [this.t('Total weight G_tot'), results.G_tot.toFixed(0), 'kg'],
      [this.t('Rolling resistance W_roll'), results.W1.toFixed(1), 'kgf'],
      [this.t('Joint resistance W_joint'), results.W2.toFixed(1), 'kgf'],
      [this.t('Slope resistance W_slope'), results.W3.toFixed(1), 'kgf'],
      [this.t('Total resistance W'), results.W.toFixed(1), 'kgf'],
      [this.t('Required force per driving wheel'), results.F_req.toFixed(1), 'kgf'],
      [this.t('Motor power N_dc'), results.N_dc.toFixed(2), 'kW'],
    ];

    const driveResults = [
      [this.t('Wheel speed n_wheel'), results.n_wheel.toFixed(2), 'rpm'],
      [this.t('Total gear ratio i_total'), results.i_total.toFixed(2), '-'],
      [this.t('Gearbox to wheel ratio i_gear'), results.i_gear.toFixed(2), '-'],
      [this.t('Motor torque M_dc'), results.M_dc.toFixed(1), 'N.m'],
      [this.t('Shaft torque M_shaft'), results.M_shaft.toFixed(1), 'N.m'],
      [this.t('Equivalent torque T_e'), results.T_eq.toFixed(1), 'N.m'],
      [this.t('Tangential force F_t'), results.F_t.toFixed(0), 'N'],
      [this.t('Calculated shaft diameter'), results.d_calculated.toFixed(1), 'mm'],
    ];

    autoTable(this.pdf, {
      head: [[this.t('Wheel Loads'), this.t('value'), this.t('unit')]],
      body: wheelLoads,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 5;

    if (this.currentY > this.pageHeight - MARGIN.bottom - 50) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    autoTable(this.pdf, {
      head: [[this.t('Contact Stress Analysis'), this.t('value'), this.t('unit')]],
      body: contactStress,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
      didParseCell: (data) => {
        if (data.column.dataKey === 'value') {
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

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 5;

    if (this.currentY > this.pageHeight - MARGIN.bottom - 50) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    autoTable(this.pdf, {
      head: [[this.t('Power & Resistance Analysis'), this.t('value'), this.t('unit')]],
      body: powerResults,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 5;

    if (this.currentY > this.pageHeight - MARGIN.bottom - 50) {
      this.pdf.addPage();
      this.currentY = MARGIN.top;
    }

    autoTable(this.pdf, {
      head: [[this.t('Drive System Design'), this.t('value'), this.t('unit')]],
      body: driveResults,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: SECONDARY_COLOR },
    });
    
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  // Safety Checks
  private addSafetyChecks(results: EdgeBeamResults) {
    // Add section header
    this.pdf.setFontSize(14);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    this.pdf.text(this.t('SAFETY ANALYSIS & VERIFICATION'), MARGIN.left, this.currentY);
    this.currentY += 10;
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    this.pdf.text(this.t('safetyChecks'), MARGIN.left, this.currentY);
    this.currentY += 6;

    const checks = [
      [this.t('Contact stress check'), results.contact_stress_check === 'pass' ? this.t('pass') : this.t('fail'), `n_H = ${results.n_H.toFixed(2)}`],
      [this.t('Shaft design check'), results.shaft_check === 'pass' ? this.t('pass') : this.t('fail'), `d = ${results.d_calculated.toFixed(1)} mm`],
      [this.t('Torque capacity check'), results.torque_check === 'pass' ? this.t('pass') : this.t('fail'), `M = ${results.M_shaft.toFixed(1)} N.m`],
    ];

    autoTable(this.pdf, {
      head: [[this.t('check'), this.t('status'), this.t('value')]],
      body: checks,
      startY: this.currentY,
      theme: 'grid',
      styles: { font: 'NotoSans' },
      headStyles: { fillColor: PRIMARY_COLOR, textColor: HEADER_TEXT_COLOR, font: 'NotoSans', fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.column.dataKey === 'status') {
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

  // Overall Assessment
  private addOverallAssessment(results: EdgeBeamResults) {
    // Add some space before overall assessment
    this.currentY += 5;
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('NotoSans', 'bold');
    this.pdf.text(this.t('overallAssessment'), MARGIN.left, this.currentY);
    this.currentY += 8;

    const overallStatus = results.contact_stress_check === 'pass' && 
                         results.shaft_check === 'pass' && 
                         results.torque_check === 'pass';
    
    const statusText = overallStatus ? this.t('Edge beam design is adequate') : this.t('Edge beam design requires modification');
    const statusColor: [number, number, number] = overallStatus ? [0, 128, 0] : [255, 0, 0];
    const description = overallStatus 
      ? this.t('All safety checks passed. The edge beam drive system is properly designed.') 
      : this.t('Some safety checks failed. Please review and modify the design.');

    this.pdf.setFillColor(overallStatus ? '#e8f5e9' : '#ffebee');
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

  // AI Recommendations
  private addAIRecommendations(text: string) {
    const title = this.t('AI Recommendations');

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

    let normalized = (text || '').replace(/\r\n/g, '\n');
    normalized = normalized.replace(/^(?:\s*#{1,6}[^\n]*\n+)+/, '');

    const lines = this.pdf.splitTextToSize(normalized, maxWidth);

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

  // Chart Capture
  private async captureElement(elementId: string, title: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id "${elementId}" not found.`);
      return;
    }

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

  // Public generation method
  public async generate(
    inputs: EdgeBeamInputs,
    results: EdgeBeamResults,
    options: EdgeBeamPDFOptions
  ) {
    const { 
      projectName = this.t('Edge Beam Drive System Project'), 
      engineer = 'N/A', 
      includeCharts = false,
      chartElements = [],
      language = 'en'
    } = options;
    const date = new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB');

    const prevLang = i18n.language;
    if (language && language !== prevLang) {
      try { await i18n.changeLanguage(language); } catch {}
    }

    try {
      // Load fonts
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

      // Page 1: Project Info & Inputs
      this.addHeader(projectName);
      this.addProjectInfo(engineer, date);
      this.addInputs(inputs);

      // Page 2+: Results
      if (this.currentY > this.pageHeight - MARGIN.bottom - 80) {
        this.pdf.addPage();
        this.currentY = MARGIN.top;
      }
      
      this.addResults(results);
      
      // Page 3: Safety Checks - Force to new page for better layout
      this.pdf.addPage();
      this.currentY = MARGIN.top;
      
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
        this.pdf.text(this.t('Analysis Charts'), MARGIN.left, this.currentY);
        this.currentY += 8;

        for (const chart of chartElements) {
          await this.captureElement(chart.id, chart.title);
        }
      }

      this.addFooter();
      this.pdf.save('Edge-Beam-Drive-Analysis-Report.pdf');
    } finally {
      if (language && language !== prevLang) {
        try { await i18n.changeLanguage(prevLang); } catch {}
      }
    }
  }
}

export const generateEdgeBeamPDFReport = async (
  inputs: EdgeBeamInputs,
  results: EdgeBeamResults,
  options: EdgeBeamPDFOptions = {}
): Promise<void> => {
  const pdfService = new EdgeBeamPDFService(options.language);
  await pdfService.generate(inputs, results, options);
};
