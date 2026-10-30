const {chromium}=require('../project-01-avatar/frontend/node_modules/playwright')
const fs=require('node:fs')
const assert=require('node:assert/strict')
const path=require('node:path')
const output=path.join(__dirname,'validation');fs.mkdirSync(output,{recursive:true})
const base='http://127.0.0.1:8103'
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:\\Users\\Lenovo\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe'})
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],ids=new Set(),custom={}
 page.on('pageerror',e=>errors.push(e.message))
 page.on('response',async r=>{if(r.request().method()==='POST'&&(r.url().endsWith('/analyze')||r.url().endsWith('/replay'))&&r.ok()){const data=await r.json();ids.add(data.id)}})
 const check=async(locator,text)=>{await locator.filter({hasText:text}).first().waitFor({state:'visible'});assert((await locator.allTextContents()).join('').includes(text))}
 const analyze=async()=>{const response=page.waitForResponse(r=>r.url().endsWith('/analyze')&&r.status()===201);await page.getByRole('button',{name:'开始分析',exact:true}).click();const r=await response;const data=await r.json();await page.locator('.result-header-actions .green').waitFor();return data}
 const api=async(url,options={})=>{const r=await page.request.fetch(base+'/api/semantics'+url,options);assert(r.ok(),url+': '+r.status());return r.json()}
 try{
  await page.goto(base);await page.getByLabel('材料标题').waitFor();await page.waitForFunction(()=>document.querySelector('textarea')?.value.includes('数字展厅'))
  await page.getByLabel('材料标题').fill('E2E-合同验证')
  const original=await analyze();assert(original.terms.length>5);await check(page.locator('.definition-card'),'成果移交');console.log('PASS initial analysis')
  await page.getByRole('button',{name:'合同金额是多少？',exact:true}).click();await check(page.locator('.answer-main'),'120,000元')
  const quote=page.locator('.evidence-list button').first();await quote.click();await page.locator('.evidence-mark').first().waitFor()
  await page.getByLabel('向材料提问').fill('作者最喜欢什么颜色？');await page.getByRole('button',{name:'发送',exact:true}).click();await check(page.locator('.answer-main'),'未找到足够依据')
  await page.getByRole('tab',{name:/实体要素/}).click();await check(page.locator('.entity-list'),'120,000元');await page.locator('.entity-list button').filter({hasText:'120,000元'}).click()
  await page.getByRole('button',{name:'编辑',exact:true}).click();await page.getByLabel('原始材料正文').fill('🧾 '+original.input+'\n测试短语。');await page.locator('.warning').waitFor();assert(await page.getByLabel('向材料提问').isDisabled())
  const modified=await analyze();assert(modified.terms[0].start>=3)
  for(const [scene,definition] of [['support','服务恢复反馈'],['research','收入确认节点']]){await page.getByLabel('业务场景').selectOption(scene);await analyze();await page.getByRole('tab',{name:'概览',exact:true}).click();await check(page.locator('.definition-card'),definition)}
  await page.getByRole('button',{name:'载入样例',exact:true}).click();await page.getByLabel('材料标题').fill('E2E-研报验证');await analyze();await page.getByRole('button',{name:'本季度营收和增长情况如何？',exact:true}).click();await check(page.locator('.answer-main'),'860万元')
  await page.getByLabel('业务场景').selectOption('support');await page.getByRole('button',{name:'载入样例',exact:true}).click();await page.getByLabel('材料标题').fill('E2E-工单验证');await analyze();await page.getByRole('button',{name:'谁负责处理，什么时候恢复？',exact:true}).click();await check(page.locator('.answer-main'),'陈明')
  await page.getByLabel('业务场景').selectOption('contract');await page.getByRole('button',{name:'载入样例',exact:true}).click();await page.getByLabel('材料标题').fill('E2E-规则重放');await page.getByLabel('原始材料正文').fill(original.input+'\n测试短语。');const before=await analyze()
  await page.getByRole('button',{name:/术语与规则/}).click();await page.getByRole('button',{name:'新增术语',exact:true}).click();let dialog=page.getByRole('dialog');await dialog.getByLabel('业务术语',{exact:true}).fill('测试短语');await dialog.getByLabel('标准名称',{exact:true}).fill('测试标准一');await dialog.getByLabel('场景释义',{exact:true}).fill('浏览器验证的自定义释义。');await dialog.getByLabel(/同义表达/).fill('测试同义词');await dialog.getByRole('button',{name:'保存术语',exact:true}).click();await dialog.waitFor({state:'hidden'});await page.getByLabel('搜索术语或规则').fill('测试短语');await check(page.locator('tbody'),'测试标准一');custom.term=(await api('/terms')).find(t=>t.term==='测试短语').id
  await page.getByLabel('编辑术语测试短语',{exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('标准名称',{exact:true}).fill('测试标准二');await dialog.getByRole('button',{name:'保存术语',exact:true}).click();await dialog.waitFor({state:'hidden'});await check(page.locator('tbody'),'测试标准二')
  await page.getByRole('tab',{name:/转换规则/}).click();await page.getByLabel('搜索术语或规则').fill('');await page.getByRole('button',{name:'新增规则',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('规则名称',{exact:true}).fill('E2E替换规则');await dialog.getByLabel('匹配文字',{exact:true}).fill('首付款');await dialog.getByLabel('替换为',{exact:true}).fill('演示首期款');await dialog.getByLabel(/优先级/).fill('99');await dialog.getByRole('button',{name:'保存规则',exact:true}).click();await dialog.waitFor({state:'hidden'});custom.rule=(await api('/rules')).find(r=>r.name==='E2E替换规则').id
  await page.getByLabel('编辑规则E2E替换规则',{exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('替换为',{exact:true}).fill('演示修订款');await dialog.getByLabel(/优先级/).fill('100');await dialog.getByRole('button',{name:'保存规则',exact:true}).click();await dialog.waitFor({state:'hidden'})
  await page.screenshot({path:path.join(output,'rules-desktop.png'),fullPage:true})
  await page.getByRole('button',{name:/处理记录/}).click();const row=page.locator('.history-row').filter({hasText:'E2E-规则重放'});const replayResponse=page.waitForResponse(r=>r.url().endsWith('/replay')&&r.status()===201);await row.getByRole('button',{name:'重放',exact:true}).click();const replayed=await(await replayResponse).json();assert(replayed.mappedText.includes('演示修订款'));assert(replayed.terms.some(t=>t.standard==='测试标准二'));assert(replayed.versions.rules>before.versions.rules)
  const frozen=await api('/runs/'+before.id);assert(!frozen.mappedText.includes('演示修订款'));assert(!frozen.terms.some(t=>t.standard==='测试标准二'))
  await page.getByRole('tab',{name:/转换文本/}).click();await check(page.locator('.converted-text'),'演示修订款')
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'导出分析快照',exact:true}).click();assert((await download).suggestedFilename().endsWith('.json'));console.log('PASS CRUD, replay, frozen snapshot and export')
  await page.getByRole('button',{name:/术语与规则/}).click();page.on('dialog',d=>d.accept());await page.getByLabel('搜索术语或规则').fill('测试短语');await page.getByLabel('删除术语测试短语',{exact:true}).click();await page.getByText('没有找到相关术语，试试新增一条。').waitFor();delete custom.term
  await page.getByRole('tab',{name:/转换规则/}).click();await page.getByLabel('搜索术语或规则').fill('E2E替换规则');await page.getByLabel('删除规则E2E替换规则',{exact:true}).click();await page.getByText('没有找到相关规则，试试新增一条。').waitFor();delete custom.rule
  await page.getByRole('button',{name:/处理记录/}).click();await page.locator('.history-row').filter({hasText:'E2E-合同验证'}).filter({hasText:'合同审阅'}).getByRole('button',{name:'打开快照',exact:true}).first().click();await page.getByRole('tab',{name:'概览',exact:true}).click();await check(page.locator('.definition-card'),'成果移交')
  await page.locator('label.step').filter({hasText:'规则转换'}).click();assert(!(await page.getByLabel('规则转换',{exact:true}).isChecked()));await page.locator('.warning').waitFor();const disabled=await analyze();assert.equal(disabled.rules.length,0);assert.equal(disabled.input,disabled.mappedText);console.log('PASS pipeline switches')
  await page.locator('label.step').filter({hasText:'规则转换'}).click()
  await page.getByRole('button',{name:'载入样例',exact:true}).click();await analyze();await page.getByRole('button',{name:'合同金额是多少？',exact:true}).click();await check(page.locator('.answer-main'),'120,000元')
  await page.screenshot({path:path.join(output,'workspace-desktop.png'),fullPage:true})
  for(const width of [375,390,768]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow at '+width);await page.screenshot({path:path.join(output,'workspace-'+width+'.png'),fullPage:true});await page.getByRole('button',{name:/术语与规则/}).click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'library overflow at '+width);await page.getByRole('button',{name:/处理记录/}).click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'history overflow at '+width);await page.getByRole('button',{name:'文本分析',exact:true}).click()}
  const unavailable=await browser.newPage();await unavailable.route('**/api/semantics/**',r=>r.abort());await unavailable.goto(base);await unavailable.getByRole('alert').waitFor();assert(await unavailable.getByRole('button',{name:'开始分析',exact:true}).isDisabled());await unavailable.close()
  assert.deepEqual(errors,[])
  console.log(JSON.stringify({passed:true,checks:['three scenes and context-specific meanings','source evidence and unknown questions','dirty input blocks Q&A','term/rule CRUD','latest-rule replay and immutable old snapshot','disabled pipeline','JSON export','375/390/768 no page overflow','backend unavailable state','zero page errors'],createdRuns:ids.size}))
 }catch(e){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw e}finally{
  if(custom.term)await api('/terms/'+custom.term,{method:'DELETE'})
  if(custom.rule)await api('/rules/'+custom.rule,{method:'DELETE'})
  for(const id of ids)await api('/runs/'+id,{method:'DELETE'})
  await browser.close()
 }
})().catch(e=>{console.error(e);process.exitCode=1})
