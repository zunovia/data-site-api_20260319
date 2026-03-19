/* ===== Japan Stats — Shared JS v2 ===== */
const APP_ID='6f7e88733e47d2ae3ddc010642412f04d8ca594c';
const API_BASE='https://api.e-stat.go.jp/rest/3.0/app/json';
const WIKI_API='https://ja.wikipedia.org/api/rest_v1';
const _isSubDir=window.location.pathname.includes('/pages/');
const _root=_isSubDir?'../':'';

// === 都道府県マスタデータ ===
const PREF_DATA={
"北海道":{code:"01",pop:5140,density:66,aging:33.4,area:78421,capital:"札幌市",governor:"鈴木直道",established:"1886年"},
"青森県":{code:"02",pop:1188,density:123,aging:34.6,area:9646,capital:"青森市",governor:"宮下宗一郎",established:"1871年"},
"岩手県":{code:"03",pop:1162,density:76,aging:35.0,area:15275,capital:"盛岡市",governor:"達増拓也",established:"1876年"},
"宮城県":{code:"04",pop:2265,density:311,aging:28.4,area:7282,capital:"仙台市",governor:"村井嘉浩",established:"1871年"},
"秋田県":{code:"05",pop:920,density:79,aging:39.0,area:11638,capital:"秋田市",governor:"佐竹敬久",established:"1871年"},
"山形県":{code:"06",pop:1035,density:111,aging:35.2,area:9323,capital:"山形市",governor:"吉村美栄子",established:"1876年"},
"福島県":{code:"07",pop:1771,density:128,aging:33.3,area:13784,capital:"福島市",governor:"内堀雅雄",established:"1876年"},
"茨城県":{code:"08",pop:2838,density:465,aging:30.4,area:6098,capital:"水戸市",governor:"大井川和彦",established:"1871年"},
"栃木県":{code:"09",pop:1903,density:297,aging:29.6,area:6408,capital:"宇都宮市",governor:"福田富一",established:"1873年"},
"群馬県":{code:"10",pop:1907,density:299,aging:30.5,area:6362,capital:"前橋市",governor:"山本一太",established:"1876年"},
"埼玉県":{code:"11",pop:7337,density:1932,aging:27.2,area:3798,capital:"さいたま市",governor:"大野元裕",established:"1871年"},
"千葉県":{code:"12",pop:6275,density:1217,aging:28.1,area:5158,capital:"千葉市",governor:"熊谷俊人",established:"1873年"},
"東京都":{code:"13",pop:14048,density:6439,aging:22.8,area:2194,capital:"新宿区",governor:"小池百合子",established:"1868年"},
"神奈川県":{code:"14",pop:9232,density:3824,aging:25.9,area:2416,capital:"横浜市",governor:"黒岩祐治",established:"1876年"},
"新潟県":{code:"15",pop:2135,density:170,aging:34.0,area:12584,capital:"新潟市",governor:"花角英世",established:"1876年"},
"富山県":{code:"16",pop:1013,density:238,aging:33.6,area:4248,capital:"富山市",governor:"新田八朗",established:"1883年"},
"石川県":{code:"17",pop:1111,density:265,aging:30.3,area:4186,capital:"金沢市",governor:"馳浩",established:"1872年"},
"福井県":{code:"18",pop:748,density:178,aging:31.5,area:4190,capital:"福井市",governor:"杉本達治",established:"1881年"},
"山梨県":{code:"19",pop:796,density:178,aging:31.4,area:4465,capital:"甲府市",governor:"長崎幸太郎",established:"1871年"},
"長野県":{code:"20",pop:2011,density:148,aging:33.5,area:13562,capital:"長野市",governor:"阿部守一",established:"1876年"},
"岐阜県":{code:"21",pop:1937,density:183,aging:31.2,area:10621,capital:"岐阜市",governor:"古田肇",established:"1876年"},
"静岡県":{code:"22",pop:3575,density:459,aging:30.7,area:7777,capital:"静岡市",governor:"鈴木康友",established:"1876年"},
"愛知県":{code:"23",pop:7495,density:1452,aging:25.3,area:5173,capital:"名古屋市",governor:"大村秀章",established:"1872年"},
"三重県":{code:"24",pop:1738,density:301,aging:30.7,area:5774,capital:"津市",governor:"一見勝之",established:"1876年"},
"滋賀県":{code:"25",pop:1408,density:350,aging:26.4,area:4017,capital:"大津市",governor:"三日月大造",established:"1872年"},
"京都府":{code:"26",pop:2542,density:552,aging:29.8,area:4612,capital:"京都市",governor:"西脇隆俊",established:"1868年"},
"大阪府":{code:"27",pop:8784,density:4612,aging:27.8,area:1905,capital:"大阪市",governor:"吉村洋文",established:"1868年"},
"兵庫県":{code:"28",pop:5382,density:641,aging:29.8,area:8401,capital:"神戸市",governor:"斎藤元彦",established:"1876年"},
"奈良県":{code:"29",pop:1306,density:354,aging:32.1,area:3691,capital:"奈良市",governor:"山下真",established:"1887年"},
"和歌山県":{code:"30",pop:901,density:191,aging:33.9,area:4725,capital:"和歌山市",governor:"岸本周平",established:"1871年"},
"鳥取県":{code:"31",pop:541,density:154,aging:33.0,area:3507,capital:"鳥取市",governor:"平井伸治",established:"1881年"},
"島根県":{code:"32",pop:650,density:97,aging:35.4,area:6708,capital:"松江市",governor:"丸山達也",established:"1881年"},
"岡山県":{code:"33",pop:1862,density:263,aging:30.6,area:7114,capital:"岡山市",governor:"伊原木隆太",established:"1876年"},
"広島県":{code:"34",pop:2737,density:323,aging:29.6,area:8479,capital:"広島市",governor:"湯崎英彦",established:"1876年"},
"山口県":{code:"35",pop:1304,density:213,aging:35.0,area:6112,capital:"山口市",governor:"村岡嗣政",established:"1871年"},
"徳島県":{code:"36",pop:700,density:169,aging:34.4,area:4147,capital:"徳島市",governor:"後藤田正純",established:"1880年"},
"香川県":{code:"37",pop:935,density:497,aging:32.2,area:1877,capital:"高松市",governor:"池田豊人",established:"1888年"},
"愛媛県":{code:"38",pop:1298,density:229,aging:33.8,area:5676,capital:"松山市",governor:"中村時広",established:"1873年"},
"高知県":{code:"39",pop:670,density:94,aging:36.1,area:7104,capital:"高知市",governor:"濵田省司",established:"1876年"},
"福岡県":{code:"40",pop:5115,density:1027,aging:27.8,area:4987,capital:"福岡市",governor:"服部誠太郎",established:"1876年"},
"佐賀県":{code:"41",pop:803,density:330,aging:31.0,area:2441,capital:"佐賀市",governor:"山口祥義",established:"1883年"},
"長崎県":{code:"42",pop:1280,density:309,aging:33.6,area:4131,capital:"長崎市",governor:"大石賢吾",established:"1876年"},
"熊本県":{code:"43",pop:1718,density:232,aging:31.5,area:7409,capital:"熊本市",governor:"木村敬",established:"1876年"},
"大分県":{code:"44",pop:1107,density:175,aging:33.9,area:6341,capital:"大分市",governor:"佐藤樹一郎",established:"1876年"},
"宮崎県":{code:"45",pop:1052,density:136,aging:33.1,area:7735,capital:"宮崎市",governor:"河野俊嗣",established:"1883年"},
"鹿児島県":{code:"46",pop:1560,density:170,aging:32.8,area:9187,capital:"鹿児島市",governor:"塩田康一",established:"1871年"},
"沖縄県":{code:"47",pop:1468,density:644,aging:22.6,area:2282,capital:"那覇市",governor:"玉城デニー",established:"1972年"}
};

