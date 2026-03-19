import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

type Section = 'home' | 'population' | 'income' | 'life' | 'explorer'
interface PrefData { code:string;name:string;pop:number;density:number;aging:number;area:number }

const APP_ID = '6f7e88733e47d2ae3ddc010642412f04d8ca594c'
const API_BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json'

// === API Functions (live data) ===
async function fetchFromAPI(endpoint: string, params: Record<string,string>) {
  const url = new URL(`${API_BASE}/${endpoint}`)
  url.searchParams.set('appId', APP_ID)
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function getStatsData(statsDataId: string, extra: Record<string,string> = {}) {
  return fetchFromAPI('getStatsData', { statsDataId, lang:'J', metaGetFlg:'Y', ...extra })
}

// === Static fallback data ===
const PREFS:PrefData[] = [
{code:"01000",name:"北海道",pop:5140,density:66,aging:33.4,area:78421},{code:"02000",name:"青森県",pop:1188,density:123,aging:34.6,area:9646},{code:"03000",name:"岩手県",pop:1162,density:76,aging:35.0,area:15275},{code:"04000",name:"宮城県",pop:2265,density:311,aging:28.4,area:7282},{code:"05000",name:"秋田県",pop:920,density:79,aging:39.0,area:11638},{code:"06000",name:"山形県",pop:1035,density:111,aging:35.2,area:9323},{code:"07000",name:"福島県",pop:1771,density:128,aging:33.3,area:13784},{code:"08000",name:"茨城県",pop:2838,density:465,aging:30.4,area:6098},{code:"09000",name:"栃木県",pop:1903,density:297,aging:29.6,area:6408},{code:"10000",name:"群馬県",pop:1907,density:299,aging:30.5,area:6362},{code:"11000",name:"埼玉県",pop:7337,density:1932,aging:27.2,area:3798},{code:"12000",name:"千葉県",pop:6275,density:1217,aging:28.1,area:5158},{code:"13000",name:"東京都",pop:14048,density:6439,aging:22.8,area:2194},{code:"14000",name:"神奈川県",pop:9232,density:3824,aging:25.9,area:2416},{code:"15000",name:"新潟県",pop:2135,density:170,aging:34.0,area:12584},{code:"16000",name:"富山県",pop:1013,density:238,aging:33.6,area:4248},{code:"17000",name:"石川県",pop:1111,density:265,aging:30.3,area:4186},{code:"18000",name:"福井県",pop:748,density:178,aging:31.5,area:4190},{code:"19000",name:"山梨県",pop:796,density:178,aging:31.4,area:4465},{code:"20000",name:"長野県",pop:2011,density:148,aging:33.5,area:13562},{code:"21000",name:"岐阜県",pop:1937,density:183,aging:31.2,area:10621},{code:"22000",name:"静岡県",pop:3575,density:459,aging:30.7,area:7777},{code:"23000",name:"愛知県",pop:7495,density:1452,aging:25.3,area:5173},{code:"24000",name:"三重県",pop:1738,density:301,aging:30.7,area:5774},{code:"25000",name:"滋賀県",pop:1408,density:350,aging:26.4,area:4017},{code:"26000",name:"京都府",pop:2542,density:552,aging:29.8,area:4612},{code:"27000",name:"大阪府",pop:8784,density:4612,aging:27.8,area:1905},{code:"28000",name:"兵庫県",pop:5382,density:641,aging:29.8,area:8401},{code:"29000",name:"奈良県",pop:1306,density:354,aging:32.1,area:3691},{code:"30000",name:"和歌山県",pop:901,density:191,aging:33.9,area:4725},{code:"31000",name:"鳥取県",pop:541,density:154,aging:33.0,area:3507},{code:"32000",name:"島根県",pop:650,density:97,aging:35.4,area:6708},{code:"33000",name:"岡山県",pop:1862,density:263,aging:30.6,area:7114},{code:"34000",name:"広島県",pop:2737,density:323,aging:29.6,area:8479},{code:"35000",name:"山口県",pop:1304,density:213,aging:35.0,area:6112},{code:"36000",name:"徳島県",pop:700,density:169,aging:34.4,area:4147},{code:"37000",name:"香川県",pop:935,density:497,aging:32.2,area:1877},{code:"38000",name:"愛媛県",pop:1298,density:229,aging:33.8,area:5676},{code:"39000",name:"高知県",pop:670,density:94,aging:36.1,area:7104},{code:"40000",name:"福岡県",pop:5115,density:1027,aging:27.8,area:4987},{code:"41000",name:"佐賀県",pop:803,density:330,aging:31.0,area:2441},{code:"42000",name:"長崎県",pop:1280,density:309,aging:33.6,area:4131},{code:"43000",name:"熊本県",pop:1718,density:232,aging:31.5,area:7409},{code:"44000",name:"大分県",pop:1107,density:175,aging:33.9,area:6341},{code:"45000",name:"宮崎県",pop:1052,density:136,aging:33.1,area:7735},{code:"46000",name:"鹿児島県",pop:1560,density:170,aging:32.8,area:9187},{code:"47000",name:"沖縄県",pop:1468,density:644,aging:22.6,area:2282}
]

const POP_TREND = {labels:["2000","2005","2010","2015","2020","2024"],total:[126926,127768,128057,127095,126146,123802]}

// === Particle Canvas for Hero ===
function ParticleHero({children}:{children:React.ReactNode}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const c = canvasRef.current; if(!c) return
    const ctx = c.getContext('2d'); if(!ctx) return
    let W = c.width = c.offsetWidth, H = c.height = c.offsetHeight
    const handleResize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight }
    window.addEventListener('resize', handleResize)

    class Particle {
      x:number;y:number;r:number;vx:number;vy:number;alpha:number;pulse:number
      constructor(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*1.8+0.3;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.alpha=Math.random()*.4+.1;this.pulse=Math.random()*Math.PI*2}
      update(){this.x+=this.vx;this.y+=this.vy;this.pulse+=.01;this.alpha=.1+Math.sin(this.pulse)*.15;if(this.x<0||this.x>W||this.y<0||this.y>H){this.x=Math.random()*W;this.y=Math.random()*H}}
      draw(){ctx!.beginPath();ctx!.arc(this.x,this.y,this.r,0,Math.PI*2);ctx!.fillStyle=`rgba(200,90,62,${this.alpha})`;ctx!.fill()}
    }

    const particles = Array.from({length:80}, ()=>new Particle())
    const loop = () => {
      ctx.clearRect(0,0,W,H)
      particles.forEach(p=>{p.update();p.draw()})
      for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(200,90,62,${.06*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke()}
      }
      animRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', handleResize) }
  }, [])

  return (
    <div className="hero-wrap">
      <canvas ref={canvasRef} className="hero-canvas"/>
      <div className="hero-overlay"/>
      <div className="hero-content">{children}</div>
      <div className="hero-scroll"><span>Scroll</span></div>
    </div>
  )
}

