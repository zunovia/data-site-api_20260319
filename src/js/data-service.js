/**
 * Data Service Layer
 * ==================
 * API呼び出しとフォールバックデータの統合レイヤー
 * - まずAPIを試行 → 失敗時は静的データにフォールバック
 * - データ変換・正規化を担当
 */

const DataService = (() => {
  let _apiAvailable = null; // null=未検証, true/false
  const _cache = {};

  // ===== API疎通テスト =====
  async function checkApiAvailability() {
    if (_apiAvailable !== null) return _apiAvailable;
    try {
      const data = await EstatAPI.getStatsList({
        statsCode: '00200524',
        limit: 1,
      });
      _apiAvailable = data.total > 0;
    } catch {
      _apiAvailable = false;
    }
    console.log(`[DataService] API available: ${_apiAvailable}`);
    return _apiAvailable;
  }

  // ===== キャッシュ付きデータ取得 =====
  async function _cachedFetch(key, apiFn, fallbackFn) {
    if (_cache[key]) return _cache[key];

    try {
      if (await checkApiAvailability()) {
        const data = await apiFn();
        _cache[key] = data;
        return data;
      }
    } catch (e) {
      console.warn(`[DataService] API failed for ${key}:`, e.message);
    }

    // フォールバック
    const data = fallbackFn();
    _cache[key] = data;
    return data;
  }

  // ===== 都道府県データ =====
  async function getPrefectures() {
    return _cachedFetch('prefectures',
      // API版
      async () => {
        const result = await EstatAPI.getPrefecturePopulation();
        // APIレスポンスを正規化
        return result.values
          .filter(v => v.area_code && v.area_code !== '00000')
          .map(v => ({
            code: v.area_code,
            name: v.area_name,
            pop: parseFloat(v.value) || 0,
          }));
      },
      // フォールバック
      () => StaticData.prefectures.map(p => ({
        code: p.code,
        name: p.name,
        pop: p.pop,
        density: p.density,
        aging: p.aging,
        area: p.area,
      }))
    );
  }

  // ===== 人口推移データ =====
  async function getPopulationTrend() {
    return _cachedFetch('popTrend',
      async () => {
        // API版: 直近の年次人口データ
        const result = await EstatAPI.getStatsData({
          statsDataId: '0003412313',
          cdArea: '00000',
          limit: 500,
        });
        // 年次ごとに集計
        const byYear = {};
        result.values.forEach(v => {
          const year = v.time_name || v.time_code;
          if (year && v.value) {
            byYear[year] = parseFloat(v.value);
          }
        });
        return byYear;
      },
      () => {
        const t = StaticData.populationTrend;
        const result = {};
        t.labels.forEach((y, i) => { result[y] = t.total[i]; });
        return result;
      }
    );
  }

  // ===== 年齢構成データ =====
  function getAgeComposition() {
    return StaticData.ageRatio;
  }

  // ===== 経済指標データ =====
  function getEconomicIndicators() {
    return StaticData.economy;
  }

  // ===== ヘッドライン数値 =====
  function getHeadline() {
    return StaticData.headline;
  }

  // ===== 都道府県マップ座標 =====
  function getMapGrid() {
    return StaticData.mapGrid;
  }

  // ===== API直接呼出し（Explorer用） =====
  async function rawApiCall(statsDataId, params = {}) {
    return EstatAPI.getStatsData({
      statsDataId,
      ...params,
    });
  }

  // ===== Public API =====
  return {
    checkApiAvailability,
    getPrefectures,
    getPopulationTrend,
    getAgeComposition,
    getEconomicIndicators,
    getHeadline,
    getMapGrid,
    rawApiCall,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataService;
}
