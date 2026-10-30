import {Hit} from './types'

export default function SourceText({text,hits,evidence,onTerm}:{text:string;hits:Hit[];evidence:string;onTerm:(hit:Hit)=>void}){
 const chars=Array.from(text);let cursor=0;const nodes:React.ReactNode[]=[]
 const evidenceStart=evidence?text.indexOf(evidence):-1
 const evidenceOffset=evidenceStart<0?-1:Array.from(text.slice(0,evidenceStart)).length
 function plain(start:number,end:number){if(start>=end)return;const a=Math.max(start,evidenceOffset),b=Math.min(end,evidenceOffset+Array.from(evidence).length);if(evidenceOffset>=0&&a<b){nodes.push(<span key={'p'+start}>{chars.slice(start,a).join('')}<mark className="evidence-mark">{chars.slice(a,b).join('')}</mark>{chars.slice(b,end).join('')}</span>)}else nodes.push(<span key={'p'+start}>{chars.slice(start,end).join('')}</span>)}
 for(const hit of hits){plain(cursor,hit.start);const inEvidence=evidenceOffset>=0&&hit.start<evidenceOffset+Array.from(evidence).length&&hit.end>evidenceOffset;nodes.push(<button key={'t'+hit.start} className={'inline-term'+(inEvidence?' evidence-term':'')} title={hit.standard} onClick={()=>onTerm(hit)}>{chars.slice(hit.start,hit.end).join('')}</button>);cursor=hit.end}
 plain(cursor,chars.length)
 return <div className="source-text">{nodes}</div>
}
