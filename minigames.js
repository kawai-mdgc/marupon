/* minigames.js - party-style minigames (classic script; defines only, touches engine globals lazily)
   create(seed): all gameplay-critical randomness comes from per-instance seeded PRNGs (mgRng),
   so every player in an online match who gets the same seed faces identical challenges. */

function mgRng(seed){let a=seed|0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mgSeed(s){s=Number(s);if(!isFinite(s))s=Math.floor(Math.random()*1e9);return(Math.floor(Math.abs(s))%2147483647)||7}
function mgR(a,b){return a+Math.random()*(b-a)} // cosmetic only
function mgClamp(v,a,b){return v<a?a:v>b?b:v}
function mgIn(px,py,x,y,w,h){return px>=x&&px<=x+w&&py>=y&&py<=y+h}
function mgCircle(x,y,r,fill,lw){
  ctx.beginPath();ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2);
  ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=lw===undefined?3:lw;ctx.strokeStyle=OUT;if(ctx.lineWidth>0)ctx.stroke();
}
function mgHeart(x,y,s,col){
  ctx.beginPath();
  ctx.moveTo(x,y+s*0.9);
  ctx.bezierCurveTo(x-s*1.6,y-s*0.1,x-s*0.9,y-s*1.2,x,y-s*0.4);
  ctx.bezierCurveTo(x+s*0.9,y-s*1.2,x+s*1.6,y-s*0.1,x,y+s*0.9);
  ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
}
function mgArrow(x,y,s,d,fill){
  // d: 0 left, 1 right, 2 up, 3 down
  let p;
  if(d===0)p=[[-s,0],[s*0.6,-s*0.85],[s*0.6,s*0.85]];
  else if(d===1)p=[[s,0],[-s*0.6,-s*0.85],[-s*0.6,s*0.85]];
  else if(d===2)p=[[0,-s],[-s*0.85,s*0.6],[s*0.85,s*0.6]];
  else p=[[0,s],[-s*0.85,-s*0.6],[s*0.85,-s*0.6]];
  ctx.beginPath();ctx.moveTo(x+p[0][0],y+p[0][1]);ctx.lineTo(x+p[1][0],y+p[1][1]);ctx.lineTo(x+p[2][0],y+p[2][1]);ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=3;ctx.lineJoin='round';ctx.strokeStyle=OUT;ctx.stroke();
}
// round critter; feet at (x,y)
function mgBlob(x,y,r,col,t,o){
  o=o||{};const sx=o.sx||1,sy=o.sy||1,f=o.face||1;
  ctx.save();ctx.translate(x,y);ctx.scale(sx,sy);
  const w=Math.sin((o.walk===undefined?t:o.walk)*0.4)*r*0.25;
  mgCircle(-r*0.5,-r*0.14+w*0.4,r*0.3,'#fff3d6',3);
  mgCircle(r*0.5,-r*0.14-w*0.4,r*0.3,'#fff3d6',3);
  mgCircle(0,-r,r,col,3.5);
  ctx.globalAlpha=0.55;
  ctx.beginPath();ctx.arc(-r*0.62,-r*0.78,r*0.17,0,6.3);ctx.arc(r*0.62,-r*0.78,r*0.17,0,6.3);ctx.fillStyle='#ff8fa8';ctx.fill();
  ctx.globalAlpha=1;
  ctx.fillStyle=OUT;ctx.strokeStyle=OUT;ctx.lineWidth=2.5;
  const ex=r*0.33,ey=-r*1.12;
  for(let k=-1;k<=1;k+=2){
    const cx=k*ex+f*r*0.08;
    if(o.blink){ctx.beginPath();ctx.moveTo(cx-r*0.12,ey);ctx.lineTo(cx+r*0.12,ey);ctx.stroke()}
    else{ctx.beginPath();ctx.ellipse(cx,ey,r*0.11,r*0.17,0,0,6.3);ctx.fill()}
    if(o.angry){ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(cx-k*r*0.25,ey-r*0.4);ctx.lineTo(cx+k*r*0.1,ey-r*0.2);ctx.stroke();ctx.lineWidth=2.5}
  }
  ctx.beginPath();
  if(o.angry){ctx.arc(f*r*0.08,-r*0.62,r*0.16,Math.PI,0)}
  else{ctx.arc(f*r*0.08,-r*0.82,r*0.13,0.1,Math.PI-0.1)}
  ctx.stroke();
  ctx.restore();
}
function mgBg(c1,c2){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,c1);g.addColorStop(1,c2);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
function mgCloud(x,y,s){
  ctx.fillStyle='#ffffff';ctx.beginPath();
  ctx.arc(x,y,16*s,0,6.3);ctx.arc(x+18*s,y-6*s,20*s,0,6.3);ctx.arc(x+40*s,y,15*s,0,6.3);ctx.arc(x+20*s,y+6*s,18*s,0,6.3);ctx.fill();
}
function mgStar(x,y,r,col){
  ctx.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r2=i%2?r*0.45:r;
    const px=x+Math.cos(a)*r2,py=y+Math.sin(a)*r2;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);}
  ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.strokeStyle=OUT;ctx.stroke();
}
function mgSparkles(arr,x,y,n,cols){
  for(let i=0;i<n;i++){const a=Math.random()*6.283,s=mgR(1,4.5);
    arr.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:mgR(20,40),col:cols[i%cols.length]});}
  if(arr.length>260)arr.splice(0,arr.length-260);
}

/* ---- shared game scaffolding ---- */
const MG_TN=['ブロンズメダル','シルバーメダル','ゴールドメダル','にじいろメダル'];
function mgTier(score,th){return score<=0?-1:score>=th[2]?3:score>=th[1]?2:score>=th[0]?1:0}
function mgTierCol(i,t){return i===3?'hsl('+((t*9)%360)+',90%,62%)':['#e0a35c','#d9dde3','#ffd23f'][i]||'#fff'}
function mgMedal(x,y,r,tier,t){
  ctx.beginPath();ctx.moveTo(x-r*0.5,y-r*1.6);ctx.lineTo(x-r*0.1,y-r*0.6);ctx.lineTo(x-r*0.9,y-r*0.6);ctx.closePath();ctx.fillStyle='#ff5a7a';ctx.fill();
  ctx.beginPath();ctx.moveTo(x+r*0.5,y-r*1.6);ctx.lineTo(x+r*0.1,y-r*0.6);ctx.lineTo(x+r*0.9,y-r*0.6);ctx.closePath();ctx.fillStyle='#4aa8ff';ctx.fill();
  mgCircle(x,y,r,mgTierCol(tier,t),4);
  mgStar(x,y,r*0.6,'#ffffff');
}
function mgBase(title,seed){
  const s=mgSeed(seed);
  return {done:false,score:0,scoreText:'',title:title,t:0,ft:0,endT:0,endLabel:'',live:0,tier:-1,seed:s,rng:mgRng(s),parts:[],pops:[],shake:0,remotes:null};
}
function mgFinish(g,score,text,label,th){
  g.done=true;g.score=Math.max(0,Math.floor(score)||0);g.live=g.score;
  g.tier=th?mgTier(g.score,th):-1;
  g.scoreText=(g.tier>=0?MG_TN[g.tier]+'  ':'')+(text||(g.score+'てん'));
  g.endT=0;g.endLabel=label||'おしまい！';
  if(g.tier>=2)sfx.win();else if(g.tier>=1)sfx.item();else sfx.coin();
}
function mgFx(g){
  if(g.shake>0)g.shake--;
  for(let i=g.parts.length-1;i>=0;i--){const p=g.parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;if(p.life<=0)g.parts.splice(i,1)}
  for(let i=g.pops.length-1;i>=0;i--){const p=g.pops[i];p.y+=p.vy;p.vy*=0.96;p.life--;if(p.life<=0)g.pops.splice(i,1)}
}
function mgPop(g,x,y,str,col,size){g.pops.push({x:x,y:y,vy:-1.7,life:55,max:55,str:str,col:col||'#ffffff',size:size||22});if(g.pops.length>40)g.pops.shift()}
function mgDrawFx(g){
  for(const p of g.parts){ctx.globalAlpha=mgClamp(p.life/20,0,1);mgCircle(p.x,p.y,3,p.col,0);ctx.globalAlpha=1}
  for(const p of g.pops){const k=p.life/p.max;ctx.globalAlpha=mgClamp(k*2.2,0,1);outlinedText(p.str,p.x,p.y,p.size*(1+Math.max(0,k-0.8)*2.5),p.col);ctx.globalAlpha=1}
}
function mgShakeBegin(g){ctx.save();if(g.shake>0){const a=Math.min(g.shake,14)*0.55;ctx.translate(Math.sin(g.t*7.3)*a,Math.cos(g.t*9.1)*a)}}
function mgComboSfx(c){if(c>0&&c%10===0)sfx.oneup();else if(c>=6)sfx.item();else sfx.coin()}
function mgTick(left){if(left>0&&left<=300&&left%60===0)sfx.check()}
function mgDbl(left){return left<=600?2:1}
function mgVignette(g,left){
  if(left<=300&&left>0){const a=0.35+0.3*Math.abs(Math.sin(g.t*0.15));ctx.strokeStyle='rgba(255,40,40,'+a+')';ctx.lineWidth=12;ctx.strokeRect(0,0,W,H)}
}
function mgTimerHUD(g,left,x,y,dbl){
  const urgent=left<=300&&left>0;
  outlinedText(String(Math.ceil(Math.max(0,left)/60)),x,y,urgent?30+Math.abs(Math.sin(g.t*0.2))*8:26,urgent?'#ff5a5a':'#ffffff');
  if(dbl&&left>0&&left<=600)outlinedText('ラスト10びょう！ ポイント2ばい',400,y+30,15+Math.abs(Math.sin(g.t*0.12))*2,'#ffd23f',OUT,4);
  mgVignette(g,left);
}
const MG_RULE=480,MG_CD=MG_RULE+190;
function mgTitle(g){
  if(g.t<MG_CD+30){outlinedText(g.title,400,28,22,'#fff')}
}
function mgWrap(str,n){const out=[];let cur='';for(const ch of String(str)){cur+=ch;if(cur.length>=n&&/[ 　、。！？)）]/.test(ch)){out.push(cur.trim());cur=''}else if(cur.length>=n+6){out.push(cur);cur=''}}if(cur.trim())out.push(cur.trim());return out}
function mgCountdown(t,help){
  if(t>=MG_CD+40)return;
  if(t<MG_RULE){
    ctx.fillStyle='rgba(20,10,40,0.62)';ctx.fillRect(0,0,W,H);
    rr(80,70,640,300,22);ctx.fillStyle='rgba(255,255,255,0.96)';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle=OUT;ctx.stroke();
    outlinedText('あそびかた',400,108,30,'#ff5a7a','#fff',7);
    const lines=mgWrap(help,20);
    lines.slice(0,6).forEach(function(l,k){outlinedText(l,400,166+k*38,24,'#fff',OUT,5)});
    const net=(typeof netOn!=='undefined'&&netOn);
    const sec=Math.ceil((MG_RULE-t)/60);
    outlinedText(net?'みんなで いっしょに はじまるよ！ あと '+sec+'びょう':'タップ / Z で スタート！  (あと '+sec+'びょう)',400,342,t%60<42?20:18,'#ffd23f',OUT,5);
    return;
  }
  const u=t-MG_RULE;
  if(u<190){
    ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fillRect(0,0,W,H);
    const n=3-Math.floor(u/60),k=1-(u%60)/60;
    outlinedText(String(Math.max(1,n)),400,H/2+30,90+k*40,'#ffd23f');
  }else{
    const k=1-(u-190)/40;
    outlinedText('スタート！',400,H/2+20,60+k*30,'#7dff6a');
  }
}
function mgEndBanner(g){
  if(!g.done)return;
  const s=Math.min(1,g.endT/12);
  ctx.fillStyle='rgba(0,0,0,'+(0.3*s)+')';ctx.fillRect(0,0,W,H);
  outlinedText(g.endLabel||'おしまい！',400,140,56*(0.4+0.6*s),'#ffd23f');
  outlinedText(g.scoreText,400,205,34*(0.4+0.6*s),'#ffffff');
  if(g.tier>=0)mgMedal(400,300,36*(0.3+0.7*s),g.tier,g.endT);
}
function mgPress(){return !!(mi.ppress||mi.pl||mi.pr||mi.pu||mi.pd||mi.pa||mi.pb)}
function mgMove(g,spd,x0,x1,y0,y1){
  // shared movement: keys or pointer-follow. returns [mx,my]
  let dx=(mi.r?1:0)-(mi.l?1:0),dy=(mi.d?1:0)-(mi.u?1:0),mx=0,my=0;
  if(dx||dy){const l=Math.sqrt(dx*dx+dy*dy);mx=dx/l*spd;my=dy/l*spd}
  else if(mi.pdown||mi.px!==g.lpx||mi.py!==g.lpy){
    const tx=mi.px-g.px,ty=mi.py-g.py,d=Math.sqrt(tx*tx+ty*ty);
    if(d>1){const s=Math.min(spd*1.25,d*0.25);mx=tx/d*s;my=ty/d*s}
  }
  g.lpx=mi.px;g.lpy=mi.py;
  g.px=mgClamp(g.px+mx,x0,x1);g.py=mgClamp(g.py+my,y0,y1);
  g.vx=mx;g.vy=my;
  if(mx>0.3)g.face=1;else if(mx<-0.3)g.face=-1;
}