// === API ===
async function fetchAPI(endpoint,params={}){const url=new URL(`${API_BASE}/${endpoint}`);url.searchParams.set('appId',APP_ID);Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));const res=await fetch(url.toString());if(!res.ok)throw new Error(`HTTP ${res.status}`);return res.json()}

async function checkAPI(){const badge=document.getElementById('api-badge');const btn=document.getElementById('refresh-btn');if(badge)badge.textContent='◌ ...';if(btn)btn.classList.add('loading');try{const d=await fetchAPI('getStatsList',{statsCode:'00200524',limit:'1',lang:'J'});if(d?.GET_STATS_LIST?.RESULT?.STATUS===0){if(badge){badge.textContent='● Live';badge.className='api-badge live'}}}catch{if(badge){badge.textContent='○ Offline';badge.className='api-badge'}}if(btn)btn.classList.remove('loading');const ts=document.getElementById('last-refresh');if(ts)ts.textContent='最終確認: '+new Date().toLocaleTimeString('ja-JP')}

// === Wikipedia API (写真+概要) ===
async function fetchWikiSummary(title){
  try{
    const res=await fetch(`${WIKI_API}/page/summary/${encodeURIComponent(title)}`);
    if(!res.ok)return null;
    return await res.json();
  }catch{return null}
}

