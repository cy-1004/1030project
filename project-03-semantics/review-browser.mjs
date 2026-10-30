import fs from 'node:fs'
import {pathToFileURL} from 'node:url'
const {BridgeClient}=await import(pathToFileURL('C:/Users/Lenovo/.dsh/mcp/huashu-chrome/node_modules/huashu-chrome/src/lib/rpc.js').href)
const client=new BridgeClient({client:'codex-semantics-review',sessionId:'codex-project03-review'})
try{
 await client.connect()
 const tab=await client.call('tabs',{action:'new',url:'http://127.0.0.1:8103/'})
 await new Promise(r=>setTimeout(r,1500))
 const snapshot=await client.call('snapshot',{}, {tabId:tab.tabId})
 console.log(JSON.stringify(snapshot).slice(0,750))
 await client.call('click',{selector:'button.primary'}, {tabId:tab.tabId})
 await new Promise(r=>setTimeout(r,1300))
 const shot=await client.call('screenshot',{}, {tabId:tab.tabId})
 fs.mkdirSync('validation',{recursive:true})
 fs.writeFileSync('validation/huashu-chrome-desktop.png',Buffer.from(shot.dataUrl.split(',')[1],'base64'))
 console.log(JSON.stringify({tabId:tab.tabId,screenshot:'validation/huashu-chrome-desktop.png'}))
}finally{client.close()}