// === Components ===
function AnimNum({target,suffix=''}:{target:number;suffix?:string}){
  const [cur,setCur]=useState(0);const ref=useRef<HTMLSpanElement>(null);const started=useRef(false)
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!started.current){started.current=true;const s=Date.now();const run=()=>{const p=Math.min((Date.now()-s)/2500,1);setCur(Math.floor(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(run)};run()}},{threshold:0.3})
    if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()
  },[target]);return <span ref={ref}>{cur.toLocaleString()}{suffix}</span>
}

function FadeIn({children,className='',delay=0}:{children:React.ReactNode;className?:string;delay?:number}){
  const ref=useRef<HTMLDivElement>(null);const [vis,setVis]=useState(false)
  useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true)},{threshold:0.12});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[])
  return <div ref={ref} className={className} style={{opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(36px)',transition:`opacity .8s ease ${delay}s, transform .8s ease ${delay}s`}}>{children}</div>
}

function NavItem({label,sublabel,onClick,accent}:{label:string;sublabel:string;onClick:()=>void;accent:string}){
  return <button onClick={onClick} className="nav-item" style={{'--accent':accent} as React.CSSProperties}>
    <div className="nav-item-inner"><span className="nav-sublabel">{sublabel}</span><span className="nav-label">{label}</span></div>
    <div className="nav-arrow"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
  </button>
}

function PrefGrid({data,metric,onSelect}:{data:PrefData[];metric:'pop'|'aging'|'density';onSelect:(p:PrefData)=>void}){
  const pos:number[][]=[[0,10,1],[1,9,3],[2,9,4],[3,9,5],[4,8,4],[5,8,5],[6,9,6],[7,9,7],[8,8,6],[9,7,6],[10,8,7],[11,9,8],[12,8,8],[13,9,9],[14,7,5],[15,6,5],[16,5,5],[17,5,6],[18,7,7],[19,6,7],[20,6,6],[21,7,9],[22,6,8],[23,6,9],[24,5,7],[25,4,7],[26,4,8],[27,3,8],[28,5,8],[29,4,9],[30,3,6],[31,2,6],[32,3,7],[33,2,7],[34,1,7],[35,4,10],[36,4,11],[37,3,10],[38,3,11],[39,1,9],[40,0,9],[41,0,10],[42,1,10],[43,2,9],[44,2,10],[45,1,11],[46,0,13]]
  const gv=(p:PrefData)=>metric==='pop'?p.pop:metric==='aging'?p.aging:p.density
  const vals=data.map(gv),mx=Math.max(...vals),mn=Math.min(...vals)
  const gc=(v:number)=>{const r=(v-mn)/(mx-mn);return metric==='aging'?`hsl(${15-r*15},${55+r*30}%,${70-r*30}%)`:`hsl(${210-r*30},${40+r*25}%,${72-r*35}%)`}
  return <div className="pref-grid">{pos.map(([i,c,r])=>{const p=data[i];if(!p)return null;return <button key={p.code} className="pref-cell" style={{gridColumn:c+1,gridRow:r,backgroundColor:gc(gv(p))}} onClick={()=>onSelect(p)} title={p.name}><span>{p.name.replace(/[県都府]$/,'').slice(0,2)}</span></button>})}</div>
}

function PrefDetail({pref,onClose}:{pref:PrefData|null;onClose:()=>void}){
  if(!pref)return null
  return <div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}>×</button>
    <h2 className="modal-title">{pref.name}</h2>
    <div className="modal-grid">
      <div className="modal-stat"><span className="modal-stat-label">人口</span><span className="modal-stat-value">{pref.pop.toLocaleString()}<small>千人</small></span></div>
      <div className="modal-stat"><span className="modal-stat-label">人口密度</span><span className="modal-stat-value">{pref.density.toLocaleString()}<small>人/km²</small></span></div>
      <div className="modal-stat"><span className="modal-stat-label">高齢化率</span><span className="modal-stat-value">{pref.aging}<small>%</small></span></div>
      <div className="modal-stat"><span className="modal-stat-label">面積</span><span className="modal-stat-value">{pref.area.toLocaleString()}<small>km²</small></span></div>
    </div>
    <p className="modal-source">出典: 総務省統計局「人口推計」(2024年)</p>
  </div></div>
}

