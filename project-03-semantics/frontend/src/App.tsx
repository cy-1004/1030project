import {useEffect,useRef,useState} from 'react'
import {BookOpen,Boxes,Check,ChevronDown,Database,FileSearch,History,Layers3,LoaderCircle,PanelLeftClose,Play,RefreshCw,SlidersHorizontal,Sparkles,X} from 'lucide-react'
import {api,Answer,Catalog,defaultPipeline,Hit,Pipeline,Result,Rule,Run,Scene,sceneLabels,Term} from './types'
import Workspace from './Workspace'
import Library from './Library'
import RunHistory from './RunHistory'

export default function App(){
 const [page,setPage]=useState<'workspace'|'library'|'history'>('workspace')
 const [catalog,setCatalog]=useState<Catalog|null>(null),[terms,setTerms]=useState<Term[]>([]),[rules,setRules]=useState<Rule[]>([]),[runs,setRuns]=useState<Run[]>([])
 const [scene,setScene]=useState<Scene>('contract'),[text,setText]=useState(''),[title,setTitle]=useState(''),[pipeline,setPipeline]=useState<Pipeline>({...defaultPipeline})
 const [result,setResult]=useState<Result|null>(null),[selected,setSelected]=useState<Hit|null>(null),[evidence,setEvidence]=useState(''),[answers,setAnswers]=useState<Answer[]>([])
 const [editing,setEditing]=useState(true),[useModel,setUseModel]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState(''),[toast,setToast]=useState(''),[connected,setConnected]=useState(false)
 const controller=useRef<AbortController|null>(null),initialized=useRef(false)
 const dirty=!!result&&(result.input!==text||result.scene!==scene||JSON.stringify(result.pipeline)!==JSON.stringify(pipeline))
 async function refresh(){const [t,r,h]=await Promise.all([api<Term[]>('/terms'),api<Rule[]>('/rules'),api<Run[]>('/runs')]);setTerms(t);setRules(r);setRuns(h)}
 async function boot(){setError('');try{const c=await api<Catalog>('/catalog');setCatalog(c);await refresh();setConnected(true);if(!initialized.current){const sample=c.samples[0];setText(sample.text);setTitle(sample.title);initialized.current=true}}catch(e){setConnected(false);setError((e as Error).message)}}
 useEffect(()=>{void boot();return()=>controller.current?.abort()},[])
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(timer)},[toast])
 function accept(r:Result){setResult(r);setScene(r.scene);setText(r.input);setTitle(r.title);setPipeline(r.pipeline);setSelected(r.terms.find(t=>t.text.includes('交付'))||r.terms[0]||null);setEvidence('');setAnswers([]);setEditing(false);setPage('workspace')}
 async function run(path:string,body?:unknown,label='正在分析'){
  if(busy)return;const c=new AbortController();controller.current=c;setBusy(label);setError('')
  try{const r=await api<Result>(path,{method:path.endsWith('/replay')||body?'POST':'GET',...(body?{body:JSON.stringify(body)}:{}),signal:c.signal});accept(r);setToast(path.endsWith('/replay')?'已用当前词典与规则生成新记录':'分析结果已载入');await refresh()}
  catch(e){if((e as Error).name==='AbortError')setToast('已停止等待，可在历史记录中检查是否已保存');else setError((e as Error).message)}finally{controller.current=null;setBusy('')}
 }
 async function ask(question:string){if(!result||dirty||busy)return;const c=new AbortController();controller.current=c;setBusy('正在查找依据');setError('');try{const answer=await api<Answer>('/ask',{method:'POST',body:JSON.stringify({runId:result.id,question,useModel}),signal:c.signal});setAnswers(a=>[...a,answer]);if(answer.evidence[0])setEvidence(answer.evidence[0])}catch(e){if((e as Error).name==='AbortError')setToast('已停止等待回答');else setError((e as Error).message)}finally{controller.current=null;setBusy('')}}
 function changeScene(value:Scene){setScene(value);setResult(null);setSelected(null);setAnswers([]);setEvidence('');setEditing(true)}
 function loadSample(){const s=catalog?.samples.find(s=>s.scene===scene);if(!s)return;setText(s.text);setTitle(s.title);setResult(null);setSelected(null);setEvidence('');setAnswers([]);setEditing(true);setToast('已载入虚构演示样例')}
 async function removeRun(id:string){await api('/runs/'+id,{method:'DELETE'});if(result?.id===id){setResult(null);setAnswers([]);setSelected(null);setEditing(true)}await refresh();setToast('记录已删除')}
 const currentTerms=terms.filter(t=>t.scene===scene),currentRules=rules.filter(r=>r.scene===scene)
 return <div className="app-shell">
  <aside className="sidebar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setPage('workspace')}}><span className="brand-symbol"><Layers3 size={23}/></span><span>语析<span className="brand-sub">场景语义工作台</span></span></a>
   <div className="nav-label">工作空间</div><nav aria-label="主要导航">
    <button className={page==='workspace'?'active':''} onClick={()=>setPage('workspace')}><FileSearch size={19}/>文本分析<span className="nav-dot"/></button>
    <button className={page==='library'?'active':''} onClick={()=>setPage('library')}><BookOpen size={19}/>术语与规则<span className="nav-count">{terms.length}</span></button>
    <button className={page==='history'?'active':''} onClick={()=>{setPage('history');void refresh().catch(e=>setError(e.message))}}><History size={19}/>处理记录<span className="nav-count">{runs.length}</span></button>
   </nav>
   <div className="sidebar-scene"><span>当前业务场景</span><strong>{sceneLabels[scene]}</strong><p>{catalog?.scenes.find(s=>s.id===scene)?.description||'阅读原文，理解业务语义'}</p><div><Database size={13}/>{currentTerms.length} 个术语 · {currentRules.filter(r=>r.enabled).length} 条启用规则</div></div>
   <div className="sidebar-bottom"><div className="connection"><i className={connected?'online':''}/>{connected?'共用后端已连接':'正在连接后端'}</div><span>项目三 · 演示工作空间</span><PanelLeftClose size={16}/></div>
  </aside>
  <main className="main"><header className="topbar"><div className="breadcrumb">工作空间 <span>/</span> <b>{page==='workspace'?'文本分析':page==='library'?'术语与规则':'处理记录'}</b></div><span className="demo-label"><span/>本地演示</span></header>
   <div className="main-content"><div className="page-heading"><div><div className="heading-context"><span/>让原文与业务含义对得上</div><h1>{page==='workspace'?'场景语义分析':page==='library'?'管理业务语言': '每一次分析，都有记录'}</h1><p>{page==='workspace'?'在同一份材料里，看见术语、关键要素与回答依据。':page==='library'?'把团队的表达方式，整理成可编辑、可重放的业务知识。':'保留当时的分析快照，也能用当前词典与规则重新处理。'}</p></div><div className="scene-picker"><label htmlFor="scene">业务场景</label><div><Boxes size={17}/><select id="scene" value={scene} disabled={!!busy} onChange={e=>changeScene(e.target.value as Scene)}>{Object.entries(sceneLabels).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><ChevronDown size={14}/></div></div></div>
   {error&&<div className="alert error" role="alert"><span>{error}</span>{!connected&&<button onClick={()=>void boot()}><RefreshCw size={14}/>重新连接</button>}<button className="icon-button" aria-label="关闭错误提示" onClick={()=>setError('')}><X size={16}/></button></div>}
   {page==='workspace'&&<>
    <section className="workflow-bar" aria-label="处理流程">
     <div className="workflow-name"><SlidersHorizontal size={17}/><span>处理流程</span></div>
     <div className="steps">{(['mapping','rules','entities','summary'] as const).map((k,i)=><label className={'step '+(pipeline[k]?'enabled':'')} key={k}>
      <input type="checkbox" aria-label={['术语映射','规则转换','实体提取','摘要整理'][i]} checked={pipeline[k]} disabled={!!busy} onChange={e=>setPipeline(p=>({...p,[k]:e.target.checked}))}/>
      <span className="step-icon" aria-hidden="true">{pipeline[k]?<Check size={13}/>:i+1}</span>{['术语映射','规则转换','实体提取','摘要整理'][i]}
     </label>)}</div><span className="workflow-hint">可按需开关</span>
    </section>
    <div className="action-bar"><div className="model-control"><label className="switch-label"><input type="checkbox" checked={useModel} disabled={!!busy} onChange={e=>setUseModel(e.target.checked)}/><span className="switch"/><Sparkles size={14}/>实时模型辅助</label><span>{useModel?'当前文本将发送至外部模型，生成摘要和回答':'本地分析，无需 API Key'}</span></div><div className="actions"><button className="secondary" onClick={loadSample} disabled={!catalog||!!busy}><RefreshCw size={15}/>载入样例</button><button className="primary" disabled={!text.trim()||!connected||!!busy} onClick={()=>void run('/analyze',{scene,text,title,pipeline,useModel})}>{busy?<LoaderCircle className="spin" size={16}/>:<Play size={16} fill="currentColor"/>}{busy||'开始分析'}</button>{busy&&<button className="secondary" onClick={()=>controller.current?.abort()}>停止等待</button>}</div></div>
    <Workspace {...{scene,text,title,setText,setTitle,result,selected,setSelected,evidence,setEvidence,answers,ask,editing,setEditing,dirty,busy,pipeline}} questions={catalog?.samples.find(s=>s.scene===(result?.scene||scene))?.questions||[]}/>
   </>}
   {page==='library'&&<Library {...{scene,terms:currentTerms,rules:currentRules}} tryRules={()=>{setPage('workspace');setEditing(true);setToast('可修改左侧材料，再开始分析验证当前配置')}} changed={async()=>{await refresh();setToast('已保存。下次分析或重放时生效')}}/>}
   {page==='history'&&<RunHistory {...{runs,busy}} open={id=>void run('/runs/'+id,undefined,'正在打开记录')} replay={id=>void run('/runs/'+id+'/replay',undefined,'正在重放分析')} remove={removeRun}/>}
   <footer className="footer"><span>样例内容为虚构数据 · 分析结果供演示与人工核对</span><span>语析工作台 <i/> Demo 1.0</span></footer>
   </div>
  </main>{toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}
 </div>
}