/* ------------------------------------------------------------------ */
/* 1. hop race                                                         */
/* ------------------------------------------------------------------ */
function mgCreateHop(seed){
  const N=60,BX=function(i){return 120+i*74},LY=[118,176,234,292];
  const PADS=[0,3,2,1]; // left, down, up, right
  const padX=function(i){return 70+i*170},PAD_Y=372,PAD_W=150,PAD_H=64;
  const TH=[1700,2500,2900];
  const g=mgBase('ぴょんぴょんレース',seed);
  const seq=[];
  for(let i=0;i<N+3;i++){let p=Math.floor(g.rng()*4);const q=g.rng();if(i>0&&p===seq[i-1]&&q<0.6)p=(p+1)%4;seq.push(p)}
  g.cf=-4;g.pts=0;g.streak=0;g.best=0;g.turbo=false;g.outT=0;g.rank=0;g.prompt=seq[0];g.near=0;
  const cols=['#ff9f43','#6ecb63','#a98bff'];
  const skills=[24,15,5],vars=[14,10,8];
  g.racers=[];
  for(let i=0;i<4;i++){
    const rg=mgRng(g.seed+101*(i+1));
    g.racers.push({lane:i,player:i===3,col:cols[i]||'#fff',board:0,x:BX(0)+37,x0:BX(0)+37,x1:BX(0)+37,hop:0,hopMax:8,stumble:0,
      rng:rg,wait:30+Math.floor(rg()*30),skill:skills[i]||0,vr:vars[i]||0,out:false,vy:0,fy:0,fin:-1,boards:0,rb:0});
  }
  const me=g.racers[3];
  const camOf=function(x){return Math.max(0,x-260)};
  function finishPlayer(){
    let ahead=0;for(let i=0;i<3;i++)if(g.racers[i].fin>=0)ahead++;
    g.rank=ahead+1;
    const bonus=[300,150,75,0][ahead];
    const sp=Math.max(0,Math.floor((2400-me.fin)/3));
    const total=g.pts+400+sp+bonus;
    mgFinish(g,total,g.rank+'い '+(me.fin/60).toFixed(1)+'びょう '+total+'てん',g.rank===1?'1いで ゴール！':'ゴール！',TH);
  }
  function doHop(r,step){
    r.x0=r.x;r.board=Math.min(N-1,r.board+step);r.boards=r.board;r.x1=BX(r.board)+37;r.hop=step>1?12:8;r.hopMax=r.hop;
    if(r.player)sfx.jump();
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const pt=g.ft,sec=pt/60;
    g.cf+=(1.5+0.1*sec)/60;
    let press=-1;
    if(mi.pl)press=0;else if(mi.pr)press=1;else if(mi.pu)press=2;else if(mi.pd)press=3;
    else if(mi.ppress){for(let i=0;i<4;i++)if(mgIn(mi.px,mi.py,padX(i),PAD_Y,PAD_W,PAD_H)){press=PADS[i];break}}
    for(let i=0;i<4;i++){
      const r=g.racers[i];
      if(r.out){r.vy+=0.5;r.fy+=r.vy;continue}
      if(r.fin>=0)continue;
      if(r.hop>0){
        r.hop--;
        r.x=r.x0+(r.x1-r.x0)*(1-r.hop/r.hopMax);
        if(r.hop===0){
          r.x=r.x1;
          if(r.board>=N-1){r.fin=pt;if(r.player)finishPlayer();}
        }
      }else if(r.stumble>0){r.stumble--}
      else if(r.player){
        if(press>=0){
          if(press===g.prompt){
            const near=me.board-g.cf<3.2;
            g.streak++;g.best=Math.max(g.best,g.streak);
            const step=g.turbo?2:1;g.turbo=false;
            doHop(me,step);
            const gain=10*step+Math.min(g.streak,12)*2+(near?25:0);
            g.pts+=gain;
            const sx=me.x-camOf(me.x);
            mgPop(g,sx+10,LY[3]-62,'+'+gain,near?'#ff9f43':'#ffffff',near?26:20);
            if(near){mgPop(g,sx+10,LY[3]-90,'ギリギリ！','#ff9f43',20);g.near++}
            mgComboSfx(g.streak);
            if(g.streak%8===0){g.turbo=true;mgPop(g,sx,LY[3]-120,'ターボ！','#7dff6a',26)}
            g.prompt=seq[me.board];
          }else{me.stumble=30;g.shake=12;g.streak=0;g.turbo=false;sfx.bump()}
        }
      }else{
        r.wait--;
        if(r.wait<=0){
          const q=r.rng(),w=Math.floor(r.skill+r.rng()*r.vr);
          if(q<0.1){r.stumble=26;r.wait=w}
          else{doHop(r,1);r.wait=w}
        }
      }
      if(!g.done&&r.board<=Math.floor(g.cf)&&r.fin<0){
        r.out=true;r.vy=-2;r.fy=0;
        if(r.player){sfx.die();g.outT=0;g.shake=16}
      }
    }
    if(g.remotes&&g.remotes.length){
      for(let i=0;i<3&&i<g.remotes.length;i++){
        const rm=g.remotes[i],est=mgClamp((rm.done?rm.score:rm.live)/30,0,N-1);
        g.racers[i].rb+=(est-g.racers[i].rb)*0.12;
      }
    }
    if(!g.done){
      g.live=g.pts;
      if(me.out){
        g.outT++;
        if(g.outT>70)mgFinish(g,g.pts,'おちちゃった！ '+me.boards+'まい '+g.pts+'てん','おちちゃった…',TH);
      }
    }
  };
  g.draw=function(){
    mgBg('#8fd8ff','#c8f0ff');
    const camX=camOf(me.x);
    mgShakeBegin(g);
    mgCloud(150-camX*0.1,50,1);mgCloud(520-camX*0.1,30,1.3);mgCloud(900-camX*0.1,60,1);
    ctx.fillStyle='#3a2a5a';ctx.fillRect(-10,96,W+20,H);
    ctx.fillStyle='#4a3670';
    for(let i=0;i<9;i++)ctx.fillRect(-10,120+i*40,W+20,6);
    for(let l=0;l<4;l++){
      const y=LY[l];
      for(let i=0;i<N;i++){
        const sx=BX(i)-camX;
        if(sx<-80||sx>W+10)continue;
        const d=g.cf-i;let off=0,al=1;
        if(d>0){off=d*d*40;al=Math.max(0,1-d*0.5)}
        else if(d>-1.5){off=Math.sin(g.t*2+i+l)*2}
        if(off>260||al<=0)continue;
        const rot=d>0?Math.min(0.5,d*0.3)*(i%2?1:-1):0;
        ctx.save();ctx.globalAlpha=al;ctx.translate(sx+33,y+off+6);ctx.rotate(rot);
        rr(-33,-6,66,14,5);ctx.fillStyle=(d>-2.5&&d<=0)?'#ff9f6e':(i%2)?'#e0a35c':'#f0b86e';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
        ctx.fillStyle='#b97b3c';ctx.fillRect(-22,-1,6,3);ctx.fillRect(14,-1,6,3);
        ctx.restore();
      }
      const fx=BX(N-1)+70-camX;
      if(fx>-40&&fx<W+40){
        ctx.fillStyle='#fff';ctx.fillRect(fx-2,y-44,4,46);ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.strokeRect(fx-2,y-44,4,46);
        for(let a=0;a<3;a++)for(let b=0;b<2;b++){ctx.fillStyle=(a+b)%2?'#fff':'#333';ctx.fillRect(fx+2+a*8,y-44+b*8,8,8)}
        ctx.strokeRect(fx+2,y-44,24,16);
      }
      const r=g.racers[l];
      const rem=(l<3&&g.remotes&&g.remotes[l])?g.remotes[l]:null;
      const sx=(rem?BX(0)+37+r.rb*74:r.x)-camX;
      let cy=y+2+(r.out&&!rem?r.fy:0),hy=0,ssx=1,ssy=1;
      if(r.hop>0&&!rem){const p=1-r.hop/r.hopMax;hy=Math.sin(p*Math.PI)*30;ssx=1-0.15*Math.sin(p*Math.PI);ssy=1+0.2*Math.sin(p*Math.PI)}
      else if(r.stumble>0&&!rem){ssy=0.8;ssx=1.15}
      if(cy<H+60&&sx>-40&&sx<W+40){
        if(r.player)drawChar(sx,cy-hy,1.15,{face:1,vx:0,vy:r.hop>0?-1:0,onGround:r.hop<=0,t:g.t,sx:ssx,sy:ssy,blink:0,dead:r.out,rot:r.out?r.fy*0.01:0});
        else mgBlob(sx,cy-hy,15,r.col,g.t,{sx:ssx,sy:ssy,face:1,walk:r.hop>0?g.t:0,blink:r.stumble>0&&!rem});
        if(rem)outlinedText(String(rem.name||'').slice(0,6),sx,cy-hy-40,13,'#fff',OUT,4);
        if(r.stumble>0&&!r.out&&!rem){outlinedText('!?',sx+16,cy-hy-34+Math.sin(g.t)*2,16,'#ffd23f')}
      }
    }
    ctx.restore();
    // prompt bubble (+ preview of next)
    if(g.t>=MG_CD&&!g.done&&!me.out){
      const sx=me.x-camX,by=LY[3]-100;
      rr(sx-26,by,52,44,12);ctx.fillStyle=g.turbo?'#fff1a8':'#fff';ctx.fill();ctx.lineWidth=g.turbo?5:3.5;ctx.strokeStyle=g.turbo?'#ff9f43':OUT;ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx-6,by+43);ctx.lineTo(sx,by+54);ctx.lineTo(sx+6,by+43);ctx.fillStyle=g.turbo?'#fff1a8':'#fff';ctx.fill();
      mgArrow(sx,by+22,15,g.prompt,'#ff5a7a');
      mgArrow(sx+42,by+22,9,seq[Math.min(N+1,me.board+(g.turbo?2:1))],'rgba(255,90,122,0.5)');
      if(g.turbo)outlinedText('ターボ！',sx,by-8,16,'#ff9f43',OUT,4);
    }
    // progress
    {
      const bx=250,bw=300,by=66;
      rr(bx-10,by-9,bw+20,18,9);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fill();
      const cfp=mgClamp((g.cf+1)/N,0,1);
      ctx.fillStyle='rgba(255,70,70,0.6)';ctx.fillRect(bx,by-5,bw*cfp,10);
      for(let i=0;i<4;i++){const r=g.racers[i];
        if(r.out)continue;
        const bd=(i<3&&g.remotes&&g.remotes[i])?r.rb:r.board;
        mgCircle(bx+bw*mgClamp(bd/(N-1),0,1),by,i===3?7:5,i===3?'#ff5a7a':r.col,2)}
    }
    mgDrawFx(g);
    if(!g.done){
      const pt=g.ft;
      outlinedText(g.pts+'てん',90,28,22,'#fff');
      outlinedText((pt/60).toFixed(1)+'びょう',720,28,18,'#fff');
      if(g.streak>=3)outlinedText('れんぞく '+g.streak,400,112+0,18,'#ffd23f',OUT,4);
      if(!me.out&&me.board-g.cf<2.6&&g.t>MG_CD+10){ctx.strokeStyle='rgba(255,40,40,'+(0.35+0.3*Math.abs(Math.sin(g.t*0.2)))+')';ctx.lineWidth=10;ctx.strokeRect(0,0,W,H)}
    }
    for(let i=0;i<4;i++){
      const px=padX(i);
      const pressed=mi.pdown&&mgIn(mi.px,mi.py,px,PAD_Y,PAD_W,PAD_H);
      rr(px,PAD_Y+(pressed?4:0),PAD_W,PAD_H-(pressed?4:0),16);
      ctx.fillStyle=pressed?'#ffe27a':'#ffffff';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
      mgArrow(px+PAD_W/2,PAD_Y+PAD_H/2+(pressed?4:0),20,PADS[i],'#ff8fa8');
    }
    mgTitle(g);mgCountdown(g.t,'でてくる やじるしと おなじ ボタン！ れんぞくで ターボ、ギリギリで ボーナス');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 2. cherry spin (two throws, bounce timing)                          */
/* ------------------------------------------------------------------ */
function mgCreateCherry(seed){
  const CX=400,CY=225,CAP=200,SPIN=360,RES=80,TH=[120,200,280];
  const g=mgBase('クルクルチェリー',seed);
  g.phase='spin';g.round=0;g.total=0;g.throws=[];g.rivals=[];g.rank=1;
  g.P=0;g.peak=0;g.act=0;g.ang=0;g.dir=1;g.lastTh=null;g.timeLeft=SPIN;g.lastKey='';g.dizzy=0;g.red=0;
  g.segs=null;g.seg=0;g.segF=0;g.pos=0;g.base=0;g.D=0;g.judged=[false,false,false];g.landIdx=-1;g.landAge=999;g.comboB=0;g.resT=0;g.shown=0;g.maxed=false;
  const rcols=['#ff9f43','#6ecb63','#a98bff'],rbase=[50,66,82];
  for(let i=0;i<3;i++){
    const rg=mgRng(g.seed+777+i);let tot=0;
    for(let k=0;k<2;k++)tot+=Math.round(mgClamp(rbase[i]+(rg()+rg()+rg()-1.5)*28,8,125));
    g.rivals.push({d:tot,col:rcols[i]});
  }
  function resetSpin(){g.phase='spin';g.P=0;g.peak=0;g.act=0;g.lastTh=null;g.timeLeft=SPIN;g.dizzy=0;g.red=0;g.lastKey='';g.shown=0}
  function launch(){
    const power=0.6*g.peak+0.4*g.P;
    let D=power*0.62;g.maxed=g.P>=CAP*0.9;if(g.maxed)D*=1.2;
    g.D=Math.max(0,D);
    g.segs=[{len:g.D*0.7,dur:100,h:mgClamp(60+g.D*1.2,60,210)},{len:g.D*0.15,dur:32,h:46},{len:g.D*0.09,dur:26,h:28},{len:g.D*0.06,dur:20,h:14}];
    g.seg=0;g.segF=0;g.pos=0;g.base=0;g.judged=[false,false,false];g.landIdx=-1;g.landAge=999;g.comboB=0;g.phase='fly';
    sfx.fire();g.shake=8;
    if(g.maxed)mgPop(g,400,150,'さいこうパワー！','#ff4a4a',30);
  }
  function judge(k,ad){
    g.judged[k]=true;
    const gx=260,gy=384;
    if(ad<=3||ad<=8){
      const perfect=ad<=3;
      const bonus=g.D*(perfect?0.12:0.06)*(1+0.5*g.comboB);
      g.segs[k+1].len+=bonus;g.comboB++;
      mgPop(g,gx,gy-100,(perfect?'ぴったり！ +':'いいね！ +')+Math.round(bonus)+'m',perfect?'#ffd23f':'#7dff6a',perfect?28:22);
      mgSparkles(g.parts,gx,gy,perfect?16:8,['#ffd23f','#fff','#ff9f43']);
      mgComboSfx(g.comboB*(perfect?2:1));
    }else{g.comboB=0;mgPop(g,gx,gy-100,'はずれ','#ff6a6a',20);sfx.bump()}
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    if(g.phase==='spin'){
      g.timeLeft--;mgTick(g.timeLeft);
      let imp=0;
      if(g.dizzy>0){g.dizzy--;g.lastTh=null}
      else{
        if(mi.pdown){
          const dx=mi.px-CX,dy=mi.py-CY;
          if(Math.sqrt(dx*dx+dy*dy)>25){
            const th=Math.atan2(dy,dx);
            if(g.lastTh!==null){
              let d=th-g.lastTh;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
              if(Math.abs(d)>0.6)d=0.6*(d<0?-1:1);
              imp+=Math.abs(d)*25;if(Math.abs(d)>0.005)g.dir=d<0?-1:1;
            }
            g.lastTh=th;
          }else g.lastTh=null;
        }else g.lastTh=null;
        if(mi.pl&&g.lastKey!=='l'){imp+=22;g.lastKey='l'}
        if(mi.pr&&g.lastKey!=='r'){imp+=22;g.lastKey='r'}
        if(mi.pa)imp+=10;
        if(mi.pu||mi.pd)imp+=10;
      }
      if(imp>0)g.act++;
      g.P=Math.min(CAP,g.P*0.97+imp);
      g.peak=Math.max(g.peak*0.995,g.P);
      g.ang+=g.dir*(g.P/CAP)*0.5;
      if(g.P>=CAP*0.9&&g.dizzy<=0){
        g.red++;
        if(g.red===1)sfx.check();
        if(g.red>110){g.dizzy=70;g.P*=0.35;g.peak=g.P;g.red=0;g.shake=14;sfx.bump();mgPop(g,400,150,'めが まわった！','#a98bff',30)}
      }else g.red=Math.max(0,g.red-2);
      g.live=g.total+Math.round(g.P*0.2);
      if((mi.prel&&g.act>=20)||(mi.pb&&g.act>=20)||g.timeLeft<=0)launch();
    }else if(g.phase==='fly'){
      g.segF++;g.landAge++;
      const s=g.segs[g.seg];
      if(mgPress()){
        let k=-1,ad=99;
        const toLand=g.seg<3?s.dur-g.segF:999;
        if(g.seg<3&&!g.judged[g.seg]&&toLand<=20){k=g.seg;ad=toLand}
        else if(g.landIdx>=0&&!g.judged[g.landIdx]&&g.landAge<=9){k=g.landIdx;ad=g.landAge}
        if(k>=0)judge(k,ad);
      }
      if(g.landIdx>=0&&!g.judged[g.landIdx]&&g.landAge>9)judge(g.landIdx,99);
      const u=Math.min(1,g.segF/s.dur),e=g.seg===0?1-Math.pow(1-u,2):u;
      g.pos=g.base+s.len*e;g.shown=g.pos;g.ang+=0.3;
      g.live=g.total+Math.round(g.pos);
      if(g.segF>=s.dur){
        g.base+=s.len;
        if(g.seg<3){g.landIdx=g.seg;g.landAge=0;g.seg++;g.segF=0;g.shake=Math.max(g.shake,5);sfx.stomp()}
        else{
          const d=Math.round(g.base);g.throws.push(d);g.total+=d;g.shown=d;g.phase='result';g.resT=0;
          g.live=g.total;
          mgPop(g,400,200,d+'m！','#ffd23f',44);sfx.win();
        }
      }
    }else if(g.phase==='result'){
      g.resT++;
      if(g.resT>=RES){
        if(g.round===0){g.round=1;resetSpin()}
        else{
          let better=0;for(let i=0;i<3;i++)if(g.rivals[i].d>g.total)better++;
          g.rank=better+1;g.phase='podium';
          mgFinish(g,g.total,g.total+'m とんだ！ '+g.rank+'い','おしまい！',TH);
        }
      }
    }
  };
  function drawCherry(x,y,s,ang,glow,sq){
    ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(s,s*(sq||1));
    ctx.lineWidth=5;ctx.strokeStyle='#4f8f3a';ctx.beginPath();ctx.moveTo(-26,-20);ctx.quadraticCurveTo(-8,-70,6,-82);ctx.moveTo(26,-20);ctx.quadraticCurveTo(10,-70,6,-82);ctx.stroke();
    ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.ellipse(18,-86,18,9,-0.4,0,6.3);ctx.fillStyle='#6ecb63';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
    if(glow){ctx.globalAlpha=glow;mgCircle(-26,0,34,'#ffd0d8',0);mgCircle(26,0,34,'#ffd0d8',0);ctx.globalAlpha=1}
    mgCircle(-26,0,26,'#ff4a6a',4);mgCircle(26,0,26,'#ff4a6a',4);
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.ellipse(-34,-9,6,9,0.5,0,6.3);ctx.ellipse(18,-9,6,9,0.5,0,6.3);ctx.fill();
    ctx.fillStyle=OUT;ctx.beginPath();ctx.ellipse(-30,2,3.2,5,0,0,6.3);ctx.ellipse(-18,2,3.2,5,0,0,6.3);ctx.fill();
    ctx.beginPath();ctx.arc(-24,10,4,0.1,Math.PI-0.1);ctx.lineWidth=2.5;ctx.stroke();
    ctx.restore();
  }
  function drawLand(){
    const ds=g.shown*30;
    mgBg('#9fdcff','#e7f8ff');
    mgCloud(((200-ds*0.05)%1000+1000)%1000-100,60,1.2);
    mgCloud(((650-ds*0.05)%1000+1000)%1000-100,100,1);
    ctx.fillStyle='#bfe6a8';
    for(let i=-1;i<8;i++){const x=i*180-(ds*0.15)%180;ctx.beginPath();ctx.arc(x+90,370,110,Math.PI,0);ctx.fill()}
    ctx.fillStyle='#8fd27a';
    for(let i=-1;i<8;i++){const x=i*140-(ds*0.4)%140;ctx.beginPath();ctx.arc(x+70,380,70,Math.PI,0);ctx.fill()}
    ctx.fillStyle='#6cc25a';ctx.fillRect(0,380,W,H-380);
    ctx.fillStyle='#8fd27a';ctx.fillRect(0,380,W,8);
    for(let m=0;m<=240;m+=10){
      const x=260+(m-g.shown)*30;
      if(x<-30||x>W+30)continue;
      ctx.fillStyle='#fff';ctx.fillRect(x-2,380,4,30);ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.strokeRect(x-2,380,4,30);
      outlinedText(m+'m',x,428,14,'#fff',OUT,4);
    }
    // rival markers
    g.rivals.forEach(function(r,i){
      const per=r.d/2,x=260+(per-g.shown)*30;
      if(x>-30&&x<W+30){mgBlob(x,382,10,r.col,g.t,{});outlinedText('CPU'+(i+1),x,350,11,'#fff',OUT,3)}
    });
  }
  g.draw=function(){
    if(g.phase==='fly'||g.phase==='result'||g.phase==='podium'){
      mgShakeBegin(g);drawLand();
      if(g.phase==='fly'||g.phase==='result'){
        let h=0,sq=1;
        if(g.phase==='fly'){
          const s=g.segs[g.seg],k=g.segF/s.dur;
          h=4*k*(1-k)*s.h;
          if(g.landAge<5)sq=0.75+g.landAge*0.05;
        }
        const cx=260,cy=370-h;
        ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.ellipse(cx,384,30*(1-Math.min(0.6,h/300)),7,0,0,6.3);ctx.fill();
        drawCherry(cx,cy-30,0.8,g.phase==='fly'?g.ang:0.3,g.maxed?0.5:0,sq);
        outlinedText(Math.floor(g.shown)+'m',400,70,52,'#ffd23f');
        if(g.phase==='fly'&&g.seg<3&&!g.judged[g.seg]){
          const toLand=g.segs[g.seg].dur-g.segF;
          if(toLand<=34){
            const rad=10+toLand*1.6;
            ctx.beginPath();ctx.arc(cx,384,rad,0,6.3);ctx.lineWidth=4;ctx.strokeStyle=toLand<=8?'#ffd23f':'#ffffff';ctx.stroke();
            if(g.seg===0)outlinedText('じめんに ついたら タップ！',400,120,20,'#fff',OUT,5);
          }
        }
      }else{
        const list=[{n:'あなた',d:g.total,col:'#ff4a6a',me:true}];
        g.rivals.forEach(function(r,i){list.push({n:'CPU'+(i+1),d:r.d,col:r.col})});
        list.sort(function(a,b){return b.d-a.d});
        const hs=[130,100,76,56];
        outlinedText('ランキング',400,36,24,'#fff');
        for(let i=0;i<4;i++){
          const x=[320,180,460,600][i],hh=hs[i];
          rr(x-55,380-hh,110,hh,8);ctx.fillStyle=['#ffd23f','#d9dde3','#e0a35c','#c9b8f0'][i];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
          outlinedText(String(i+1),x,380-hh+30,34,'#fff');
          if(list[i].me)drawCherry(x,380-hh-34,0.55,Math.sin(g.endT*0.1)*0.2,0);
          else mgBlob(x,380-hh,18,list[i].col,g.endT,{});
          outlinedText(list[i].n+' '+list[i].d+'m',x,380-hh-(list[i].me?96:56),15,'#fff',OUT,4);
        }
        if(g.tier>=0)mgMedal(690,90,30,g.tier,g.endT);
      }
      ctx.restore();
      mgDrawFx(g);
      if(g.phase==='fly')outlinedText('とんでけー！',400,100,24,'#fff',OUT,5);
      if(g.phase==='result')outlinedText((g.throws.length)+'かいめ: '+g.throws[g.throws.length-1]+'m とんだ！',400,150,26,'#fff',OUT,5);
    }else{
      mgBg('#ffe9f1','#ffd0e0');
      ctx.fillStyle='#ffc2d6';ctx.beginPath();ctx.arc(CX,CY+10,150,0,6.3);ctx.fill();
      ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.setLineDash&&ctx.setLineDash([8,10]);ctx.stroke();ctx.setLineDash&&ctx.setLineDash([]);
      ctx.fillStyle='#b97b3c';rr(CX-8,CY,16,120,6);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      const pw=g.P/CAP;
      ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,'+(0.3+0.5*pw)+')';
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(CX,CY,70+i*14,g.ang*g.dir+i*1.6,g.ang*g.dir+i*1.6+0.7+pw*0.8);ctx.stroke()}
      const shk=g.red>20?Math.sin(g.t*2)*3:0;
      drawCherry(CX+shk,CY,1.3+pw*0.2,g.ang,pw>0.8?0.5:0);
      if(g.dizzy>0){for(let i=0;i<4;i++){const a=g.t*0.15+i*1.57;mgStar(CX+Math.cos(a)*70,CY-110+Math.sin(a)*14,9,'#ffd23f')}}
      if(mi.pdown&&g.t>MG_CD){mgCircle(mi.px,mi.py,9,'#fff',3)}
      // gauge with red zone
      rr(180,396,440,26,13);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
      if(pw>0.01){
        rr(184,400,Math.max(18,432*pw),18,9);
        const gr=ctx.createLinearGradient(184,0,616,0);gr.addColorStop(0,'#7dff6a');gr.addColorStop(0.6,'#ffd23f');gr.addColorStop(1,'#ff4a4a');
        ctx.fillStyle=gr;ctx.fill();
      }
      ctx.fillStyle='rgba(255,60,60,0.35)';ctx.fillRect(184+432*0.9,400,432*0.1,18);
      outlinedText('パワー',150,409,15,'#fff',OUT,4);
      outlinedText('つよい！',650,409,13,'#ff4a4a',OUT,4);
      const tl=mgClamp(g.timeLeft/SPIN,0,1);
      rr(180,58,440,14,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      if(tl>0){rr(183,61,Math.max(10,434*tl),8,4);ctx.fillStyle=g.timeLeft<=180?'#ff5a5a':'#4aa8ff';ctx.fill()}
      outlinedText((g.round+1)+'かいめ / 2かい   のこり '+Math.ceil(Math.max(0,g.timeLeft)/60)+'びょう',400,92,16,'#fff',OUT,4);
      outlinedText('ぜんぶで '+g.total+'m',90,28,20,'#fff');
      if(g.t>MG_CD&&g.act<20)outlinedText('さくらんぼの まわりを ぐるぐる なぞろう！',400,350,18,'#fff',OUT,5);
      else if(g.act>=20)outlinedText(g.red>20?'まわしすぎ ちゅうい！ はなして！':'はなして とばす！ (Xキー) まっかで ボーナス',400,350,16,g.red>20?'#ff6a6a':'#fff',OUT,5);
      if(g.timeLeft>0&&g.timeLeft<=300)mgVignette(g,g.timeLeft);
      mgDrawFx(g);
    }
    mgTitle(g);mgCountdown(g.t,'ぐるぐる まわして なげる！ じめんに ついたら タップで ボーナス (キー: ◀▶)');
    if(g.done&&g.endT<60){const s=Math.min(1,g.endT/10);outlinedText('おしまい！',400,H/2-20,50*s,'#ffd23f')}
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 3. dodge                                                            */
/* ------------------------------------------------------------------ */
function mgCreateDodge(seed){
  const FX0=30,FX1=770,FY0=50,FY1=430,TOTAL=3000,TH=[760,1360,2040];
  const g=mgBase('よけろ！ボールシュート',seed);
  const ri=mgRng(g.seed+5);
  g.px=330;g.py=240;g.vx=0;g.vy=0;g.lives=3;g.inv=0;g.shield=0;g.balls=[];g.bombs=[];g.items=[];
  g.evT=70;g.itemT=100;g.itemN=0;g.hits=0;g.stars=0;g.near=0;g.chain=0;g.chainT=0;g.sc=0;g.scT=0;g.tp=0;g.ev=0;
  g.lpx=null;g.lpy=null;g.face=1;g.ey=240;
  function total(){return Math.floor(g.tp)+g.ev}
  function add(x,y,a,s,b){g.balls.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,b:b||0,rot:0,min:999,nm:false})}
  function event(){
    const sec=g.ft/60,r=g.rng(),a=g.rng(),b=g.rng(),c=g.rng();
    const sp=2.8+sec*0.07,ex=700,ey=g.ey,ty0=g.py-12;
    const ws=[3,sec>4?2:0,sec>3?2.5:0,sec>13?1.5:0,sec>10?1.5:0,sec>16?1.2:0];
    let tot=0;for(let i=0;i<ws.length;i++)tot+=ws[i];
    let q=r*tot,pat=0;for(let i=0;i<ws.length;i++){if(q<ws[i]){pat=i;break}q-=ws[i]}
    const d=Math.hypot(g.px-ex,ty0-ey),tt=d/sp,lead=sec>8?0.8:0.4;
    const base=Math.atan2(ty0+g.vy*tt*lead-ey,g.px+g.vx*tt*lead-ex);
    const spr=Math.max(0.03,0.08-sec*0.003);
    if(pat===0)add(ex-30,ey,base+(a-0.5)*2*spr,sp,0);
    else if(pat===1){add(ex-30,ey,base-0.3,sp,0);add(ex-30,ey,base+(a-0.5)*0.1,sp,0);add(ex-30,ey,base+0.3,sp,0)}
    else if(pat===2){const gy=FY0+70+a*(FY1-FY0-140);for(let y=FY0+22;y<FY1-8;y+=38){if(Math.abs(y-gy)<58)continue;add(FX1+12,y,Math.PI,2.1+sec*0.03,0)}}
    else if(pat===3)g.bombs.push({x:mgClamp(g.px+(a-0.5)*200,FX0+40,FX1-40),y:mgClamp(g.py+(b-0.5)*160,FY0+40,FY1-30),t:60,c:c});
    else if(pat===4){for(let i=0;i<7;i++){const x=FX0+30+((i*104+a*104)%680);add(x,FY0-8,Math.PI/2,2.4+sec*0.03,0)}}
    else add(ex-30,ey,base+(a-0.5)*2*spr,sp*1.05,2);
    sfx.bump();
    g.evT+=Math.max(24,Math.round(56-sec*1.4));
  }
  function end(full){
    const surv=Math.min(g.ft,TOTAL);
    if(full)g.ev+=100+(g.hits===0?200:0);
    mgFinish(g,total(),Math.floor(surv/60)+'びょう よけた！ ★'+g.stars+'こ'+(full&&g.hits===0?' いちども あたらなかった！':''),full?'ぜんぶ よけた！':'あたっちゃった…',TH);
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD){g.lpx=mi.px;g.lpy=mi.py;return}
    g.ft++;
    const left=TOTAL-g.ft,dbl=mgDbl(left);
    mgTick(left);
    mgMove(g,4.2,FX0+22,FX1-22,FY0+24,FY1-8);
    g.ey=240+110*Math.sin(g.ft*0.02);
    {const ex=725,ex2=g.px-ex,ey2=g.py-g.ey,dd=Math.sqrt(ex2*ex2+ey2*ey2);
      if(dd<48&&dd>0.01){g.px=ex+ex2/dd*48;g.py=g.ey+ey2/dd*48;g.px=mgClamp(g.px,FX0+22,FX1-22);g.py=mgClamp(g.py,FY0+24,FY1-8)}}
    if(g.inv>0)g.inv--;
    if(g.chainT>0){g.chainT--;if(g.chainT===0)g.chain=0}
    if(g.scT>0){g.scT--;if(g.scT===0)g.sc=0}
    g.tp+=0.25*dbl;
    if(g.ft>=g.evT)event();
    // bombs
    for(let i=g.bombs.length-1;i>=0;i--){
      const b=g.bombs[i];b.t--;
      if(b.t<=0){
        for(let k=0;k<10;k++)add(b.x,b.y,k*Math.PI/5+b.c*1.2,2.2,0);
        mgSparkles(g.parts,b.x,b.y,16,['#ff9f43','#ffd23f','#fff']);g.shake=Math.max(g.shake,7);sfx.boom();g.bombs.splice(i,1);
      }
    }
    // items
    g.itemT--;
    if(g.itemT<=0){
      const x=FX0+40+ri()*(FX1-FX0-170),y=FY0+50+ri()*(FY1-FY0-100);
      g.items.push({k:g.itemN%4===3?'shield':'star',x:x,y:y,life:360});g.itemN++;g.itemT=140;
    }
    for(let i=g.items.length-1;i>=0;i--){
      const it=g.items[i];it.life--;
      const dx=it.x-g.px,dy=it.y-(g.py-12);
      if(dx*dx+dy*dy<24*24){
        if(it.k==='star'){
          g.sc=g.scT>0?g.sc+1:1;g.scT=300;g.stars++;
          const gain=(40+Math.min(g.sc-1,4)*10)*dbl;g.ev+=gain;
          mgPop(g,it.x,it.y-14,'+'+gain,'#ffd23f',24);mgSparkles(g.parts,it.x,it.y,12,['#ffd23f','#fff']);mgComboSfx(g.sc);
        }else{g.shield=1;mgPop(g,it.x,it.y-14,'バリア！','#7ad7ff',22);mgSparkles(g.parts,it.x,it.y,12,['#7ad7ff','#fff']);sfx.item()}
        g.items.splice(i,1);continue;
      }
      if(it.life<=0)g.items.splice(i,1);
    }
    // balls
    for(let i=g.balls.length-1;i>=0;i--){
      const b=g.balls[i];
      b.x+=b.vx;b.y+=b.vy;b.rot+=0.2;
      if(b.b>0){
        let bounced=false;
        if(b.y<FY0+9){b.y=FY0+9;b.vy=-b.vy;bounced=true}
        else if(b.y>FY1-9){b.y=FY1-9;b.vy=-b.vy;bounced=true}
        if(b.x<FX0+9){b.x=FX0+9;b.vx=-b.vx;bounced=true}
        if(bounced){b.b--;mgSparkles(g.parts,b.x,b.y,4,['#fff','#ffd23f'])}
      }
      if(b.x<FX0-40||b.x>FX1+60||b.y<FY0-40||b.y>FY1+40){g.balls.splice(i,1);continue}
      const ddx=b.x-g.px,ddy=b.y-(g.py-12),dist=Math.sqrt(ddx*ddx+ddy*ddy);
      if(g.inv<=0&&dist<17){
        g.balls.splice(i,1);g.hits++;g.inv=60;g.shake=16;g.chain=0;g.chainT=0;
        if(g.shield){g.shield=0;sfx.bump();mgPop(g,g.px,g.py-50,'ガード！','#7ad7ff',24);mgSparkles(g.parts,g.px,g.py-12,14,['#7ad7ff','#fff'])}
        else{
          g.lives--;sfx.die();mgSparkles(g.parts,g.px,g.py-12,12,['#ff4a6a','#fff']);
          if(g.lives<=0){end(false);return}
        }
        continue;
      }
      if(dist<b.min)b.min=dist;
      else if(!b.nm&&b.min<30&&b.min>=17&&dist>b.min+0.5){
        b.nm=true;g.chain=g.chainT>0?g.chain+1:1;g.chainT=90;g.near++;
        const gain=(10+4*Math.min(g.chain-1,5))*dbl;g.ev+=gain;
        mgPop(g,g.px,g.py-46,'ギリギリ +'+gain,'#7dff6a',g.chain>=3?24:18);mgComboSfx(g.chain);
      }
    }
    g.live=total();
    if(g.ft>=TOTAL)end(true);
  };
  g.draw=function(){
    mgBg('#ffe58a','#ffc86a');
    mgShakeBegin(g);
    rr(FX0-8,FY0-8,FX1-FX0+16,FY1-FY0+16,34);ctx.fillStyle=OUT;ctx.fill();
    rr(FX0,FY0,FX1-FX0,FY1-FY0,28);ctx.fillStyle='#9be07a';ctx.fill();
    ctx.save();rr(FX0,FY0,FX1-FX0,FY1-FY0,28);ctx.clip();
    ctx.fillStyle='#8cd46c';
    for(let i=0;i<10;i++)if(i%2)ctx.fillRect(FX0+i*74,FY0,74,FY1-FY0);
    ctx.restore();
    ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.moveTo(400,FY0+10);ctx.lineTo(400,FY1-10);ctx.stroke();
    // bomb markers
    for(const b of g.bombs){
      const k=b.t/60,rad=20+(1-k)*8;
      ctx.beginPath();ctx.arc(b.x,b.y,rad+Math.sin(g.t*0.5)*3,0,6.3);ctx.lineWidth=4;ctx.strokeStyle=(Math.floor(g.t/4)%2)?'#ff4a4a':'#ffd23f';ctx.stroke();
      mgCircle(b.x,b.y,12,'#3a3a4a',3);outlinedText('!',b.x,b.y+7,18,'#ffd23f',OUT,3);
    }
    for(const it of g.items){
      if(it.life<90&&Math.floor(g.t/5)%2)continue;
      const bob=Math.sin(g.t*0.1+it.x)*3;
      if(it.k==='star')mgStar(it.x,it.y+bob,15,'#ffd23f');
      else{mgCircle(it.x,it.y+bob,14,'rgba(122,215,255,0.55)',3.5);outlinedText('S',it.x,it.y+bob+6,16,'#fff',OUT,3)}
    }
    let sq=1;const toFire=g.evT-g.ft;if(toFire<14&&toFire>0)sq=1+(14-toFire)*0.012;
    mgBlob(725,g.ey+34,34,'#c97a4a',g.t,{angry:true,sx:sq,sy:2-sq,face:-1,blink:false});
    for(const b of g.balls){
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);
      mgCircle(0,0,9,b.b>0?'#7ad7ff':'#ff6a6a',3);
      ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.arc(-3,-3,2.5,0,6.3);ctx.fill();
      ctx.restore();
    }
    if(!(g.inv>0&&Math.floor(g.t/4)%2===0)){
      ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(g.px,g.py+1,13,5,0,0,6.3);ctx.fill();
      drawChar(g.px,g.py,1,{face:g.face,vx:g.vx,vy:0,onGround:Math.abs(g.vx)<0.2,t:g.t,sx:1,sy:1,blink:0,dead:false,rot:0});
      if(g.shield){ctx.beginPath();ctx.arc(g.px,g.py-14,24,0,6.3);ctx.lineWidth=3;ctx.strokeStyle='rgba(122,215,255,0.9)';ctx.stroke();ctx.fillStyle='rgba(122,215,255,0.2)';ctx.fill()}
    }
    ctx.restore();
    mgDrawFx(g);
    const left=Math.max(0,TOTAL-g.ft);
    mgTimerHUD(g,left,400,28,true);
    for(let i=0;i<3;i++)mgHeart(60+i*38,28,11,i<g.lives?'#ff4a6a':'#c9bfc0');
    outlinedText(total()+'てん',715,28,22,'#fff');
    if(g.chain>=2)outlinedText('ギリギリ れんぞく x'+g.chain,400,H-8,16,'#7dff6a',OUT,4);
    mgTitle(g);mgCountdown(g.t,'ボールを よけろ！ ★でボーナス ギリギリで れんぞくボーナス (キー: ◀▶▲▼)');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 4. archery                                                          */