function BarChart({data,labels,maxVal,color='var(--accent-pop)'}:{data:number[];labels:string[];maxVal?:number;color?:string}){
  const mx=maxVal||Math.max(...data)
  return <div className="bar-chart">{data.map((v,i)=><div key={i} className="bar-item"><div className="bar-track"><div className="bar-fill" style={{height:`${(v/mx)*100}%`,backgroundColor:color}}/></div><span className="bar-label">{labels[i]}</span></div>)}</div>
}

// === MAIN APP ===
export default function App(){
  const [section,setSection]=useState<Section>('home')
  const [selectedPref,setSelectedPref]=useState<PrefData|null>(null)
  const [metric,setMetric]=useState<'pop'|'aging'|'density'>('pop')
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  const [apiStatus,setApiStatus]=useState<'checking'|'live'|'offline'>('checking')

  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme)},[theme])

  // Check API availability on mount
  useEffect(()=>{
    (async()=>{
      try{
        const d=await fetchFromAPI('getStatsList',{statsCode:'00200524',limit:'1',lang:'J'})
        setApiStatus(d?.GET_STATS_LIST?.RESULT?.STATUS===0?'live':'offline')
      }catch{setApiStatus('offline')}
    })()
  },[])

  const header=(<header className="header">
    <div className="header-brand" onClick={()=>setSection('home')}><span className="header-logo">日本統計</span><span className="header-sub">JAPAN STATS</span></div>
    <div className="header-right">
      <span className={`api-badge ${apiStatus}`}>{apiStatus==='live'?'● API Live':apiStatus==='checking'?'◌ Checking...':'○ Offline'}</span>
      <button className="theme-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?'☀':'☽'}</button>
    </div>
  </header>)

  const back=<button className="back-btn" onClick={()=>setSection('home')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg><span>戻る</span></button>

  const footer=(<footer className="footer">
    <p className="footer-brand"><a href="https://www.ryotakaneda.com/" target="_blank" rel="noopener noreferrer">Sur Communication Inc.</a></p>
    <p>出典: 総務省統計局 / 厚生労働省 | e-Stat API v3.0</p>
  </footer>)

  if(section==='home')return(
    <div className="app">
      {header}
      <ParticleHero>
        <p className="hero-eyebrow anim-fade" style={{animationDelay:'.3s'}}>Total Population of Japan — 2024</p>
        <h1 className="hero-number anim-fade" style={{animationDelay:'.5s'}}><AnimNum target={123802}/><span className="hero-unit">千人</span></h1>
        <p className="hero-delta anim-fade" style={{animationDelay:'.8s'}}>前年比 ▼ 550千人（−0.44%）</p>
        <div className="hero-chips anim-fade" style={{animationDelay:'1s'}}>
          <span className="chip">65歳以上 29.3%</span><span className="chip">15歳未満 11.2%</span><span className="chip">外国人 374万人</span>
        </div>
      </ParticleHero>

      <section className="nav-section">
        <FadeIn><p className="section-eyebrow">Data Sections</p><h2 className="section-title">データを探す</h2></FadeIn>
        <div className="nav-list">
          <FadeIn delay={.1}><NavItem label="人口" sublabel="Population" onClick={()=>setSection('population')} accent="#c85a3e"/></FadeIn>
          <FadeIn delay={.2}><NavItem label="年収" sublabel="Income" onClick={()=>setSection('income')} accent="#3e8ac8"/></FadeIn>
          <FadeIn delay={.3}><NavItem label="暮らし" sublabel="Living" onClick={()=>setSection('life')} accent="#5aad6a"/></FadeIn>
          <FadeIn delay={.4}><NavItem label="データ探索" sublabel="Explorer" onClick={()=>setSection('explorer')} accent="#b08a3e"/></FadeIn>
        </div>
      </section>
      <section className="trend-section">
        <FadeIn><p className="section-eyebrow">Population Trend</p><h2 className="section-title">人口推移</h2></FadeIn>
        <FadeIn delay={.2}><BarChart data={POP_TREND.total} labels={POP_TREND.labels} maxVal={130000}/></FadeIn>
        <FadeIn delay={.35}><p className="trend-note">日本の総人口は2008年の1億2,808万人をピークに減少が続いています</p></FadeIn>
      </section>
      {footer}
    </div>
  )

  if(section==='population')return(
    <div className="app page-population">{header}{back}
      <section className="page-hero"><FadeIn><p className="section-eyebrow">Population</p><h1 className="page-title">人口</h1><p className="page-desc">47都道府県の人口・高齢化率・人口密度をマップで視覚化</p></FadeIn></section>
      <section className="metric-switch">
        <button className={metric==='pop'?'active':''} onClick={()=>setMetric('pop')}>人口</button>
        <button className={metric==='aging'?'active':''} onClick={()=>setMetric('aging')}>高齢化率</button>
        <button className={metric==='density'?'active':''} onClick={()=>setMetric('density')}>人口密度</button>
      </section>
      <FadeIn><PrefGrid data={PREFS} metric={metric} onSelect={setSelectedPref}/></FadeIn>
      <section className="ranking-section"><FadeIn><h3 className="ranking-title">{metric==='pop'?'人口':metric==='aging'?'高齢化率':'人口密度'} ランキング Top 10</h3></FadeIn>
        <div className="ranking-list">{[...PREFS].sort((a,b)=>{const av=metric==='pop'?a.pop:metric==='aging'?a.aging:a.density;const bv=metric==='pop'?b.pop:metric==='aging'?b.aging:b.density;return bv-av}).slice(0,10).map((p,i)=>(
          <FadeIn key={p.code} delay={i*.05}><button className="ranking-item" onClick={()=>setSelectedPref(p)}><span className="ranking-num">{String(i+1).padStart(2,'0')}</span><span className="ranking-name">{p.name}</span><span className="ranking-value">{metric==='pop'?`${p.pop.toLocaleString()}千人`:metric==='aging'?`${p.aging}%`:`${p.density.toLocaleString()}人/km²`}</span></button></FadeIn>
        ))}</div>
      </section>
      <PrefDetail pref={selectedPref} onClose={()=>setSelectedPref(null)}/>
      {footer}
    </div>
  )

  if(section==='income'){
    const inc=[{p:'東京都',v:620},{p:'神奈川県',v:544},{p:'大阪府',v:531},{p:'愛知県',v:519},{p:'京都府',v:502},{p:'兵庫県',v:495},{p:'埼玉県',v:490},{p:'千葉県',v:487},{p:'福岡県',v:463},{p:'広島県',v:459}]
    return(<div className="app page-income">{header}{back}
      <section className="page-hero"><FadeIn><p className="section-eyebrow">Income</p><h1 className="page-title">年収</h1><p className="page-desc">都道府県別の平均年収ランキング（賃金構造基本統計調査）</p></FadeIn></section>
      <section className="income-chart">{inc.map((d,i)=><FadeIn key={d.p} delay={i*.06}><div className="income-bar-row"><span className="income-rank">{String(i+1).padStart(2,'0')}</span><span className="income-pref">{d.p}</span><div className="income-bar-track"><div className="income-bar-fill" style={{width:`${(d.v/650)*100}%`}}/></div><span className="income-value">{d.v}<small>万円</small></span></div></FadeIn>)}</section>
      <FadeIn delay={.3}><section className="income-note"><h3>年収データについて</h3><p>厚生労働省「賃金構造基本統計調査」をもとに都道府県別の平均年収を算出。転職サイトや就活メディアで最も引用される統計データの一つです。</p></section></FadeIn>
      {footer}
    </div>)
  }

  if(section==='life'){
    const items=[{item:'ラーメン',top:'山形市',v:18834},{item:'餃子',top:'宮崎市',v:4184},{item:'カレー',top:'鳥取市',v:11338},{item:'コーヒー',top:'京都市',v:16265},{item:'パン',top:'神戸市',v:42237},{item:'牛肉',top:'京都市',v:34517}]
    const cpi={l:['2018','2019','2020','2021','2022','2023','2024'],v:[99.3,99.8,100.0,99.8,102.3,105.8,108.5]}
    return(<div className="app page-life">{header}{back}
      <section className="page-hero"><FadeIn><p className="section-eyebrow">Living</p><h1 className="page-title">暮らし</h1><p className="page-desc">家計調査の品目別支出ランキングと消費者物価指数</p></FadeIn></section>
      <section className="life-ranking"><FadeIn><h3 className="life-subtitle">品目別支出 No.1 都市</h3></FadeIn>
        <div className="life-grid">{items.map((d,i)=><FadeIn key={d.item} delay={i*.08}><div className="life-card"><span className="life-item">{d.item}</span><span className="life-city">{d.top}</span><span className="life-amount">{d.v.toLocaleString()}<small>円/年</small></span></div></FadeIn>)}</div>
      </section>
      <section className="cpi-section"><FadeIn><h3 className="life-subtitle">消費者物価指数（CPI）推移</h3><p className="cpi-base">2020年基準 = 100.0</p></FadeIn><FadeIn delay={.2}><BarChart data={cpi.v} labels={cpi.l} maxVal={115} color="var(--accent-life)"/></FadeIn></section>
      {footer}
    </div>)
  }

  return(<div className="app page-explorer">{header}{back}
    <section className="page-hero"><FadeIn><p className="section-eyebrow">Explorer</p><h1 className="page-title">データ探索</h1><p className="page-desc">e-Stat APIで700以上の統計データを自由に検索</p></FadeIn></section>
    <FadeIn delay={.2}><section className="explorer-info"><h3>e-Stat API v3.0 — リアルタイム接続</h3><p>このサイトはクライアントサイドJavaScriptからe-Stat APIに直接アクセスし、常に最新データを取得する設計です。</p>
      <div className="explorer-links"><a href="https://www.e-stat.go.jp/" target="_blank" rel="noopener noreferrer" className="explorer-link">e-Stat →</a><a href="https://www.e-stat.go.jp/api/" target="_blank" rel="noopener noreferrer" className="explorer-link">API機能 →</a><a href="https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0" target="_blank" rel="noopener noreferrer" className="explorer-link">仕様書 v3.0 →</a></div>
    </section></FadeIn>
    <FadeIn delay={.35}><section className="explorer-codes"><h3>主要統計コード</h3><div className="code-list">
      {[{c:'00200521',n:'国勢調査',o:'総務省'},{c:'00200524',n:'人口推計',o:'総務省'},{c:'00200532',n:'労働力調査',o:'総務省'},{c:'00200573',n:'消費者物価指数',o:'総務省'},{c:'00200561',n:'家計調査',o:'総務省'},{c:'00450091',n:'賃金構造基本統計調査',o:'厚労省'}].map(s=><div className="code-item" key={s.c}><code>{s.c}</code><span>{s.n}</span><small>{s.o}</small></div>)}
    </div></section></FadeIn>
    {footer}
  </div>)
}
