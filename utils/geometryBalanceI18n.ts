export type Lang = 'en' | 'vi';

const dict: Record<Lang, Record<string, string>> = {
  en: {
    geometricBalance: 'Geometric balance',
    meets: 'Meets criterion',
    increaseBy: 'Increase by {pct}%',
    decreaseBy: 'Decrease by {pct}%',
  },
  vi: {
    geometricBalance: 'Cân đối hình học',
    meets: 'Đạt',
    increaseBy: 'Cần tăng {pct}%',
    decreaseBy: 'Cần giảm {pct}%',
  },
};

export const gbT = (lang: Lang, key: keyof typeof dict['en']) => dict[lang][key] || dict.en[key];

