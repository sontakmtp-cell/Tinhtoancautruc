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
    // Section titles
    'Section geometry': 'Hình học tiết diện',
    'Loading & material': 'Tải trọng & vật liệu',
    'Safety checks': 'Kiểm tra an toàn',
    'Calculation summary': 'Tóm tắt tính toán',

    // Input labels
    'Top flange width b': 'Bề rộng cánh trên b',
    'Section height h': 'Chiều cao tiết diện h',
    'Top flange thickness t1': 'Bề dày cánh trên t1',
    'Bottom flange thickness t2': 'Bề dày cánh dưới t2',
    'Web thickness t3': 'Bề dày bản bụng t3',
    'Web spacing b1': 'Khoảng cách bản bụng b1',
    'Span length L': 'Chiều dài nhịp L',
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
    'Buckling': 'Ổn định cục bộ',

    // Calculation summary labels
    'Area F': 'Diện tích F',
    'Moment of inertia Jx': 'Mô men quán tính Jx',
    'Moment of inertia Jy': 'Mô men quán tính Jy',
    'Section modulus Wx': 'Mô đun chống uốn Wx',
    'Section modulus Wy': 'Mô đun chống uốn Wy',
    'Neutral axis Yc': 'Trục trung hòa Yc',
    'Bending moment Mx': 'Mô men uốn Mx',
    'Stress sigma_u': 'Ứng suất σ_u',
    'Deflection f': 'Độ võng f',
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