// === 都道府県詳細モーダル ===
async function showPrefModal(prefName){
  // Remove trailing suffixes for lookup
  const name=prefName.replace(/[都道府県]$/g,'');
  const fullName=Object.keys(PREF_DATA).find(k=>k.startsWith(name))||prefName;
  const d=PREF_DATA[fullName];
  if(!d)return;

  // Create modal
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.onclick=()=>overlay.remove();

  const content=document.createElement('div');
  content.className='modal-content modal-wide';
  content.onclick=e=>e.stopPropagation();

  content.innerHTML=`
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
    <div class="modal-header-row">
      <div>
        <h2 class="modal-title">${fullName}</h2>
        <p class="modal-sub">${d.capital} / 設置: ${d.established}</p>
      </div>
      <div class="modal-governor">
        <div class="governor-photo" id="gov-photo-${d.code}"></div>
        <div><span class="modal-gov-label">知事</span><span class="modal-gov-name" id="gov-name-${d.code}">${d.governor}</span></div>
      </div>
    </div>
    <div class="modal-grid modal-grid-3">
      <div class="modal-stat"><span class="modal-stat-label">人口</span><span class="modal-stat-value">${d.pop.toLocaleString()}<small>千人</small></span></div>
      <div class="modal-stat"><span class="modal-stat-label">人口密度</span><span class="modal-stat-value">${d.density.toLocaleString()}<small>人/km²</small></span></div>
      <div class="modal-stat"><span class="modal-stat-label">高齢化率</span><span class="modal-stat-value">${d.aging}<small>%</small></span></div>
      <div class="modal-stat"><span class="modal-stat-label">面積</span><span class="modal-stat-value">${d.area.toLocaleString()}<small>km²</small></span></div>
      <div class="modal-stat"><span class="modal-stat-label">県庁所在地</span><span class="modal-stat-value" style="font-size:1rem">${d.capital}</span></div>
      <div class="modal-stat"><span class="modal-stat-label">都道府県コード</span><span class="modal-stat-value" style="font-size:1rem">${d.code}</span></div>
    </div>
    <div class="modal-wiki" id="wiki-${d.code}"><span class="modal-loading">Wikipedia情報を取得中...</span></div>
    <div class="modal-links">
      <a href="https://ja.wikipedia.org/wiki/${encodeURIComponent(fullName)}" target="_blank" rel="noopener" class="modal-link">Wikipedia →</a>
      <a href="https://www.e-stat.go.jp/regional-statistics/ssdsview/prefectures" target="_blank" rel="noopener" class="modal-link">e-Stat地域統計 →</a>
    </div>
    <p class="modal-source">出典: 総務省統計局「人口推計」(2024年)</p>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Fetch Wikipedia summary + photo
  const wiki=await fetchWikiSummary(fullName);
  const wikiEl=document.getElementById(`wiki-${d.code}`);
  if(wiki&&wikiEl){
    wikiEl.innerHTML=`<p class="wiki-extract">${wiki.extract||''}</p>`;
  }else if(wikiEl){
    wikiEl.innerHTML='';
  }

  // Governor photo from Wikipedia
  const govWiki=await fetchWikiSummary(d.governor);
  const photoEl=document.getElementById(`gov-photo-${d.code}`);
  if(govWiki?.thumbnail?.source&&photoEl){
    photoEl.style.backgroundImage=`url(${govWiki.thumbnail.source})`;
    photoEl.classList.add('has-photo');
  }
}

// === 政治家詳細モーダル ===
async function showPersonModal(name,role){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.onclick=()=>overlay.remove();

  const content=document.createElement('div');
  content.className='modal-content modal-wide';
  content.onclick=e=>e.stopPropagation();
  content.innerHTML=`
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
    <div class="person-loading"><span class="modal-loading">${name} の情報を取得中...</span></div>
  `;
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  const wiki=await fetchWikiSummary(name);
  if(wiki){
    content.innerHTML=`
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      <div class="person-header">
        ${wiki.thumbnail?`<div class="person-photo" style="background-image:url(${wiki.thumbnail.source})"></div>`:'<div class="person-photo person-no-photo"></div>'}
        <div>
          <h2 class="modal-title">${name}</h2>
          <p class="modal-sub">${role}</p>
        </div>
      </div>
      <p class="wiki-extract">${wiki.extract||'情報が見つかりませんでした。'}</p>
      <div class="modal-links">
        <a href="https://ja.wikipedia.org/wiki/${encodeURIComponent(name)}" target="_blank" rel="noopener" class="modal-link">Wikipedia →</a>
      </div>
    `;
  }else{
    content.querySelector('.person-loading').innerHTML='<p>情報を取得できませんでした。</p>';
  }
}

// === Scroll Reveal ===
function initScrollReveal(){const els=document.querySelectorAll('.fade-in');const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.08});els.forEach(el=>obs.observe(el))}

// === Counter ===
function animateCounter(el,target,dur=2500){const s=Date.now();(function t(){const p=Math.min((Date.now()-s)/dur,1);el.textContent=Math.floor(target*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(t)})()}

// === Particles ===
function initParticles(id){const c=document.getElementById(id);if(!c)return;const ctx=c.getContext('2d');let W=c.width=c.offsetWidth,H=c.height=c.offsetHeight;window.addEventListener('resize',()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight});class P{constructor(){this.r()}r(){this.x=Math.random()*W;this.y=Math.random()*H;this.s=Math.random()*1.6+.3;this.vx=(Math.random()-.5)*.25;this.vy=(Math.random()-.5)*.25;this.a=Math.random()*.35+.1;this.p=Math.random()*6.28}u(){this.x+=this.vx;this.y+=this.vy;this.p+=.008;this.a=.1+Math.sin(this.p)*.12;if(this.x<0||this.x>W||this.y<0||this.y>H)this.r()}d(){ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,6.28);ctx.fillStyle=`rgba(232,107,71,${this.a})`;ctx.fill()}}const ps=Array.from({length:70},()=>new P());(function l(){ctx.clearRect(0,0,W,H);ps.forEach(p=>{p.u();p.d()});for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.hypot(dx,dy);if(d<110){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle=`rgba(232,107,71,${.05*(1-d/110)})`;ctx.lineWidth=.4;ctx.stroke()}}requestAnimationFrame(l)})()}

// === HTML Generators ===
function headerHTML(){return`<header class="header"><a href="${_root}index.html" class="header-brand"><span class="header-logo">日本統計</span><span class="header-sub">JAPAN STATS</span></a><div class="header-right"><button class="refresh-btn" id="refresh-btn" onclick="checkAPI()"><svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke-linecap="round" stroke-linejoin="round"/></svg><span>更新</span></button><span class="api-badge" id="api-badge">◌</span></div></header>`}
function footerHTML(){return`<footer><p class="footer-brand"><a href="https://www.ryotakaneda.com/" target="_blank" rel="noopener noreferrer">Sur Communication Inc.</a></p><p>出典: 総務省統計局 / 厚生労働省 / 内閣府 | e-Stat API v3.0</p><p id="last-refresh"></p></footer>`}
function arrowSVG(){return'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>'}
function backHTML(){return`<a href="${_root}index.html" class="back-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>ホーム</span></a>`}

// === Pref Link (ハイパーリンク付き都道府県名) ===
function prefLink(name){return`<a href="javascript:void(0)" onclick="showPrefModal('${name}')" class="pref-link">${name}</a>`}

// === Charts ===
function createBarChart(el,data,labels,maxV,color){const mx=maxV||Math.max(...data);el.innerHTML='<div class="bar-chart">'+data.map((v,i)=>`<div class="bar-item"><div class="bar-track"><div class="bar-fill" style="height:${(v/mx)*100}%;background:${color}"></div></div><span class="bar-label">${labels[i]}</span></div>`).join('')+'</div>'}
function createHBar(el,items,color,maxV){const mx=maxV||Math.max(...items.map(i=>i.value));el.innerHTML='<div class="hbar-list">'+items.map(d=>`<div class="hbar-row"><span class="hbar-name">${d.link?`<a href="javascript:void(0)" onclick="${d.link}" class="pref-link">${d.name}</a>`:d.name}</span><div class="hbar-track"><div class="hbar-fill" style="width:${(d.value/mx)*100}%;background:${color}"></div></div><span class="hbar-val">${typeof d.value==='number'?d.value.toLocaleString():d.value}</span></div>`).join('')+'</div>'}

// === Init ===
document.addEventListener('DOMContentLoaded',()=>{initScrollReveal();checkAPI()});
