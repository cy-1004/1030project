export type Scene='contract'|'support'|'research'
export type Pipeline={mapping:boolean;rules:boolean;entities:boolean;summary:boolean}
export type Term={id:string;scene:Scene;term:string;standard:string;definition:string;aliases:string[];version:number}
export type Rule={id:string;scene:Scene;name:string;pattern:string;replacement:string;priority:number;enabled:boolean;version:number}
export type Hit={termId:string;text:string;start:number;end:number;standard:string;definition:string}
export type Entity={type:string;text:string;start:number;end:number}
export type RuleHit={id:string;name:string;pattern:string;replacement:string;priority:number;count:number;evidence:string}
export type Result={id:string;title:string;createdAt:string;scene:Scene;input:string;mappedText:string;terms:Hit[];entities:Entity[];rules:RuleHit[];summary:string;summarySource:string;versions:{terms:number;rules:number};pipeline:Pipeline;notice:string}
export type Catalog={scenes:{id:Scene;name:string;description:string}[];samples:{id:string;scene:Scene;title:string;text:string;questions:string[]}[];steps:string[]}
export type Run={id:string;scene:Scene;title:string;created_at:string}
export type Answer={answer:string;evidence:string[];source:string;question:string;runId:string}
export const sceneLabels:Record<Scene,string>={contract:'合同审阅',support:'客服工单',research:'经营研报'}
export const stepLabels:Record<keyof Pipeline,string>={mapping:'术语映射',rules:'规则转换',entities:'实体提取',summary:'摘要整理'}
export const defaultPipeline:Pipeline={mapping:true,rules:true,entities:true,summary:true}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{const r=await fetch('/api/semantics'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}});if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.error||'服务暂不可用，请检查共用后端')}return r.json()}
