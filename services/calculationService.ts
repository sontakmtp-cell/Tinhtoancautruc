import type { BeamInputs, CalculationResults, DiagramData, DoubleBeamInputs, VBeamInputs } from '../types';

const KG_TO_KN = 9.80665 / 1000; // Chuyá»ƒn Ä‘á»•i kilogram-lá»±c sang kilonewton
const KG_CM2_TO_MPA = 0.0980665; // Chuyá»ƒn Ä‘á»•i kg/cm^2 sang MPa

type CalcMode = 'single-girder' | 'i-beam';

export const calculateBeamProperties = (inputs: BeamInputs, mode: CalcMode = 'single-girder'): CalculationResults => {
  const {
    b: b_bottom_mm,      // Chiá»u rá»™ng cÃ¡nh dÆ°á»›i b1
    h: h_mm,               // Chiá»u cao dáº§m H
    t1: t_bottom_input_mm, // Chiá»u dÃ y cÃ¡nh dÆ°á»›i t1
    t2: t_top_input_mm,    // Chiá»u dÃ y cÃ¡nh trÃªn t2
    t3: t_web_input_mm,    // Chiá»u dÃ y sÆ°á»n dáº§m t3
    b1: b_body_input_mm,   // Khoáº£ng cÃ¡ch giá»¯a sÆ°á»n dáº§m b2
    b3: b_top_mm,
    L,
    P_nang,
    P_thietbi,
    sigma_allow,
    sigma_yield,
    E,
    nu,
    q,
  } = inputs;

  // Chuyá»ƒn Ä‘á»•i Ä‘áº§u vÃ o tá»« milimet sang centimet Ä‘á»ƒ tÃ­nh toÃ¡n
  const H = h_mm / 10; // chiá»u cao tiáº¿t diá»‡n, kÃ½ hiá»‡u lÃ  H
  // BÃ­ danh ná»™i bá»™ má»›i Ä‘á»ƒ khá»›p vá»›i cÃ¡c kÃ½ hiá»‡u/nhÃ£n Ä‘Æ°á»£c yÃªu cáº§u trong khi giá»¯ á»•n Ä‘á»‹nh hÃ¬nh dáº¡ng Ä‘áº§u vÃ o
  const t_top = t_top_input_mm / 10;         // chiá»u dÃ y cÃ¡nh trÃªn
  const t_bottom = t_bottom_input_mm / 10;   // chiá»u dÃ y cÃ¡nh dÆ°á»›i
  const t_web = t_web_input_mm / 10;         // chiá»u dÃ y sÆ°á»n dáº§m
  const b_body = b_body_input_mm / 10;       // chiá»u rá»™ng (lá»t lÃ²ng) giá»¯a cÃ¡c sÆ°á»n dáº§m cho dáº§m tá»• há»£p
  const b_top = (b_top_mm ?? b_bottom_mm) / 10; // chiá»u rá»™ng cÃ¡nh trÃªn (cm). fallback Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch ngÆ°á»£c
  const b_bottom = b_bottom_mm / 10;            // chiá»u rá»™ng cÃ¡nh dÆ°á»›i (cm)

  // --- 1. TÃ­nh toÃ¡n Ä‘áº·c trÆ°ng hÃ¬nh há»c ---
  let F: number;
  let Yc: number;
  const Xc = 0; // Äá»‘i xá»©ng qua trá»¥c tung trong cáº£ hai cháº¿ Ä‘á»™ (gá»‘c tá»a Ä‘á»™ á»Ÿ giá»¯a theo chiá»u ngang)

  let Ix_top: number;
  let Ix_bottom: number;
  let Ix_webs_or_web: number; // cho má»™t sÆ°á»n dáº§m trong dáº§m I, hoáº·c hai sÆ°á»n dáº§m trong dáº§m tá»• há»£p
  let Jx: number;

  let Iy_top: number;
  let Iy_bottom: number;
  let Iy_webs_or_web: number; // cho má»™t sÆ°á»n dáº§m trong dáº§m I, hoáº·c hai sÆ°á»n dáº§m trong dáº§m tá»• há»£p
  let Jy: number;

  let Wx: number;
  let Wy: number;

  if (mode === 'i-beam') {
    // Dáº§m I cÃ¡n nÃ³ng tiÃªu chuáº©n: tiáº¿t diá»‡n Ä‘á»‘i xá»©ng vá»›i cÃ¡c cÃ¡nh báº±ng nhau
    const b_flange = b_bottom; // chiá»u rá»™ng cÃ¡nh (nhÆ° nhau cho cáº£ trÃªn vÃ  dÆ°á»›i)
    const t_flange = t_bottom; // chiá»u dÃ y cÃ¡nh (nhÆ° nhau cho cáº£ hai cÃ¡nh, t1=t2)
    const t_web_thickness = t_web; // chiá»u dÃ y sÆ°á»n dáº§m (t3)
    
    // TÃ­nh diá»‡n tÃ­ch cÃ¡c thÃ nh pháº§n
    const A_top_flange = b_flange * t_flange;
    const A_bottom_flange = b_flange * t_flange;
    const h_web = Math.max(H - 2 * t_flange, 0); // chiá»u cao sÆ°á»n dáº§m = tá»•ng chiá»u cao - 2 * chiá»u dÃ y cÃ¡nh
    const A_web = t_web_thickness * h_web;

    // Tá»•ng diá»‡n tÃ­ch máº·t cáº¯t ngang
    F = A_top_flange + A_bottom_flange + A_web;

    // TÃ­nh khoáº£ng cÃ¡ch trá»ng tÃ¢m tá»« thá»› dÆ°á»›i cÃ¹ng
    const y_top_flange = H - t_flange / 2;
    const y_bottom_flange = t_flange / 2;
    const y_web = t_flange + h_web / 2;
    
    // Vá»‹ trÃ­ trá»ng tÃ¢m (nÃªn á»Ÿ H/2 Ä‘á»‘i vá»›i dáº§m I Ä‘á»‘i xá»©ng)
    Yc = (A_top_flange * y_top_flange + A_bottom_flange * y_bottom_flange + A_web * y_web) / (F || 1);

    // MÃ´ men quÃ¡n tÃ­nh Ä‘á»‘i vá»›i trá»¥c x (trá»¥c máº¡nh) sá»­ dá»¥ng Ä‘á»‹nh lÃ½ trá»¥c song song
    // I = I_local + A * dÂ²
    Ix_top = (b_flange * t_flange ** 3) / 12 + A_top_flange * (y_top_flange - Yc) ** 2;
    Ix_bottom = (b_flange * t_flange ** 3) / 12 + A_bottom_flange * (y_bottom_flange - Yc) ** 2;
    Ix_webs_or_web = (t_web_thickness * h_web ** 3) / 12 + A_web * (y_web - Yc) ** 2;
    Jx = Ix_top + Ix_bottom + Ix_webs_or_web;

    // MÃ´ men quÃ¡n tÃ­nh Ä‘á»‘i vá»›i trá»¥c y (trá»¥c yáº¿u)
    Iy_top = (t_flange * b_flange ** 3) / 12;
    Iy_bottom = (t_flange * b_flange ** 3) / 12;
    Iy_webs_or_web = (h_web * t_web_thickness ** 3) / 12;
    Jy = Iy_top + Iy_bottom + Iy_webs_or_web;

    // MÃ´ Ä‘un máº·t cáº¯t
    const c_max_x = Math.max(Yc, H - Yc);
    Wx = Jx / c_max_x;
    Wy = Jy / (b_flange / 2);
  } else {
    // Dáº§m Ä‘Æ¡n tá»• há»£p vá»›i hai sÆ°á»n dáº§m cÃ¡ch nhau b_body
    const A_top = b_top * t_top;
    const A_bottom = b_bottom * t_bottom;
    const h_web = Math.max(H - t_top - t_bottom, 0);
    const A_one_web = h_web * t_web;

    F = A_top + A_bottom + 2 * A_one_web;

    const y_top = H - t_top / 2;
    const y_bottom = t_bottom / 2;
    const y_webs = t_bottom + h_web / 2;
    Yc = (A_top * y_top + A_bottom * y_bottom + 2 * A_one_web * y_webs) / (F || 1);

    Ix_top = (b_top * t_top ** 3) / 12 + A_top * (y_top - Yc) ** 2;
    Ix_bottom = (b_bottom * t_bottom ** 3) / 12 + A_bottom * (y_bottom - Yc) ** 2;
    Ix_webs_or_web = 2 * ((t_web * h_web ** 3) / 12 + A_one_web * (y_webs - Yc) ** 2);
    Jx = Ix_top + Ix_bottom + Ix_webs_or_web;

    Iy_top = (t_top * b_top ** 3) / 12;
    Iy_bottom = (t_bottom * b_bottom ** 3) / 12;
    const web_dist_from_center = b_body / 2 + t_web / 2;
    Iy_webs_or_web = 2 * ((h_web * t_web ** 3) / 12 + A_one_web * web_dist_from_center ** 2);
    Jy = Iy_top + Iy_bottom + Iy_webs_or_web;

    Wx = Jx / Math.max(Yc, H - Yc);
    Wy = Jy / (Math.max(b_top, b_bottom) / 2);
  }

  // --- 2. TÃ­nh toÃ¡n táº£i trá»ng vÃ  á»©ng suáº¥t ---
  const P = P_nang + P_thietbi;
  // Táº£i trá»ng báº£n thÃ¢n dáº§m (kg/cm)
  const q_auto = F * 7850 / 1_000_000;
  
  // MÃ´ men cho dáº§m Ä‘Æ¡n giáº£n
  const M_bt = (q_auto * L ** 2) / 8; // MÃ´ men tá»« táº£i trá»ng phÃ¢n bá»‘ (tá»± Ä‘á»™ng)
  const M_vn = (P * L) / 4;      // MÃ´ men tá»« táº£i trá»ng táº­p trung á»Ÿ giá»¯a

  // Tá»•ng mÃ´ men vá»›i cÃ¡c há»‡ sá»‘ an toÃ n/Ä‘á»™ng
  const M_x = 1.05 * (M_bt + 1.25 * M_vn);
  const M_y = 0.05 * (M_bt + M_vn);

  const sigma_u = (M_x / Wx) + (M_y / Wy);

  // á»¨ng suáº¥t riÃªng táº¡i cÃ¡c thá»› trÃªn vÃ  dÆ°á»›i do M_x
  const sigma_top_compression = (M_x * (H - Yc)) / Jx;
  const sigma_bottom_tension = (M_x * Yc) / Jx;

  // Äá»™ vÃµng (káº¿t há»£p táº£i trá»ng phÃ¢n bá»‘ vÃ  táº£i trá»ng Ä‘iá»ƒm trung tÃ¢m)
  const f = (5 * q_auto * L ** 4) / (384 * E * Jx) + (P * L ** 3) / (48 * E * Jx);
  const f_allow = mode === 'i-beam' ? L / 800 : L / 1000;

  // --- 3. Kiá»ƒm tra an toÃ n ---
  const K_sigma = sigma_allow / sigma_u;
  const n_f = f_allow / f;

  // --- 4. Kiá»ƒm tra nÃ¢ng cao (Oáº±n cá»¥c bá»™ & Äá»™ máº£nh cá»§a sÆ°á»n dáº§m) ---

  // Chuyá»ƒn Ä‘á»•i á»©ng suáº¥t cháº£y sang MPa cho cÃ¡c cÃ´ng thá»©c Eurocode
  const sigma_yield_mpa = sigma_yield * KG_CM2_TO_MPA;
  // Há»‡ sá»‘ Epsilon dá»±a trÃªn cÆ°á»ng Ä‘á»™ cháº£y, theo EN 1993-1-1, 5.2.2(6)
  const epsilon = sigma_yield_mpa > 0 ? Math.sqrt(235 / sigma_yield_mpa) : 0;

  // 4a. Oáº±n cá»¥c bá»™ cá»§a cÃ¡nh dáº§m chá»‹u nÃ©n (theo EN 1993-1-1, Báº£ng 5.2)
  // Viá»‡c kiá»ƒm tra nÃ y xÃ¡c Ä‘á»‹nh loáº¡i tiáº¿t diá»‡n. ChÃºng tÃ´i Ä‘ang kiá»ƒm tra theo giá»›i háº¡n Loáº¡i 3
  // Ä‘á»ƒ trÃ¡nh tÃ­nh toÃ¡n chiá»u rá»™ng hiá»‡u quáº£ cho cÃ¡c tiáº¿t diá»‡n Loáº¡i 4.
  let representative_b: number; // TÆ°Æ¡ng á»©ng vá»›i 'c' trong báº£ng Eurocode
  let representative_t: number; // TÆ°Æ¡ng á»©ng vá»›i 't' trong báº£ng Eurocode
  let lambda_limit: number;
  
  if (mode === 'i-beam') {
    // Dáº§m I: Kiá»ƒm tra cÃ¡nh ngoÃ i (pháº§n cÃ¡nh tá»« máº·t sÆ°á»n dáº§m ra mÃ©p)
    // Giáº£ sá»­ lÃ  dáº§m I cÃ¡n nÃ³ng tiÃªu chuáº©n khÃ´ng cÃ³ dá»¯ liá»‡u bÃ¡n kÃ­nh lÆ°á»£n
    representative_b = (b_bottom - t_web) / 2; // c = pháº§n cÃ¡nh nhÃ´ ra
    representative_t = t_top;                  // t_f = chiá»u dÃ y cÃ¡nh
    // Giá»›i háº¡n cho cÃ¡nh ngoÃ i chá»‹u nÃ©n Loáº¡i 3 (Báº£ng 5.2, sheet 2)
    lambda_limit = 14 * epsilon;
  } else {
    // Dáº§m Ä‘Æ¡n tá»• há»£p: Kiá»ƒm tra bá»™ pháº­n nÃ©n bÃªn trong (báº£n cÃ¡nh dÆ°á»›i giá»¯a hai sÆ°á»n dáº§m)
    // VÃ¬ xe con Ä‘Æ°á»£c gáº¯n vÃ o cÃ¡nh dÆ°á»›i, cáº§n kiá»ƒm tra á»•n Ä‘á»‹nh cá»§a cÃ¡nh dÆ°á»›i
    representative_b = b_body; // c = chiá»u rá»™ng lá»t lÃ²ng giá»¯a cÃ¡c sÆ°á»n dáº§m
    representative_t = t_bottom;  // t_f = chiá»u dÃ y cÃ¡nh dÆ°á»›i (t1)
    // Giá»›i háº¡n cho bá»™ pháº­n nÃ©n bÃªn trong chá»‹u uá»‘n Loáº¡i 3 (Báº£ng 5.2, sheet 1)
    lambda_limit = 42 * epsilon;
  }
  
  // Tá»· sá»‘ chiá»u rá»™ng/chiá»u dÃ y thá»±c táº¿
  const lambda_actual = representative_b > 0 && representative_t > 0 ? representative_b / representative_t : 0;
  // Há»‡ sá»‘ an toÃ n oáº±n
  const K_buckling = lambda_actual > 0 ? lambda_limit / lambda_actual : Infinity;

  // --- 5. Äá» xuáº¥t sÆ°á»n tÄƒng cÆ°á»ng theo EN 1993-1-5 ---
  // TÃ­nh chiá»u cao thá»±c cá»§a sÆ°á»n dáº§m (h_w)
  const h_w_mm = Math.max(h_mm - t_top_input_mm - t_bottom_input_mm, 0);

  // Khá»Ÿi táº¡o cÃ¡c biáº¿n cáº§n thiáº¿t
  let needsStiffeners = false;
  // When stiffeners are not required, keep spacing at 0 to avoid misleading UI
  let optimalSpacing_mm = 0;
  let stiffenerWidth_mm = 0;
  let stiffenerThickness_mm = 0;
  let stiffenerInertia_mm4 = 0;
  let stiffenerCount = 0;
  let stiffenersTotalWeight_kg = 0;
  const stiffenerPositions_cm: number[] = [];
  const span_mm = L * 10;  // Chuyá»ƒn Ä‘á»•i chiá»u dÃ i tá»« cm sang mm
  
  // Validation input theo yÃªu cáº§u 4
  if (h_w_mm <= 0 || t_web_input_mm <= 0) {
    console.warn("Chiá»u cao hoáº·c Ä‘á»™ dÃ y sÆ°á»n khÃ´ng há»£p lá»‡, bá» qua gÃ¢n tÄƒng cÆ°á»ng.");
  } else {
    // TÃ­nh tá»‰ sá»‘ máº£nh cá»§a sÆ°á»n dáº§m
    const slendernessRatio = h_w_mm / t_web_input_mm;
    
    // TÃ­nh giá»›i háº¡n máº¥t á»•n Ä‘á»‹nh cáº¯t theo EN 1993-1-5, 5.3
    const eta = 1.2; // Há»‡ sá»‘ hiá»‡u quáº£ cáº¯t theo EN 1993-1-5, 5.1(2)
    const slendernessLimit = 72 * epsilon / eta; // CÃ´ng thá»©c má»›i theo yÃªu cáº§u 1
    
    // Kiá»ƒm tra nhu cáº§u gÃ¢n tÄƒng cÆ°á»ng
    needsStiffeners = Number.isFinite(slendernessRatio) && slendernessRatio > slendernessLimit;

    if (needsStiffeners) {
      const gammaM1 = 1.1;
      const supportShear_kg = P / 2 + (q_auto * L) / 2;
      const supportShear_kN = supportShear_kg * KG_TO_KN;
      const supportShear_N = supportShear_kN * 1000;

      // TÃ­nh khoáº£ng cÃ¡ch tá»‘i Æ°u giá»¯a cÃ¡c gÃ¢n (theo yÃªu cáº§u 5)
      if (sigma_yield_mpa > 0 && supportShear_N > 0) {
        // Æ¯á»›c lÆ°á»£ng Ä‘Æ¡n giáº£n hÃ³a tá»« EN 1993-1-5, khÃ´ng sá»­ dá»¥ng trá»±c tiáº¿p Ï‡_w
        const plasticShearCapacity_N = (h_w_mm * t_web_input_mm * sigma_yield_mpa) / (Math.sqrt(3) * gammaM1);
        const utilisation = plasticShearCapacity_N / supportShear_N;
        optimalSpacing_mm = utilisation * h_w_mm;
      }

      if (!Number.isFinite(optimalSpacing_mm) || optimalSpacing_mm <= 0) {
        optimalSpacing_mm = h_w_mm;
      }

      if (h_w_mm > 0) {
        const a_min = 0.5 * h_w_mm;
        // Cáº­p nháº­t giá»›i háº¡n khoáº£ng cÃ¡ch gÃ¢n theo EN 1993-1-5, 9.2 (yÃªu cáº§u 2)
        const a_limit_aspect = 3 * h_w_mm; // Giá»›i háº¡n tá»‰ sá»‘ a/h_w â‰¤ 3
        optimalSpacing_mm = Math.max(a_min, Math.min(optimalSpacing_mm, a_limit_aspect));
      }
      optimalSpacing_mm = Math.max(10, Math.round(optimalSpacing_mm / 10) * 10);

      // TÃ­nh toÃ¡n kÃ­ch thÆ°á»›c gÃ¢n tÄƒng cÆ°á»ng
      if (h_w_mm > 0 && t_web_input_mm > 0) {
        stiffenerWidth_mm = Math.round(Math.max(0.1 * h_w_mm, 80) / 10) * 10;
        const rawThickness = Math.max(0.6 * Math.sqrt(Math.max(sigma_yield_mpa, 1) / 235) * t_web_input_mm, 8);
        stiffenerThickness_mm = Math.max(8, Math.round(rawThickness));
        stiffenerInertia_mm4 = stiffenerWidth_mm * Math.pow(stiffenerThickness_mm, 3) / 12;

        // Kiá»ƒm tra mÃ´men quÃ¡n tÃ­nh tá»‘i thiá»ƒu theo EN 1993-1-5, 9.3 (yÃªu cáº§u 3)
        const requiredInertia_mm4 = (Math.pow(h_w_mm, 3) * t_web_input_mm) / (10.5 * optimalSpacing_mm);
        if (stiffenerInertia_mm4 < requiredInertia_mm4) {
          console.warn("MÃ´men quÃ¡n tÃ­nh cá»§a gÃ¢n khÃ´ng Ä‘á»§ theo EN 1993-1-5, 9.3");
        }
      }

      if (needsStiffeners && optimalSpacing_mm > 0 && span_mm > 0) {
        // TÃ­nh sá»‘ lÆ°á»£ng gÃ¢n trÆ°á»›c khi kiá»ƒm tra Ä‘iá»u kiá»‡n dá»«ng
        stiffenerCount = Math.ceil(span_mm / optimalSpacing_mm);
        
        if (optimalSpacing_mm >= span_mm) {
          // Náº¿u khoáº£ng cÃ¡ch gÃ¢n lá»›n hÆ¡n chiá»u dÃ i dáº§m, khÃ´ng cáº§n gÃ¢n
          needsStiffeners = false;
          stiffenerCount = 0;
          stiffenersTotalWeight_kg = 0;
          optimalSpacing_mm = span_mm;
        } else {
          // TÃ­nh vá»‹ trÃ­ cÃ¡c gÃ¢n (Ä‘Æ¡n vá»‹ cm)
          const spacing_cm = optimalSpacing_mm / 10;
          let currentPosition = spacing_cm;
          let guard = 0;
          while (currentPosition < L && guard < 500) { // L lÃ  chiá»u dÃ i dáº§m (cm)
            stiffenerPositions_cm.push(Number(currentPosition.toFixed(2)));
            currentPosition += spacing_cm;
            guard += 1;
          }
          // TÃ­nh tá»•ng trá»ng lÆ°á»£ng sÆ°á»n tÄƒng cÆ°á»ng
          const singleStiffenerVolume_mm3 = h_w_mm * stiffenerWidth_mm * stiffenerThickness_mm;
          const singleStiffenerWeight_kg = (singleStiffenerVolume_mm3 * 7850) / 1e9;
          stiffenersTotalWeight_kg = stiffenerCount * singleStiffenerWeight_kg;
        }
      }
    }
  }

  const beamSelfWeight_kg = q_auto * L;

  return {
    F, Yc, Xc, Jx, Jy, Wx, Wy,
    Jx_top: Ix_top, Jx_bottom: Ix_bottom, Jx_webs: Ix_webs_or_web,
    Jy_top: Iy_top, Jy_bottom: Iy_bottom, Jy_webs: Iy_webs_or_web,
    P, M_bt, M_vn, M_x, M_y,
    beamSelfWeight: beamSelfWeight_kg,
    q: q_auto,
    sigma_u, sigma_top_compression, sigma_bottom_tension, f, f_allow,
    K_sigma, n_f, K_buckling,
    stress_check: K_sigma >= 1 ? 'pass' : 'fail',
    deflection_check: n_f >= 1 ? 'pass' : 'fail',
    buckling_check: K_buckling >= 1 ? 'pass' : 'fail',
    calculationMode: mode,
    stiffener: {
      required: needsStiffeners,
      effectiveWebHeight: h_w_mm,
      epsilon,
      optimalSpacing: optimalSpacing_mm,
      count: needsStiffeners ? stiffenerCount : 0,
      width: stiffenerWidth_mm,
      thickness: stiffenerThickness_mm,
      requiredInertia: stiffenerInertia_mm4,
      positions: needsStiffeners ? stiffenerPositions_cm : [],
      totalWeight: stiffenersTotalWeight_kg,
    },
  };
};

