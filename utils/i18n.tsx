import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'vi';

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const LanguageProvider = ({ children, initial = 'en' as Language }: { children: ReactNode; initial?: Language }) => {
  const [lang, setLang] = useState<Language>(initial);
  return <I18nContext.Provider value={{ lang, setLang }}>{children}</I18nContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

// Simple dictionary keyed by English phrase for minimal intrusion
const dict: Record<Language, Record<string, string>> = {
  en: {},
  vi: {
    // Geometric balance
    'Geometric balance': 'Cân đối hình học',
    'Meets criterion': 'Đạt',
    'Increase by {pct}%': 'Cần tăng {pct}%',
    'Decrease by {pct}%': 'Cần giảm {pct}%',
    // Section titles
    'Section geometry': 'Hình học tiết diện',
    'Loading & material': 'Tải trọng & vật liệu',
    'Safety checks': 'Kiểm tra an toàn',
    'Calculation summary': 'Tóm tắt tính toán',

    // Beam type tab labels
    'Single girder': 'Dầm đơn',
    'Double girder': 'Dầm đôi',
    'Rolled I-beam': 'Dầm I cán',
    'V-type beam': 'Dầm dạng V',

    // Input labels
    'Bottom flange width b1': 'Chiều rộng cánh dưới b1',
    'Top flange width b3': 'Chiều rộng cánh trên b2',
    'Top flange width b': 'Bề rộng cánh trên b',
    'Section height h': 'Chiều cao dầm H',
    'Top flange thickness t1': 'Bề dày cánh trên t2',
    'Bottom flange thickness t2': 'Bề dày cánh dưới t1',
    'Web thickness t3': 'Bề dày thân t3',
    'Web spacing b2': 'Rộng thân b3',
    'Span length L': 'Khẩu độ dầm L',
    'End carriage wheel center distance A': 'Tâm bánh xe dầm biên A',
    'End inclined segment length C': 'Chiều dài đoạn nghiêng đầu dầm C',
    'Hoist load': 'Tải nâng',
    'Trolley weight': 'Trọng lượng xe con',
    'Uniform load q': 'Tải phân bố đều q',
    'Allowable stress': 'Ứng suất cho phép',
    'Yield stress': 'Giới hạn chảy',
    'Elastic modulus E': 'Mô đun đàn hồi E',
    'Poisson ratio (nu)': 'Hệ số Poisson (ν)',

    // Safety check labels
    'Stress check': 'Kiểm tra ứng suất',
    'Deflection': 'Độ võng',
    'Buckling': 'Ổn định',

    // Calculation summary labels
    'Area F': 'Diện tích F',
    'Moment of inertia Jx': 'Momen quán tính Jx',
    'Moment of inertia Jy': 'Momen quán tính Jy',
    'Section modulus Wx': 'Mô đun chống uốn Wx',
    'Section modulus Wy': 'Mô đun chống uốn Wy',
    'Neutral axis Yc': 'Trục trung hòa Yc',
    'Bending moment Mx': 'Momen uốn Mx',
    'Stress sigma_u': 'Ứng suất σ_u',
    'Deflection f': 'Độ võng f',

    // Diagrams & UI
    'Analysis diagrams': 'Biểu đồ phân tích',
    'Internal Force Diagram (Bending Moment)': 'Biểu đồ nội lực (Momen uốn)',
    'Internal Force Diagram (Shear Force)': 'Biểu đồ nội lực (Lực cắt)',
    'Stress Distribution Diagram': 'Biểu đồ phân bố ứng suất',
    'Neutral Axis': 'Trục trung hòa',
    'Material': 'Vật liệu',
  },
};

export const translate = (lang: Language, key: string) => {
  return dict[lang][key] ?? key;
};

// React hook variant for convenience
export const useT = () => {
  const { lang } = useLanguage();
  return (key: string) => translate(lang, key);
};
