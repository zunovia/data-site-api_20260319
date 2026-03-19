/**
 * e-Stat API Client Module
 * ========================
 * クライアントサイドから e-Stat API v3.0 を直接呼び出すモジュール
 * CORS対応JSONエンドポイントを使用
 * 
 * API仕様: https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0
 */

const EstatAPI = (() => {
  const BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json';
  let _appId = null;

  // ===== 初期化 =====
  function init(appId) {
    _appId = appId;
  }

  // ===== 共通リクエスト =====
  async function _request(endpoint, params = {}) {
    if (!_appId) throw new Error('appId not set. Call EstatAPI.init(appId) first.');
    
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.set('appId', _appId);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, v);
      }
    });

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    
    const json = await res.json();
    return json;
  }

  // ===== 統計表情報取得 =====
  async function getStatsList(params = {}) {
    const data = await _request('getStatsList', {
      lang: 'J',
      limit: 100,
      ...params,
    });
    
    const root = data.GET_STATS_LIST;
    if (!root || root.RESULT.STATUS !== 0) {
      throw new Error(root?.RESULT?.ERROR_MSG || 'API Error');
    }
    
    return {
      total: root.DATALIST_INF?.NUMBER || 0,
      tables: _toArray(root.DATALIST_INF?.TABLE_INF),
    };
  }

  // ===== メタ情報取得 =====
  async function getMetaInfo(statsDataId) {
    const data = await _request('getMetaInfo', {
      statsDataId,
      lang: 'J',
    });

    const root = data.GET_META_INFO;
    if (!root || root.RESULT.STATUS !== 0) {
      throw new Error(root?.RESULT?.ERROR_MSG || 'API Error');
    }

    const classObjs = _toArray(root.METADATA_INF?.CLASS_INF?.CLASS_OBJ);
    const meta = {};
    classObjs.forEach(obj => {
      const id = obj['@id'];
      meta[id] = _toArray(obj.CLASS).map(c => ({
        code: c['@code'],
        name: c['@name'],
        level: c['@level'],
        unit: c['@unit'] || null,
        parentCode: c['@parentCode'] || null,
      }));
    });

    return {
      tableInfo: root.METADATA_INF?.TABLE_INF,
      classes: meta,
    };
  }

  // ===== 統計データ取得 =====
  async function getStatsData(params = {}) {
    const data = await _request('getStatsData', {
      lang: 'J',
      metaGetFlg: 'Y',
      cntGetFlg: 'N',
      explanationGetFlg: 'N',
      annotationGetFlg: 'N',
      replaceSpChar: 2, // NULL置換
      ...params,
    });

    const root = data.GET_STATS_DATA;
    if (!root || root.RESULT.STATUS > 2) {
      throw new Error(root?.RESULT?.ERROR_MSG || 'API Error');
    }

    const statData = root.STATISTICAL_DATA;

    // メタ情報パース
    const classLookup = {};
    const classObjs = _toArray(statData.CLASS_INF?.CLASS_OBJ);
    classObjs.forEach(obj => {
      const id = obj['@id'];
      classLookup[id] = {};
      _toArray(obj.CLASS).forEach(c => {
        classLookup[id][c['@code']] = {
          name: c['@name'],
          level: c['@level'],
          unit: c['@unit'] || null,
        };
      });
    });

    // データパース
    const values = _toArray(statData.DATA_INF?.VALUE).map(v => {
      const row = { value: v['$'] };
      // 各分類コードを解決
      Object.keys(v).forEach(k => {
        if (k.startsWith('@')) {
          const classId = k.replace('@', '');
          const code = v[k];
          row[classId + '_code'] = code;
          if (classLookup[classId] && classLookup[classId][code]) {
            row[classId + '_name'] = classLookup[classId][code].name;
            row[classId + '_unit'] = classLookup[classId][code].unit;
          }
        }
      });
      return row;
    });

    return {
      totalNumber: statData.RESULT_INF?.TOTAL_NUMBER,
      tableInfo: statData.TABLE_INF,
      classes: classLookup,
      values,
    };
  }

  // ===== ヘルパー: 配列保証 =====
  function _toArray(item) {
    if (!item) return [];
    return Array.isArray(item) ? item : [item];
  }

  // ===== 便利関数: 都道府県別人口取得 =====
  async function getPrefecturePopulation() {
    return getStatsData({
      statsDataId: '0003448233',
      cdArea: '00000,01000,02000,03000,04000,05000,06000,07000,08000,09000,10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34000,35000,36000,37000,38000,39000,40000,41000,42000,43000,44000,45000,46000,47000',
      cdTimeFrom: 'max',
      limit: 1000,
    });
  }

  // ===== 便利関数: 社会・人口統計体系（高齢化率等） =====
  async function getAgingRate() {
    return getStatsData({
      statsDataId: 'C0020050213000',
      cdCat01: '%23A03503', // 老年人口割合 (URLエンコード済み#)
      limit: 100,
    });
  }

  // ===== 便利関数: 統計表検索 =====
  async function searchStats(keyword, statsCode = null) {
    const params = { searchWord: keyword, limit: 20 };
    if (statsCode) params.statsCode = statsCode;
    return getStatsList(params);
  }

  // ===== Public API =====
  return {
    init,
    getStatsList,
    getMetaInfo,
    getStatsData,
    getPrefecturePopulation,
    getAgingRate,
    searchStats,
    // expose for advanced use
    _request,
    _toArray,
  };
})();

// ES Module export (if bundler is used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EstatAPI;
}