export const generateDiagramData = (inputs: BeamInputs, results: CalculationResults): DiagramData => {
  const { L } = inputs;
  const { P, M_x, q } = results;
  const points = 101; // Sá»‘ Ä‘iá»ƒm Ä‘á»ƒ tÃ­nh toÃ¡n dá»c theo dáº§m
  const data: DiagramData = [];

  const R = P / 2 + (q * L) / 2; // Lá»±c pháº£n lá»±c táº¡i gá»‘i tá»±a
  
  const M_max_simple = (P * L) / 4 + (q * L**2) / 8;
  const scaleFactor = M_max_simple > 0 ? M_x / M_max_simple : 1;


  for (let i = 0; i < points; i++) {
    const x = (L / (points - 1)) * i;
    let shear: number;
    let moment: number;

    // Lá»±c cáº¯t
    if (x < L / 2) {
      shear = R - q * x;
    } else {
      shear = R - q * x - P;
    }

    // MÃ´ men uá»‘n
    if (x <= L / 2) {
      moment = (R * x - (q * x ** 2) / 2);
    } else {
      moment = (R * x - (q * x ** 2) / 2 - P * (x - L / 2));
    }
    
    data.push({ x, shear, moment: moment * scaleFactor });
  }

  if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const simpleMomentEnd = (R * lastPoint.x - (q * lastPoint.x ** 2) / 2 - P * (lastPoint.x - L / 2));
      data[data.length - 1].moment = Math.abs(simpleMomentEnd) < 1e-9 ? 0 : simpleMomentEnd * scaleFactor;
  }

  return data;
};

