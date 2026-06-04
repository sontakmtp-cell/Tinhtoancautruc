export type GeoTechnicalTableId =
  | 'preliminary-design-checklist'
  | 'rolled-vs-welded-i-section'
  | 'calculator-input-parameters'
  | 'common-design-mistakes';

export type GeoTechnicalTableColumn = {
  key: string;
  label: string;
  align?: 'left' | 'center';
};

export type GeoTechnicalTableRow = {
  id: string;
  cells: Record<string, string>;
};

export type GeoTechnicalTable = {
  id: GeoTechnicalTableId;
  title: string;
  caption: string;
  guidanceNote: string;
  columns: GeoTechnicalTableColumn[];
  rowHeaderKey: string;
  rows: GeoTechnicalTableRow[];
};

export const geoTechnicalTables: GeoTechnicalTable[] = [
  {
    id: 'preliminary-design-checklist',
    title: 'Checklist so bo khi thiet ke dam cau truc',
    caption:
      'Bang nay dung de ra soat thong tin o buoc thiet ke so bo dam cau truc, khong thay the phe duyet thiet ke ket cau.',
    guidanceNote:
      'Huong dan so bo: can ky su ket cau kiem tra tai trong, mo hinh tinh, lien ket, dieu kien lam viec va tieu chuan ap dung truoc khi thi cong.',
    rowHeaderKey: 'step',
    columns: [
      { key: 'step', label: 'Hang muc' },
      { key: 'whatToCheck', label: 'Can kiem tra' },
      { key: 'whyItMatters', label: 'Vi sao quan trong' },
      { key: 'handoff', label: 'Ket qua can co' },
    ],
    rows: [
      {
        id: 'duty-context',
        cells: {
          step: 'Xac dinh cong nang cau truc',
          whatToCheck:
            'Loai cau truc, suc nang, che do lam viec, tan suat nang ha, moi truong trong nha hay ngoai troi.',
          whyItMatters:
            'Cung mot suc nang nhung che do lam viec khac nhau co the dan den yeu cau do cung, moi han va chi tiet khac nhau.',
          handoff: 'Mo ta dieu kien van hanh va pham vi su dung.',
        },
      },
      {
        id: 'span-supports',
        cells: {
          step: 'Chot so do nhip va goi tua',
          whatToCheck:
            'Chieu dai nhip, vi tri goi, kieu lien ket, khoang cach ray, khong gian lap dat va bao tri.',
          whyItMatters:
            'So do goi va nhip quyet dinh cach phan bo noi luc va bien dang cua dam.',
          handoff: 'So do mat bang, cao do va kich thuoc hinh hoc chinh.',
        },
      },
      {
        id: 'loads',
        cells: {
          step: 'Tong hop tai trong',
          whatToCheck:
            'Tai trong ban than, tai xe con, tai nang, luc ngang, luc doc cau truc va cac truong hop bat loi.',
          whyItMatters:
            'Thieu mot nhom tai trong co the lam ket qua tinh thieu an toan.',
          handoff: 'Bang tai trong dau vao va cach to hop tai.',
        },
      },
      {
        id: 'section-choice',
        cells: {
          step: 'Chon dang tiet dien so bo',
          whatToCheck:
            'Dam I can nong, dam I to hop han, ban tang cuong, suon tang cung va kha nang mua vat lieu.',
          whyItMatters:
            'Dang tiet dien anh huong den trong luong, gia cong, do cung va kha nang thi cong.',
          handoff: 'Phuong an tiet dien de dua vao tinh thu.',
        },
      },
      {
        id: 'serviceability',
        cells: {
          step: 'Kiem tra dieu kien su dung',
          whatToCheck:
            'Do vong, rung, do on dinh khi xe con di chuyen, va anh huong den ray hoac thiet bi treo.',
          whyItMatters:
            'Dam co the du ben nhung van khong dat neu bien dang lam cau truc van hanh kem.',
          handoff: 'Danh sach dieu kien can kiem trong ho so tinh.',
        },
      },
    ],
  },
  {
    id: 'rolled-vs-welded-i-section',
    title: 'So sanh thep I can nong va dam I to hop han',
    caption:
      'Bang so sanh giup chon huong thiet ke so bo giua thep I can nong va dam I to hop han cho dam cau truc.',
    guidanceNote:
      'Huong dan so bo: lua chon cuoi cung phu thuoc vat lieu san co, nang luc gia cong, kiem tra lien ket va ket qua tinh toan chi tiet.',
    rowHeaderKey: 'criterion',
    columns: [
      { key: 'criterion', label: 'Tieu chi' },
      { key: 'rolled', label: 'Thep I can nong' },
      { key: 'welded', label: 'Dam I to hop han' },
      { key: 'note', label: 'Luu y khi chon' },
    ],
    rows: [
      {
        id: 'availability',
        cells: {
          criterion: 'Vat lieu va tien do',
          rolled:
            'Thuan tien khi kich thuoc phu hop voi hang co san va nha cung cap dap ung kip.',
          welded:
            'Linh hoat hon ve kich thuoc nhung can thoi gian cat, han, kiem tra va son bao ve.',
          note: 'Kiem tra ton kho va nang luc xuong truoc khi chot phuong an.',
        },
      },
      {
        id: 'section-efficiency',
        cells: {
          criterion: 'Hieu qua tiet dien',
          rolled:
            'Don gian, on dinh ve chat luong, nhung co the bi gioi han boi kich thuoc tieu chuan.',
          welded:
            'Co the dieu chinh ban canh, bung dam va suon tang cung theo yeu cau thuc te.',
          note: 'Dam to hop thuong phu hop hon khi can tiet dien rieng cho nhip hoac tai lon.',
        },
      },
      {
        id: 'fabrication',
        cells: {
          criterion: 'Gia cong va kiem soat chat luong',
          rolled:
            'It cong doan han hon, giam rui ro bien dang do han trong nhieu truong hop.',
          welded:
            'Can quy trinh han, kiem tra moi han, xu ly bien dang va nghiem thu chat luong.',
          note: 'Chat luong han va dung sai che tao la phan khong nen bo qua.',
        },
      },
      {
        id: 'stiffeners',
        cells: {
          criterion: 'Suon tang cung va chi tiet phu',
          rolled:
            'Van co the can suon tai vi tri banh xe, goi tua hoac lien ket tuy ket qua kiem tra.',
          welded:
            'Thuong de bo tri suon va ban tang cuong theo yeu cau rieng cua du an.',
          note: 'Khong mac dinh dam I can nong la khong can suon tang cung.',
        },
      },
      {
        id: 'maintenance',
        cells: {
          criterion: 'Bao tri va van hanh',
          rolled:
            'Hinh dang don gian, it duong han doc hon, thuan tien quan sat trong bao tri dinh ky.',
          welded:
            'Can chu y khu vuc moi han, canh ban va diem tap trung ung suat khi kiem tra sau su dung.',
          note: 'Moi phuong an deu can ke hoach kiem tra, son va bao tri.',
        },
      },
    ],
  },
  {
    id: 'calculator-input-parameters',
    title: 'Thong so can chuan bi truoc khi dung may tinh dam cau truc',
    caption:
      'Bang nay tom tat cac thong so dau vao nen chuan bi truoc khi dung cong cu tinh dam cau truc.',
    guidanceNote:
      'Huong dan so bo: neu thieu thong tin, hay tam dung va xac nhan voi ban ve, nha cung cap cau truc hoac ky su phu trach.',
    rowHeaderKey: 'parameter',
    columns: [
      { key: 'parameter', label: 'Thong so' },
      { key: 'meaning', label: 'Y nghia' },
      { key: 'source', label: 'Lay tu dau' },
      { key: 'watchOut', label: 'Can tranh' },
    ],
    rows: [
      {
        id: 'span',
        cells: {
          parameter: 'Chieu dai nhip dam',
          meaning: 'Khoang cach lam viec giua cac goi hoac diem tua chinh cua dam.',
          source: 'Ban ve ket cau, mat bang nha xuong, thong tin goi tua.',
          watchOut: 'Nhap nham kich thuoc tong the thay vi nhip tinh toan.',
        },
      },
      {
        id: 'crane-capacity',
        cells: {
          parameter: 'Suc nang va tai xe con',
          meaning: 'Tai nang danh nghia va cac tai trong di kem thiet bi nang.',
          source: 'Ho so cau truc, catalogue nha san xuat, bien ban chon thiet bi.',
          watchOut: 'Chi nhap suc nang ma bo qua tai xe con hoac thiet bi treo.',
        },
      },
      {
        id: 'wheel-loads',
        cells: {
          parameter: 'Tai banh xe',
          meaning: 'Tai truyen xuong dam tai cac vi tri banh xe bat loi.',
          source: 'Du lieu nha san xuat cau truc hoac bang tinh phan phoi tai.',
          watchOut: 'Dung tai trung binh khi can kiem tra truong hop bat loi.',
        },
      },
      {
        id: 'section-dimensions',
        cells: {
          parameter: 'Kich thuoc tiet dien',
          meaning: 'Chieu cao dam, ban canh, chieu day ban canh, bung dam va cac chi tiet lien quan.',
          source: 'Bang thep hinh, ban ve che tao, phuong an dam to hop.',
          watchOut: 'Tron don qua som hoac nhap sai don vi giua mm, cm va m.',
        },
      },
      {
        id: 'material',
        cells: {
          parameter: 'Vat lieu',
          meaning: 'Mac thep, trang thai vat lieu va thong tin can cho kiem tra ket cau.',
          source: 'Yeu cau du an, chung chi vat lieu, tieu chuan noi bo.',
          watchOut: 'Mac dinh mot mac thep khi ho so du an chua xac nhan.',
        },
      },
      {
        id: 'support-condition',
        cells: {
          parameter: 'Lien ket va dieu kien tua',
          meaning: 'Cach dam duoc do, neo, han, bat bulong va kha nang chuyen vi tai goi.',
          source: 'Ban ve lien ket, chi tiet cot, dam do ray va thuc te thi cong.',
          watchOut: 'Dung mot so do tinh khac voi cach lap dat thuc te.',
        },
      },
    ],
  },
  {
    id: 'common-design-mistakes',
    title: 'Loi thiet ke thuong gap va buoc kiem tra',
    caption:
      'Bang nay neu cac loi hay gap khi tinh so bo dam cau truc va cach kiem tra lai truoc khi lap ho so.',
    guidanceNote:
      'Huong dan so bo: cac muc duoi day la danh sach ra soat, khong phai ket luan dam dat hay khong dat.',
    rowHeaderKey: 'mistake',
    columns: [
      { key: 'mistake', label: 'Loi thuong gap' },
      { key: 'risk', label: 'Rui ro' },
      { key: 'check', label: 'Nen kiem tra lai' },
      { key: 'owner', label: 'Nguoi nen xac nhan' },
    ],
    rows: [
      {
        id: 'missing-horizontal-load',
        cells: {
          mistake: 'Bo qua luc ngang hoac luc doc cau truc',
          risk: 'Ket qua chi phan anh tai thang dung, khong day du cho van hanh thuc te.',
          check: 'Ra soat tai trong do di chuyen, phanh, lech tai va tac dong len lien ket.',
          owner: 'Ky su ket cau va don vi cung cap cau truc.',
        },
      },
      {
        id: 'wrong-wheel-position',
        cells: {
          mistake: 'Dat vi tri banh xe khong bat loi',
          risk: 'Noi luc va bien dang tinh duoc co the nho hon truong hop nguy hiem.',
          check: 'Thu cac vi tri xe con va cum banh xe gay tac dong lon nhat len dam.',
          owner: 'Nguoi lap mo hinh tinh.',
        },
      },
      {
        id: 'serviceability-afterthought',
        cells: {
          mistake: 'Chi nhin vao do ben, bo qua do vong va van hanh',
          risk: 'Dam co the khong phu hop voi ray, xe con hoac cam giac van hanh.',
          check: 'Kiem tra dieu kien su dung va trao doi voi ben van hanh thiet bi.',
          owner: 'Ky su ket cau va bo phan van hanh.',
        },
      },
      {
        id: 'fabrication-tolerance',
        cells: {
          mistake: 'Khong tinh den dung sai che tao va lap dat',
          risk: 'Ban ve tinh dung nhung khi lap dat bi lech ray, lech goi hoac kho bao tri.',
          check: 'Doi chieu ban ve che tao, dung sai lap dat, khe ho va trinh tu thi cong.',
          owner: 'Don vi che tao, giam sat va ky su thiet ke.',
        },
      },
      {
        id: 'unsupported-assumptions',
        cells: {
          mistake: 'Dung gia tri mac dinh ma khong ghi lai gia thiet',
          risk: 'Nguoi duyet khong biet dau vao nao da duoc xac nhan va dau vao nao chi la tam tinh.',
          check: 'Ghi ro nguon du lieu, ngay cap nhat va cac muc can xac nhan tiep.',
          owner: 'Nguoi lap bang tinh va nguoi kiem tra.',
        },
      },
    ],
  },
];

export const geoTechnicalTableById = geoTechnicalTables.reduce(
  (tablesById, table) => {
    tablesById[table.id] = table;
    return tablesById;
  },
  {} as Record<GeoTechnicalTableId, GeoTechnicalTable>,
);
