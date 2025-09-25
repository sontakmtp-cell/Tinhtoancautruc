import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import viTranslation from './locales/vi/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // Luôn khởi tạo với tiếng Việt
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Supplement missing or newly added keys programmatically to avoid JSON encoding issues.
// Calculation results and diagrams labels
i18n.addResources('en', 'translation', {
  'safetyChecks': 'Safety checks',
  'Geometric balance': 'Geometric balance',
  'Calculation summary': 'Calculation summary',
  'Stress check': 'Stress check',
  'Deflection': 'Deflection',
  'Buckling': 'Buckling',
  'Area F': 'Area F',
  'Moment of inertia Jx': 'Moment of inertia Jx',
  'Moment of inertia Jy': 'Moment of inertia Jy',
  'Section modulus Wx': 'Section modulus Wx',
  'Section modulus Wy': 'Section modulus Wy',
  'Neutral axis Yc': 'Neutral axis Yc',
  'Bending moment Mx': 'Bending moment Mx',
  'Stress sigma_u': 'Stress sigma_u',
  'Deflection f': 'Deflection f',
  'Analysis diagrams': 'Analysis diagrams',
  'Internal Force Diagram (Bending Moment)': 'Internal Force Diagram (Bending Moment)',
  'Internal Force Diagram (Shear Force)': 'Internal Force Diagram (Shear Force)'
});

i18n.addResources('vi', 'translation', {
  'safetyChecks': 'Kiểm tra an toàn',
  'Geometric balance': 'Cân đối hình học',
  'Calculation summary': 'Tóm tắt tính toán',
  'Stress check': 'Kiểm tra ứng suất',
  'Deflection': 'Độ võng',
  'Buckling': 'Ổn định',
  'Area F': 'Diện tích F',
  'Moment of inertia Jx': 'Momen quán tính Jx',
  'Moment of inertia Jy': 'Momen quán tính Jy',
  'Section modulus Wx': 'Mô đun chống uốn Wx',
  'Section modulus Wy': 'Mô đun chống uốn Wy',
  'Neutral axis Yc': 'Trục trung hòa Yc',
  'Bending moment Mx': 'Momen uốn Mx',
  'Stress sigma_u': 'Ứng suất σ_u',
  'Deflection f': 'Độ võng f',
  'Analysis diagrams': 'Biểu đồ phân tích',
  'Internal Force Diagram (Bending Moment)': 'Biểu đồ nội lực (Momen uốn)',
  'Internal Force Diagram (Shear Force)': 'Biểu đồ nội lực (Lực cắt)'
});

// Ensure interpolation-ready strings for percentage suggestions
i18n.addResources('en', 'translation', {
  increaseByPct: 'Increase by {{pct}}%',
  decreaseByPct: 'Decrease by {{pct}}%',
  meetsCriterion: 'Meets criterion'
});

i18n.addResources('vi', 'translation', {
  increaseByPct: 'Cần tăng {{pct}}%',
  decreaseByPct: 'Cần giảm {{pct}}%',
  meetsCriterion: 'Đạt'
});

export default i18n;

// PDF-specific fallbacks
i18n.addResources('en', 'translation', {
  'pdf.notAvailable': 'N/A',
  'pdf.customMaterial': 'Custom'
});

i18n.addResources('vi', 'translation', {
  'pdf.notAvailable': 'Không có',
  'pdf.customMaterial': 'Tùy chọn'
});

// PDF standards
i18n.addResources('en', 'translation', {
  'pdf.tcvnStandards': 'TCVN 5575-2024, TCVN 4244:2005, Eurocode 3 (EN 1993-1-5)',
  'pdf.tcvnTestConditions': 'Load test according to TCVN 4244:2005, EN 13001'
});


// Diagram labels with proper encoding
i18n.addResources('en', 'translation', {
  'Stress Distribution Diagram': 'Stress Distribution Diagram',
  'Deflected Shape Diagram': 'Deflected Shape Diagram',
  'Neutral Axis': 'Neutral Axis',
  'stressDiagram.ariaLabel': 'Stress distribution over cross-section',
  'stressDiagram.compression': 'compression',
  'stressDiagram.tension': 'tension',
  'stressDiagram.unit': 'σ (kg/cm²)',
  'deflectionDiagram.ariaLabel': 'Beam deflection diagram',
  'deflectionDiagram.allowable': '[f] = {{value}}',
  'deflectionDiagram.actual': 'f = {{value}}',
  'diagram.noData': 'No diagram data',
  'deflectionDiagram.support': 'Support'
});

i18n.addResources('vi', 'translation', {
  'Stress Distribution Diagram': 'Biểu đồ phân bố ứng suất',
  'Deflected Shape Diagram': 'Biểu đồ độ võng',
  'Neutral Axis': 'Trục trung hòa',
  'stressDiagram.ariaLabel': 'Biểu đồ phân bố ứng suất trên mặt cắt',
  'stressDiagram.compression': 'nén',
  'stressDiagram.tension': 'kéo',
  'stressDiagram.unit': 'σ (kg/cm²)',
  'deflectionDiagram.ariaLabel': 'Biểu đồ độ võng của dầm',
  'deflectionDiagram.allowable': '[f] = {{value}}',
  'deflectionDiagram.actual': 'f = {{value}}',
  'diagram.noData': 'Không có dữ liệu biểu đồ',
  'deflectionDiagram.support': 'Gối đỡ'
});
