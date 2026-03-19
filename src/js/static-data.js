/**
 * Static Fallback Data
 * ====================
 * API接続不可時に使用する静的データ
 * 出典: 総務省統計局「人口推計」「労働力調査」「消費者物価指数」(2024年データ)
 */

const StaticData = {

  // === 都道府県データ（2024年推計 / 千人単位） ===
  prefectures: [
    { code: "01000", name: "北海道",   pop: 5140, density: 66,  aging: 33.4, area: 78421 },
    { code: "02000", name: "青森県",   pop: 1188, density: 123, aging: 34.6, area: 9646 },
    { code: "03000", name: "岩手県",   pop: 1162, density: 76,  aging: 35.0, area: 15275 },
    { code: "04000", name: "宮城県",   pop: 2265, density: 311, aging: 28.4, area: 7282 },
    { code: "05000", name: "秋田県",   pop: 920,  density: 79,  aging: 39.0, area: 11638 },
    { code: "06000", name: "山形県",   pop: 1035, density: 111, aging: 35.2, area: 9323 },
    { code: "07000", name: "福島県",   pop: 1771, density: 128, aging: 33.3, area: 13784 },
    { code: "08000", name: "茨城県",   pop: 2838, density: 465, aging: 30.4, area: 6098 },
    { code: "09000", name: "栃木県",   pop: 1903, density: 297, aging: 29.6, area: 6408 },
    { code: "10000", name: "群馬県",   pop: 1907, density: 299, aging: 30.5, area: 6362 },
    { code: "11000", name: "埼玉県",   pop: 7337, density: 1932, aging: 27.2, area: 3798 },
    { code: "12000", name: "千葉県",   pop: 6275, density: 1217, aging: 28.1, area: 5158 },
    { code: "13000", name: "東京都",   pop: 14048, density: 6439, aging: 22.8, area: 2194 },
    { code: "14000", name: "神奈川県", pop: 9232, density: 3824, aging: 25.9, area: 2416 },
    { code: "15000", name: "新潟県",   pop: 2135, density: 170, aging: 34.0, area: 12584 },
    { code: "16000", name: "富山県",   pop: 1013, density: 238, aging: 33.6, area: 4248 },
    { code: "17000", name: "石川県",   pop: 1111, density: 265, aging: 30.3, area: 4186 },
    { code: "18000", name: "福井県",   pop: 748,  density: 178, aging: 31.5, area: 4190 },
    { code: "19000", name: "山梨県",   pop: 796,  density: 178, aging: 31.4, area: 4465 },
    { code: "20000", name: "長野県",   pop: 2011, density: 148, aging: 33.5, area: 13562 },
    { code: "21000", name: "岐阜県",   pop: 1937, density: 183, aging: 31.2, area: 10621 },
    { code: "22000", name: "静岡県",   pop: 3575, density: 459, aging: 30.7, area: 7777 },
    { code: "23000", name: "愛知県",   pop: 7495, density: 1452, aging: 25.3, area: 5173 },
    { code: "24000", name: "三重県",   pop: 1738, density: 301, aging: 30.7, area: 5774 },
    { code: "25000", name: "滋賀県",   pop: 1408, density: 350, aging: 26.4, area: 4017 },
    { code: "26000", name: "京都府",   pop: 2542, density: 552, aging: 29.8, area: 4612 },
    { code: "27000", name: "大阪府",   pop: 8784, density: 4612, aging: 27.8, area: 1905 },
    { code: "28000", name: "兵庫県",   pop: 5382, density: 641, aging: 29.8, area: 8401 },
    { code: "29000", name: "奈良県",   pop: 1306, density: 354, aging: 32.1, area: 3691 },
    { code: "30000", name: "和歌山県", pop: 901,  density: 191, aging: 33.9, area: 4725 },
    { code: "31000", name: "鳥取県",   pop: 541,  density: 154, aging: 33.0, area: 3507 },
    { code: "32000", name: "島根県",   pop: 650,  density: 97,  aging: 35.4, area: 6708 },
    { code: "33000", name: "岡山県",   pop: 1862, density: 263, aging: 30.6, area: 7114 },
    { code: "34000", name: "広島県",   pop: 2737, density: 323, aging: 29.6, area: 8479 },
    { code: "35000", name: "山口県",   pop: 1304, density: 213, aging: 35.0, area: 6112 },
    { code: "36000", name: "徳島県",   pop: 700,  density: 169, aging: 34.4, area: 4147 },
    { code: "37000", name: "香川県",   pop: 935,  density: 497, aging: 32.2, area: 1877 },
    { code: "38000", name: "愛媛県",   pop: 1298, density: 229, aging: 33.8, area: 5676 },
    { code: "39000", name: "高知県",   pop: 670,  density: 94,  aging: 36.1, area: 7104 },
    { code: "40000", name: "福岡県",   pop: 5115, density: 1027, aging: 27.8, area: 4987 },
    { code: "41000", name: "佐賀県",   pop: 803,  density: 330, aging: 31.0, area: 2441 },
    { code: "42000", name: "長崎県",   pop: 1280, density: 309, aging: 33.6, area: 4131 },
    { code: "43000", name: "熊本県",   pop: 1718, density: 232, aging: 31.5, area: 7409 },
    { code: "44000", name: "大分県",   pop: 1107, density: 175, aging: 33.9, area: 6341 },
    { code: "45000", name: "宮崎県",   pop: 1052, density: 136, aging: 33.1, area: 7735 },
    { code: "46000", name: "鹿児島県", pop: 1560, density: 170, aging: 32.8, area: 9187 },
    { code: "47000", name: "沖縄県",   pop: 1468, density: 644, aging: 22.6, area: 2282 },
  ],

  // === 全国人口推移（千人・各年10月1日） ===
  populationTrend: {
    labels: ["2000","2005","2010","2015","2016","2017","2018","2019","2020","2021","2022","2023","2024"],
    total: [126926,127768,128057,127095,126933,126706,126443,126167,126146,125502,125124,124352,123802],
    under15: [18472,17521,16803,15887,15578,15270,14979,14694,14407,14132,13880,14173,13830],
    working: [86380,84092,81032,77282,76561,75962,75451,75072,74449,74504,74208,73952,73728],
    over65: [22005,25672,29246,33465,34592,35152,35577,35885,36192,36214,36236,36227,36243],
  },

  // === 年齢構成比率（%） ===
  ageRatio: {
    labels: ["2000","2005","2010","2015","2020","2024"],
    under15: [14.6, 13.8, 13.2, 12.6, 12.0, 11.2],
    working: [68.1, 66.1, 63.8, 60.8, 59.5, 59.6],
    over65:  [17.4, 20.2, 23.0, 26.6, 28.6, 29.3],
  },

  // === 経済指標 ===
  economy: {
    cpi: {
      labels: ["2018","2019","2020","2021","2022","2023","2024"],
      values: [99.3, 99.8, 100.0, 99.8, 102.3, 105.8, 108.5],
      unit: "2020年基準",
    },
    unemployment: {
      labels: ["2018","2019","2020","2021","2022","2023","2024"],
      values: [2.4, 2.4, 2.8, 2.8, 2.6, 2.6, 2.5],
      unit: "％（季節調整値）",
    },
    jobRatio: {
      labels: ["2018","2019","2020","2021","2022","2023","2024"],
      values: [1.61, 1.60, 1.18, 1.13, 1.28, 1.31, 1.25],
      unit: "倍（季節調整値）",
    },
  },

  // === ヘッドライン数値 ===
  headline: {
    totalPopulation: 123802,  // 千人
    totalPopulationYear: 2024,
    populationChange: -550,   // 千人（前年比）
    populationChangeRate: -0.44, // %
    agingRate: 29.3,          // %
    under15Rate: 11.2,        // %
    workingRate: 59.6,        // %
    over75: 20777,            // 千人
    foreignPopulation: 3743,  // 千人
  },

  // === 都道府県グリッドマップ座標 ===
  // グリッド配置（日本地図の概形を保持するための座標）
  mapGrid: {
    cols: 13, rows: 15,
    // [県コード, col, row] — 各都道府県のグリッド位置
    positions: [
      [1,10,1],   // 北海道
      [2,9,3],    // 青森
      [3,9,4], [4,9,5],    // 岩手, 宮城
      [5,8,4], [6,8,5],    // 秋田, 山形
      [7,9,6],              // 福島
      [8,9,7], [9,8,6],    // 茨城, 栃木
      [10,7,6],             // 群馬
      [11,8,7], [12,9,8],  // 埼玉, 千葉
      [13,8,8], [14,9,9],  // 東京, 神奈川
      [15,7,5],             // 新潟
      [16,6,5], [17,5,5],  // 富山, 石川
      [18,5,6],             // 福井
      [19,7,7], [20,7,8],  // 山梨, 長野
      [21,6,6], [22,7,9],  // 岐阜, 静岡
      [23,6,7], [24,6,8],  // 愛知, 三重
      [25,5,7], [26,4,7],  // 滋賀, 京都
      [27,4,8], [28,3,8],  // 大阪, 兵庫
      [29,5,8], [30,4,9],  // 奈良, 和歌山
      [31,3,6], [32,2,6],  // 鳥取, 島根
      [33,3,7], [34,2,7],  // 岡山, 広島
      [35,1,7],             // 山口
      [36,4,10],[37,4,11], // 徳島, 香川
      [38,3,10],[39,3,11], // 愛媛, 高知
      [40,1,9],             // 福岡
      [41,0,9], [42,0,10], // 佐賀, 長崎
      [43,1,10],[44,2,9],  // 熊本, 大分
      [45,2,10],[46,1,11], // 宮崎, 鹿児島
      [47,0,13],            // 沖縄
    ],
  },
};

// ES Module export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StaticData;
}
