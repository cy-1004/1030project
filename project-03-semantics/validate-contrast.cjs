// Check computed text/background colors after layout and transitions have settled.
const {chromium}=require('../project-01-avatar/frontend/node_modules/playwright')
const fs=require('node:fs'),path=require('node:path')
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:\\Users\\Lenovo\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe'})
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),report=[];let runId
 async function check(name){
  await page.waitForTimeout(250)
  const result=await page.evaluate(()=>{
   const rgb=s=>{const v=s.match(/[\d.]+/g)?.map(Number)||[0,0,0];return [v[0],v[1],v[2],v[3]??1]}
   const over=(c,b)=>c.slice(0,3).map((v,i)=>v*c[3]+b[i]*(1-c[3]))
   const light=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0)
   const items=[]
   for(const el of document.querySelectorAll('body *')){
    if(el.closest('svg,script,style,:disabled,[aria-disabled=true]'))continue
    const style=getComputedStyle(el),rect=el.getBoundingClientRect()
    if(!rect.width||!rect.height||style.visibility==='hidden'||style.opacity==='0')continue
    let text=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim()
    if((el.tagName==='INPUT'||el.tagName==='TEXTAREA')&&!['checkbox','radio','hidden'].includes(el.type))text=el.value||el.placeholder
    if(!text)continue
    const ancestry=[];for(let p=el;p;p=p.parentElement)ancestry.unshift(p)
    let background=[255,255,255];for(const ancestor of ancestry)background=over(rgb(getComputedStyle(ancestor).backgroundColor),background)
    const foreground=over(rgb(style.color),background),a=light(foreground),b=light(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05)
    const size=parseFloat(style.fontSize),large=size>=24||(size>=18.66&&Number(style.fontWeight)>=700),minimum=large?3:4.5
    items.push({text:text.slice(0,45),ratio:Number(ratio.toFixed(2)),minimum,selector:el.tagName.toLowerCase()+'.'+[...el.classList].join('.')})
   }
   return {checked:items.length,minimumRatio:Math.min(...items.map(i=>i.ratio)),failures:items.filter(i=>i.ratio<i.minimum)}
  })
  report.push({page:name,...result})
 }
 try{
  await page.goto('http://127.0.0.1:8103');await page.waitForFunction(()=>document.querySelector('textarea')?.value.includes('数字展厅'));await check('editor')
  const response=page.waitForResponse(r=>r.url().endsWith('/analyze')&&r.status()===201);await page.getByRole('button',{name:'开始分析',exact:true}).click();runId=(await(await response).json()).id
  await page.getByRole('button',{name:'合同金额是多少？',exact:true}).click();await page.locator('.answer-main').waitFor();await check('analysis and evidence')
  await page.getByRole('tab',{name:/实体要素/}).click();await check('entities')
  await page.getByRole('tab',{name:/规则命中/}).click();await check('rules')
  await page.getByRole('button',{name:/术语与规则/}).click();await check('term library')
  await page.getByRole('button',{name:'新增术语',exact:true}).click();await check('term dialog');await page.getByRole('button',{name:'取消',exact:true}).click()
  await page.getByRole('tab',{name:/转换规则/}).click();await check('rule library')
  await page.getByRole('button',{name:'新增规则',exact:true}).click();await check('rule dialog');await page.getByRole('button',{name:'取消',exact:true}).click()
  await page.getByRole('button',{name:/处理记录/}).click();await check('history')
  await page.setViewportSize({width:375,height:844});await check('history mobile')
  await page.getByRole('button',{name:'文本分析',exact:true}).click();await page.getByRole('tab',{name:'概览',exact:true}).click();await check('analysis mobile')
  const failures=report.flatMap(r=>r.failures.map(f=>({page:r.page,...f})))
  fs.writeFileSync(path.join(__dirname,'validation','contrast-report.json'),JSON.stringify({report,failures},null,2))
  console.log(JSON.stringify({pages:report.length,textSamples:report.reduce((n,r)=>n+r.checked,0),failures},null,2))
  if(failures.length)process.exitCode=1
 }finally{if(runId)await page.request.delete('http://127.0.0.1:8103/api/semantics/runs/'+runId);await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
