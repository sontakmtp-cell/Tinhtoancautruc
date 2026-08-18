export const SITE_URL = 'https://cautruc.kythuatvang.com';
export const APP_NAME = 'Crane Beam Design Studio';
export const ORGANIZATION_NAME = 'Kỹ Thuật Vàng';

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLdObject = { [key: string]: JsonLdValue };

export type RoutePath =
  | '/'
  | '/faq'
  | '/huong-dan/dam-cau-truc-la-gi'
  | '/huong-dan/tai-trong-dam-cau-truc'
  | '/huong-dan/tinh-toan-dam-cau-truc'
  | '/huong-dan/cong-thuc-tinh-dam-cau-truc'
  | '/huong-dan/chon-tiet-dien-dam-cau-truc'
  | '/huong-dan/kiem-tra-do-vong-dam-cau-truc';

export type RouteMetadata = {
  path: RoutePath;
  title: string;
  description: string;
  canonicalUrl: string;
  changefreq: 'weekly' | 'monthly';
  priority: number;
  type: 'home' | 'faq' | 'article';
  breadcrumb: Array<{
    name: string;
    path: RoutePath | '/huong-dan';
  }>;
  sitemap: {
    loc: string;
    changefreq: 'weekly' | 'monthly';
    priority: number;
  };
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type TechArticleInput = {
  headline: string;
  description: string;
  path: RouteMetadata['path'];
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  keywords?: string[];
  sections?: string[];
};

export const organization = {
  name: ORGANIZATION_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512x512.png`,
  knowsAbout: [
    'tính toán dầm cầu trục',
    'TCVN 5575:2024',
    'TCVN 2737:2023',
    'kết cấu thép nhà xưởng',
    'thiết kế dầm cầu trục',
  ],
} as const;

export const routeMetadata: RouteMetadata[] = [
  {
    path: '/',
    title: 'Công cụ tính toán dầm cầu trục online theo TCVN 5575:2024',
    description:
      'Crane Beam Design Studio hỗ trợ tính toán, kiểm tra bền, ổn định, độ võng và xuất báo cáo PDF cho dầm cầu trục nhà xưởng.',
    canonicalUrl: `${SITE_URL}/`,
    changefreq: 'weekly',
    priority: 1,
    type: 'home',
    breadcrumb: [{ name: 'Trang chủ', path: '/' }],
    sitemap: {
      loc: `${SITE_URL}/`,
      changefreq: 'weekly',
      priority: 1,
    },
  },
  {
    path: '/faq',
    title: 'FAQ tính toán dầm cầu trục theo TCVN',
    description:
      'Câu hỏi thường gặp về dầm cầu trục, tiêu chuẩn TCVN, tải trọng, độ võng và cách dùng công cụ tính toán online.',
    canonicalUrl: `${SITE_URL}/faq`,
    changefreq: 'monthly',
    priority: 0.8,
    type: 'faq',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ],
    sitemap: {
      loc: `${SITE_URL}/faq`,
      changefreq: 'monthly',
      priority: 0.8,
    },
  },
  {
    path: '/huong-dan/dam-cau-truc-la-gi',
    title: 'Dầm cầu trục là gì? Cấu tạo và phân loại',
    description:
      'Giải thích dầm cầu trục, cấu tạo chính, các dạng tiết diện phổ biến và dữ liệu cần có trước khi tính toán theo TCVN.',
    canonicalUrl: `${SITE_URL}/huong-dan/dam-cau-truc-la-gi`,
    changefreq: 'monthly',
    priority: 0.9,
    type: 'article',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Hướng dẫn', path: '/huong-dan' },
      { name: 'Dầm cầu trục là gì', path: '/huong-dan/dam-cau-truc-la-gi' },
    ],
    sitemap: {
      loc: `${SITE_URL}/huong-dan/dam-cau-truc-la-gi`,
      changefreq: 'monthly',
      priority: 0.9,
    },
  },
  {
    path: '/huong-dan/tai-trong-dam-cau-truc',
    title: 'Cách tính tải trọng dầm cầu trục theo TCVN 2737:2023',
    description:
      'Hướng dẫn xác định tải đứng, tải ngang, tải động và dữ liệu bánh xe khi tính dầm cầu trục nhà xưởng.',
    canonicalUrl: `${SITE_URL}/huong-dan/tai-trong-dam-cau-truc`,
    changefreq: 'monthly',
    priority: 0.9,
    type: 'article',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Hướng dẫn', path: '/huong-dan' },
      { name: 'Tải trọng dầm cầu trục', path: '/huong-dan/tai-trong-dam-cau-truc' },
    ],
    sitemap: {
      loc: `${SITE_URL}/huong-dan/tai-trong-dam-cau-truc`,
      changefreq: 'monthly',
      priority: 0.9,
    },
  },
  {
    path: '/huong-dan/tinh-toan-dam-cau-truc',
    title: 'Cách tính toán dầm cầu trục theo TCVN 5575:2024',
    description:
      'Hướng dẫn từng bước xác định tải trọng, chọn sơ bộ tiết diện và kiểm tra dầm cầu trục nhà xưởng theo tiêu chuẩn Việt Nam.',
    canonicalUrl: `${SITE_URL}/huong-dan/tinh-toan-dam-cau-truc`,
    changefreq: 'monthly',
    priority: 0.9,
    type: 'article',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Hướng dẫn', path: '/huong-dan' },
      { name: 'Tính toán dầm cầu trục', path: '/huong-dan/tinh-toan-dam-cau-truc' },
    ],
    sitemap: {
      loc: `${SITE_URL}/huong-dan/tinh-toan-dam-cau-truc`,
      changefreq: 'monthly',
      priority: 0.9,
    },
  },
  {
    path: '/huong-dan/cong-thuc-tinh-dam-cau-truc',
    title: 'Công thức tính toán dầm cầu trục chi tiết',
    description:
      'Tổng hợp công thức tính tải trọng, nội lực, ứng suất, độ võng và thông số tiết diện khi kiểm tra dầm cầu trục.',
    canonicalUrl: `${SITE_URL}/huong-dan/cong-thuc-tinh-dam-cau-truc`,
    changefreq: 'monthly',
    priority: 0.9,
    type: 'article',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Hướng dẫn', path: '/huong-dan' },
      { name: 'Công thức tính dầm cầu trục', path: '/huong-dan/cong-thuc-tinh-dam-cau-truc' },
    ],
    sitemap: {
      loc: `${SITE_URL}/huong-dan/cong-thuc-tinh-dam-cau-truc`,
      changefreq: 'monthly',
      priority: 0.9,
    },
  },
  {
    path: '/huong-dan/chon-tiet-dien-dam-cau-truc',
    title: 'Cách chọn tiết diện dầm cầu trục cho nhà xưởng',
    description:
      'Hướng dẫn chọn tiết diện dầm cầu trục theo nhịp, sức nâng, loại thép và điều kiện làm việc của cầu trục.',
    canonicalUrl: `${SITE_URL}/huong-dan/chon-tiet-dien-dam-cau-truc`,
    changefreq: 'monthly',
    priority: 0.85,
    type: 'article',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Hướng dẫn', path: '/huong-dan' },
      { name: 'Chọn tiết diện dầm cầu trục', path: '/huong-dan/chon-tiet-dien-dam-cau-truc' },
    ],
    sitemap: {
      loc: `${SITE_URL}/huong-dan/chon-tiet-dien-dam-cau-truc`,
      changefreq: 'monthly',
      priority: 0.85,
    },
  },
  {
    path: '/huong-dan/kiem-tra-do-vong-dam-cau-truc',
    title: 'Kiểm tra độ võng dầm cầu trục theo TCVN',
    description:
      'Giải thích cách kiểm tra độ võng đứng, độ võng ngang và giới hạn sử dụng khi thiết kế dầm cầu trục.',
    canonicalUrl: `${SITE_URL}/huong-dan/kiem-tra-do-vong-dam-cau-truc`,
    changefreq: 'monthly',
    priority: 0.85,
    type: 'article',
    breadcrumb: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Hướng dẫn', path: '/huong-dan' },
      { name: 'Kiểm tra độ võng dầm cầu trục', path: '/huong-dan/kiem-tra-do-vong-dam-cau-truc' },
    ],
    sitemap: {
      loc: `${SITE_URL}/huong-dan/kiem-tra-do-vong-dam-cau-truc`,
      changefreq: 'monthly',
      priority: 0.85,
    },
  },
];

export const sitemapRoutes = routeMetadata.map(({ sitemap }) => sitemap);

export function getRouteMetadata(path: string): RouteMetadata | undefined {
  return routeMetadata.find((route) => route.path === path);
}

export function toAbsoluteUrl(path: string): string {
  if (path === '/') {
    return `${SITE_URL}/`;
  }

  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildOrganizationJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    url: organization.url,
    logo: organization.logo,
    knowsAbout: [...organization.knowsAbout],
  };
}

export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: APP_NAME,
    alternateName: 'Công cụ tính toán dầm cầu trục online',
    url: `${SITE_URL}/`,
    description:
      'Công cụ tính toán dầm cầu trục trực tuyến miễn phí cho kỹ sư kết cấu và sinh viên xây dựng tại Việt Nam.',
    inLanguage: 'vi-VN',
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: organization.logo,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildWebApplicationJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    url: SITE_URL,
    applicationCategory: 'EngineeringApplication',
    applicationSubCategory: 'Structural Engineering Calculator',
    operatingSystem: 'Web',
    inLanguage: 'vi-VN',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      url: SITE_URL,
    },
    featureList: [
      'Tính toán tải trọng dầm cầu trục',
      'Kiểm tra bền và ổn định dầm thép',
      'Kiểm tra độ võng dầm cầu trục',
      'Kiểm tra mỏi theo nhóm chế độ làm việc khi có dữ liệu đầu vào',
      'Xuất báo cáo tính toán dạng PDF',
      'Hỗ trợ thiết kế theo TCVN 5575:2024',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    keywords: 'dầm cầu trục, TCVN 5575:2024, TCVN 2737:2023, tính toán kết cấu thép, crane beam calculator',
  };
}

export function buildFAQPageJsonLd(faqItems: FaqItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildTechArticleJsonLd(article: TechArticleInput): JsonLdObject {
  const url = toAbsoluteUrl(article.path);

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.headline,
    description: article.description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    inLanguage: 'vi-VN',
    datePublished: article.datePublished ?? '2026-06-04',
    dateModified: article.dateModified ?? '2026-06-04',
    author: {
      '@type': 'Organization',
      name: article.authorName ?? ORGANIZATION_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: ORGANIZATION_NAME,
      logo: {
        '@type': 'ImageObject',
        url: organization.logo,
      },
    },
    keywords: article.keywords ?? [
      'dầm cầu trục',
      'tính toán dầm cầu trục',
      'TCVN 5575:2024',
      'kết cấu thép',
    ],
    about: article.sections ?? [
      'tính toán dầm cầu trục',
      'thiết kế kết cấu thép',
      'kiểm tra dầm thép nhà xưởng',
    ],
  };
}

export function buildBreadcrumbListJsonLd(items: RouteMetadata['breadcrumb']): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildRouteJsonLd(route: RouteMetadata, options?: {
  faqItems?: FaqItem[];
  article?: Partial<Omit<TechArticleInput, 'path'>> & { faqItems?: FaqItem[] };
}): JsonLdObject[] {
  const schemas = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildWebApplicationJsonLd(),
    buildBreadcrumbListJsonLd(route.breadcrumb),
  ];

  if (route.type === 'faq' && options?.faqItems?.length) {
    schemas.push(buildFAQPageJsonLd(options.faqItems));
  }

  if (route.type === 'article') {
    schemas.push(
      buildTechArticleJsonLd({
        headline: options?.article?.headline ?? route.title,
        description: options?.article?.description ?? route.description,
        path: route.path,
        datePublished: options?.article?.datePublished,
        dateModified: options?.article?.dateModified,
        authorName: options?.article?.authorName,
        keywords: options?.article?.keywords,
        sections: options?.article?.sections,
      }),
    );

    if (options?.article?.faqItems?.length) {
      schemas.push(buildFAQPageJsonLd(options.article.faqItems));
    }
  }

  return schemas;
}
