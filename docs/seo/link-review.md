# Internal and external linking review

**Scope:** static review of `App.tsx`, `src/geo/seo.ts`, `src/geo/guideContent.ts`, `src/geo/faqContent.ts`, `src/geo/technicalTables.ts`, `components/GeoGuidePage.tsx`, `components/GeoTechnicalTables.tsx`, `components/GeoFAQPage.tsx`, `components/GeoStructuredData.tsx`, `public/sitemap.xml`, and `public/robots.txt`.

**Evidence date:** 2026-10-06. This is a source-code review, not a live crawl. Direct page fetches for the site and the two official VSQI standard pages were attempted through the web reader but were inaccessible/time-limited. So internal destination status and rendered production links remain unverified. Search results did confirm the VSQI records and titles noted below.

## Findings

- The static sitemap lists eight routes: home, FAQ, and six guide pages. These correspond to `routeMetadata` in `src/geo/seo.ts`. `robots.txt` allows crawling and declares `/sitemap.xml`.
- Route changes are mostly implemented as `<button onClick>` handlers: the global nav, homepage FAQ and guide cards, homepage guide CTAs, and the guide-page formula CTA. These are usable for people with JavaScript, but they do not expose crawlable destination URLs as ordinary links in rendered HTML. The homepage has no static `<a href>` links to its content routes.
- Guide pages provide in-page table-of-contents anchors, and JSON-LD breadcrumbs are emitted from route metadata. There is no visible, clickable breadcrumb trail. Article prose and the FAQ answer renderer do not turn related route mentions into contextual links.
- The selected guide pages show “Nguồn tham khảo” items, but `GuideReference` contains only `label` and `note`; the rendered references are plain text, not links. Across the reviewed components and data, there are no external source hyperlinks.
- The article set has a natural topic cluster around “tính toán dầm cầu trục”: calculation guide, loads, formulas, section selection, deflection, and definition. That cluster is not yet connected with crawlable route links.
- The sitemap hard-codes `lastmod` as `2026-06-05` for every URL while guide metadata also carries that date. Keep these values generated or updated with content revisions so the sitemap does not become stale.

### Static route inventory

| URL path | Current role / observed title | Suggested search intent and target topic |
|---|---|---|
| `/` | Calculator homepage | Tool / transactional: **máy tính dầm cầu trục**, **tính toán dầm cầu trục online** |
| `/huong-dan/tinh-toan-dam-cau-truc` | Calculation guide | Pillar / informational: **cách tính toán dầm cầu trục**, TCVN 5575:2024 |
| `/huong-dan/dam-cau-truc-la-gi` | Definition and types | Supporting / informational: **dầm cầu trục là gì**, cấu tạo dầm cầu trục |
| `/huong-dan/tai-trong-dam-cau-truc` | Load guide | Supporting / informational: **tải trọng dầm cầu trục**, tải bánh xe cầu trục |
| `/huong-dan/cong-thuc-tinh-dam-cau-truc` | Formula guide | Supporting / informational: **công thức tính dầm cầu trục** |
| `/huong-dan/chon-tiet-dien-dam-cau-truc` | Section selection guide | Supporting / informational: **chọn tiết diện dầm cầu trục** |
| `/huong-dan/kiem-tra-do-vong-dam-cau-truc` | Deflection guide | Supporting / informational: **kiểm tra độ võng dầm cầu trục** |
| `/faq` | FAQ | Support / informational: questions on design inputs, standards, results, and tool use |

This keyword-to-page map is inferred from existing route titles/content. No search-volume, difficulty, Search Console, or SERP data was supplied, so it is not a measured demand or ranking-priority map.

## Recommended link plan

Start with ordinary semantic anchors (`<a href="/…">`) for navigation between routes. They can retain SPA behavior with a click handler that calls `navigateTo`, while still exposing real hrefs and preserving open-in-new-tab and keyboard behavior. Keep buttons for actions that do not navigate. Use absolute URLs only for external citations; keep internal hrefs root-relative and aligned with canonical route paths.

| Source → destination | Suggested anchor | Placement | Purpose |
|---|---|---|---|
| Home → calculation guide | “hướng dẫn tính toán dầm cầu trục” | Existing “Hướng dẫn” nav item and intro to the content card section | Give the primary supporting guide a direct, crawlable entry point. |
| Home → definition guide | “dầm cầu trục là gì và cấu tạo gồm những gì” | Existing calculator evidence CTA | Match the reader's background-knowledge question. |
| Home → load guide | “cách xác định tải trọng dầm cầu trục” | Existing calculator evidence CTA | Match the reader's input-preparation step. |
| Home → formula, section, and deflection guides | “công thức tính dầm cầu trục”; “cách chọn tiết diện dầm cầu trục”; “kiểm tra độ võng dầm cầu trục” | The existing guide cards/list | Make every sitemap article discoverable via a regular link. |
| Calculation pillar → load guide | “xác định tải trọng và phản lực bánh xe” | At the first discussion of load collection / before calculation steps | Link to the deepest relevant prerequisite. |
| Calculation pillar → formula guide | “các công thức tính dầm cầu trục” | Existing “Cần xem công thức chi tiết?” box | Keep the current CTA but expose it as a link. |
| Calculation pillar → section guide | “chọn tiết diện dầm cầu trục” | After preliminary sizing discussion | Connect process overview to the focused design topic. |
| Calculation pillar → deflection guide | “kiểm tra độ võng dầm cầu trục” | Where serviceability checks are introduced | Connect process overview to the focused check. |
| Calculation pillar → homepage calculator | “mở công cụ tính dầm cầu trục” | After required inputs / near the conclusion | Provide the relevant next action after the method. |
| Each supporting guide → calculation pillar | “quy trình tính toán dầm cầu trục” | Early in the guide after its scope statement, and optionally once near the end | Link spokes to the pillar with a natural, page-specific contextual anchor. |
| Load guide ↔ formula guide | “công thức tải trọng và nội lực” / “cách xác định tải bánh xe” | Load combinations and wheel-load formula sections | Useful cross-link between directly adjacent steps. |
| Section guide ↔ deflection guide | “kiểm tra độ võng theo nhịp dầm” / “chọn tiết diện theo tải và nhịp” | Section selection and serviceability passages | Connect design choice to its governing check. |
| Every guide → FAQ | “câu hỏi thường gặp về dầm cầu trục” | Conclusion / next-steps area | Offer a helpful follow-up for readers with unresolved basic questions. |
| FAQ → calculation guide and calculator | “hướng dẫn tính toán dầm cầu trục” / “mở công cụ tính dầm cầu trục” | Answers about workflow, inputs, and tool usage | Turn FAQ answers into useful next steps instead of isolated text. |

