// =============================================
// データ鮮度の表示
//
// data/sources.json を読み、そのページの「最終更新」と「最終確認」を出す。
//
// この2つを分けているのが要点:
//   最終更新 = ページの数値が実際に変わった日
//   最終確認 = 出典を見に行った日（変化が無くても進む）
// 中身が変わっていないのに更新日だけを進めると、読む人に
// 「新しい情報だ」と誤解させることになる。だから分けて出す。
//
// 使い方: ページに <div id="freshness" data-page="キー"></div> を置き、
//         shared.js のあとにこのファイルを読み込む。
//
// 台帳の値は innerHTML に流さず、textContent で入れる。
// 将来この JSON を人手以外が書き換えるようになっても壊れないようにするため。
// =============================================
(() => {
    const mount = document.getElementById('freshness');
    if (!mount) return;

    const key = mount.dataset.page;
    if (!key) return;

    // shared.js が定義する _root（サブディレクトリなら '../'）を使う
    const root = (typeof _root === 'string') ? _root : '';

    const fmt = (iso) => {
        if (!iso) return '—';
        const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : '—';
    };

    const daysSince = (iso) => {
        const t = Date.parse(String(iso) + 'T00:00:00Z');
        return Number.isNaN(t) ? null : Math.floor((Date.now() - t) / 86400000);
    };

    // ラベル＋強調値のピルを1つ作る
    const pill = (label, value, stale) => {
        const el = document.createElement('span');
        el.className = stale ? 'fresh-pill is-stale' : 'fresh-pill';
        el.appendChild(document.createTextNode(label));
        if (value !== undefined) {
            const b = document.createElement('b');
            b.textContent = value;
            el.appendChild(b);
        }
        return el;
    };

    fetch(root + 'data/sources.json', { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
        .then((ledger) => {
            const page = (ledger.pages || []).find((p) => p.key === key);
            if (!page) return;

            const gap = daysSince(page.last_checked);
            // 40日以上確認していなければ、その事実も隠さず出す
            const stale = gap !== null && gap > 40;

            const sources = Array.isArray(page.sources) ? page.sources : [];
            const confirmed = sources.filter((s) => s.confidence === 'confirmed').length;

            const frag = document.createDocumentFragment();
            frag.appendChild(pill('最終更新 ', fmt(page.last_updated), false));
            frag.appendChild(pill('最終確認 ', fmt(page.last_checked), stale));
            if (sources.length) {
                frag.appendChild(pill('出典 ', `${confirmed}/${sources.length} 件が確認済`, false));
            }
            if (page.needs_inventory) {
                frag.appendChild(pill('出典の棚卸しが未了', undefined, true));
            }

            const note = document.createElement('span');
            note.className = 'fresh-note';
            note.textContent = '毎月1回、出典を確認しています。数値が変わったときだけ「最終更新」が進みます。';
            frag.appendChild(note);

            mount.className = 'freshness';
            mount.replaceChildren(frag);
        })
        .catch(() => {
            // 台帳が読めないときは何も出さない（嘘の更新日を出さないため）
        });
})();