/* ------------------------------------------------------------------ */
function mgCreateArchery(seed){
  const BX=100,BY=330,TOTAL=3000,GRAV=0.17,VK=0.13,MAXPULL=110,GROUND=400,TH=[680,1530,2720];
  const lanesX=[470,590,710],lanesV=[0.7,1.0,1.3];
  const g=mgBase('まとあてアーチェリー',seed);
  g.pts=0;g.arrow=null;g.reload=0;g.targets=[];g.aim=false;g.pvx=0;g.pvy=0;g.ang=22;g.charge=0;g.charging=false;g.cdir=1;g.pull=0;
  g.combo=0;g.hits=0;g.wph=g.rng()*6.283;g.windNow=0;
  function roll(t){const r=t.rng();return r<0.12?'boss':r<0.46?'mid':r<0.74?'big':'friend'}
  for(let l=0;l<3;l++)for(let k=0;k<2;k++){
    const t={lane:l,x:lanesX[l],y:70+k*160+l*40,v:lanesV[l],sp:lanesV[l],type:'mid',rng:mgRng(g.seed*7+l*2+k+1)};
    t.type=roll(t);g.targets.push(t);
  }
  function radius(t){return t.type==='boss'?13:t.type==='mid'?18:t.type==='big'?26:20}
  function value(t){return t.type==='boss'?100:t.type==='mid'?30:t.type==='big'?10:-60}
  function mult(){return 1+Math.min(g.combo,6)*0.25}
  function shoot(vx,vy){
    if(g.arrow||g.reload>0)return false;
    g.arrow={x:BX+10,y:BY,vx:Math.max(vx,3),vy:vy,stuck:0};
    sfx.fire();return true;
  }
  function pullToV(px,py){
    let dx=BX-px,dy=BY-py;const l=Math.sqrt(dx*dx+dy*dy);
    if(l>MAXPULL){dx*=MAXPULL/l;dy*=MAXPULL/l}
    return {vx:dx*VK,vy:dy*VK,len:Math.min(l,MAXPULL)};
  }
  function windAt(ft){return Math.sin(ft*0.004+g.wph)*mgClamp((ft-300)/600,0,1)*0.012}
  function miss(){if(g.combo>0)mgPop(g,g.arrow.x>800?760:g.arrow.x,Math.min(g.arrow.y,380),'はずれ…','#ffffff',16);g.combo=0}
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const left=TOTAL-g.ft;mgTick(left);
    g.windNow=windAt(g.ft);
    const ramp=1+0.5*g.ft/TOTAL;
    for(const t of g.targets){
      t.sp=t.v*(t.type==='boss'?1.5:1)*ramp;
      t.y-=t.sp;
      if(t.y<30){t.y=420;t.type=roll(t)}
    }
    if(g.reload>0)g.reload--;
    if(!g.arrow&&g.reload<=0){
      if(mi.ppress){g.aim=true}
      if(g.aim&&mi.pdown){const p=pullToV(mi.px,mi.py);g.pvx=p.vx;g.pvy=p.vy;g.pull=p.len}
      if(g.aim&&mi.prel){
        g.aim=false;
        if(g.pull>18){shoot(g.pvx,g.pvy)}
        g.pull=0;
      }
    }else if(mi.prel)g.aim=false;
    if(!g.aim){
      if(mi.u)g.ang=Math.min(75,g.ang+0.8);
      if(mi.d)g.ang=Math.max(-10,g.ang-0.8);
      if(mi.a&&!g.arrow&&g.reload<=0){
        if(!g.charging){g.charging=true;g.charge=0;g.cdir=1}
        g.charge+=g.cdir*0.018;if(g.charge>=1){g.charge=1;g.cdir=-1}if(g.charge<=0){g.charge=0;g.cdir=1}
        const L=25+g.charge*(MAXPULL-25),a=g.ang*Math.PI/180;
        g.pvx=Math.cos(a)*L*VK;g.pvy=-Math.sin(a)*L*VK;g.pull=L;
      }else if(g.charging){
        g.charging=false;
        if(!g.arrow&&g.reload<=0)shoot(g.pvx,g.pvy);
        g.pull=0;g.charge=0;
      }
    }
    const A=g.arrow;
    if(A){
      if(A.stuck>0){A.stuck--;if(A.stuck<=0){g.arrow=null;g.reload=14}}
      else{
        A.vy+=GRAV;A.vx+=g.windNow;A.x+=A.vx;A.y+=A.vy;
        const ang=Math.atan2(A.vy,A.vx),tx=A.x+Math.cos(ang)*12,ty=A.y+Math.sin(ang)*12;
        let hit=null,best=1e9;
        for(const t of g.targets){
          if(t.y>405||t.y<20)continue;
          const dx=tx-t.x,dy=ty-t.y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<radius(t)+3&&d<best){best=d;hit=t}
        }
        if(hit){
          const v=value(hit),r=radius(hit);
          g.hits++;
          if(v>0){
            const bull=best<r*0.38,gain=Math.round(v*(bull?2:1)*mult()*mgDbl(left));
            g.pts+=gain;g.combo++;
            mgSparkles(g.parts,hit.x,hit.y,v>=100?22:12,v>=100?['#ffd23f','#fff','#ff9f43']:['#ff6a6a','#fff']);
            mgPop(g,hit.x,hit.y-20,(bull?'どまんなか！ +':'+')+gain,v>=100?'#ffd23f':bull?'#ff9f43':'#ffffff',bull||v>=100?28:22);
            if(g.combo>=2)mgPop(g,hit.x,hit.y+8,g.combo+'れんぞく x'+mult().toFixed(2),'#7dff6a',14);
            if(bull||v>=100)g.shake=Math.max(g.shake,6);
            if(v>=100)sfx.item();else mgComboSfx(g.combo);
          }else{
            g.pts=Math.max(0,g.pts+v);g.combo=0;g.shake=12;
            mgSparkles(g.parts,hit.x,hit.y,12,['#8aa0ff','#fff']);
            mgPop(g,hit.x,hit.y-20,String(v),'#ff6a6a',26);sfx.bump();
          }
          hit.type=roll(hit);hit.y=420;
          A.stuck=1;
        }else if(A.y>GROUND){A.y=GROUND;A.stuck=18;miss()}
        else if(A.x>840||A.y<-300){miss();g.arrow=null;g.reload=14}
      }
    }
    g.live=g.pts;
    if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん','じかんぎれ！',TH);
  };
  function drawTarget(t){
    const r=radius(t);
    if(t.y>470)return;
    if(t.type==='boss'){
      mgCircle(t.x,t.y,r,'#ffd23f',3.5);mgCircle(t.x,t.y,r*0.62,'#fff3b0',2.5);mgStar(t.x,t.y,r*0.5,'#ff9f43');
      outlinedText('100',t.x+r+14,t.y+5,12,'#ffd23f',OUT,3);
    }else if(t.type==='mid'){
      mgCircle(t.x,t.y,r,'#ffffff',3.5);mgCircle(t.x,t.y,r*0.68,'#ff6a6a',2.5);mgCircle(t.x,t.y,r*0.36,'#ffffff',2.5);mgCircle(t.x,t.y,r*0.14,'#ff6a6a',0);
    }else if(t.type==='big'){
      mgCircle(t.x,t.y,r,'#bfe3ff',3.5);mgCircle(t.x,t.y,r*0.55,'#ffffff',2.5);mgCircle(t.x,t.y,r*0.2,'#4aa8ff',0);
    }else{
      mgBlob(t.x,t.y+r,r,'#8fc7ff',t.y*0.2,{face:-1});
      outlinedText('×',t.x,t.y-r-6,14,'#ff6a6a',OUT,4);
    }
  }
  g.draw=function(){
    mgBg('#8fd8ff','#d8f4ff');
    mgShakeBegin(g);
    mgCloud(120,60,1.2);mgCloud(480,40,1);mgCloud(700,90,1.3);
    ctx.fillStyle='#bfe6a8';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(60+i*150,400,90,Math.PI,0);ctx.fill()}
    ctx.fillStyle='#6cc25a';ctx.fillRect(0,GROUND,W,H-GROUND);
    ctx.fillStyle='#8fd27a';ctx.fillRect(0,GROUND,W,6);
    for(let l=0;l<3;l++){ctx.fillStyle='rgba(150,100,60,0.5)';ctx.fillRect(lanesX[l]-2,30,4,GROUND-30)}
    for(const t of g.targets)drawTarget(t);
    drawChar(55,GROUND+2,1.4,{face:1,vx:0,vy:0,onGround:true,t:g.t,sx:1,sy:1,blink:0,dead:false,rot:0});
    const pulling=(g.aim&&g.pull>0)||g.charging;
    let aang=-0.35;
    if(pulling)aang=Math.atan2(g.pvy,g.pvx);
    else aang=-g.ang*Math.PI/180;
    const pl=pulling?g.pull:0;
    if(pulling&&!g.arrow){
      let x=BX+10,y=BY,vx=Math.max(g.pvx,3),vy=g.pvy;
      for(let i=0;i<36;i++){
        vy+=GRAV;x+=vx;y+=vy;
        if(i%3===2){ctx.globalAlpha=1-i/40;mgCircle(x,y,3,'#fff',1.5);ctx.globalAlpha=1}
        if(y>GROUND)break;
      }
    }else if(!g.arrow&&g.t>MG_CD){
      ctx.globalAlpha=0.5;const ha=-g.ang*Math.PI/180;
      mgCircle(BX+40*Math.cos(ha),BY+40*Math.sin(ha),3,'#fff',1.5);ctx.globalAlpha=1;
    }
    ctx.save();ctx.translate(BX,BY);ctx.rotate(aang);
    ctx.lineWidth=7;ctx.strokeStyle=OUT;ctx.beginPath();ctx.arc(0,0,36,-1.2,1.2);ctx.stroke();
    ctx.lineWidth=3.5;ctx.strokeStyle='#e0a35c';ctx.beginPath();ctx.arc(0,0,36,-1.2,1.2);ctx.stroke();
    const sx=36*Math.cos(1.2),sy=36*Math.sin(1.2);
    ctx.lineWidth=2;ctx.strokeStyle=OUT;ctx.beginPath();ctx.moveTo(sx,-sy);ctx.lineTo(-pl*0.35,0);ctx.lineTo(sx,sy);ctx.stroke();
    if(!g.arrow&&g.reload<=0){
      const ax=-pl*0.35;
      ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.beginPath();ctx.moveTo(ax,0);ctx.lineTo(ax+46,0);ctx.stroke();
      ctx.lineWidth=2;ctx.strokeStyle='#fff3d6';ctx.beginPath();ctx.moveTo(ax,0);ctx.lineTo(ax+46,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(ax+52,0);ctx.lineTo(ax+42,-5);ctx.lineTo(ax+42,5);ctx.closePath();ctx.fillStyle='#ff6a6a';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=OUT;ctx.stroke();
    }
    ctx.restore();
    if(g.aim&&mi.pdown){ctx.setLineDash&&ctx.setLineDash([4,6]);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.moveTo(BX,BY);ctx.lineTo(mi.px,mi.py);ctx.stroke();ctx.setLineDash&&ctx.setLineDash([]);mgCircle(mi.px,mi.py,7,'#fff',2.5)}
    if(g.arrow){
      const A=g.arrow,a=Math.atan2(A.vy,A.vx);
      ctx.save();ctx.translate(A.x,A.y);ctx.rotate(a);
      ctx.lineWidth=5;ctx.strokeStyle=OUT;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(14,0);ctx.stroke();
      ctx.lineWidth=2.5;ctx.strokeStyle='#fff3d6';ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(14,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(10,-6);ctx.lineTo(10,6);ctx.closePath();ctx.fillStyle='#ff6a6a';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=OUT;ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    mgDrawFx(g);
    if(g.charging){
      rr(30,60,120,16,8);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      rr(33,63,Math.max(8,114*g.charge),10,5);ctx.fillStyle='#ff9f43';ctx.fill();
    }
    // wind sock
    {
      const w=g.windNow/0.012,wx=620,wy=26;
      outlinedText('かぜ',wx-34,wy+6,13,'#fff',OUT,3);
      if(Math.abs(w)<0.08)outlinedText('なし',wx+6,wy+6,13,'#fff',OUT,3);
      else{for(let i=0;i<3;i++){if(Math.abs(w)>i*0.33)mgArrow(wx+(w>0?1:-1)*(i*14-14)+8,wy,6,w>0?1:0,'#ffd23f')}}
    }
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    mgTimerHUD(g,TOTAL-g.ft,730,28,true);
    if(g.combo>=2)outlinedText(g.combo+'れんぞく！ x'+mult().toFixed(2),400,H-6,18,'#ffd23f',OUT,4);
    mgTitle(g);mgCountdown(g.t,'ひっぱって はなす！ まんなかで 2ばい、れんぞくで ボーナス、ともだち(×)は NG！');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 5. coin grab                                                        */
/* ------------------------------------------------------------------ */
function mgCreateCoin(seed){
  const FX0=30,FX1=770,FY0=56,FY1=430,TOTAL=3000,TH=[760,1530,2550];
  const g=mgBase('コインゲット！',seed);
  g.px=400;g.py=250;g.vx=0;g.vy=0;g.face=1;g.lpx=null;g.lpy=null;g.stun=0;g.mag=0;g.combo=0;g.comT=0;g.pts=0;g.objs=[];g.evT=30;g.evN=0;g.got=0;g.maxCombo=0;
  function mult(){return Math.min(5,1+Math.floor(g.combo/5))}
  function spawn(){
    const sec=g.ft/60;
    const r1=g.rng(),r2=g.rng(),r3=g.rng(),r4=g.rng(),r5=g.rng();
    const x=FX0+30+r2*(FX1-FX0-60),y=FY0+30+r3*(FY1-FY0-60);
    const bw=sec<3?0:0.12+0.16*Math.min(1,sec/25);
    let k;
    if(g.evN%22===10)k='magnet';
    else if(r1<bw)k='bomb';
    else if(r1>0.92)k='gold';
    else k='coin';
    const o={k:k,x:x,y:y,age:0,vx:0,vy:0,tele:0,life:k==='gold'?260:k==='magnet'?380:k==='bomb'?520:420};
    if(k==='bomb'){const a=r4*6.283,s=0.8+r5*0.9;o.vx=Math.cos(a)*s;o.vy=Math.sin(a)*s;o.tele=45}
    g.objs.push(o);g.evN++;
    g.evT+=Math.max(12,Math.round(24-g.ft/150));
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD){g.lpx=mi.px;g.lpy=mi.py;return}
    g.ft++;
    const left=TOTAL-g.ft,dbl=mgDbl(left);
    mgTick(left);
    if(g.stun>0){g.stun--;g.vx=0;g.vy=0;g.lpx=mi.px;g.lpy=mi.py}
    else mgMove(g,3.7,FX0+16,FX1-16,FY0+22,FY1-6);
    if(g.comT>0){g.comT--;if(g.comT===0)g.combo=0}
    if(g.mag>0)g.mag--;
    if(g.ft>=g.evT)spawn();
    for(let i=g.objs.length-1;i>=0;i--){
      const o=g.objs[i];o.age++;o.life--;
      if(o.k==='bomb'){
        if(o.tele>0)o.tele--;
        else{
          o.x+=o.vx;o.y+=o.vy;
          if(o.x<FX0+16){o.x=FX0+16;o.vx=-o.vx}if(o.x>FX1-16){o.x=FX1-16;o.vx=-o.vx}
          if(o.y<FY0+16){o.y=FY0+16;o.vy=-o.vy}if(o.y>FY1-16){o.y=FY1-16;o.vy=-o.vy}
        }
      }else if(g.mag>0&&(o.k==='coin'||o.k==='gold')){
        const dx=g.px-o.x,dy=g.py-12-o.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<170&&d>1){o.x+=dx/d*3.8;o.y+=dy/d*3.8}
      }
      if(o.life<=0){g.objs.splice(i,1);continue}
      const dx=o.x-g.px,dy=o.y-(g.py-12),d2=dx*dx+dy*dy;
      if(o.k==='bomb'){
        if(o.tele<=0&&g.stun<=0&&d2<26*26){
          g.stun=60;g.combo=0;g.comT=0;const loss=Math.min(g.pts,40);g.pts-=loss;g.shake=18;
          mgSparkles(g.parts,o.x,o.y,22,['#ff9f43','#ffd23f','#ff4a4a']);mgPop(g,o.x,o.y-20,'-'+loss,'#ff6a6a',28);sfx.boom();
          g.objs.splice(i,1);
        }
      }else if(d2<22*22){
        if(o.k==='magnet'){g.mag=300;mgPop(g,o.x,o.y-20,'じしゃく！','#ff6a6a',24);sfx.item();mgSparkles(g.parts,o.x,o.y,14,['#ff6a6a','#4aa8ff','#fff'])}
        else{
          g.combo=g.comT>0?g.combo+1:1;g.comT=55;g.maxCombo=Math.max(g.maxCombo,g.combo);g.got++;
          const gain=(o.k==='gold'?50:10)*mult()*dbl;g.pts+=gain;
          mgPop(g,o.x,o.y-16,'+'+gain,o.k==='gold'?'#ffd23f':'#ffffff',o.k==='gold'?26:18+mult()*2);
          mgSparkles(g.parts,o.x,o.y,o.k==='gold'?14:6,['#ffd23f','#fff']);
          mgComboSfx(g.combo);
        }
        g.objs.splice(i,1);
      }
    }
    g.live=g.pts;
    if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  '+g.got+'こ','じかんぎれ！',TH);
  };
  g.draw=function(){
    mgBg('#7ad0ff','#4aa8e8');
    mgShakeBegin(g);
    rr(FX0-8,FY0-8,FX1-FX0+16,FY1-FY0+16,30);ctx.fillStyle=OUT;ctx.fill();
    rr(FX0,FY0,FX1-FX0,FY1-FY0,24);ctx.fillStyle='#f6e3a8';ctx.fill();
    ctx.save();rr(FX0,FY0,FX1-FX0,FY1-FY0,24);ctx.clip();
    ctx.fillStyle='#f0d68e';
    for(let i=0;i<20;i++)for(let j=0;j<11;j++)if((i+j)%2)ctx.fillRect(FX0+i*37,FY0+j*37,37,37);
    ctx.restore();
    if(g.mag>0){ctx.beginPath();ctx.arc(g.px,g.py-12,170,0,6.3);ctx.lineWidth=3;ctx.strokeStyle='rgba(255,90,90,'+(0.3+0.2*Math.sin(g.t*0.3))+')';ctx.stroke()}
    for(const o of g.objs){
      const bob=Math.sin(g.t*0.12+o.x)*2;
      if(o.k==='bomb'){
        if(o.tele>0){const a=Math.floor(g.t/3)%2?0.9:0.4;ctx.globalAlpha=a;mgCircle(o.x,o.y,16,'#3a3a4a',3);ctx.globalAlpha=1;ctx.beginPath();ctx.arc(o.x,o.y,22+o.tele*0.4,0,6.3);ctx.lineWidth=3;ctx.strokeStyle='#ff4a4a';ctx.stroke()}
        else{
          mgCircle(o.x,o.y,15,'#3a3a4a',3.5);
          ctx.lineWidth=3;ctx.strokeStyle='#e0a35c';ctx.beginPath();ctx.moveTo(o.x+6,o.y-13);ctx.quadraticCurveTo(o.x+12,o.y-22,o.x+18,o.y-18);ctx.stroke();
          mgStar(o.x+19,o.y-19,5+Math.abs(Math.sin(g.t*0.5))*3,'#ff9f43');
          ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(o.x-5,o.y-4,3,0,6.3);ctx.arc(o.x+5,o.y-4,3,0,6.3);ctx.fill();
          ctx.fillStyle='#ff4a4a';ctx.fillRect(o.x-6,o.y+4,12,3);
        }
      }else if(o.k==='magnet'){
        if(o.life<90&&Math.floor(g.t/5)%2)continue;
        ctx.lineWidth=9;ctx.strokeStyle=OUT;ctx.beginPath();ctx.arc(o.x,o.y+bob,11,Math.PI,0);ctx.lineTo(o.x+11,o.y+bob+10);ctx.moveTo(o.x-11,o.y+bob);ctx.lineTo(o.x-11,o.y+bob+10);ctx.stroke();
        ctx.lineWidth=5;ctx.strokeStyle='#ff4a4a';ctx.beginPath();ctx.arc(o.x,o.y+bob,11,Math.PI,0);ctx.lineTo(o.x+11,o.y+bob+10);ctx.moveTo(o.x-11,o.y+bob);ctx.lineTo(o.x-11,o.y+bob+10);ctx.stroke();
        ctx.fillStyle='#fff';ctx.fillRect(o.x-14,o.y+bob+8,6,6);ctx.fillRect(o.x+8,o.y+bob+8,6,6);
      }else{
        if(o.life<70&&Math.floor(g.t/5)%2)continue;
        const sx=Math.abs(Math.cos(g.t*0.1+o.x))*0.7+0.3,r=o.k==='gold'?15:11;
        ctx.save();ctx.translate(o.x,o.y+bob);ctx.scale(sx,1);
        mgCircle(0,0,r,o.k==='gold'?'#ffb020':'#ffd23f',3);mgCircle(0,0,r*0.55,o.k==='gold'?'#fff3b0':'#ffe680',2);
        ctx.restore();
        if(o.k==='gold')mgStar(o.x+14,o.y-14+bob,5,'#fff');
      }
    }
    if(!(g.stun>0&&Math.floor(g.t/3)%2===0)){
      ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(g.px,g.py+1,13,5,0,0,6.3);ctx.fill();
      drawChar(g.px,g.py,1,{face:g.face,vx:g.vx,vy:0,onGround:Math.abs(g.vx)<0.2&&Math.abs(g.vy)<0.2,t:g.t,sx:1,sy:1,blink:0,dead:false,rot:g.stun>0?Math.sin(g.t)*0.2:0});
    }
    if(g.stun>0)for(let i=0;i<3;i++){const a=g.t*0.2+i*2.1;mgStar(g.px+Math.cos(a)*16,g.py-36+Math.sin(a)*5,5,'#ffd23f')}
    ctx.restore();
    mgDrawFx(g);
    mgTimerHUD(g,TOTAL-g.ft,400,28,true);
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    if(g.combo>=2)outlinedText(g.combo+'れんぞく x'+mult(),700,28,20,'#ffd23f',OUT,4);
    if(g.comT>0){ctx.fillStyle='#ffd23f';ctx.fillRect(620,40,Math.max(0,160*g.comT/55),5)}
    if(g.mag>0)outlinedText('じしゃく '+Math.ceil(g.mag/60),400,H-8,16,'#ff6a6a',OUT,4);
    mgTitle(g);mgCountdown(g.t,'コインを あつめろ！ れんぞくで ポイントが ふえる、ばくだんに ちゅうい (キー: ◀▶▲▼)');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 6. rhythm tap                                                       */
/* ------------------------------------------------------------------ */
function mgCreateTap(seed){
  const LX=180,LW=110,HIT=340,TOP=66,FALL=95,TOTAL=3100,TH=[4250,8160,11900];
  const LCOL=['#ff6a8a','#ffb340','#5ad0ff','#a98bff'],ADIR=[0,3,2,1]; // lanes: left, down, up, right
  const g=mgBase('リズムタップ',seed);
  g.notes=[];g.pts=0;g.combo=0;g.maxCombo=0;g.flash=[0,0,0,0];g.counts=[0,0,0,0];g.pulse=0;
  {
    let prev=-1;
    for(let k=0,tt=100;tt<2950;k++,tt+=14){
      const sec=tt/60,r1=g.rng(),r2=g.rng(),r3=g.rng();
      const on=k%2===0;
      const pr=on?0.55+0.3*Math.min(1,sec/25):(sec<6?0:0.12+0.4*Math.min(1,(sec-6)/22));
      if(r1<pr){
        const lane=prev<0?Math.floor(r2*4):(prev+1+Math.floor(r2*3))%4;
        const type=(sec>5&&r3<0.08)?'bomb':r3>0.92?'star':'note';
        g.notes.push({t:tt,lane:lane,type:type,res:null,age:0});prev=lane;
      }
    }
  }
  function mult(){return Math.min(4,1+0.5*Math.floor(g.combo/10))}
  function resolve(n,res,gain,col,txt){
    n.res=res;
    const x=LX+n.lane*LW+LW/2;
    if(gain>0){
      g.pts+=gain;g.combo++;g.maxCombo=Math.max(g.maxCombo,g.combo);g.counts[res==='perfect'?0:res==='great'?1:2]++;
      mgPop(g,x,HIT-50,txt+' +'+gain,col,res==='perfect'?22:18);
      mgSparkles(g.parts,x,HIT,res==='perfect'?12:6,[col,'#fff']);
      if(res==='perfect'||g.combo%5===0)mgComboSfx(g.combo);else sfx.coin();
    }
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const left=TOTAL-g.ft,dbl=mgDbl(left);mgTick(left);
    for(let i=0;i<4;i++)if(g.flash[i]>0)g.flash[i]--;
    if(g.pulse>0)g.pulse--;
    const taps=[];
    if(mi.pl)taps.push(0);if(mi.pd)taps.push(1);if(mi.pu)taps.push(2);if(mi.pr)taps.push(3);
    if(mi.ppress&&mi.px>=LX&&mi.px<LX+4*LW&&mi.py>=TOP-10)taps.push(Math.floor((mi.px-LX)/LW));
    for(const lane of taps){
      g.flash[lane]=8;
      let best=null,bd=99;
      for(const n of g.notes){
        if(n.res||n.lane!==lane)continue;
        const ad=Math.abs(g.ft-n.t);
        if(ad<=13&&ad<bd){bd=ad;best=n}
      }
      const x=LX+lane*LW+LW/2;
      if(!best){if(g.combo>0)mgPop(g,x,HIT-40,'はずれ','#ff6a6a',16);g.combo=0;continue}
      if(best.type==='bomb'){
        best.res='bomb';g.combo=0;const loss=Math.min(g.pts,60);g.pts-=loss;g.shake=14;
        mgSparkles(g.parts,x,HIT,16,['#ff9f43','#ff4a4a','#fff']);mgPop(g,x,HIT-50,'ばくだん！ -'+loss,'#ff6a6a',22);sfx.boom();continue;
      }
      const star=best.type==='star'?3:1,m=mult()*dbl*star;
      if(bd<=4)resolve(best,'perfect',Math.round(30*m),'#ffd23f','ぴったり！');
      else if(bd<=8)resolve(best,'great',Math.round(20*m),'#7dff6a','いいね！');
      else resolve(best,'ok',Math.round(10*m),'#ffffff','まあまあ');
      if(best.type==='star')g.shake=Math.max(g.shake,5);
    }
    for(const n of g.notes){
      if(n.res)continue;
      if(g.ft>n.t+13){
        const x=LX+n.lane*LW+LW/2;
        if(n.type==='bomb'){n.res='safe';mgPop(g,x,HIT-40,'よけた！','#7ad7ff',14)}
        else{n.res='miss';if(g.combo>5)sfx.bump();g.combo=0;mgPop(g,x,HIT-40,'はずれ','#ff6a6a',18)}
      }
    }
    g.live=g.pts;
    if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  さいだい '+g.maxCombo+'れんぞく','おしまい！',TH);
  };
  g.draw=function(){
    const fever=g.combo>=30;
    mgBg(fever?'#4a1a6a':'#2a2a5a',fever?'#a02a6a':'#4a3a8a');
    mgShakeBegin(g);
    // lanes
    for(let i=0;i<4;i++){
      const x=LX+i*LW;
      ctx.fillStyle=g.flash[i]>0?'rgba(255,255,255,0.28)':'rgba(255,255,255,0.08)';ctx.fillRect(x+2,TOP,LW-4,H-TOP);
      ctx.fillStyle=LCOL[i];ctx.globalAlpha=0.35+(g.flash[i]>0?0.4:0);ctx.fillRect(x+2,HIT-4,LW-4,8);ctx.globalAlpha=1;
    }
    ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.moveTo(LX,HIT);ctx.lineTo(LX+4*LW,HIT);ctx.stroke();
    // notes
    for(const n of g.notes){
      if(n.res&&n.res!=='safe')continue;
      const y=HIT-(n.t-g.ft)*(HIT-TOP)/FALL;
      if(y<TOP-30||y>H+30)continue;
      if(n.res==='safe')continue;
      const x=LX+n.lane*LW+LW/2;
      if(n.type==='bomb'){
        mgCircle(x,y,19,'#2a2a3a',3.5);
        ctx.lineWidth=3;ctx.strokeStyle='#e0a35c';ctx.beginPath();ctx.moveTo(x+6,y-17);ctx.quadraticCurveTo(x+12,y-26,x+18,y-22);ctx.stroke();
        mgStar(x+19,y-23,5+Math.abs(Math.sin(g.t*0.5))*3,'#ff9f43');
        outlinedText('×',x,y+7,20,'#ff4a4a',OUT,3);
      }else{
        rr(x-40,y-15,80,30,12);ctx.fillStyle=n.type==='star'?'#ffd23f':LCOL[n.lane];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
        if(n.type==='star')mgStar(x,y,13,'#fff');else mgArrow(x,y,9,ADIR[n.lane],'#fff');
      }
    }
    ctx.restore();
    mgDrawFx(g);
    // pads
    for(let i=0;i<4;i++){
      const x=LX+i*LW,pressed=g.flash[i]>0;
      rr(x+6,372+(pressed?4:0),LW-12,56-(pressed?4:0),14);ctx.fillStyle=pressed?'#ffffff':LCOL[i];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
      mgArrow(x+LW/2,400+(pressed?4:0),15,ADIR[i],pressed?LCOL[i]:'#ffffff');
    }
    // HUD
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    mgTimerHUD(g,TOTAL-g.ft,730,28,true);
    if(g.combo>=3){outlinedText(g.combo+'',90,100,40+Math.min(20,g.combo*0.5),fever?'#ff9ff0':'#ffd23f');outlinedText('れんぞく x'+mult().toFixed(1),90,126,16,'#fff',OUT,4)}
    if(fever)outlinedText('もりあがりタイム！',690,110,22,'#ff9ff0',OUT,5);
    mgTitle(g);mgCountdown(g.t,'おちてくる おとを せんに あわせて タップ！ ばくだん(×)は さわらない！');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 7. stack                                                            */
/* ------------------------------------------------------------------ */
function mgCreateStack(seed){
  const BH=26,FLOOR=410,TOTAL=3000,AMP=170,CX=400,TH=[680,2040,5100];
  const g=mgBase('ぐらぐらスタック',seed);
  g.tower=[{x:CX,w:200,gold:false,hue:200,drop:0,perfect:0}];
  g.count=0;g.combo=0;g.pts=0;g.cur=null;g.spawnT=0;g.falling=[];g.cam=0;g.over=false;g.overT=0;g.bestCombo=0;
  function topOf(){return g.tower[g.tower.length-1]}
  function speed(){return Math.min(0.046,0.024+0.0016*g.count)}
  function spawn(){
    const t=topOf();
    g.cur={x:CX,w:t.w,ph:g.rng()*6.283,gold:(g.count+1)%6===0};
    g.cur.x=CX+Math.sin(g.cur.ph)*AMP;
  }
  spawn();
  function topY(i){return FLOOR-(i+1)*BH}
  function drop(left){
    const t=topOf(),c=g.cur;
    const l=Math.max(t.x-t.w/2,c.x-c.w/2),r=Math.min(t.x+t.w/2,c.x+c.w/2),ov=r-l;
    const n=g.tower.length;
    g.cur=null;
    if(ov<6){
      g.falling.push({x:c.x,w:c.w,y:topY(n)-70,vy:0,rot:0,vr:c.x>t.x?0.05:-0.05,gold:c.gold,hue:(n*17)%360});
      g.over=true;g.overT=0;g.shake=18;sfx.die();return;
    }
    const off=c.x-t.x,vpx=AMP*speed()*Math.abs(Math.cos(c.ph));
    const perfect=Math.abs(off)<=5+vpx*0.5;
    let nb;
    if(perfect){
      g.combo++;g.bestCombo=Math.max(g.bestCombo,g.combo);
      nb={x:t.x,w:Math.min(200,t.w+(t.w<200?Math.min(2+g.combo,8):0)),gold:c.gold,hue:(n*17)%360,drop:8,perfect:14};
      mgSparkles(g.parts,t.x,topY(n)+BH/2,14,['#ffd23f','#fff']);
      g.shake=Math.max(g.shake,4);
    }else{
      g.combo=0;
      nb={x:(l+r)/2,w:ov,gold:c.gold,hue:(n*17)%360,drop:8,perfect:0};
      const cl=c.x-c.w/2,cr=c.x+c.w/2;
      if(c.x>t.x)g.falling.push({x:(r+cr)/2,w:cr-r,y:topY(n),vy:0,rot:0,vr:0.06,gold:c.gold,hue:nb.hue});
      else g.falling.push({x:(cl+l)/2,w:l-cl,y:topY(n),vy:0,rot:0,vr:-0.06,gold:c.gold,hue:nb.hue});
      g.shake=Math.max(g.shake,3);
    }
    g.tower.push(nb);g.count++;
    const base=perfect?10+10+10*Math.min(g.combo-1,6):10;
    const gain=base*(c.gold?3:1)*mgDbl(left);
    g.pts+=gain;
    const sx=nb.x,sy=topY(n)-g.cam*0;
    mgPop(g,sx,topY(n)-g.cam-10,(perfect?'ぴったり！ +':'+')+gain,perfect?'#ffd23f':'#ffffff',perfect?26:20);
    if(perfect&&g.combo>=2)mgPop(g,sx,topY(n)-g.cam-38,g.combo+'れんぞく','#7dff6a',16);
    if(perfect)mgComboSfx(g.combo);else sfx.stomp();
    g.spawnT=10;
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const left=TOTAL-g.ft;mgTick(left);
    const tcam=Math.max(0,(g.tower.length-6)*BH);
    g.cam+=(tcam-g.cam)*0.12;
    for(let i=g.falling.length-1;i>=0;i--){const f=g.falling[i];f.vy+=0.5;f.y+=f.vy;f.rot+=f.vr;if(f.y>FLOOR+300)g.falling.splice(i,1)}
    for(const b of g.tower){if(b.drop>0)b.drop--;if(b.perfect>0)b.perfect--}
    if(g.over){g.overT++;if(g.overT>50)mgFinish(g,g.pts,g.pts+'てん  '+g.count+'だん つんだ！','くずれちゃった！',TH);g.live=g.pts;return}
    if(g.cur){
      if(mgPress())drop(left);
      else{g.cur.ph+=speed();g.cur.x=CX+Math.sin(g.cur.ph)*AMP}
    }else{g.spawnT--;if(g.spawnT<=0)spawn()}
    g.live=g.pts;
    if(!g.over&&g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  '+g.count+'だん つんだ！','じかんぎれ！',TH);
  };
  function drawBlock(x,y,w,hue,gold,glow){
    rr(x-w/2,y,w,BH,6);
    ctx.fillStyle=gold?'#ffd23f':'hsl('+hue+',75%,62%)';ctx.fill();ctx.lineWidth=glow?5:3.5;ctx.strokeStyle=glow?'#ffffff':OUT;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(x-w/2+5,y+4,Math.max(0,w-10),4);
    if(gold)mgStar(x,y+BH/2,8,'#fff');
  }
  g.draw=function(){
    const hgt=Math.min(1,g.tower.length/30);
    mgBg(hgt<0.5?'#8fd8ff':'#3a5aa8',hgt<0.5?'#d8f4ff':'#8fd8ff');
    mgShakeBegin(g);
    mgCloud(100,80+g.cam*0.1,1.1);mgCloud(520,140+g.cam*0.1,1.4);mgCloud(700,50+g.cam*0.1,0.9);
    ctx.fillStyle='#6cc25a';ctx.fillRect(0,FLOOR+BH-g.cam*0+g.cam,W,H);
    ctx.save();ctx.translate(0,g.cam);
    ctx.fillStyle='#8fd27a';ctx.fillRect(0,FLOOR,W,6);
    ctx.fillStyle='#6cc25a';ctx.fillRect(0,FLOOR,W,200);
    for(let i=0;i<g.tower.length;i++){const b=g.tower[i];drawBlock(b.x,topY(i)-b.drop*8,b.w,b.hue,b.gold,b.perfect>0)}
    const t=topOf(),ty=topY(g.tower.length-1);
    if(g.cur&&!g.over){
      // guide lines
      ctx.setLineDash&&ctx.setLineDash([5,7]);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,0.8)';
      ctx.beginPath();ctx.moveTo(t.x-t.w/2,ty-110);ctx.lineTo(t.x-t.w/2,ty);ctx.moveTo(t.x+t.w/2,ty-110);ctx.lineTo(t.x+t.w/2,ty);ctx.stroke();
      ctx.beginPath();ctx.moveTo(t.x,ty-110);ctx.lineTo(t.x,ty);ctx.stroke();
      ctx.setLineDash&&ctx.setLineDash([]);
      drawBlock(g.cur.x,ty-BH-62,g.cur.w,(g.tower.length*17)%360,g.cur.gold,false);
    }
    for(const f of g.falling){ctx.save();ctx.translate(f.x,f.y+BH/2);ctx.rotate(f.rot);drawBlock(0,-BH/2,f.w,f.hue,f.gold,false);ctx.restore()}
    ctx.restore();
    ctx.restore();
    mgDrawFx(g);
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    outlinedText(g.count+'だん',90,56,18,'#fff',OUT,4);
    mgTimerHUD(g,TOTAL-g.ft,730,28,true);
    if(g.combo>=2)outlinedText('ぴったり '+g.combo+'れんぞく！',400,H-10,20,'#ffd23f',OUT,4);
    if(g.cur&&g.cur.gold)outlinedText('★ ゴールドブロック 3ばい ★',400,100,18,'#ffd23f',OUT,4);
    mgTitle(g);mgCountdown(g.t,'タップで ブロックを おとす！ ぴったり かさねて れんぞくボーナス、はずすと くずれる');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 8. whack                                                            */
/* ------------------------------------------------------------------ */
function mgCreateWhack(seed){
  const TOTAL=3000,TH=[850,2040,4250];
  const HX=[230,400,570],HY=[205,310,415];
  const g=mgBase('ぽこぽこモグラ',seed);
  g.pts=0;g.combo=0;g.comT=0;g.maxCombo=0;g.stun=0;g.cur=4;g.kb=false;g.hammer=null;g.sched=[];g.got=0;g.bonks=0;
  {
    const busy=[0,0,0,0,0,0,0,0,0];
    let tt=50;
    while(tt<2980){
      const pr=tt/3000,r1=g.rng(),r2=g.rng(),r3=g.rng(),r4=g.rng();
      let ok=-1;const h0=Math.floor(r1*9);
      for(let k=0;k<9;k++){const h=(h0+k)%9;if(busy[h]<=tt){ok=h;break}}
      const dur=Math.round(78-38*pr+r4*10);
      if(ok>=0){
        const type=r2<0.07+0.03*pr?'gold':(tt>180&&r3<0.14+0.10*pr)?'decoy':'mole';
        busy[ok]=tt+dur+10;
        g.sched.push({t:tt,hole:ok,type:type,dur:dur,hit:0,esc:false});
      }
      tt+=Math.round(36-17*pr+r4*6);
    }
  }
  function mult(){return Math.min(5,1+Math.floor(g.combo/4))}
  function hx(h){return HX[h%3]}
  function hy(h){return HY[Math.floor(h/3)]}
  function whack(h,left){
    g.hammer={h:h,t:10};
    let best=null;
    for(const m of g.sched){
      if(m.hole!==h||m.hit)continue;
      const age=g.ft-m.t;
      if(age>=4&&age<=m.dur-4){best=m;break}
    }
    const x=hx(h),y=hy(h)-40;
    if(!best){if(g.combo>0){mgPop(g,x,y-30,'からぶり','#ffffff',16)}g.combo=0;g.comT=0;sfx.bump();return}
    best.hit=g.ft;
    if(best.type==='decoy'){
      g.combo=0;g.comT=0;g.stun=25;g.shake=14;const loss=Math.min(g.pts,40);g.pts-=loss;
      mgSparkles(g.parts,x,y,16,['#ff4a4a','#ffd23f','#fff']);mgPop(g,x,y-30,'ちがうよ！ -'+loss,'#ff6a6a',26);sfx.die();
    }else{
      g.combo++;g.comT=75;g.maxCombo=Math.max(g.maxCombo,g.combo);g.got++;
      const base=best.type==='gold'?50:10,gain=base*mult()*mgDbl(left);
      g.pts+=gain;
      mgPop(g,x,y-30,'+'+gain,best.type==='gold'?'#ffd23f':'#ffffff',best.type==='gold'?28:18+mult()*2);
      mgSparkles(g.parts,x,y,best.type==='gold'?18:8,best.type==='gold'?['#ffd23f','#fff']:['#ffb340','#fff']);
      if(best.type==='gold'){g.shake=Math.max(g.shake,5);sfx.item()}else mgComboSfx(g.combo);
    }
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const left=TOTAL-g.ft;mgTick(left);
    if(g.stun>0)g.stun--;
    if(g.hammer){g.hammer.t--;if(g.hammer.t<=0)g.hammer=null}
    if(g.comT>0){g.comT--;if(g.comT===0)g.combo=0}
    if(mi.pl||mi.pr||mi.pu||mi.pd){
      g.kb=true;let c=g.cur%3,r=Math.floor(g.cur/3);
      if(mi.pl)c=Math.max(0,c-1);if(mi.pr)c=Math.min(2,c+1);if(mi.pu)r=Math.max(0,r-1);if(mi.pd)r=Math.min(2,r+1);
      g.cur=r*3+c;
    }
    if(g.stun<=0){
      if(mi.pa||mi.pb){g.kb=true;whack(g.cur,left)}
      else if(mi.ppress){
        let bh=-1,bd=60*60;
        for(let h=0;h<9;h++){const dx=mi.px-hx(h),dy=mi.py-(hy(h)-30),d=dx*dx+dy*dy;if(d<bd){bd=d;bh=h}}
        if(bh>=0){g.kb=false;whack(bh,left)}
      }
    }
    for(const m of g.sched){
      if(!m.esc&&!m.hit&&g.ft>m.t+m.dur){m.esc=true}
    }
    g.live=g.pts;
    if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  '+g.got+'ひき たたいた！','じかんぎれ！',TH);
  };
  function drawHole(h){
    const x=hx(h),y=hy(h);
    ctx.fillStyle='#3a2418';ctx.beginPath();ctx.ellipse(x,y,56,16,0,0,6.3);ctx.fill();
    ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
  }
  function drawMole(m){
    const age=g.ft-m.t;
    if(age<0)return;
    const x=hx(m.hole),y=hy(m.hole);
    let p=age<8?age/8:age>m.dur-8?(m.dur-age)/8:1;
    if(m.hit){p=Math.max(0,1-(g.ft-m.hit)/8)}
    if(p<=0)return;
    ctx.save();ctx.beginPath();ctx.rect(x-80,y-120,160,120+0);ctx.clip();
    const top=y-8-p*62;
    const body=m.type==='gold'?'#ffd23f':m.type==='decoy'?'#6a6a8a':'#b9855a';
    const squash=m.hit?0.7:1;
    ctx.save();ctx.translate(x,y);ctx.scale(1,squash);ctx.translate(-x,-y);
    rr(x-34,top,68,80,28);ctx.fillStyle=body;ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
    mgCircle(x-26,top+6,9,body,3);mgCircle(x+26,top+6,9,body,3);
    ctx.fillStyle=OUT;
    if(m.hit){ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.beginPath();ctx.moveTo(x-18,top+22);ctx.lineTo(x-8,top+30);ctx.moveTo(x-8,top+22);ctx.lineTo(x-18,top+30);ctx.moveTo(x+8,top+22);ctx.lineTo(x+18,top+30);ctx.moveTo(x+18,top+22);ctx.lineTo(x+8,top+30);ctx.stroke()}
    else{ctx.beginPath();ctx.ellipse(x-13,top+26,4,6,0,0,6.3);ctx.ellipse(x+13,top+26,4,6,0,0,6.3);ctx.fill()}
    mgCircle(x,top+38,7,m.type==='decoy'?'#ff4a4a':'#ff8fa8',3);
    if(m.type==='decoy'){ctx.lineWidth=4;ctx.strokeStyle='#ff4a4a';ctx.beginPath();ctx.moveTo(x-22,top+14);ctx.lineTo(x-6,top+20);ctx.moveTo(x+22,top+14);ctx.lineTo(x+6,top+20);ctx.stroke()}
    if(m.type==='gold'){mgStar(x,top-6,9,'#fff')}
    ctx.restore();
    ctx.restore();
    // front lip
    ctx.fillStyle='#3a2418';ctx.beginPath();ctx.ellipse(x,y+4,58,10,0,0,Math.PI);ctx.fill();
    if(m.type==='decoy'&&!m.hit)outlinedText('×',x,top-8,20,'#ff4a4a',OUT,4);
  }
  g.draw=function(){
    mgBg('#9be07a','#6cc25a');
    ctx.fillStyle='rgba(255,255,255,0.12)';for(let i=0;i<8;i++)ctx.fillRect(i*100,0,50,H);
    mgShakeBegin(g);
    for(let r=0;r<3;r++){
      for(let c=0;c<3;c++)drawHole(r*3+c);
      for(const m of g.sched)if(Math.floor(m.hole/3)===r&&m.t<=g.ft&&g.ft<=m.t+m.dur+10)drawMole(m);
    }
    if(g.kb&&g.t>MG_CD){const x=hx(g.cur),y=hy(g.cur);ctx.beginPath();ctx.ellipse(x,y-24,64,52,0,0,6.3);ctx.lineWidth=4;ctx.strokeStyle='#ffffff';ctx.stroke()}
    if(g.hammer){
      const x=hx(g.hammer.h),y=hy(g.hammer.h)-60,k=g.hammer.t/10;
      ctx.save();ctx.translate(x+30,y-20+(1-k)*10);ctx.rotate(-0.8+(1-k)*1.2);
      ctx.fillStyle='#b97b3c';rr(-5,0,10,70,4);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      rr(-26,-22,52,30,8);ctx.fillStyle='#ff6a6a';ctx.fill();ctx.stroke();
      ctx.restore();
    }
    if(g.stun>0)outlinedText('いたっ！',400,150,30,'#ffd23f',OUT,5);
    ctx.restore();
    mgDrawFx(g);
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    mgTimerHUD(g,TOTAL-g.ft,730,28,true);
    if(g.combo>=2){outlinedText(g.combo+'れんぞく x'+mult(),400,H-26,22,'#ffd23f',OUT,5);ctx.fillStyle='#ffd23f';ctx.fillRect(300,H-14,Math.max(0,200*g.comT/75),6)}
    mgTitle(g);mgCountdown(g.t,'でてきた モグラを たたけ！ キラキラは 5ばい、あかいまゆげ(×)は たたくな！ (キー: ◀▶▲▼ + Z)');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 9. しんけいすいじゃく (メモリー)                                    */
/* ------------------------------------------------------------------ */
function mgCreateMemory(seed){
  const TOTAL=4200,TH=[800,2200,4400];
  const BOARDS=[[4,3],[4,4],[5,4],[6,4]];
  const FACES=['🍎','🍌','🍇','🍓','🍒','🍉','🍋','🥕','🍄','⭐','🐱','🐶','🐸','🐰'];
  const BACKS=['#7ac0ff','#ff9ecb','#9be88a','#ffd36a'];
  const g=mgBase('しんけいすいじゃく',seed);
  g.pts=0;g.combo=0;g.bi=0;g.cards=[];g.sel=[];g.lock=0;g.peek=0;g.cur=0;g.pairs=0;g.kb=false;g.nextT=0;g.clears=0;g.maxCombo=0;
  function layout(){
    const b=BOARDS[Math.min(g.bi,BOARDS.length-1)];
    g.cols=b[0];g.rows=b[1];g.cw=Math.min(112,(W-60)/g.cols);g.ch=Math.min(104,(H-150)/g.rows);
    g.ox=(W-g.cols*g.cw)/2;g.oy=92+(H-150-g.rows*g.ch)/2;
  }
  function newBoard(){
    layout();
    const n=g.cols*g.rows/2,idx=FACES.map(function(_,i){return i});
    for(let i=idx.length-1;i>0;i--){const j=Math.floor(g.rng()*(i+1));const t=idx[i];idx[i]=idx[j];idx[j]=t}
    const arr=[];for(let k=0;k<n;k++){arr.push(idx[k]);arr.push(idx[k])}
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(g.rng()*(i+1));const t=arr[i];arr[i]=arr[j];arr[j]=t}
    g.cards=arr.map(function(f){return {f:f,up:false,flip:1,vanish:0,m:false}});
    g.peek=270+g.bi*40;g.peekMax=g.peek;g.sel=[];g.lock=0;g.cur=0;g.nextT=0;
  }
  newBoard();
  function cx(i){return g.ox+(i%g.cols)*g.cw+g.cw/2}
  function cy(i){return g.oy+Math.floor(i/g.cols)*g.ch+g.ch/2}
  function pick(i,left){
    const c=g.cards[i];
    if(!c||c.m||c.up||g.lock>0||g.peek>0||g.nextT>0||g.sel.length>=2)return;
    c.up=true;g.sel.push(i);sfx.jump();
    if(g.sel.length===2){
      const a=g.cards[g.sel[0]],b=g.cards[g.sel[1]];
      if(a.f===b.f){
        g.combo++;g.maxCombo=Math.max(g.maxCombo,g.combo);g.pairs++;
        const gain=100*Math.min(5,g.combo)*mgDbl(left);
        g.pts+=gain;a.m=b.m=true;a.vanish=b.vanish=22;
        for(let k=0;k<2;k++){const j=g.sel[k];mgSparkles(g.parts,cx(j),cy(j),12,['#ffd23f','#fff','#ff8aa8'])}
        mgPop(g,(cx(g.sel[0])+cx(g.sel[1]))/2,Math.min(cy(g.sel[0]),cy(g.sel[1]))-20,'+'+gain+(g.combo>=2?'  '+g.combo+'れんぞく!':''),'#ffd23f',22+Math.min(8,g.combo*2));
        mgComboSfx(g.combo);g.sel=[];
        if(g.cards.every(function(x){return x.m})){
          g.nextT=40;g.clears++;const bonus=300+g.bi*100;g.pts+=bonus;
          mgPop(g,400,70,'ぜんぶ そろった！ +'+bonus,'#7dff6a',28);sfx.win();
        }
      }else{
        if(g.combo>0)mgPop(g,cx(i),cy(i)-40,'ざんねん','#ffffff',16);
        g.combo=0;g.lock=42;sfx.bump();
      }
    }
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const left=TOTAL-g.ft;mgTick(left);
    if(g.peek>0){
      g.peek--;if(g.peek===0){for(const c of g.cards)c.up=false}
    }else{
      if(g.lock>0){g.lock--;if(g.lock===0){for(const k of g.sel)g.cards[k].up=false;g.sel=[]}}
    }
    if(g.nextT>0){g.nextT--;if(g.nextT===0){g.bi++;newBoard()}}
    for(const c of g.cards){
      const tgt=(c.up||g.peek>0)?1:0;
      c.flip+=(tgt-c.flip)*0.35;if(Math.abs(tgt-c.flip)<0.02)c.flip=tgt;
      if(c.vanish>0)c.vanish--;
    }
    if(mi.pl||mi.pr||mi.pu||mi.pd){
      g.kb=true;let c=g.cur%g.cols,r=Math.floor(g.cur/g.cols);
      if(mi.pl)c=(c+g.cols-1)%g.cols;if(mi.pr)c=(c+1)%g.cols;if(mi.pu)r=(r+g.rows-1)%g.rows;if(mi.pd)r=(r+1)%g.rows;
      g.cur=r*g.cols+c;
    }
    if(mi.pa||mi.pb){g.kb=true;pick(g.cur,left)}
    else if(mi.ppress){
      for(let i=0;i<g.cards.length;i++){
        if(mgIn(mi.px,mi.py,cx(i)-g.cw/2+3,cy(i)-g.ch/2+3,g.cw-6,g.ch-6)){g.kb=false;g.cur=i;pick(i,left);break}
      }
    }
    g.live=g.pts;
    if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  '+g.pairs+'ペア みつけた！','じかんぎれ！',TH);
  };
  g.draw=function(){
    mgBg('#ffd9ec','#ffb6d9');
    ctx.fillStyle='rgba(255,255,255,0.18)';for(let i=0;i<8;i++)ctx.fillRect(i*100,0,50,H);
    mgShakeBegin(g);
    for(let i=0;i<g.cards.length;i++){
      const c=g.cards[i];
      if(c.m&&c.vanish<=0)continue;
      const x=cx(i),y=cy(i),w=g.cw-8,h=g.ch-8,sc=c.m?c.vanish/22:1;
      const fx=Math.abs(Math.cos(c.flip*Math.PI)),face=c.flip>0.5;
      ctx.save();ctx.translate(x,y+(c.m?-(1-sc)*20:0));ctx.scale(Math.max(0.04,fx)*sc,sc);
      rr(-w/2,-h/2,w,h,12);
      if(face){ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
        ctx.font='bold '+Math.floor(Math.min(w,h)*0.62)+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';ctx.fillText(FACES[c.f],0,3)}
      else{ctx.fillStyle=BACKS[g.bi%4];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold '+Math.floor(h*0.5)+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('?',0,3)}
      ctx.restore();
    }
    if(g.kb&&g.t>MG_CD&&g.cards[g.cur]&&!g.cards[g.cur].m){ctx.strokeStyle='#ffffff';ctx.lineWidth=5;rr(cx(g.cur)-g.cw/2+1,cy(g.cur)-g.ch/2+1,g.cw-2,g.ch-2,14);ctx.stroke()}
    ctx.restore();
    mgDrawFx(g);
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    mgTimerHUD(g,TOTAL-g.ft,730,28,true);
    if(g.peek>0&&g.t>MG_CD){outlinedText('おぼえて！',320,62,24,'#ffd23f',OUT,5);outlinedText(String(Math.ceil(g.peek/60)),440,62,40,'#ffffff',OUT,6);ctx.fillStyle='#ffd23f';ctx.fillRect(250,86,300*g.peek/(g.peekMax||1),6)}
    else if(g.combo>=2)outlinedText(g.combo+'れんぞく x'+Math.min(5,g.combo),400,H-22,22,'#ffd23f',OUT,5);
    mgTitle(g);mgCountdown(g.t,'おなじ ならびを 2まい そろえよう！ はじめに ちょっとだけ みせるよ。れんぞくで ポイントアップ (キー: ◀▶▲▼ + Z)');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 10. あいつをさがせ                                                  */
/* ------------------------------------------------------------------ */
function mgCreateFind(seed){
  const TOTAL=3000,TH=[1360,3400,6800];
  const CC=['#ff8a8a','#7ad0ff','#ffe066','#9be88a','#c9a0ff','#ffb06a'];
  const g=mgBase('あいつをさがせ',seed);
  g.round=0;g.pts=0;g.combo=0;g.stun=0;g.chars=[];g.target=null;g.rt=0;g.limit=0;g.found=0;g.miss=0;g.px=400;g.py=270;g.kb=false;g.msgT=0;g.revT=0;
  function accAt(x,y,r,a,t){
    // a: 0 なし 1 リボン 2 ぼうし 3 めがね 4 おうかん
    const hx=x,hy=y-r;
    ctx.lineWidth=2.4;ctx.strokeStyle=OUT;
    if(a===1){ctx.fillStyle='#ff4a7a';ctx.beginPath();ctx.moveTo(hx-r*0.1,hy-r*0.95);ctx.lineTo(hx-r*0.85,hy-r*1.35);ctx.lineTo(hx-r*0.75,hy-r*0.55);ctx.closePath();ctx.moveTo(hx+r*0.1,hy-r*0.95);ctx.lineTo(hx+r*0.85,hy-r*1.35);ctx.lineTo(hx+r*0.75,hy-r*0.55);ctx.closePath();ctx.fill();ctx.stroke()}
    else if(a===2){ctx.fillStyle='#4a6fd8';rr(hx-r*0.55,hy-r*1.65,r*1.1,r*0.8,4);ctx.fill();ctx.stroke();rr(hx-r*0.95,hy-r*0.95,r*1.9,r*0.3,4);ctx.fill();ctx.stroke()}
    else if(a===3){ctx.beginPath();ctx.arc(hx-r*0.33,hy-r*0.12,r*0.3,0,6.3);ctx.arc(hx+r*0.33,hy-r*0.12,r*0.3,0,6.3);ctx.moveTo(hx-r*0.03,hy-r*0.12);ctx.lineTo(hx+r*0.03,hy-r*0.12);ctx.stroke()}
    else if(a===4){ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(hx-r*0.7,hy-r*0.9);ctx.lineTo(hx-r*0.7,hy-r*1.6);ctx.lineTo(hx-r*0.3,hy-r*1.2);ctx.lineTo(hx,hy-r*1.7);ctx.lineTo(hx+r*0.3,hy-r*1.2);ctx.lineTo(hx+r*0.7,hy-r*1.6);ctx.lineTo(hx+r*0.7,hy-r*0.9);ctx.closePath();ctx.fill();ctx.stroke()}
  }
  function drawChar(c,r,t){mgBlob(c.x,c.y,r,CC[c.col],t+c.ph*10,{face:c.vx>=0?1:-1,walk:t*0.6+c.ph*10});accAt(c.x,c.y,r,c.acc,t)}
  function newRound(){
    const r=g.round,n=Math.min(64,10+r*5),spd=0.35+Math.min(1.5,r*0.13);
    const tc=Math.floor(g.rng()*CC.length),ta=Math.floor(g.rng()*5);
    g.target={col:tc,acc:ta};
    const one=Math.min(0.92,0.15+r*0.11);
    g.chars=[];
    const ti=Math.floor(g.rng()*n);
    for(let i=0;i<n;i++){
      let col,acc;
      if(i===ti){col=tc;acc=ta}
      else{
        const q=g.rng();
        if(q<one){ if(g.rng()<0.5){col=tc;acc=(ta+1+Math.floor(g.rng()*4))%5} else {acc=ta;col=(tc+1+Math.floor(g.rng()*(CC.length-1)))%CC.length} }
        else{col=(tc+1+Math.floor(g.rng()*(CC.length-1)))%CC.length;acc=(ta+1+Math.floor(g.rng()*4))%5}
      }
      const a=g.rng()*6.283,s=spd*(0.6+g.rng()*0.8);
      g.chars.push({x:50+g.rng()*700,y:150+g.rng()*260,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.7,col:col,acc:acc,ph:g.rng(),isT:i===ti});
    }
    g.limit=Math.max(330,720-r*40);g.rt=0;g.revT=0;
  }
  newRound();
  function radius(){return g.chars.length>40?12:g.chars.length>24?13:15}
  function tap(x,y,left){
    if(g.stun>0||g.revT>0)return;
    const r=radius();let best=null,bd=1e9;
    for(const c of g.chars){const dx=x-c.x,dy=y-(c.y-r),d=dx*dx+dy*dy;if(d<(r+6)*(r+6)&&d<bd){bd=d;best=c}}
    if(!best){g.stun=18;return}
    if(best.isT){
      g.combo++;const frac=1-g.rt/g.limit,m=1+Math.min(3,Math.floor(g.combo/3)),gain=Math.round((100+120*frac)*m*mgDbl(left));
      g.pts+=gain;g.found++;g.msgT=40;
      mgSparkles(g.parts,best.x,best.y-r,16,['#ffd23f','#fff','#7dff6a']);mgPop(g,best.x,best.y-40,'+'+gain,'#ffd23f',24);
      mgComboSfx(g.combo);g.round++;g.revT=26;g.nextC=best;
    }else{
      g.combo=0;g.stun=45;g.miss++;g.shake=8;const loss=Math.min(g.pts,40);g.pts-=loss;
      mgPop(g,best.x,best.y-40,'ちがう！ -'+loss,'#ff6a6a',20);sfx.die();
    }
  }
  g.update=function(){
    g.t++;mgFx(g);
    if(g.done){g.endT++;return}
    if(g.t<=MG_CD)return;
    g.ft++;
    const left=TOTAL-g.ft;mgTick(left);
    if(g.stun>0)g.stun--;
    if(g.revT>0){g.revT--;if(g.revT===0)newRound();g.live=g.pts;if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  '+g.found+'にん みつけた！','じかんぎれ！',TH);return}
    g.rt++;
    for(const c of g.chars){
      c.x+=c.vx;c.y+=c.vy;
      if(c.x<30){c.x=30;c.vx=Math.abs(c.vx)}if(c.x>770){c.x=770;c.vx=-Math.abs(c.vx)}
      if(c.y<150){c.y=150;c.vy=Math.abs(c.vy)}if(c.y>420){c.y=420;c.vy=-Math.abs(c.vy)}
    }
    if(g.rt>=g.limit){
      g.combo=0;g.miss++;mgPop(g,400,140,'じかんぎれ… つぎ！','#ffffff',22);sfx.bump();g.round++;newRound();
    }
    mgMove(g,6,16,784,120,430);
    if(mi.pl||mi.pr||mi.pu||mi.pd)g.kb=true;
    if(mi.pa||mi.pb){g.kb=true;tap(g.px,g.py,left)}
    else if(mi.ppress){g.kb=false;tap(mi.px,mi.py,left)}
    g.live=g.pts;
    if(g.ft>=TOTAL)mgFinish(g,g.pts,g.pts+'てん  '+g.found+'にん みつけた！','じかんぎれ！',TH);
  };
  g.draw=function(){
    mgBg('#cfe9ff','#a8d8ff');
    ctx.fillStyle='rgba(255,255,255,0.28)';for(let i=0;i<6;i++){mgCloud(60+i*140,330+(i%2)*40,1.0)}
    mgShakeBegin(g);
    const r=radius(),list=g.chars.slice().sort(function(a,b){return a.y-b.y});
    for(const c of list){
      if(g.revT>0&&!c.isT)ctx.globalAlpha=0.35;
      drawChar(c,r,g.t);ctx.globalAlpha=1;
    }
    if(g.revT>0&&g.nextC){ctx.strokeStyle='#ffd23f';ctx.lineWidth=5;ctx.beginPath();ctx.arc(g.nextC.x,g.nextC.y-r,r+10+g.revT*0.4,0,6.3);ctx.stroke()}
    else if(g.rt>g.limit*0.6){
      const t=g.chars.find(function(c){return c.isT});
      if(t){ctx.globalAlpha=0.25+0.25*Math.abs(Math.sin(g.t*0.15));ctx.strokeStyle='#ff5a7a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(t.x,t.y-r,r+14,0,6.3);ctx.stroke();ctx.globalAlpha=1}
    }
    ctx.restore();
    mgDrawFx(g);
    // さがす対象
    rr(280,38,240,64,16);ctx.fillStyle='rgba(255,255,255,0.92)';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
    outlinedText('この子を さがせ！',400,56,15,'#fff',OUT,4);
    if(g.target){const tc={x:400,y:98,col:g.target.col,acc:g.target.acc,vx:1,ph:0};mgBlob(400,98,15,CC[tc.col],g.t,{walk:0});accAt(400,98,15,tc.acc,g.t)}
    ctx.fillStyle='#7dff6a';ctx.fillRect(280,104,Math.max(0,240*(1-g.rt/g.limit)),6);
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    mgTimerHUD(g,TOTAL-g.ft,730,28,true);
    if(g.combo>=2)outlinedText(g.combo+'れんぞく',130,H-22,20,'#ffd23f',OUT,5);
    if(g.stun>0&&g.t>MG_CD)outlinedText('おっと！',400,H-24,24,'#ff6a6a',OUT,5);
    if(g.kb&&g.t>MG_CD){ctx.strokeStyle='#ff5a7a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(g.px,g.py,16,0,6.3);ctx.moveTo(g.px-22,g.py);ctx.lineTo(g.px+22,g.py);ctx.moveTo(g.px,g.py-22);ctx.lineTo(g.px,g.py+22);ctx.stroke()}
    mgTitle(g);mgCountdown(g.t,'うえに でている キャラと ぜんぶ おなじ子を タップ！ いろと かざりが おなじ子は 1にんだけ (キー: ◀▶▲▼ + Z)');
    mgEndBanner(g);
  };
  return g;
}

const MINIGAMES=[
  {id:'hop',name:'ぴょんぴょんレース',desc:'おちる いたを ダッシュで わたりきれ！ ターボで がんばれ',help:'やじるしと おなじ ボタンを れんぞくで！ ギリギリで ボーナス',create:function(seed){return mgCreateHop(seed)}},
  {id:'cherry',name:'クルクルチェリー',desc:'さくらんぼを ぐるぐる まわして 2かい なげて とおくへ！',help:'ぐるぐる なぞって はなす！ おちる ときに タップで バウンス',create:function(seed){return mgCreateCherry(seed)}},
  {id:'dodge',name:'よけろ！ボールシュート',desc:'ボールを 50びょう よけつづけよう ★で ポイント ゲット',help:'ゆびで うごいて よけろ！ ★と ギリギリで ボーナス (キー: ◀▶▲▼)',create:function(seed){return mgCreateDodge(seed)}},
  {id:'archery',name:'まとあてアーチェリー',desc:'かぜを よんで まとを ねらいうち！ ともだちには あてないで',help:'うしろに ひっぱって はなす！ ど真ん中は 2ばい (キー: ▲▼ かくど / スペース)',create:function(seed){return mgCreateArchery(seed)}},
  {id:'coin',name:'コインゲット！',desc:'アリーナの コインを あつめまくれ！ ばくだんに ちゅうい',help:'ゆびで うごいて コインを ゲット！ れんぞくで ポイントが ふえる (キー: ◀▶▲▼)',create:function(seed){return mgCreateCoin(seed)}},
  {id:'tap',name:'リズムタップ',desc:'おちてくる おとを タイミングよく タップ！',help:'おとが せんに かさなったら そのレーンを タップ！ (キー: ◀▼▲▶)',create:function(seed){return mgCreateTap(seed)}},
  {id:'stack',name:'ぐらぐらスタック',desc:'ゆれる ブロックを ぴったり つみあげろ！',help:'タップで おとす！ ぴったりで れんぞくボーナス、はずすと くずれる',create:function(seed){return mgCreateStack(seed)}},
  {id:'whack',name:'ぽこぽこモグラ',desc:'でてくる モグラを たたけ！ キラキラは ボーナス',help:'モグラを タップ！ × の モグラは たたかない (キー: ◀▶▲▼ + Z)',create:function(seed){return mgCreateWhack(seed)}},
  {id:'memory',name:'しんけいすいじゃく',desc:'おなじ カードを 2まい そろえよう！ れんぞくで ポイントアップ',help:'おなじ ならびを 2まい そろえよう！ はじめに ちょっとだけ みせるよ (キー: ◀▶▲▼ + Z)',create:function(seed){return mgCreateMemory(seed)}},
  {id:'find',name:'あいつをさがせ',desc:'たくさんの なかから おなじ子を 1にん みつけだせ！',help:'うえに でている キャラと ぜんぶ おなじ子を タップ！ (キー: ◀▶▲▼ + Z)',create:function(seed){return mgCreateFind(seed)}}
];