Suggested architecture: homepage (tool hub) links to the calculation pillar and all six spokes; each spoke links back to the pillar and one or two closely related spokes; the pillar points to each supporting guide and the calculator; FAQ routes users to relevant guides and back to the tool. Add a visible breadcrumb (`Trang chủ > Hướng dẫn > [bài viết]`) with anchors, consistent with the existing JSON-LD breadcrumb list. Avoid adding every possible link to every page; place links where the named topic is actually discussed.

## External source links to add

The official Vietnam Standards and Quality Institute catalogue is a strong source for the standards already named in the content. Search results returned the exact records and described TCVN 5575:2024 as active and TCVN 2737:2023 as the loads-and-actions standard. Direct fetch validation timed out, so treat these as verified search-result destinations, not as a completed HTTP status check.

| Destination | Suggested anchor | Placement |
|---|---|---|
| [VSQI record: TCVN 5575:2024](https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+5575%3A2024) | “tra cứu TCVN 5575:2024 tại VSQI” | First mention of the steel-design standard and the plain-text reference list. |
| [VSQI record: TCVN 2737:2023](https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+2737%3A2023) | “tra cứu TCVN 2737:2023 tại VSQI” | First mention of load combinations and the plain-text reference list. |

Link to the official catalogue records, not to an unofficial full-text copy. A manufacturer's crane catalogue should be linked only when a specific device or example is being discussed and the named manufacturer/document can be identified; current references merely say “Catalogue cầu trục”, which is too broad for a useful citation.

## Implementation and verification checklist

- [ ] Convert route-navigation buttons to semantic anchors with actual hrefs, preserving client-side navigation behavior where appropriate.
- [ ] Add contextual pillar/spoke links from the map above and a visible linked breadcrumb to guide pages.
- [ ] Extend reference data with URL fields and render descriptive external anchors for the two official standard records.
- [ ] Check every internal destination resolves to the intended route and canonical URL, including direct load/refresh of each SPA route.
- [ ] Verify external target responses in a browser or HTTP checker; this audit could not verify their live status.
- [ ] Confirm sitemap URLs exactly match canonical route metadata and refresh `lastmod` only when page content changes.

No competitor link-gap claim or numeric link-health score is included: competitor pages, production links, and a live crawl were unavailable, and a composite score would overstate the evidence. Expected benefits are better discoverability and reader navigation; ranking impact is not guaranteed.

## Follow-up implementation review — 2026-10-06

Reviewed the route-link implementation in `App.tsx`, `components/RouteLink.tsx`, `components/GuideArticleButtons.tsx`, and `components/GeoGuidePage.tsx`, then checked the generated `dist` pages.

- `RouteLink` renders an actual `<a href>` and intercepts only ordinary unmodified left-clicks when an SPA navigation callback is present. Modified clicks, downloads, targeted links, or prevented events retain browser behavior.
- The generated output contains eight route pages: home, FAQ, and six guide pages. All internal path hrefs in those rendered pages resolve to a URL listed in `dist/sitemap.xml`.
- The generated homepage contains anchors to each of the seven content routes. The header nav, calculator-area guide CTAs, FAQ card, and guide cards are links.
- All seven non-home pages render a visible breadcrumb nav. Guide breadcrumbs link back to home and to the calculation pillar; the current page is text with `aria-current="page"`.
- All six guide pages render a related-guides nav. The pillar links to the five other guides and FAQ; each supporting guide links to the pillar and the other guide pages.
- `npm run check:seo` passed: “SEO checks passed for 8 pages: static content, metadata, schemas, links and routing.” A separate rendered-HTML check also passed for sitemap-target resolution, homepage coverage, breadcrumbs, and related-link nav presence.
- External source links remain deferred. No external anchors were added to generated pages; their live status was not verified, so this pass makes no external-link availability claim.

The optional `node scripts/verify-dom.mjs` smoke test did not run: it failed before test execution because the configured absolute `jsdom` import was unavailable at `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/jsdom/lib/api.js`. The rendered HTML and `check:seo` checks above are independent of that failed optional test.

## Xác minh bổ sung bởi lead

Smoke test DOM ban đầu vướng đường dẫn jsdom. Sau khi cài jsdom tạm thời và sửa đường dẫn, đã kiểm tra thành công gửi form, điều hướng guide/FAQ, metadata và Ctrl-click. Script tạm không được đưa vào repository; xem README về giới hạn kiểm tra Chromium/PDF.
