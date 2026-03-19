import { useState, useEffect, useRef } from 'react'
import './App.css'

type Section = 'home'|'population'|'income'|'life'|'politics'|'medical'|'npo'|'explorer'
interface PrefData { code:string;name:string;pop:number;density:number;aging:number;area:number }

const APP_ID = '6f7e88733e47d2ae3ddc010642412f04d8ca594c'
const API_BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json'

async function fetchAPI(endpoint:string, params:Record<string,string>) {
  const url = new URL(`${API_BASE}/${endpoint}`)
  url.searchParams.set('appId', APP_ID)
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// === Static Data ===
const PREFS:PrefData[] = [
{code:"01000",name:"北海道",pop:5140,density:66,aging:33.4,area:78421},{code:"02000",name:"青森県",pop:1188,density:123,aging:34.6,area:9646},{code:"03000",name:"岩手県",pop:1162,density:76,aging:35.0,area:15275},{code:"04000",name:"宮城県",pop:2265,density:311,aging:28.4,area:7282},{code:"05000",name:"秋田県",pop:920,density:79,aging:39.0,area:11638},{code:"06000",name:"山形県",pop:1035,density:111,aging:35.2,area:9323},{code:"07000",name:"福島県",pop:1771,density:128,aging:33.3,area:13784},{code:"08000",name:"茨城県",pop:2838,density:465,aging:30.4,area:6098},{code:"09000",name:"栃木県",pop:1903,density:297,aging:29.6,area:6408},{code:"10000",name:"群馬県",pop:1907,density:299,aging:30.5,area:6362},{code:"11000",name:"埼玉県",pop:7337,density:1932,aging:27.2,area:3798},{code:"12000",name:"千葉県",pop:6275,density:1217,aging:28.1,area:5158},{code:"13000",name:"東京都",pop:14048,density:6439,aging:22.8,area:2194},{code:"14000",name:"神奈川県",pop:9232,density:3824,aging:25.9,area:2416},{code:"15000",name:"新潟県",pop:2135,density:170,aging:34.0,area:12584},{code:"16000",name:"富山県",pop:1013,density:238,aging:33.6,area:4248},{code:"17000",name:"石川県",pop:1111,density:265,aging:30.3,area:4186},{code:"18000",name:"福井県",pop:748,density:178,aging:31.5,area:4190},{code:"19000",name:"山梨県",pop:796,density:178,aging:31.4,area:4465},{code:"20000",name:"長野県",pop:2011,density:148,aging:33.5,area:13562},{code:"21000",name:"岐阜県",pop:1937,density:183,aging:31.2,area:10621},{code:"22000",name:"静岡県",pop:3575,density:459,aging:30.7,area:7777},{code:"23000",name:"愛知県",pop:7495,density:1452,aging:25.3,area:5173},{code:"24000",name:"三重県",pop:1738,density:301,aging:30.7,area:5774},{code:"25000",name:"滋賀県",pop:1408,density:350,aging:26.4,area:4017},{code:"26000",name:"京都府",pop:2542,density:552,aging:29.8,area:4612},{code:"27000",name:"大阪府",pop:8784,density:4612,aging:27.8,area:1905},{code:"28000",name:"兵庫県",pop:5382,density:641,aging:29.8,area:8401},{code:"29000",name:"奈良県",pop:1306,density:354,aging:32.1,area:3691},{code:"30000",name:"和歌山県",pop:901,density:191,aging:33.9,area:4725},{code:"31000",name:"鳥取県",pop:541,density:154,aging:33.0,area:3507},{code:"32000",name:"島根県",pop:650,density:97,aging:35.4,area:6708},{code:"33000",name:"岡山県",pop:1862,density:263,aging:30.6,area:7114},{code:"34000",name:"広島県",pop:2737,density:323,aging:29.6,area:8479},{code:"35000",name:"山口県",pop:1304,density:213,aging:35.0,area:6112},{code:"36000",name:"徳島県",pop:700,density:169,aging:34.4,area:4147},{code:"37000",name:"香川県",pop:935,density:497,aging:32.2,area:1877},{code:"38000",name:"愛媛県",pop:1298,density:229,aging:33.8,area:5676},{code:"39000",name:"高知県",pop:670,density:94,aging:36.1,area:7104},{code:"40000",name:"福岡県",pop:5115,density:1027,aging:27.8,area:4987},{code:"41000",name:"佐賀県",pop:803,density:330,aging:31.0,area:2441},{code:"42000",name:"長崎県",pop:1280,density:309,aging:33.6,area:4131},{code:"43000",name:"熊本県",pop:1718,density:232,aging:31.5,area:7409},{code:"44000",name:"大分県",pop:1107,density:175,aging:33.9,area:6341},{code:"45000",name:"宮崎県",pop:1052,density:136,aging:33.1,area:7735},{code:"46000",name:"鹿児島県",pop:1560,density:170,aging:32.8,area:9187},{code:"47000",name:"沖縄県",pop:1468,density:644,aging:22.6,area:2282}]

const POP_TREND={labels:["2000","2005","2010","2015","2020","2024"],total:[126926,127768,128057,127095,126146,123802]}

// === Particle Canvas ===
function ParticleHero({children}:{children:React.ReactNode}){
  const canvasRef=useRef<HTMLCanvasElement>(null),animRef=useRef<number>(0)
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return
    let W=c.width=c.offsetWidth,H=c.height=c.offsetHeight
    const onResize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight}
    window.addEventListener('resize',onResize)
    class P{x:number;y:number;r:number;vx:number;vy:number;a:number;p:number;constructor(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*1.8+.3;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.a=Math.random()*.4+.1;this.p=Math.random()*Math.PI*2}update(){this.x+=this.vx;this.y+=this.vy;this.p+=.01;this.a=.1+Math.sin(this.p)*.15;if(this.x<0||this.x>W||this.y<0||this.y>H){this.x=Math.random()*W;this.y=Math.random()*H}}draw(){ctx!.beginPath();ctx!.arc(this.x,this.y,this.r,0,Math.PI*2);ctx!.fillStyle=`rgba(200,90,62,${this.a})`;ctx!.fill()}}
    const ps=Array.from({length:80},()=>new P())
    const loop=()=>{ctx.clearRect(0,0,W,H);ps.forEach(p=>{p.update();p.draw()});for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle=`rgba(200,90,62,${.06*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke()}};animRef.current=requestAnimationFrame(loop)};loop()
    return()=>{cancelAnimationFrame(animRef.current);window.removeEventListener('resize',onResize)}
  },[])
  return <div className="hero-wrap"><canvas ref={canvasRef} className="hero-canvas"/><div className="hero-overlay"/><div className="hero-content">{children}</div><div className="hero-scroll"><span>Scroll</span></div></div>
}

// === Components ===
function AnimNum({target,suffix=''}:{target:number;suffix?:string}){const[cur,setCur]=useState(0);const ref=useRef<HTMLSpanElement>(null),started=useRef(false);useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!started.current){started.current=true;const s=Date.now();const run=()=>{const p=Math.min((Date.now()-s)/2500,1);setCur(Math.floor(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(run)};run()}},{threshold:.3});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[target]);return<span ref={ref}>{cur.toLocaleString()}{suffix}</span>}

function FadeIn({children,className='',delay=0}:{children:React.ReactNode;className?:string;delay?:number}){const ref=useRef<HTMLDivElement>(null);const[vis,setVis]=useState(false);useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true)},{threshold:.12});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect()},[]);return<div ref={ref} className={className} style={{opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(36px)',transition:`opacity .8s ease ${delay}s, transform .8s ease ${delay}s`}}>{children}</div>}

function NavItem({label,sublabel,onClick,accent}:{label:string;sublabel:string;onClick:()=>void;accent:string}){return<button onClick={onClick} className="nav-item" style={{'--accent':accent} as React.CSSProperties}><div className="nav-item-inner"><span className="nav-sublabel">{sublabel}</span><span className="nav-label">{label}</span></div><div className="nav-arrow"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg></div></button>}

function PrefGrid({data,metric,onSelect}:{data:PrefData[];metric:'pop'|'aging'|'density';onSelect:(p:PrefData)=>void}){const pos:number[][]=[[0,10,1],[1,9,3],[2,9,4],[3,9,5],[4,8,4],[5,8,5],[6,9,6],[7,9,7],[8,8,6],[9,7,6],[10,8,7],[11,9,8],[12,8,8],[13,9,9],[14,7,5],[15,6,5],[16,5,5],[17,5,6],[18,7,7],[19,6,7],[20,6,6],[21,7,9],[22,6,8],[23,6,9],[24,5,7],[25,4,7],[26,4,8],[27,3,8],[28,5,8],[29,4,9],[30,3,6],[31,2,6],[32,3,7],[33,2,7],[34,1,7],[35,4,10],[36,4,11],[37,3,10],[38,3,11],[39,1,9],[40,0,9],[41,0,10],[42,1,10],[43,2,9],[44,2,10],[45,1,11],[46,0,13]];const gv=(p:PrefData)=>metric==='pop'?p.pop:metric==='aging'?p.aging:p.density;const vals=data.map(gv),mx=Math.max(...vals),mn=Math.min(...vals);const gc=(v:number)=>{const r=(v-mn)/(mx-mn);return metric==='aging'?`hsl(${15-r*15},${55+r*30}%,${70-r*30}%)`:`hsl(${210-r*30},${40+r*25}%,${72-r*35}%)`};return<div className="pref-grid">{pos.map(([i,c,r])=>{const p=data[i];if(!p)return null;return<button key={p.code} className="pref-cell" style={{gridColumn:c+1,gridRow:r,backgroundColor:gc(gv(p))}} onClick={()=>onSelect(p)} title={p.name}><span>{p.name.replace(/[県都府]$/,'').slice(0,2)}</span></button>})}</div>}

function PrefDetail({pref,onClose}:{pref:PrefData|null;onClose:()=>void}){if(!pref)return null;return<div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><h2 className="modal-title">{pref.name}</h2><div className="modal-grid"><div className="modal-stat"><span className="modal-stat-label">人口</span><span className="modal-stat-value">{pref.pop.toLocaleString()}<small>千人</small></span></div><div className="modal-stat"><span className="modal-stat-label">人口密度</span><span className="modal-stat-value">{pref.density.toLocaleString()}<small>人/km²</small></span></div><div className="modal-stat"><span className="modal-stat-label">高齢化率</span><span className="modal-stat-value">{pref.aging}<small>%</small></span></div><div className="modal-stat"><span className="modal-stat-label">面積</span><span className="modal-stat-value">{pref.area.toLocaleString()}<small>km²</small></span></div></div><p className="modal-source">出典: 総務省統計局「人口推計」(2024年)</p></div></div>}

function BarChart({data,labels,maxVal,color='var(--accent-pop)'}:{data:number[];labels:string[];maxVal?:number;color?:string}){const mx=maxVal||Math.max(...data);return<div className="bar-chart">{data.map((v,i)=><div key={i} className="bar-item"><div className="bar-track"><div className="bar-fill" style={{height:`${(v/mx)*100}%`,backgroundColor:color}}/></div><span className="bar-label">{labels[i]}</span></div>)}</div>}

// === Stat Card Component ===
function StatCard({label,value,unit,accent='var(--fg)'}:{label:string;value:string|number;unit?:string;accent?:string}){return<div className="stat-card"><span className="stat-card-label">{label}</span><span className="stat-card-value" style={{color:accent}}>{typeof value==='number'?value.toLocaleString():value}{unit&&<small>{unit}</small>}</span></div>}

// === Horizontal Bar ===
function HBar({items,maxVal,color}:{items:{name:string;value:number}[];maxVal?:number;color:string}){const mx=maxVal||Math.max(...items.map(i=>i.value));return<div className="hbar-list">{items.map((d,i)=><div key={i} className="hbar-row"><span className="hbar-name">{d.name}</span><div className="hbar-track"><div className="hbar-fill" style={{width:`${(d.value/mx)*100}%`,backgroundColor:color}}/></div><span className="hbar-val">{d.value.toLocaleString()}</span></div>)}</div>}

// === Refresh Button ===
function RefreshButton({onClick,loading}:{onClick:()=>void;loading:boolean}){return<button className="refresh-btn" onClick={onClick} disabled={loading}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading?'spin':''}><path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{loading?'更新中...':'データ更新'}</span></button>}

// === MAIN APP ===
export default function App(){
  const [section,setSection]=useState<Section>('home')
  const [selectedPref,setSelectedPref]=useState<PrefData|null>(null)
  const [metric,setMetric]=useState<'pop'|'aging'|'density'>('pop')
  const [theme,setTheme]=useState<'dark'|'light'>('dark')
  const [apiStatus,setApiStatus]=useState<'checking'|'live'|'offline'>('checking')
  const [refreshing,setRefreshing]=useState(false)
  const [lastRefresh,setLastRefresh]=useState<string>('')

  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme)},[theme])
  useEffect(()=>{(async()=>{try{const d=await fetchAPI('getStatsList',{statsCode:'00200524',limit:'1',lang:'J'});setApiStatus(d?.GET_STATS_LIST?.RESULT?.STATUS===0?'live':'offline')}catch{setApiStatus('offline')}})()},[])

  const handleRefresh=async()=>{
    setRefreshing(true)
    try{
      await fetchAPI('getStatsList',{statsCode:'00200524',limit:'1',lang:'J'})
      setApiStatus('live')
      setLastRefresh(new Date().toLocaleTimeString('ja-JP'))
    }catch{setApiStatus('offline')}
    setRefreshing(false)
  }

  const header=(<header className="header">
    <div className="header-brand" onClick={()=>setSection('home')}><span className="header-logo">日本統計</span><span className="header-sub">JAPAN STATS</span></div>
    <div className="header-right">
      <RefreshButton onClick={handleRefresh} loading={refreshing}/>
      <span className={`api-badge ${apiStatus}`}>{apiStatus==='live'?'● Live':apiStatus==='checking'?'◌ ...':'○ Offline'}</span>
      <button className="theme-toggle" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?'☀':'☽'}</button>
    </div>
  </header>)

  const back=<button className="back-btn" onClick={()=>setSection('home')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/></svg><span>戻る</span></button>

  const footer=(<footer className="footer"><p className="footer-brand"><a href="https://www.ryotakaneda.com/" target="_blank" rel="noopener noreferrer">Sur Communication Inc.</a></p><p>出典: 総務省統計局 / 厚生労働省 / 内閣府 | e-Stat API v3.0</p>{lastRefresh&&<p>最終更新: {lastRefresh}</p>}</footer>)

  // ===== HOME =====
  if(section==='home')return(
    <div className="app">{header}
      <ParticleHero>
        <p className="hero-eyebrow anim-fade" style={{animationDelay:'.3s'}}>Total Population of Japan — 2024</p>
        <h1 className="hero-number anim-fade" style={{animationDelay:'.5s'}}><AnimNum target={123802}/><span className="hero-unit">千人</span></h1>
        <p className="hero-delta anim-fade" style={{animationDelay:'.8s'}}>前年比 ▼ 550千人（−0.44%）</p>
        <div className="hero-chips anim-fade" style={{animationDelay:'1s'}}><span className="chip">65歳以上 29.3%</span><span className="chip">15歳未満 11.2%</span><span className="chip">外国人 374万人</span></div>
      </ParticleHero>
      <section className="nav-section">
        <FadeIn><p className="section-eyebrow">Data Sections</p><h2 className="section-title">データを探す</h2></FadeIn>
        <div className="nav-list">
          <FadeIn delay={.05}><NavItem label="人口" sublabel="Population" onClick={()=>setSection('population')} accent="#c85a3e"/></FadeIn>
          <FadeIn delay={.1}><NavItem label="年収" sublabel="Income" onClick={()=>setSection('income')} accent="#3e8ac8"/></FadeIn>
          <FadeIn delay={.15}><NavItem label="暮らし" sublabel="Living" onClick={()=>setSection('life')} accent="#5aad6a"/></FadeIn>
          <FadeIn delay={.2}><NavItem label="政治・選挙" sublabel="Politics & Election" onClick={()=>setSection('politics')} accent="#9b59b6"/></FadeIn>
          <FadeIn delay={.25}><NavItem label="医療・脳疾患" sublabel="Medical & Brain Injury" onClick={()=>setSection('medical')} accent="#e74c3c"/></FadeIn>
          <FadeIn delay={.3}><NavItem label="NPO・寄付" sublabel="NPO & Donation" onClick={()=>setSection('npo')} accent="#f39c12"/></FadeIn>
          <FadeIn delay={.35}><NavItem label="データ探索" sublabel="Explorer" onClick={()=>setSection('explorer')} accent="#b08a3e"/></FadeIn>
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

  // ===== POPULATION =====
  if(section==='population')return(<div className="app page-population">{header}{back}
    <section className="page-hero"><FadeIn><p className="section-eyebrow">Population</p><h1 className="page-title">人口</h1><p className="page-desc">47都道府県の人口・高齢化率・人口密度をマップで視覚化</p></FadeIn></section>
    <section className="metric-switch"><button className={metric==='pop'?'active':''} onClick={()=>setMetric('pop')}>人口</button><button className={metric==='aging'?'active':''} onClick={()=>setMetric('aging')}>高齢化率</button><button className={metric==='density'?'active':''} onClick={()=>setMetric('density')}>人口密度</button></section>
    <FadeIn><PrefGrid data={PREFS} metric={metric} onSelect={setSelectedPref}/></FadeIn>
    <section className="ranking-section"><FadeIn><h3 className="ranking-title">{metric==='pop'?'人口':metric==='aging'?'高齢化率':'人口密度'} Top 10</h3></FadeIn><div className="ranking-list">{[...PREFS].sort((a,b)=>{const av=metric==='pop'?a.pop:metric==='aging'?a.aging:a.density;const bv=metric==='pop'?b.pop:metric==='aging'?b.aging:b.density;return bv-av}).slice(0,10).map((p,i)=><FadeIn key={p.code} delay={i*.04}><button className="ranking-item" onClick={()=>setSelectedPref(p)}><span className="ranking-num">{String(i+1).padStart(2,'0')}</span><span className="ranking-name">{p.name}</span><span className="ranking-value">{metric==='pop'?`${p.pop.toLocaleString()}千人`:metric==='aging'?`${p.aging}%`:`${p.density.toLocaleString()}人/km²`}</span></button></FadeIn>)}</div></section>
    <PrefDetail pref={selectedPref} onClose={()=>setSelectedPref(null)}/>{footer}</div>)

  // ===== INCOME =====
  if(section==='income'){const inc=[{p:'東京都',v:620},{p:'神奈川県',v:544},{p:'大阪府',v:531},{p:'愛知県',v:519},{p:'京都府',v:502},{p:'兵庫県',v:495},{p:'埼玉県',v:490},{p:'千葉県',v:487},{p:'福岡県',v:463},{p:'広島県',v:459}];return(<div className="app page-income">{header}{back}<section className="page-hero"><FadeIn><p className="section-eyebrow">Income</p><h1 className="page-title">年収</h1><p className="page-desc">都道府県別の平均年収ランキング（賃金構造基本統計調査）</p></FadeIn></section><section className="income-chart">{inc.map((d,i)=><FadeIn key={d.p} delay={i*.06}><div className="income-bar-row"><span className="income-rank">{String(i+1).padStart(2,'0')}</span><span className="income-pref">{d.p}</span><div className="income-bar-track"><div className="income-bar-fill" style={{width:`${(d.v/650)*100}%`}}/></div><span className="income-value">{d.v}<small>万円</small></span></div></FadeIn>)}</section>{footer}</div>)}

  // ===== LIFE =====
  if(section==='life'){const items=[{item:'ラーメン',top:'山形市',v:18834},{item:'餃子',top:'宮崎市',v:4184},{item:'カレー',top:'鳥取市',v:11338},{item:'コーヒー',top:'京都市',v:16265},{item:'パン',top:'神戸市',v:42237},{item:'牛肉',top:'京都市',v:34517}];const cpi={l:['2018','2019','2020','2021','2022','2023','2024'],v:[99.3,99.8,100.0,99.8,102.3,105.8,108.5]};return(<div className="app page-life">{header}{back}<section className="page-hero"><FadeIn><p className="section-eyebrow">Living</p><h1 className="page-title">暮らし</h1></FadeIn></section><section className="life-ranking"><FadeIn><h3 className="life-subtitle">品目別支出 No.1 都市</h3></FadeIn><div className="life-grid">{items.map((d,i)=><FadeIn key={d.item} delay={i*.08}><div className="life-card"><span className="life-item">{d.item}</span><span className="life-city">{d.top}</span><span className="life-amount">{d.v.toLocaleString()}<small>円/年</small></span></div></FadeIn>)}</div></section><section className="cpi-section"><FadeIn><h3 className="life-subtitle">消費者物価指数（CPI）推移</h3></FadeIn><FadeIn delay={.2}><BarChart data={cpi.v} labels={cpi.l} maxVal={115} color="var(--accent-life)"/></FadeIn></section>{footer}</div>)}

  // ===== POLITICS =====
  if(section==='politics'){
    const parties=[{name:'自民党',seats:191},{name:'立憲民主',seats:148},{name:'維新',seats:38},{name:'国民民主',seats:28},{name:'公明党',seats:24},{name:'れいわ',seats:9},{name:'共産党',seats:8},{name:'他',seats:19}]
    const turnout={l:["2005","2009","2012","2014","2017","2021","2024"],v:[67.5,69.3,59.3,52.7,53.7,55.9,53.8]}
    return(<div className="app page-politics">{header}{back}
      <section className="page-hero"><FadeIn><p className="section-eyebrow">Politics & Election</p><h1 className="page-title">政治・選挙</h1><p className="page-desc">国会議員・都道府県知事・市区町村首長のデータ</p></FadeIn></section>
      <FadeIn><div className="stat-grid"><StatCard label="衆議院定数" value={465} unit="人" accent="#9b59b6"/><StatCard label="参議院定数" value={248} unit="人" accent="#9b59b6"/><StatCard label="女性議員比率" value="16.0" unit="%" accent="#e74c3c"/><StatCard label="都道府県知事" value={47} unit="人"/><StatCard label="女性知事" value={3} unit="人" accent="#e74c3c"/><StatCard label="市区町村数" value={1741} accent="#3e8ac8"/></div></FadeIn>
      <FadeIn delay={.15}><section className="sub-section"><h3 className="life-subtitle">衆議院 政党別議席数（2024年選挙後）</h3><HBar items={parties.map(p=>({name:p.name,value:p.seats}))} color="#9b59b6"/></section></FadeIn>
      <FadeIn delay={.25}><section className="sub-section"><h3 className="life-subtitle">衆院選投票率の推移</h3><BarChart data={turnout.v} labels={turnout.l} maxVal={75} color="#9b59b6"/></section></FadeIn>
      <FadeIn delay={.35}><section className="info-card"><h3>市区町村首長</h3><p>全国1,741市区町村のうち、女性首長は56人（3.2%）。平均投票率は50.3%。市792・町743・村183・特別区23の構成。</p><p className="info-source">出典: 総務省「地方公共団体の議会の議員及び長の所属党派別人員調」</p></section></FadeIn>
      {footer}
    </div>)
  }

  // ===== MEDICAL =====
  if(section==='medical'){
    const strokePat={l:["2002","2005","2008","2011","2014","2017","2020","2023"],inp:[170,152,137,134,118,112,108,103]}
    const strokeTypes=[{name:'脳梗塞',value:63},{name:'脳内出血',value:23},{name:'くも膜下出血',value:8},{name:'その他',value:6}]
    const strokeDeaths={l:["2000","2005","2010","2015","2020","2023"],v:[132,131,123,111,102,97]}
    return(<div className="app page-medical">{header}{back}
      <section className="page-hero"><FadeIn><p className="section-eyebrow">Medical & Brain Injury</p><h1 className="page-title">医療・脳疾患</h1><p className="page-desc">脳卒中・脳外傷・高次脳機能障害の統計データ</p></FadeIn></section>

      <FadeIn><div className="stat-grid"><StatCard label="脳卒中入院患者" value="103" unit="千人/日" accent="#e74c3c"/><StatCard label="脳卒中死亡数" value="97,000" unit="人/年" accent="#e74c3c"/><StatCard label="平均在院日数" value="77.4" unit="日"/><StatCard label="外傷性脳損傷(年間)" value="30,000" unit="人" accent="#c0392b"/><StatCard label="高次脳機能障害" value="500,000" unit="人（推計）" accent="#c0392b"/><StatCard label="支援拠点機関" value={125} unit="箇所"/></div></FadeIn>

      <FadeIn delay={.15}><section className="sub-section"><h3 className="life-subtitle">脳卒中 種類別内訳（%）</h3><HBar items={strokeTypes} color="#e74c3c" maxVal={70}/></section></FadeIn>

      <FadeIn delay={.25}><section className="sub-section"><h3 className="life-subtitle">脳卒中 入院患者数の推移（千人/日）</h3><BarChart data={strokePat.inp} labels={strokePat.l} maxVal={180} color="#e74c3c"/></section></FadeIn>

      <FadeIn delay={.3}><section className="sub-section"><h3 className="life-subtitle">脳血管疾患 死亡数の推移（千人）</h3><BarChart data={strokeDeaths.v} labels={strokeDeaths.l} maxVal={140} color="#c0392b"/></section></FadeIn>

      <FadeIn delay={.4}><section className="info-card"><h3>高次脳機能障害について</h3><p>脳外傷や脳卒中の後遺症として発生。推計50万人が症状を抱えており、主な症状は記憶障害、注意障害、遂行機能障害、社会的行動障害。全国125の支援拠点機関で相談支援を実施。</p><p>外傷性脳損傷(TBI)の主な原因は交通事故(40%)、転倒・転落(35%)、スポーツ(10%)。</p><p className="info-source">出典: 厚労省「患者調査」/ 国立障害者リハビリテーションセンター</p></section></FadeIn>
      {footer}
    </div>)
  }

  // ===== NPO & DONATION =====
  if(section==='npo'){
    const npoFields=[{name:'保健・医療・福祉',value:29245},{name:'社会教育',value:12540},{name:'まちづくり',value:11234},{name:'子どもの健全育成',value:10180},{name:'環境の保全',value:7890},{name:'学術・文化・スポーツ',value:7654}]
    const furusato={l:['2018','2019','2020','2021','2022','2023'],v:[5127,4875,6725,8302,9654,11175]}
    const donation={l:['2016','2018','2020','2021','2022','2023'],v:[7756,9989,12126,14339,12448,13520]}
    return(<div className="app page-npo">{header}{back}
      <section className="page-hero"><FadeIn><p className="section-eyebrow">NPO & Donation</p><h1 className="page-title">NPO・寄付</h1><p className="page-desc">特定非営利活動法人の実態と日本の寄付文化</p></FadeIn></section>

      <FadeIn><div className="stat-grid"><StatCard label="NPO法人総数" value={50350} accent="#f39c12"/><StatCard label="活動率" value="78.5" unit="%"/><StatCard label="平均スタッフ" value="12.3" unit="人"/><StatCard label="個人寄付総額" value="1.35" unit="兆円" accent="#f39c12"/><StatCard label="ふるさと納税" value="1.12" unit="兆円" accent="#e67e22"/><StatCard label="寄付参加率" value="44.1" unit="%"/></div></FadeIn>

      <FadeIn delay={.15}><section className="sub-section"><h3 className="life-subtitle">NPO法人 分野別登録数</h3><HBar items={npoFields} color="#f39c12"/></section></FadeIn>

      <FadeIn delay={.25}><section className="sub-section"><h3 className="life-subtitle">ふるさと納税額の推移（億円）</h3><BarChart data={furusato.v} labels={furusato.l} maxVal={12000} color="#e67e22"/></section></FadeIn>

      <FadeIn delay={.35}><section className="sub-section"><h3 className="life-subtitle">個人寄付総額の推移（億円）</h3><BarChart data={donation.v} labels={donation.l} maxVal={16000} color="#f39c12"/></section></FadeIn>

      <FadeIn delay={.45}><section className="info-card"><h3>寄付先の内訳</h3><p>宗教関連(31.2%)、ふるさと納税(28.5%)、社会福祉(12.3%)、教育・研究(8.7%)、医療・保健(6.2%)。寄付者1人あたり平均額は約27,000円。</p><p className="info-source">出典: 日本ファンドレイジング協会「寄付白書」/ 総務省「ふるさと納税」</p></section></FadeIn>
      {footer}
    </div>)
  }

  // ===== EXPLORER =====
  return(<div className="app page-explorer">{header}{back}
    <section className="page-hero"><FadeIn><p className="section-eyebrow">Explorer</p><h1 className="page-title">データ探索</h1><p className="page-desc">e-Stat APIで700以上の統計データを検索</p></FadeIn></section>
    <FadeIn delay={.2}><section className="explorer-info"><h3>e-Stat API v3.0 — リアルタイム接続</h3><p>クライアントサイドJSからCORS対応APIに直接アクセス。更新ボタンでAPI疎通確認も可能。</p>
      <div className="explorer-links"><a href="https://www.e-stat.go.jp/" target="_blank" rel="noopener noreferrer" className="explorer-link">e-Stat →</a><a href="https://www.e-stat.go.jp/api/" target="_blank" rel="noopener noreferrer" className="explorer-link">API機能 →</a><a href="https://www.e-stat.go.jp/api/api-info/e-stat-manual3-0" target="_blank" rel="noopener noreferrer" className="explorer-link">仕様書 v3.0 →</a></div>
    </section></FadeIn>
    <FadeIn delay={.35}><section className="explorer-codes"><h3>主要統計コード</h3><div className="code-list">
      {[{c:'00200521',n:'国勢調査'},{c:'00200524',n:'人口推計'},{c:'00200235',n:'衆議院選挙結果'},{c:'00200236',n:'参議院選挙結果'},{c:'00450022',n:'患者調査'},{c:'00200573',n:'消費者物価指数'},{c:'00200561',n:'家計調査'},{c:'00450091',n:'賃金構造基本統計調査'},{c:'00100414',n:'NPO法人実態調査'}].map(s=><div className="code-item" key={s.c}><code>{s.c}</code><span>{s.n}</span></div>)}
    </div></section></FadeIn>
    {footer}
  </div>)
}