// --- Double-girder helpers ---
export const calculateDoubleBeamProperties = (inputs: DoubleBeamInputs): CalculationResults => {
  // 1) Normalize transversal load (kg/m -> kg/cm)
  const transversalLoad_cm = (inputs.transversalLoad || 0) / 100;

  // 2) Create per-beam inputs by splitting point loads equally
  const perBeam: BeamInputs = {
    ...inputs,
    P_nang: (inputs.P_nang || 0) / 2,
    P_thietbi: (inputs.P_thietbi || 0) / 2,
    // q in inputs is already kg/cm; add half of transversal load (kg/cm)
    q: (inputs.q || 0) + transversalLoad_cm / 2,
  };

  // 3) Run single-girder calculation for one beam
  const perBeamResults = calculateBeamProperties(perBeam, 'single-girder');

  // 4) Combine to double-girder overall properties
  const Td_cm = (inputs.Td || 0) / 10; // mm -> cm

  const F_total = 2 * perBeamResults.F;
  const Jx_total = 2 * perBeamResults.Jx;
  const Wx_total = 2 * perBeamResults.Wx;

  // Parallel axis theorem about y-axis (lateral) for two beams spaced Td
  const Jy_total = 2 * (perBeamResults.Jy + perBeamResults.F * Math.pow(Td_cm / 2, 2));
  const Wy_total = Jy_total / (Math.max(perBeamResults.Yc, 1e-9)); // approximate based on centroidal distance

  const Mx_total = 2 * perBeamResults.M_x;
  const My_total = 2 * perBeamResults.M_y;
  const P_total = (inputs.P_nang || 0) + (inputs.P_thietbi || 0);

  // Keep performance checks per-beam (each girder works in parallel)
  // Stiffener: take per-beam recommendation; double total weight. Keep count per girder.
  const stiffener = {
    ...perBeamResults.stiffener,
    totalWeight: perBeamResults.stiffener.totalWeight * 2,
  };

  // --- Override local buckling check for double-girder ---
  // In double-girder, the rail/load sits on the top flange (t2),
  // so evaluate the internal compression flange (between two webs)
  // using EN 1993-1-1 Class 3 limit: c/t <= 42*epsilon
  const sigma_yield_mpa_d = (inputs.sigma_yield || 0) * KG_CM2_TO_MPA;
  const epsilon_d = sigma_yield_mpa_d > 0 ? Math.sqrt(235 / sigma_yield_mpa_d) : 0;
  const c_mm = Math.max(inputs.b1 || 0, 0);   // web spacing (between webs)
  const t_top_mm = Math.max(inputs.t2 || 0, 0); // top flange thickness (compression flange)
  const lambda_limit_d = 42 * (epsilon_d || 0);
  const lambda_actual_d = (c_mm > 0 && t_top_mm > 0) ? (c_mm / t_top_mm) : 0; // unitless
  const K_buckling_d = lambda_actual_d > 0 ? (lambda_limit_d / lambda_actual_d) : Infinity;
  const buckling_check_d: 'pass' | 'fail' = K_buckling_d >= 1 ? 'pass' : 'fail';

    // --- Torsion due to rail misalignment (Tr vs Td) ---
  try {
    const Tr_mm = inputs.Tr || 0;
    const Td_mm = inputs.Td || 0;
    const e_cm = (Tr_mm - Td_mm) / 20; // (Tr - Td)/2 with mm->cm conversion

    // Per-beam reaction (kg)
    const R_side = (perBeamResults.P || 0) / 2 + (perBeamResults.q || 0) * (inputs.L || 0) / 2;

    // Torsional moment per side (kg.cm)
    const T_torsion = R_side * e_cm;

    // Thin-walled closed section (Bredt-Batho approximation)
    const b_mm = inputs.b || 0;
    const b3_mm = inputs.b3 || b_mm || 0;
    const h_mm = inputs.h || 0;
    const t1_mm = inputs.t1 || 0;
    const t2_mm = inputs.t2 || 0;
    const t3_mm = inputs.t3 || 0;
    const b1_mm = inputs.b1 || 0;

    const A_m_mm2 = Math.max((b1_mm + t3_mm) * Math.max(h_mm - t1_mm - t2_mm, 0), 0);
    const sum_l_over_t =
      (b3_mm > 0 && t2_mm > 0 ? (b3_mm / t2_mm) : 0) +
      (b_mm > 0 && t1_mm > 0 ? (b_mm / t1_mm) : 0) +
      (t3_mm > 0 && (h_mm - t1_mm - t2_mm) > 0 ? 2 * ((h_mm - t1_mm - t2_mm) / t3_mm) : 0);

    const Jt_mm4 = sum_l_over_t > 0 ? 4 * Math.pow(A_m_mm2, 2) / sum_l_over_t : 0;
    const Jt_cm4 = Jt_mm4 / 1e4; // mm^4 -> cm^4
    const A_m_cm2 = A_m_mm2 / 100; // mm^2 -> cm^2

    // Shear flow and shear stresses due to torsion (kg/cm^2)
    const q_t = A_m_cm2 > 0 ? (T_torsion / (2 * A_m_cm2)) : 0; // kg/cm
    const t1_cm = t1_mm / 10;
    const t2_cm = t2_mm / 10;
    const t3_cm = t3_mm / 10;
    const tau_t_bottom = t1_cm > 0 ? (q_t / t1_cm) : 0;
    const tau_t_top = t2_cm > 0 ? (q_t / t2_cm) : 0;
    const tau_t_web = t3_cm > 0 ? (q_t / t3_cm) : 0;

    // Angle of twist (simple, no length factor): theta = T/(G*Jt)
    const E = inputs.E || perBeamResults ? (perBeamResults as any).E || 0 : 0; // E is not in results; use inputs
    const nu = inputs.nu ?? 0.3;
    const G = (inputs.E || 0) / (2 * (1 + nu));
    const theta = (G > 0 && Jt_cm4 > 0) ? (T_torsion / (G * Jt_cm4)) : 0; // rad

    const railDifferential_mm = theta * (Tr_mm / 20) * 10; // theta * (Tr_cm/2) -> cm, then to mm

    // Torsion check
    const sigma_allow = inputs.sigma_allow || 0;
    const tau_allow = 0.6 * sigma_allow;
    const tau_max = Math.max(tau_t_top || 0, tau_t_web || 0, tau_t_bottom || 0);
    const torsion_check: 'pass' | 'fail' = (tau_max <= tau_allow) ? 'pass' : 'fail';

    // Attach to aggregated results below via object spread
    var __torsion = { T_torsion, theta, tau_t_top, tau_t_web, tau_t_bottom, railDifferential: railDifferential_mm, torsion_check } as Partial<CalculationResults>;
  } catch { var __torsion = {} as Partial<CalculationResults>; }
  return {
    // Geometry
    F: F_total,
    Yc: perBeamResults.Yc,
    Xc: perBeamResults.Xc,
    Jx: Jx_total,
    Jy: Jy_total,
    Wx: Wx_total,
    Wy: Wy_total,

    // Inertia breakdown (approximate doubling for reporting)
    Jx_top: perBeamResults.Jx_top * 2,
    Jx_bottom: perBeamResults.Jx_bottom * 2,
    Jx_webs: perBeamResults.Jx_webs * 2,
    Jy_top: perBeamResults.Jy_top * 2,
    Jy_bottom: perBeamResults.Jy_bottom * 2,
    Jy_webs: perBeamResults.Jy_webs * 2,

    // Loads and moments
    P: P_total,
    M_bt: perBeamResults.M_bt * 2,
    M_vn: perBeamResults.M_vn * 2,
    M_x: Mx_total,
    M_y: My_total,
    beamSelfWeight: perBeamResults.beamSelfWeight * 2,
    // Use per-beam distributed load for clarity
    q: perBeamResults.q,

    // Stresses and deflection (per-beam)
    sigma_u: perBeamResults.sigma_u,
    sigma_top_compression: perBeamResults.sigma_top_compression,
    sigma_bottom_tension: perBeamResults.sigma_bottom_tension,
    f: perBeamResults.f,
    f_allow: perBeamResults.f_allow,

    // Safety factors (per-beam)
    K_sigma: perBeamResults.K_sigma,
    n_f: perBeamResults.n_f,
    // Use double-girder specific local buckling based on top flange (t2)
    K_buckling: K_buckling_d,
    stress_check: perBeamResults.stress_check,
    deflection_check: perBeamResults.deflection_check,
    buckling_check: buckling_check_d,

    calculationMode: 'double-girder',
    stiffener,
    
    // Merge torsion results
    ...(__torsion || {}),
  };
};

