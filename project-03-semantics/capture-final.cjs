const {chromium}=require('../project-01-avatar/frontend/node_modules/playwright')
const fs=require('node:fs'),path=require('node:path')
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:\\Users\\Lenovo\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe'})
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),base='http://127.0.0.1:8103',out=path.join(__dirname,'validation');let id
 fs.mkdirSync(out,{recursive:true})
 try{
  await page.goto(base);await page.waitForFunction(()=>document.querySelector('textarea')?.value.includes('数字展厅'))
  const response=page.waitForResponse(r=>r.url().endsWith('/analyze')&&r.status()===201);await page.getByRole('button',{name:'开始分析',exact:true}).click();id=(await(await response).json()).id
  await page.getByRole('button',{name:'合同金额是多少？',exact:true}).click();await page.locator('.answer-main').waitFor();await page.locator('.toast').waitFor({state:'hidden'});await page.evaluate(()=>window.scrollTo(0,0))
  await page.screenshot({path:path.join(out,'workspace-desktop.png'),fullPage:true})
  for(const width of [375,390,768]){await page.setViewportSize({width,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'workspace-'+width+'.png'),fullPage:true})}
  await page.setViewportSize({width:1440,height:1000});await page.getByRole('button',{name:/术语与规则/}).click();await page.getByRole('tab',{name:/转换规则/}).click();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'rules-desktop.png'),fullPage:true})
  console.log('Final screenshots saved')
 }finally{if(id)await page.request.delete(base+'/api/semantics/runs/'+id);await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
