import {useId} from 'react'
import {Config,hairColors,outfitColors,shoeColors,skinColors} from './data'

export default function Avatar({config:c,id,className=''}:{config:Config;id?:string;className?:string}){
 const uid=useId().replace(/:/g,''), skin=skinColors[c.skinId], hair=hairColors[c.hairColor], cloth=outfitColors[c.outfitColor], shoe=shoeColors[c.shoesColor]
 const long=['waves','long','sleek'].includes(c.hairId), dress=c.outfitId==='dress', boot=c.shoesId==='boots', tall=c.shoesId==='ankle'
 const faceWidth=1+(c.face.shape-2)*.035, eyeGap=(c.face.eyes-2)*2, noseWidth=3+(c.face.nose-2)*.8, mouth=4+(c.face.smile-2)*2
 return <svg id={id} className={className} viewBox="0 0 400 700" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="可编辑的人物形象">
 <defs><linearGradient id={'skin'+uid} x1="0" x2="1"><stop stopColor={skin}/><stop offset=".5" stopColor={skin}/><stop offset="1" stopColor="#8f6759"/></linearGradient><linearGradient id={'cloth'+uid} x1="0" x2="1"><stop stopColor={cloth}/><stop offset=".55" stopColor={cloth}/><stop offset="1" stopColor="#47443e"/></linearGradient></defs>
 <ellipse cx="200" cy="677" rx="91" ry="13" fill="#000" opacity=".18"/>
 {long&&<path d="M153 95 Q135 110 145 196 L132 260 Q166 282 200 253 Q234 282 268 260 L255 196 Q265 110 247 95Z" fill={hair}/>}
 <path d="M162 431 Q154 481 157 548 L154 634 Q154 647 167 648 L181 648 Q190 646 190 635 L199 496 L210 635 Q211 646 220 648 L235 648 Q246 646 246 634 L243 548 Q246 481 238 431Z" fill={dress?`url(#skin${uid})`:'#3d3c38'} stroke="#50433d" strokeWidth="1.5"/>
 <path d="M132 228 Q109 231 99 268 L76 387 Q73 403 86 406 Q98 409 102 393 L130 314 L148 284Z" fill={`url(#skin${uid})`}/><path d="M268 228 Q291 231 301 268 L324 387 Q327 403 314 406 Q302 409 298 393 L270 314 L252 284Z" fill={`url(#skin${uid})`}/>
 <path d="M177 175 L177 212 Q200 229 223 212 L223 175Z" fill={`url(#skin${uid})`}/>
 <g transform={`translate(200 0) scale(${faceWidth} 1) translate(-200 0)`}><path d="M155 105 Q152 64 200 61 Q248 64 245 105 L241 145 Q235 181 200 191 Q165 181 159 145Z" fill={`url(#skin${uid})`} stroke="#916b5b" strokeWidth="1"/>
 <path d={`M${174-eyeGap} 123 Q${181-eyeGap} 120 ${188-eyeGap} 123 M${212+eyeGap} 123 Q${219+eyeGap} 120 ${226+eyeGap} 123`} fill="none" stroke="#513c36" strokeWidth="2.1" strokeLinecap="round"/><circle cx={181-eyeGap} cy="125" r="2" fill="#322723"/><circle cx={219+eyeGap} cy="125" r="2" fill="#322723"/>
 <path d={`M200 126 L${200-noseWidth} 147 Q200 150 ${200+noseWidth} 147`} fill="none" stroke="#a26f5c" strokeWidth="1.4"/><path d={`M189 162 Q200 ${162+mouth} 211 162`} fill="none" stroke="#8c514e" strokeWidth="2" strokeLinecap="round"/></g>
 <path d={c.hairId==='pixie'?'M153 111 Q144 61 188 53 Q235 47 247 93 L242 108 Q224 93 218 81 Q189 103 156 108Z':c.hairId==='bob'?'M151 119 Q140 63 181 54 Q225 44 247 76 Q258 94 251 146 L240 157 L237 103 Q209 103 192 75 Q178 98 157 109 L159 156 Q147 147 151 119Z':c.hairId==='bun'?'M155 109 Q148 65 188 57 Q230 53 245 88 L243 106 Q216 99 199 77 Q182 97 157 110Z':'M153 119 Q143 66 186 55 Q235 45 247 92 L244 119 Q225 102 207 76 Q184 101 156 112Z'} fill={hair}/>
 {c.hairId==='bun'&&<ellipse cx="208" cy="53" rx="27" ry="19" fill={hair}/>} {c.hairId==='waves'&&<path d="M151 112 Q137 153 149 185 Q137 216 149 243 M249 112 Q263 153 251 185 Q263 216 251 243" fill="none" stroke={hair} strokeWidth="19" strokeLinecap="round"/>}
 {dress?<><path d="M168 211 Q200 230 232 211 L258 240 L247 322 Q262 381 282 470 Q200 493 118 470 Q138 381 153 322 L142 240Z" fill={`url(#cloth${uid})`} stroke="#655b50" strokeWidth="1.5"/><path d="M168 211 Q200 256 232 211" fill="none" stroke="#e6d7c5" opacity=".7" strokeWidth="3"/><path d="M200 271 L200 461" stroke="#f5eee5" opacity=".18" strokeWidth="3"/></>:<><path d="M170 212 Q200 231 230 212 L270 233 L290 305 L269 314 L258 279 L255 411 Q201 426 145 411 L142 279 L131 314 L110 305 L130 233Z" fill={`url(#cloth${uid})`} stroke="#6c6054" strokeWidth="1.5"/>
 {(c.outfitId==='trench'||c.outfitId==='blazer')&&<><path d="M170 213 L158 238 L190 278 L199 252 L180 222 M230 213 L242 238 L210 278 L201 252 L220 222" fill="#e6ded1" opacity=".48"/><path d="M200 255 L200 410" stroke="#3e3731" opacity=".35" strokeWidth="2"/><path d="M155 333 Q200 341 245 333 L245 344 Q200 352 155 344Z" fill="#716457" opacity={c.outfitId==='trench'?'.65':'.15'}/><circle cx="208" cy="292" r="2.5" fill="#d7c8a5"/><circle cx="208" cy="314" r="2.5" fill="#d7c8a5"/></>}
 {c.outfitId==='shirt'&&<path d="M170 212 L182 242 L200 227 L218 242 L230 212 M200 227 L200 402" fill="none" stroke="#f4eee4" strokeWidth="3" opacity=".7"/>}
 {c.outfitId==='jacket'&&<><path d="M146 319 Q200 329 254 319 L255 353 Q200 365 145 353Z" fill="#302f2d" opacity=".4"/><path d="M200 229 L200 351" stroke="#ddd0b9" strokeWidth="2"/></>}
 {c.outfitId==='knit'&&<><path d="M180 212 Q200 246 220 212 M151 385 Q200 398 249 385" fill="none" stroke="#e1d2be" strokeWidth="5" opacity=".4"/><path d="M165 265 L165 375 M235 265 L235 375" stroke="#fff" opacity=".08" strokeWidth="4"/></>}</>}
 {boot&&<><path d="M154 557 L190 557 L190 642 L177 653 L147 648Z M210 557 L246 557 L253 648 L223 653 L210 642Z" fill={shoe}/><path d="M155 574 L188 574 M212 574 L245 574" stroke="#c5b299" opacity=".4"/></>}
 {tall&&<><path d="M154 607 L190 607 L190 645 L151 648Z M210 607 L246 607 L249 648 L210 645Z" fill={shoe}/></>}
 <path d={c.shoesId==='heels'?'M157 635 L187 635 L190 655 L147 658 L144 652Z M213 635 L243 635 L256 652 L253 658 L210 655Z':c.shoesId==='sandals'?'M153 640 L187 640 L191 655 L147 657 L145 652Z M213 640 L247 640 L255 652 L253 657 L209 655Z':'M153 637 L188 637 L192 656 Q176 663 144 657 L144 650Z M212 637 L247 637 L256 650 L256 657 Q224 663 208 656Z'} fill={shoe}/>
 {c.shoesId==='sneakers'&&<path d="M145 653 Q169 659 191 653 M209 653 Q231 659 255 653" fill="none" stroke="#eee9df" strokeWidth="5"/>}
 {c.shoesId==='sandals'&&<path d="M153 642 L181 652 M219 652 L247 642" stroke="#d1b999" strokeWidth="3"/>}
 </svg>
}
