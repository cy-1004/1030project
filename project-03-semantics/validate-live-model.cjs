// Optional check: sends a fictional sample through the configured external model.
;(async()=>{
 const base='http://127.0.0.1:8103/api/semantics';let id
 const request=async(path,body,method='POST')=>{const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(40000)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
 try{
  const text='数字展厅演示合同。服务期限为2026年11月1日至2027年10月31日。本合同总价为120,000元。乙方应于2026年12月15日前完成交付。'
  const result=await request('/analyze',{scene:'contract',text,title:'模型通路检查（虚构材料）',useModel:true});id=result.id
  const answer=await request('/ask',{runId:id,question:'合同金额是多少？',useModel:true})
  console.log(JSON.stringify({summarySource:result.summarySource,summaryFallback:!!result.notice,answerSource:answer.source,evidenceCount:answer.evidence.length,evidenceMatchesSource:answer.evidence.every(e=>text.includes(e))}))
 }finally{if(id)await request('/runs/'+id,null,'DELETE')}
})().catch(e=>{console.error(e.message);process.exitCode=1})