export const generateDoubleBeamDiagramData = (inputs: DoubleBeamInputs, _results: CalculationResults): DiagramData => {
  // Build per-beam inputs and results similar to above to reuse existing generator
  const transversalLoad_cm = (inputs.transversalLoad || 0) / 100;
  const perBeam: BeamInputs = {
    ...inputs,
    P_nang: (inputs.P_nang || 0) / 2,
    P_thietbi: (inputs.P_thietbi || 0) / 2,
    q: (inputs.q || 0) + transversalLoad_cm / 2,
  };
  const perBeamResults = calculateBeamProperties(perBeam, 'single-girder');
  const perData = generateDiagramData(perBeam, perBeamResults);
  // For the full system, shear and moment are doubled (two identical girders in parallel)
  return perData.map(p => ({ x: p.x, shear: p.shear * 2, moment: p.moment * 2 }));
};

// --- V-beam specialized calculation ---
export const calculateVBeamProperties = (inputs: VBeamInputs): CalculationResults => {
  const deg = (d: number) => (d * Math.PI) / 180;
  const a1 = deg(30);   // V-web angle from vertical
  const alpha = deg(10); // Roof angle from horizontal

  // Extract and convert to cm
  const b1_cm = (inputs.b1 || 0) / 10;
  const t1_cm = (inputs.t1 || 0) / 10;
  const t2_cm = (inputs.t2 || 0) / 10;
  const t3_cm = (inputs.t3 || 0) / 10;
  const t4_cm = (inputs.t4 || 0) / 10;
  const h1_cm = (inputs.h1 || 0) / 10;
  const h3_cm = (inputs.h3 || 0) / 10; // along web axis

  // Key vertical levels
  const yJunc = t1_cm + h1_cm; // bottom to V junction
  const x_web_in = t2_cm / 2 + h3_cm * Math.sin(a1); // inner web top x
  const H2 = yJunc + h3_cm * Math.cos(a1); // inner web top y
  const H3 = Math.tan(alpha) * x_web_in;   // inner roof rise
  const yApexIn = H2 + H3;
  const H_total = yApexIn + t4_cm;         // outer apex (vertical thickness t4)

  // Areas (cm^2)
  const A_bottom = b1_cm * t1_cm;
  const A_central = t2_cm * h1_cm;
  const A_vweb_one = t3_cm * h3_cm;
  const A_vweb_total = 2 * A_vweb_one;
  // Roof: thickness is vertical; convert to normal thickness by 1/cos(alpha). Length along plate = x_web_in / cos(alpha)
  const A_roof_one = (x_web_in / Math.cos(alpha)) * t4_cm; // Area is horizontal projection * vertical thickness
  const A_roof_total = 2 * A_roof_one;

  const F_total = A_bottom + A_central + A_vweb_total + A_roof_total;

  // Centroid Y (cm)
  const y_bottom_c = t1_cm / 2;
  const y_central_c = t1_cm + h1_cm / 2;
  const y_vweb_c = yJunc + (h3_cm * Math.cos(a1)) / 2;
  const y_roof_c = yApexIn + t4_cm / 2; // Centroid of the top roof plate

  const Yc = (A_bottom * y_bottom_c + A_central * y_central_c + A_vweb_total * y_vweb_c + A_roof_total * y_roof_c) / (F_total || 1);

  // Jx (cm^4): Use Steiner's theorem for all parts. For inclined parts, use formula for rotated rectangle.
  // I_x = (b*h^3/12)*cos^2(a) + (h*b^3/12)*sin^2(a)
  const Jx_bottom = (b1_cm * Math.pow(t1_cm, 3)) / 12 + A_bottom * Math.pow(y_bottom_c - Yc, 2);
  const Jx_central = (t2_cm * Math.pow(h1_cm, 3)) / 12 + A_central * Math.pow(y_central_c - Yc, 2);
  
  // Correct inertia for V-webs (rotated rectangles)
  const cos_a1_sq = Math.pow(Math.cos(a1), 2);
  const sin_a1_sq = Math.pow(Math.sin(a1), 2);
  const Jx_vweb_one_local = (t3_cm * Math.pow(h3_cm, 3) / 12) * cos_a1_sq + (h3_cm * Math.pow(t3_cm, 3) / 12) * sin_a1_sq;
  const Jx_vweb_one = Jx_vweb_one_local + A_vweb_one * Math.pow(y_vweb_c - Yc, 2);
  const Jx_vweb_total = 2 * Jx_vweb_one;

  // Correct inertia for roof plates (rotated rectangles)
  const Jx_roof_one_local = (x_web_in * Math.pow(t4_cm, 3) / 12); // Simplified as it's mostly horizontal
  const Jx_roof_one = Jx_roof_one_local + A_roof_one * Math.pow(y_roof_c - Yc, 2);
  const Jx_roof_total = 2 * Jx_roof_one;
  const Jx = Jx_bottom + Jx_central + Jx_vweb_total + Jx_roof_total;

  // Jy (cm^4): symmetry about y-axis; Xc = 0
  const Xc = 0;
  const Jy_bottom = (t1_cm * Math.pow(b1_cm, 3)) / 12; // centered at x=0
  const Jy_central = (h1_cm * Math.pow(t2_cm, 3)) / 12; // centered at x=0
  // V-web centroid x from center (one side)
  const x_vweb_c = t2_cm / 2 + (h3_cm * Math.sin(a1)) / 2; // Centroid of one V-web from center
  const Jy_vweb_one_local = (h3_cm * Math.pow(t3_cm, 3) / 12) * cos_a1_sq + (t3_cm * Math.pow(h3_cm, 3) / 12) * sin_a1_sq;
  const Jy_vweb_one = Jy_vweb_one_local + A_vweb_one * Math.pow(x_vweb_c - Xc, 2);
  const Jy_vweb_total = 2 * Jy_vweb_one;
  // Roof centroid x from center (one side)
  const x_roof_c = x_web_in / 2;
  const Jy_roof_one_local = (t4_cm * Math.pow(x_web_in, 3) / 12);
  const Jy_roof_one = Jy_roof_one_local + A_roof_one * Math.pow(x_roof_c - Xc, 2);
  const Jy_roof_total = 2 * Jy_roof_one;
  const Jy = Jy_bottom + Jy_central + Jy_vweb_total + Jy_roof_total;

  // Section moduli
  const Wx = Jx / Math.max(Yc, H_total - Yc || 1e-9);
  const halfTopWidth = x_web_in; // conservative lever arm for Wy
  const halfBottomWidth = b1_cm / 2;
  const c_y = Math.max(halfTopWidth, halfBottomWidth, 1e-9);
  const Wy = Jy / c_y;

  // --- Loads and performance (reuse logic) ---
  const L = inputs.L || 0; // cm
  const P = (inputs.P_nang || 0) + (inputs.P_thietbi || 0);
  const q_auto = F_total * 7850 / 1_000_000; // kg/cm
  const M_bt = (q_auto * Math.pow(L, 2)) / 8;
  const M_vn = (P * L) / 4;
  const M_x = 1.05 * (M_bt + 1.25 * M_vn);
  const M_y = 0.05 * (M_bt + M_vn);

  const sigma_u = (M_x / (Wx || 1e-9)) + (M_y / (Wy || 1e-9));
  
  // Corrected stress calculation for V-beam with load on bottom flange
  // For crane beam with load on bottom flange, bottom fiber is in compression
  const sigma_bottom_compression = (M_x * Yc) / (Jx || 1e-9);
  const sigma_top_tension = (M_x * (H_total - Yc)) / (Jx || 1e-9);

  const E = inputs.E || 0;
  const f = (5 * q_auto * Math.pow(L, 4)) / (384 * E * (Jx || 1e-9)) + (P * Math.pow(L, 3)) / (48 * E * (Jx || 1e-9));
  const f_allow = L / 850;

  const sigma_allow = inputs.sigma_allow || 0;
  const sigma_yield = inputs.sigma_yield || 0;
  const K_sigma = sigma_allow > 0 ? sigma_allow / (sigma_u || 1e-9) : Infinity;
  const n_f = f_allow > 0 ? f_allow / (f || 1e-9) : Infinity;

  // Corrected local buckling check for bottom flange (compression flange)
  // For V-beam with load on bottom flange, check bottom flange buckling
  const sigma_yield_mpa = sigma_yield * KG_CM2_TO_MPA;
  const epsilon = sigma_yield_mpa > 0 ? Math.sqrt(235 / sigma_yield_mpa) : 0;
  // Bottom flange outstand from central web - critical for compression
  const representative_b = Math.max(b1_cm - t2_cm, 0) / 2; // outstand from central web
  const representative_t = t1_cm;
  const lambda_limit = 14 * epsilon; // Class 3 limit for outstand flange in compression
  const lambda_actual = representative_t > 0 ? representative_b / representative_t : 0;
  const K_buckling = lambda_actual > 0 ? lambda_limit / lambda_actual : Infinity;

  // Stiffener recommendation use clear web height between flanges
  const h_w_mm = Math.max((H_total * 10) - (inputs.t1 || 0) - (inputs.t2 || 0), 0);
  const t_web_input_mm = inputs.t3 || 0;

  let needsStiffeners = false;
  let optimalSpacing_mm = 0;
  let stiffenerWidth_mm = 0;
  let stiffenerThickness_mm = 0;
  let stiffenerInertia_mm4 = 0;
  let stiffenerCount = 0;
  let stiffenersTotalWeight_kg = 0;
  const stiffenerPositions_cm: number[] = [];
  const span_mm = (inputs.L || 0) * 10;

  if (h_w_mm > 0 && t_web_input_mm > 0) {
    const slendernessRatio = h_w_mm / t_web_input_mm;
    const eta = 1.2;
    const slendernessLimit = 72 * epsilon / eta;
    needsStiffeners = Number.isFinite(slendernessRatio) && slendernessRatio > slendernessLimit;

    if (needsStiffeners) {
      const gammaM1 = 1.1;
      const supportShear_kg = P / 2 + (q_auto * (inputs.L || 0)) / 2;
      const supportShear_kN = supportShear_kg * KG_TO_KN;
      const supportShear_N = supportShear_kN * 1000;
      if (sigma_yield_mpa > 0 && supportShear_N > 0) {
        const plasticShearCapacity_N = (h_w_mm * t_web_input_mm * sigma_yield_mpa) / (Math.sqrt(3) * gammaM1);
        const utilisation = plasticShearCapacity_N / supportShear_N;
        optimalSpacing_mm = utilisation * h_w_mm;
      }
      if (!Number.isFinite(optimalSpacing_mm) || optimalSpacing_mm <= 0) {
        optimalSpacing_mm = h_w_mm;
      }
      const a_min = 0.5 * h_w_mm;
      const a_limit_aspect = 3 * h_w_mm;
      optimalSpacing_mm = Math.max(a_min, Math.min(optimalSpacing_mm, a_limit_aspect));
      optimalSpacing_mm = Math.max(10, Math.round(optimalSpacing_mm / 10) * 10);

      if (h_w_mm > 0 && t_web_input_mm > 0) {
        stiffenerWidth_mm = Math.round(Math.max(0.1 * h_w_mm, 80) / 10) * 10;
        const rawThickness = Math.max(0.6 * Math.sqrt(Math.max(sigma_yield_mpa, 1) / 235) * t_web_input_mm, 8);
        stiffenerThickness_mm = Math.max(8, Math.round(rawThickness));
        stiffenerInertia_mm4 = stiffenerWidth_mm * Math.pow(stiffenerThickness_mm, 3) / 12;
      }

      if (optimalSpacing_mm >= span_mm) {
        needsStiffeners = false;
        stiffenerCount = 0;
        stiffenersTotalWeight_kg = 0;
        optimalSpacing_mm = span_mm;
      } else {
        const spacing_cm = optimalSpacing_mm / 10;
        let currentPosition = spacing_cm;
        let guard = 0;
        while (currentPosition < (inputs.L || 0) && guard < 500) {
          stiffenerPositions_cm.push(Number(currentPosition.toFixed(2)));
          currentPosition += spacing_cm;
          guard += 1;
        }
        stiffenerCount = stiffenerPositions_cm.length; // Correct the count
        const singleStiffenerVolume_mm3 = h_w_mm * stiffenerWidth_mm * stiffenerThickness_mm;
        const singleStiffenerWeight_kg = (singleStiffenerVolume_mm3 * 7850) / 1e9;
        stiffenersTotalWeight_kg = stiffenerCount * singleStiffenerWeight_kg;
      }
    }
  }

  const beamSelfWeight_kg = q_auto * (inputs.L || 0);

  return {
    // Geometry
    F: F_total,
    Yc, Xc, Jx, Jy, Wx, Wy,
    
    // Inertia component breakdown
    Jx_top: Jx_roof_total,
    Jx_bottom: Jx_bottom,
    Jx_webs: Jx_central + Jx_vweb_total,
    Jy_top: Jy_roof_total, 
    Jy_bottom: Jy_bottom,
    Jy_webs: Jy_central + Jy_vweb_total,

    // Loads & moments
    P, M_bt, M_vn, M_x, M_y,
    beamSelfWeight: beamSelfWeight_kg,
    q: q_auto,

    // Stresses & deflection (corrected for V-beam with load on bottom flange)
    sigma_u, 
    sigma_top_compression: sigma_top_tension, // Actually tension for crane beam
    sigma_bottom_tension: sigma_bottom_compression, // Actually compression for crane beam
    f, f_allow,
    K_sigma, n_f, K_buckling,
    stress_check: K_sigma >= 1 ? 'pass' : 'fail',
    deflection_check: n_f >= 1 ? 'pass' : 'fail',
    buckling_check: K_buckling >= 1 ? 'pass' : 'fail',

    calculationMode: 'v-beam',
    stiffener: {
      required: needsStiffeners,
      effectiveWebHeight: Math.max((H_total * 10) - (inputs.t1 || 0) - (inputs.t2 || 0), 0),
      epsilon,
      optimalSpacing: optimalSpacing_mm,
      count: needsStiffeners ? stiffenerCount : 0,
      width: stiffenerWidth_mm,
      thickness: stiffenerThickness_mm,
      requiredInertia: stiffenerInertia_mm4,
      positions: needsStiffeners ? stiffenerPositions_cm : [],
      totalWeight: stiffenersTotalWeight_kg,
    },
  };
};
