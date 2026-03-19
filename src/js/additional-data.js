/**
 * 追加データセット
 * ================
 * 政治・医療・NPO・寄付関連の統計データ
 */
const AdditionalData = {
  // === 国会議員データ ===
  parliament: {
    title: "国会議員",
    source: "総務省「日本統計年鑑」/ 衆議院・参議院",
    lastUpdate: "2024年",
    summary: {
      house_of_representatives: 465,  // 衆議院定数
      house_of_councillors: 248,       // 参議院定数
      total: 713,
      women_ratio: 16.0,  // %
    },
    // 衆院選投票率推移
    voter_turnout_shu: {
      labels: ["2005","2009","2012","2014","2017","2021","2024"],
      values: [67.5, 69.3, 59.3, 52.7, 53.7, 55.9, 53.8],
    },
    // 参院選投票率推移
    voter_turnout_san: {
      labels: ["2007","2010","2013","2016","2019","2022"],
      values: [58.6, 57.9, 52.6, 54.7, 48.8, 52.1],
    },
    // 政党別議席数（衆議院 2024年選挙後）
    parties_shu: [
      { name: "自由民主党", seats: 191 },
      { name: "立憲民主党", seats: 148 },
      { name: "日本維新の会", seats: 38 },
      { name: "国民民主党", seats: 28 },
      { name: "公明党", seats: 24 },
      { name: "れいわ新選組", seats: 9 },
      { name: "日本共産党", seats: 8 },
      { name: "その他・無所属", seats: 19 },
    ],
  },

  // === 都道府県知事データ ===
  governors: {
    title: "都道府県知事",
    source: "総務省・各都道府県HP",
    lastUpdate: "2025年3月",
    avgAge: 60.2,
    womenCount: 3,
    // 知事の年代分布
    ageDistribution: [
      { range: "40代", count: 5 },
      { range: "50代", count: 15 },
      { range: "60代", count: 18 },
      { range: "70代以上", count: 9 },
    ],
    avgTenure: 2.8, // 平均在任期数
  },

  // === 市区町村長データ ===
  mayors: {
    title: "市区町村首長",
    source: "総務省「地方公共団体の議会の議員及び長の所属党派別人員調」",
    lastUpdate: "2024年",
    totalMunicipalities: 1741,
    cities: 792,
    towns: 743,
    villages: 183,
    specialWards: 23,
    womenMayors: 56,
    womenRatio: 3.2,
    avgTurnout: 50.3,
  },

  // === 脳外傷・高次脳機能障害データ ===
  brainInjury: {
    title: "脳外傷・高次脳機能障害",
    source: "厚労省「患者調査」/ 国立障害者リハビリテーションセンター",
    lastUpdate: "2023年（令和5年患者調査）",
    // 外傷性脳損傷(TBI)推計
    tbi: {
      estimatedPatients: 30000, // 年間新規（推計）
      prevalence: 500000,        // 有病者数推計
      mainCauses: [
        { cause: "交通事故", ratio: 40 },
        { cause: "転倒・転落", ratio: 35 },
        { cause: "スポーツ", ratio: 10 },
        { cause: "その他", ratio: 15 },
      ],
    },
    // 高次脳機能障害
    higherBrainDysfunction: {
      estimatedTotal: 500000,
      certifiedDisability: 78000,
      supportCenters: 125,  // 支援拠点機関数
      symptoms: ["記憶障害","注意障害","遂行機能障害","社会的行動障害"],
    },
  },

  // === 脳卒中データ ===
  stroke: {
    title: "脳卒中（脳血管疾患）",
    source: "厚労省「患者調査」「人口動態統計」",
    lastUpdate: "2023年",
    // 患者数推移
    patients: {
      labels: ["2002","2005","2008","2011","2014","2017","2020","2023"],
      inpatient: [170.0, 152.0, 137.0, 134.0, 118.0, 112.0, 108.0, 103.0],
      outpatient: [99.0, 92.0, 85.0, 80.0, 77.0, 72.0, 68.0, 65.0],
      unit: "千人",
    },
    // 死亡数
    deaths: {
      labels: ["2000","2005","2010","2015","2020","2023"],
      values: [132000, 131000, 123000, 111000, 102000, 97000],
    },
    // 種類別内訳
    types: [
      { type: "脳梗塞", ratio: 63, patients: 65000 },
      { type: "脳内出血", ratio: 23, patients: 24000 },
      { type: "くも膜下出血", ratio: 8, patients: 8000 },
      { type: "その他", ratio: 6, patients: 6000 },
    ],
    avgHospitalStay: 77.4, // 平均在院日数
  },

  // === NPO関連データ ===
  npo: {
    title: "NPO法人",
    source: "内閣府「特定非営利活動法人に関する実態調査」",
    lastUpdate: "2024年",
    totalRegistered: 50350,
    activeRatio: 78.5,  // %
    // 分野別NPO法人数
    byField: [
      { field: "保健・医療・福祉", count: 29245, ratio: 58.1 },
      { field: "社会教育", count: 12540, ratio: 24.9 },
      { field: "まちづくり", count: 11234, ratio: 22.3 },
      { field: "子どもの健全育成", count: 10180, ratio: 20.2 },
      { field: "環境の保全", count: 7890, ratio: 15.7 },
      { field: "学術・文化・芸術・スポーツ", count: 7654, ratio: 15.2 },
    ],
    // 年間収入規模
    revenueDistribution: [
      { range: "100万円未満", ratio: 22.5 },
      { range: "100〜500万円", ratio: 25.3 },
      { range: "500万〜1000万円", ratio: 15.2 },
      { range: "1000万〜5000万円", ratio: 22.8 },
      { range: "5000万円以上", ratio: 14.2 },
    ],
    avgStaff: 12.3,
    avgVolunteers: 24.5,
  },

  // === 寄付関連データ ===
  donation: {
    title: "寄付",
    source: "日本ファンドレイジング協会「寄付白書」/ 総務省「ふるさと納税」",
    lastUpdate: "2024年",
    // 個人寄付総額推移
    individualDonation: {
      labels: ["2016","2018","2020","2021","2022","2023"],
      values: [7756, 9989, 12126, 14339, 12448, 13520],
      unit: "億円",
    },
    // ふるさと納税
    furusatoNozei: {
      labels: ["2018","2019","2020","2021","2022","2023"],
      values: [5127, 4875, 6725, 8302, 9654, 11175],
      unit: "億円",
      users: [3953, 4057, 5522, 7406, 8914, 10001],
      usersUnit: "千件",
    },
    // 寄付先分野
    donationByField: [
      { field: "宗教関連", ratio: 31.2 },
      { field: "ふるさと納税", ratio: 28.5 },
      { field: "社会福祉", ratio: 12.3 },
      { field: "教育・研究", ratio: 8.7 },
      { field: "医療・保健", ratio: 6.2 },
      { field: "文化・芸術", ratio: 4.1 },
      { field: "その他", ratio: 9.0 },
    ],
    avgDonation: 27000, // 寄付者1人当たり平均（円）
    donorRate: 44.1,    // 寄付参加率（%）
  },

  // === e-Stat API統計表ID（新規追加分） ===
  apiMapping: {
    election_shu: { statsCode: "00200235", name: "衆議院議員総選挙結果調" },
    election_san: { statsCode: "00200236", name: "参議院議員通常選挙結果調" },
    patients: { statsCode: "00450022", name: "患者調査" },
    npo_survey: { statsCode: "00100414", name: "特定非営利活動法人に関する実態調査" },
    local_gov: { statsCode: "00200524", name: "地方公共団体の議会の議員及び長" },
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdditionalData;
}
