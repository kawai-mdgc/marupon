/* minigames.js - party-style minigames (classic script; defines only, touches engine globals lazily) */

function mgR(a,b){return a+Math.random()*(b-a)}
function mgClamp(v,a,b){return v<a?a:v>b?b:v}
function mgIn(px,py,x,y,w,h){return px>=x&&px<=x+w&&py>=y&&py<=y+h}
function mgCircle(x,y,r,fill,lw){
  ctx.beginPath();ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2);
  ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=lw===undefined?3:lw;ctx.strokeStyle=OUT;ctx.stroke();
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
    if(o.angry){ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(cx-k*r*0.25,ey-r*0.4+(k<0?0:0));ctx.lineTo(cx+k*r*0.1,ey-r*0.2);ctx.stroke();ctx.lineWidth=2.5}
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
function mgTitle(g){
  if(g.t<150){outlinedText(g.title,400,28,22,'#fff')}
}
function mgCountdown(t,help){
  if(t>=150)return;
  if(t<120){
    ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fillRect(0,0,W,H);
    const n=3-Math.floor(t/40),k=1-(t%40)/40;
    outlinedText(String(n),400,H/2+30,90+k*40,'#ffd23f');
    rr(60,64,680,34,17);ctx.fillStyle='rgba(255,255,255,0.92)';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
    outlinedText(help,400,82,16,'#fff',OUT,4);
  }else{
    const k=1-(t-120)/30;
    outlinedText('スタート！',400,H/2+20,60+k*30,'#7dff6a');
  }
}
function mgEndBanner(g){
  if(!g.done)return;
  const s=Math.min(1,g.endT/12);
  ctx.fillStyle='rgba(0,0,0,'+(0.28*s)+')';ctx.fillRect(0,0,W,H);
  outlinedText(g.endLabel||'おしまい！',400,150,56*(0.4+0.6*s),'#ffd23f');
  outlinedText(g.scoreText,400,215,36*(0.4+0.6*s),'#ffffff');
}
function mgBase(title){
  return {done:false,score:0,scoreText:'',title:title,t:0,endT:0,endLabel:''};
}
function mgFinish(g,score,text,label){
  g.done=true;g.score=Math.max(0,Math.floor(score)||0);g.scoreText=text||String(g.score);g.endT=0;
  if(label)g.endLabel=label;
}
function mgSparkles(arr,x,y,n,cols){
  for(let i=0;i<n;i++){const a=Math.random()*6.283,s=mgR(1,4.5);
    arr.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:mgR(20,40),col:cols[i%cols.length]});}
}
function mgStar(x,y,r,col){
  ctx.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*0.45:r;
    const px=x+Math.cos(a)*rr2,py=y+Math.sin(a)*rr2;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);}
  ctx.closePath();ctx.fillStyle=col;ctx.fill();ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.strokeStyle=OUT;ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* 1. hop race                                                         */
/* ------------------------------------------------------------------ */
function mgCreateHop(){
  const N=30,BX=function(i){return 120+i*74},LY=[118,176,234,292];
  const PADS=[0,3,2,1]; // left, down, up, right
  const padX=function(i){return 70+i*170},PAD_Y=372,PAD_W=150,PAD_H=64;
  const g=mgBase('ぴょんぴょんレース');
  g.prompt=Math.floor(Math.random()*4);g.cf=-3;g.shake=0;g.rank=0;g.outT=0;
  const cols=['#ff9f43','#6ecb63','#a98bff'];
  const skills=[mgR(8,12),mgR(13,18),mgR(18,23)];
  g.racers=[];
  for(let i=0;i<4;i++){
    g.racers.push({lane:i,player:i===3,col:cols[i]||'#fff',board:0,x:BX(0)+37,x0:BX(0)+37,x1:BX(0)+37,hop:0,stumble:0,
      wait:Math.floor(mgR(30,60)),skill:skills[i]||0,out:false,vy:0,fy:0,fin:-1,boards:0,sq:0});
  }
  const me=g.racers[3];
  function finishPlayer(){
    let ahead=0;for(let i=0;i<3;i++)if(g.racers[i].fin>=0)ahead++;
    g.rank=ahead+1;
    const time=me.fin/60;
    const bonus=[500,300,150,0][ahead];
    mgFinish(g,1000-Math.floor(time*10)+bonus,g.rank+'い '+time.toFixed(1)+'びょう',g.rank===1?'1いだよ！':'ゴール！');
    sfx.win();
  }
  function doHop(r,pt){
    r.x0=r.x;r.board++;r.boards=r.board;r.x1=BX(r.board)+37;r.hop=8;
    if(r.player)sfx.jump();
  }
  g.update=function(){
    g.t++;
    if(g.done){g.endT++;return}
    if(g.shake>0)g.shake--;
    if(g.t<=120)return;
    const pt=g.t-120,sec=pt/60;
    g.cf+=(1.0+0.1*sec)/60;
    // player input
    let press=-1;
    if(mi.pl)press=0;else if(mi.pr)press=1;else if(mi.pu)press=2;else if(mi.pd)press=3;
    else if(mi.ppress){for(let i=0;i<4;i++)if(mgIn(mi.px,mi.py,padX(i),PAD_Y,PAD_W,PAD_H)){press=PADS[i];break}}
    for(let i=0;i<4;i++){
      const r=g.racers[i];
      if(r.out){r.vy+=0.5;r.fy+=r.vy;continue}
      if(r.fin>=0)continue;
      if(r.hop>0){
        r.hop--;
        r.x=r.x0+(r.x1-r.x0)*(1-r.hop/8);
        if(r.hop===0){
          r.x=r.x1;
          if(r.board>=N-1){r.fin=pt;if(r.player)finishPlayer();}
        }
      }else if(r.stumble>0){r.stumble--}
      else if(r.player){
        if(press>=0){
          if(press===g.prompt){doHop(r,pt);g.prompt=Math.floor(Math.random()*4)}
          else{r.stumble=30;g.shake=12;sfx.bump()}
        }
      }else{
        r.wait--;
        if(r.wait<=0){
          if(Math.random()<0.1){r.stumble=26;r.wait=Math.floor(r.skill+mgR(0,14))}
          else{doHop(r,pt);r.wait=Math.floor(r.skill+mgR(0,14))}
        }
      }
      if(!g.done&&r.board<=Math.floor(g.cf)&&r.fin<0){
        r.out=true;r.vy=-2;r.fy=0;
        if(r.player){sfx.die();g.outT=0}
      }
    }
    if(!g.done){
      if(me.out){
        g.outT++;
        if(g.outT>70)mgFinish(g,me.boards*10,me.boards+'まいで らくか','らくか…');
      }
    }
  };
  g.draw=function(){
    mgBg('#8fd8ff','#c8f0ff');
    const camX=Math.max(0,me.x-260);
    let sxk=0,syk=0;if(g.shake>0){sxk=Math.sin(g.t*3)*3}
    ctx.save();ctx.translate(sxk,syk);
    mgCloud(150-camX*0.1,50,1);mgCloud(520-camX*0.1,30,1.3);mgCloud(900-camX*0.1,60,1);
    // chasm
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
        rr(-33,-6,66,14,5);ctx.fillStyle=(i%2)?'#e0a35c':'#f0b86e';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
        ctx.fillStyle='#b97b3c';ctx.fillRect(-22,-1,6,3);ctx.fillRect(14,-1,6,3);
        ctx.restore();
      }
      // goal flag
      const fx=BX(N-1)+70-camX;
      if(fx>-40&&fx<W+40){
        ctx.fillStyle='#fff';ctx.fillRect(fx-2,y-44,4,46);ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.strokeRect(fx-2,y-44,4,46);
        for(let a=0;a<3;a++)for(let b=0;b<2;b++){ctx.fillStyle=(a+b)%2?'#fff':'#333';ctx.fillRect(fx+2+a*8,y-44+b*8,8,8)}
        ctx.strokeRect(fx+2,y-44,24,16);
      }
      const r=g.racers[l];
      const sx=r.x-camX;
      let cy=y+2+(r.out?r.fy:0),hy=0,ssx=1,ssy=1;
      if(r.hop>0){const p=1-r.hop/8;hy=Math.sin(p*Math.PI)*30;ssx=1-0.15*Math.sin(p*Math.PI);ssy=1+0.2*Math.sin(p*Math.PI)}
      else if(r.stumble>0){ssy=0.8;ssx=1.15}
      if(cy<H+60){
        if(r.player)drawChar(sx,cy-hy,1.15,{face:1,vx:0,vy:r.hop>0?-1:0,onGround:r.hop<=0,t:g.t,sx:ssx,sy:ssy,blink:0,dead:r.out,rot:r.out?r.fy*0.01:0});
        else mgBlob(sx,cy-hy,15,r.col,g.t,{sx:ssx,sy:ssy,face:1,walk:r.hop>0?g.t:0,blink:r.stumble>0});
        if(r.stumble>0&&!r.out){outlinedText('!?',sx+16,cy-hy-34+Math.sin(g.t)*2,16,'#ffd23f')}
      }
    }
    ctx.restore();
    // prompt bubble
    if(g.t>=100&&!g.done&&!me.out){
      const sx=me.x-camX,by=LY[3]-100;
      rr(sx-26,by,52,44,12);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3.5;ctx.strokeStyle=OUT;ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx-6,by+43);ctx.lineTo(sx,by+54);ctx.lineTo(sx+6,by+43);ctx.fillStyle='#fff';ctx.fill();
      mgArrow(sx,by+22,15,g.prompt,'#ff5a7a');
    }
    // progress
    {
      const bx=250,bw=300,by=66;
      rr(bx-10,by-9,bw+20,18,9);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fill();
      const cfp=mgClamp((g.cf+1)/N,0,1);
      ctx.fillStyle='rgba(255,70,70,0.6)';ctx.fillRect(bx,by-5,bw*cfp,10);
      for(let i=0;i<4;i++){const r=g.racers[i];
        if(r.out)continue;
        mgCircle(bx+bw*mgClamp(r.board/(N-1),0,1),by,i===3?7:5,i===3?'#ff5a7a':r.col,2)}
    }
    if(!g.done){
      const pt=Math.max(0,g.t-120);
      outlinedText('ばん '+me.board+'/'+(N-1),90,28,18,'#fff');
      outlinedText((pt/60).toFixed(1)+'びょう',720,28,18,'#fff');
    }
    // pads
    for(let i=0;i<4;i++){
      const px=padX(i);
      const pressed=mi.pdown&&mgIn(mi.px,mi.py,px,PAD_Y,PAD_W,PAD_H);
      rr(px,PAD_Y+(pressed?4:0),PAD_W,PAD_H-(pressed?4:0),16);
      ctx.fillStyle=pressed?'#ffe27a':'#ffffff';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
      mgArrow(px+PAD_W/2,PAD_Y+PAD_H/2+(pressed?4:0),20,PADS[i],'#ff8fa8');
    }
    mgTitle(g);mgCountdown(g.t,'でてくる やじるしと おなじ ボタンを おそう！ おちる いたに ちゅうい');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 2. cherry spin                                                      */
/* ------------------------------------------------------------------ */
function mgCreateCherry(){
  const CX=400,CY=225,CAP=200,SPIN=480,FLY=150;
  const g=mgBase('クルクルチェリー');
  g.phase='spin';g.P=0;g.peak=0;g.sum=0;g.n=0;g.ang=0;g.dir=1;g.lastTh=null;g.held=0;g.act=0;g.timeLeft=SPIN;
  g.lastKey='';g.dist=0;g.fly=0;g.shown=0;g.rivals=[];g.rank=1;g.px=0;g.py=0;
  function launch(){
    const avg=g.n>0?g.sum/g.n:0;
    const power=0.55*g.peak+0.45*avg;
    g.dist=Math.max(0,Math.round(power*0.62));
    g.phase='fly';g.fly=0;sfx.fire();
    for(let i=0;i<3;i++){
      let v=60;for(let k=0;k<3;k++)v+=mgR(-16,16);
      g.rivals.push({d:Math.round(mgClamp(v,12,125)),col:['#ff9f43','#6ecb63','#a98bff'][i]});
    }
  }
  g.update=function(){
    g.t++;
    if(g.done){g.endT++;return}
    if(g.t<=120)return;
    if(g.phase==='spin'){
      g.timeLeft--;
      let imp=0;
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
        g.held++;g.px=mi.px;g.py=mi.py;
      }else g.lastTh=null;
      if(mi.pl&&g.lastKey!=='l'){imp+=22;g.lastKey='l'}
      if(mi.pr&&g.lastKey!=='r'){imp+=22;g.lastKey='r'}
      if(mi.pa)imp+=10;
      if(mi.pu||mi.pd)imp+=10;
      if(imp>0)g.act++;
      g.P=Math.min(CAP,g.P*0.97+imp);
      if(g.act>0){g.peak=Math.max(g.peak,g.P);g.sum+=g.P;g.n++}
      g.ang+=g.dir*(g.P/CAP)*0.5;
      if((mi.prel&&g.act>=20)||(mi.pb&&g.act>=20)||g.timeLeft<=0)launch();
    }else if(g.phase==='fly'){
      g.fly++;
      const u=Math.min(1,g.fly/FLY),e=1-Math.pow(1-u,2);
      g.shown=g.dist*e;
      g.ang+=0.3;
      if(g.fly>=FLY){
        const all=[g.dist].concat(g.rivals.map(function(r){return r.d}));
        let better=0;for(let i=1;i<all.length;i++)if(all[i]>g.dist)better++;
        g.rank=better+1;
        g.phase='podium';
        mgFinish(g,g.dist,g.dist+'m  '+g.rank+'い','');
        if(g.rank===1)sfx.win();else sfx.coin();
      }
    }
  };
  function drawCherry(x,y,s,ang,glow){
    ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(s,s);
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
    // far hills
    ctx.fillStyle='#bfe6a8';
    for(let i=-1;i<8;i++){const x=i*180-(ds*0.15)%180;ctx.beginPath();ctx.arc(x+90,370,110,Math.PI,0);ctx.fill()}
    ctx.fillStyle='#8fd27a';
    for(let i=-1;i<8;i++){const x=i*140-(ds*0.4)%140;ctx.beginPath();ctx.arc(x+70,380,70,Math.PI,0);ctx.fill()}
    ctx.fillStyle='#6cc25a';ctx.fillRect(0,380,W,H-380);
    ctx.fillStyle='#8fd27a';ctx.fillRect(0,380,W,8);
    // meter posts
    for(let m=0;m<=200;m+=10){
      const x=260+(m-g.shown)*30;
      if(x<-30||x>W+30)continue;
      ctx.fillStyle='#fff';ctx.fillRect(x-2,380,4,30);ctx.strokeStyle=OUT;ctx.lineWidth=2;ctx.strokeRect(x-2,380,4,30);
      outlinedText(m+'m',x,428,14,'#fff',OUT,4);
    }
  }
  g.draw=function(){
    if(g.phase==='fly'||g.phase==='podium'){
      drawLand();
      const u=Math.min(1,g.fly/FLY);
      let h;
      if(u<0.7){const k=u/0.7;h=4*k*(1-k)*mgClamp(70+g.dist*1.2,70,230)}
      else{const k=(u-0.7)/0.3;h=Math.abs(Math.sin(k*Math.PI*2))*22*(1-k)}
      const cx=g.phase==='podium'?260:260,cy=370-h;
      if(g.phase==='fly'){
        ctx.fillStyle='rgba(0,0,0,0.15)';ctx.beginPath();ctx.ellipse(cx,384,30*(1-h/400),7,0,0,6.3);ctx.fill();
        drawCherry(cx,cy-30,0.8,g.ang,0);
        outlinedText(Math.floor(g.shown)+'m',400,70,52,'#ffd23f');
      }else{
        // podium
        const list=[{n:'あなた',d:g.dist,col:'#ff4a6a',me:true}];
        g.rivals.forEach(function(r,i){list.push({n:'CPU'+(i+1),d:r.d,col:r.col})});
        list.sort(function(a,b){return b.d-a.d});
        const hs=[130,100,76,56],xs=[400,270,530,140];
        outlinedText('ランキング',400,36,24,'#fff');
        for(let i=0;i<4;i++){
          const x=[320,180,460,600][i],hh=hs[i];
          rr(x-55,380-hh,110,hh,8);ctx.fillStyle=['#ffd23f','#d9dde3','#e0a35c','#c9b8f0'][i];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
          outlinedText(String(i+1),x,380-hh+30,34,'#fff');
          if(list[i].me)drawCherry(x,380-hh-34,0.55,Math.sin(g.endT*0.1)*0.2,0);
          else mgBlob(x,380-hh,18,list[i].col,g.endT,{});
          outlinedText(list[i].n+' '+list[i].d+'m',x,380-hh-(list[i].me?96:56),15,'#fff',OUT,4);
        }
        xs.length=0;
      }
    }else{
      mgBg('#ffe9f1','#ffd0e0');
      // sparkly floor
      ctx.fillStyle='#ffc2d6';ctx.beginPath();ctx.arc(CX,CY+10,150,0,6.3);ctx.fill();
      ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.setLineDash&&ctx.setLineDash([8,10]);ctx.stroke();ctx.setLineDash&&ctx.setLineDash([]);
      // pin
      ctx.fillStyle='#b97b3c';rr(CX-8,CY,16,120,6);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      const pw=g.P/CAP;
      // speed rings
      ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,'+(0.3+0.5*pw)+')';
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(CX,CY,70+i*14,g.ang*g.dir+i*1.6,g.ang*g.dir+i*1.6+0.7+pw*0.8);ctx.stroke()}
      drawCherry(CX,CY,1.3+pw*0.2,g.ang,pw>0.8?0.5:0);
      // pointer hint
      if(mi.pdown&&g.t>120){mgCircle(mi.px,mi.py,9,'#fff',3)}
      // gauge
      rr(180,396,440,26,13);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=OUT;ctx.stroke();
      if(pw>0.01){
        rr(184,400,Math.max(18,432*pw),18,9);
        const gr=ctx.createLinearGradient(184,0,616,0);gr.addColorStop(0,'#7dff6a');gr.addColorStop(0.6,'#ffd23f');gr.addColorStop(1,'#ff4a4a');
        ctx.fillStyle=gr;ctx.fill();
      }
      outlinedText('パワー',150,409,15,'#fff',OUT,4);
      // time bar
      const tl=mgClamp(g.timeLeft/SPIN,0,1);
      rr(180,58,440,14,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      if(tl>0){rr(183,61,Math.max(10,434*tl),8,4);ctx.fillStyle='#4aa8ff';ctx.fill()}
      outlinedText('のこり '+Math.ceil(Math.max(0,g.timeLeft)/60)+'びょう',400,92,16,'#fff',OUT,4);
      if(g.t>120&&g.act<20)outlinedText('さくらんぼの まわりを ぐるぐる なぞろう！',400,350,18,'#fff',OUT,5);
      else if(g.act>=20)outlinedText('はなして とばす！ (Xキー)',400,350,16,'#fff',OUT,5);
    }
    mgTitle(g);mgCountdown(g.t,'ゆびで さくらんぼの まわりを ぐるぐる！ はやいほど とおくへ (キー: ◀▶ こうごに)');
    if(g.phase==='fly')outlinedText('とんでけー！',400,120,24,'#fff',OUT,5);
    if(g.done&&g.endT<60){const s=Math.min(1,g.endT/10);outlinedText('おしまい！',400,H/2-20,50*s,'#ffd23f')}
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 3. dodge                                                            */
/* ------------------------------------------------------------------ */
function mgCreateDodge(){
  const FX0=30,FX1=770,FY0=50,FY1=430,TOTAL=1800;
  const g=mgBase('よけろ！ボールシュート');
  g.px=330;g.py=240;g.lives=3;g.inv=0;g.balls=[];g.ft=0;g.shootT=60;g.hits=0;g.lpx=null;g.lpy=null;g.face=1;g.ey=240;g.vx=0;g.parts=[];
  function fire(){
    const sec=g.ft/60;
    const sp=2.9+sec*0.09;
    const ex=700,ey=g.ey;
    const base=Math.atan2(g.py-ey,g.px-ex);
    const spr=Math.max(0.08,0.3-sec*0.008);
    const bnc=Math.random()<Math.min(0.5,0.1+sec*0.015)?1:0;
    function add(a,s,b){g.balls.push({x:ex-30,y:ey,vx:Math.cos(a)*s,vy:Math.sin(a)*s,b:b,rot:0})}
    const r=Math.random();
    if(sec>20&&r<0.12){for(let i=0;i<7;i++)add(Math.PI*(0.62+i*0.12),sp*0.85,0)}
    else if(sec>10&&r<0.35){add(base-0.3,sp,bnc);add(base+mgR(-0.1,0.1),sp,0);add(base+0.3,sp,bnc)}
    else add(base+mgR(-spr,spr),sp,bnc);
    sfx.bump();
  }
  function end(){
    const surv=Math.min(g.ft,TOTAL);
    const full=g.ft>=TOTAL;
    const bonus=full&&g.hits===0?300:0;
    mgFinish(g,Math.floor(surv*100/60)+bonus,(surv/60).toFixed(1)+'びょう'+(bonus?' ノーミス！':''),full?'ぜんぶ よけた！':'やられた…');
    if(full)sfx.win();
  }
  g.update=function(){
    g.t++;
    if(g.done){g.endT++;return}
    if(g.t<=120){g.lpx=mi.px;g.lpy=mi.py;return}
    g.ft++;
    let dx=(mi.r?1:0)-(mi.l?1:0),dy=(mi.d?1:0)-(mi.u?1:0),mx=0,my=0;
    if(dx||dy){const l=Math.sqrt(dx*dx+dy*dy);mx=dx/l*4.2;my=dy/l*4.2}
    else if(mi.pdown||mi.px!==g.lpx||mi.py!==g.lpy){
      const tx=mi.px-g.px,ty=mi.py-g.py,d=Math.sqrt(tx*tx+ty*ty);
      if(d>1){const s=Math.min(5.2,d*0.25);mx=tx/d*s;my=ty/d*s}
    }
    g.lpx=mi.px;g.lpy=mi.py;
    g.px=mgClamp(g.px+mx,FX0+22,FX1-22);g.py=mgClamp(g.py+my,FY0+24,FY1-8);
    if(mx>0.3)g.face=1;else if(mx<-0.3)g.face=-1;
    g.vx=mx;
    g.ey=240+110*Math.sin(g.ft*0.02);
    // keep player outside enemy
    {const ex=725,ex2=g.px-ex,ey2=g.py-g.ey,dd=Math.sqrt(ex2*ex2+ey2*ey2);
      if(dd<48&&dd>0.01){g.px=ex+ex2/dd*48;g.py=g.ey+ey2/dd*48;g.px=mgClamp(g.px,FX0+22,FX1-22);g.py=mgClamp(g.py,FY0+24,FY1-8)}}
    if(g.inv>0)g.inv--;
    g.shootT--;
    if(g.shootT<=0){fire();g.shootT=Math.floor(Math.max(16,44-g.ft/60*1.1))}
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
      const ddx=b.x-g.px,ddy=b.y-(g.py-12);
      if(g.inv<=0&&ddx*ddx+ddy*ddy<17*17){
        g.balls.splice(i,1);g.lives--;g.hits++;g.inv=100;sfx.die();
        mgSparkles(g.parts,g.px,g.py-12,12,['#ff4a6a','#fff']);
        if(g.lives<=0){end();return}
      }
    }
    for(let i=g.parts.length-1;i>=0;i--){const p=g.parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;if(p.life<=0)g.parts.splice(i,1)}
    if(g.ft>=TOTAL)end();
  };
  g.draw=function(){
    mgBg('#ffe58a','#ffc86a');
    rr(FX0-8,FY0-8,FX1-FX0+16,FY1-FY0+16,34);ctx.fillStyle=OUT;ctx.fill();
    rr(FX0,FY0,FX1-FX0,FY1-FY0,28);ctx.fillStyle='#9be07a';ctx.fill();
    ctx.save();rr(FX0,FY0,FX1-FX0,FY1-FY0,28);ctx.clip();
    ctx.fillStyle='#8cd46c';
    for(let i=0;i<10;i++)if(i%2)ctx.fillRect(FX0+i*74,FY0,74,FY1-FY0);
    ctx.restore();
    ctx.lineWidth=4;ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.moveTo(400,FY0+10);ctx.lineTo(400,FY1-10);ctx.stroke();
    // enemy
    let sq=1;if(g.shootT<14&&g.shootT>0)sq=1+(14-g.shootT)*0.012;
    mgBlob(725,g.ey+34,34,'#c97a4a',g.t,{angry:true,sx:sq,sy:2-sq,face:-1,blink:false});
    // balls
    for(const b of g.balls){
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);
      mgCircle(0,0,9,b.b>0?'#7ad7ff':'#ff6a6a',3);
      ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.arc(-3,-3,2.5,0,6.3);ctx.fill();
      ctx.restore();
    }
    // player
    if(!(g.inv>0&&Math.floor(g.t/4)%2===0)){
      ctx.fillStyle='rgba(0,0,0,0.18)';ctx.beginPath();ctx.ellipse(g.px,g.py+1,13,5,0,0,6.3);ctx.fill();
      drawChar(g.px,g.py,1,{face:g.face,vx:g.vx,vy:0,onGround:Math.abs(g.vx)<0.2,t:g.t,sx:1,sy:1,blink:0,dead:false,rot:0});
    }
    for(const p of g.parts){ctx.globalAlpha=mgClamp(p.life/20,0,1);mgCircle(p.x,p.y,3,p.col,0);ctx.globalAlpha=1}
    // HUD
    const left=Math.max(0,(TOTAL-g.ft)/60);
    outlinedText(left.toFixed(1),400,28,28,'#fff');
    for(let i=0;i<3;i++)mgHeart(60+i*38,28,11,i<g.lives?'#ff4a6a':'#c9bfc0');
    mgTitle(g);mgCountdown(g.t,'ゆびを うごかして ボールを よけろ！ (キー: ◀▶▲▼) 30びょう にげきれ！');
    mgEndBanner(g);
  };
  return g;
}

/* ------------------------------------------------------------------ */
/* 4. archery                                                          */
/* ------------------------------------------------------------------ */
function mgCreateArchery(){
  const BX=100,BY=330,TOTAL=1800,GRAV=0.17,VK=0.13,MAXPULL=110,GROUND=400;
  const lanesX=[470,590,710],lanesV=[0.7,1.0,1.3];
  const g=mgBase('まとあてアーチェリー');
  g.pts=0;g.ft=0;g.arrow=null;g.reload=0;g.parts=[];g.texts=[];g.targets=[];
  g.aim=false;g.pvx=0;g.pvy=0;g.ang=22;g.charge=0;g.charging=false;g.cdir=1;g.pull=0;g.hits=0;
  function rollType(){const r=Math.random();return r<0.15?'boss':r<0.7?'mid':'friend'}
  for(let l=0;l<3;l++)for(let k=0;k<2;k++)g.targets.push({lane:l,x:lanesX[l],y:70+k*160+l*40,type:rollType(),v:lanesV[l],flash:0});
  function radius(t){return t.type==='boss'?14:t.type==='mid'?22:20}
  function value(t){return t.type==='boss'?100:t.type==='mid'?20:-50}
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
  g.update=function(){
    g.t++;
    if(g.done){g.endT++;return}
    if(g.t<=120)return;
    g.ft++;
    // targets
    for(const t of g.targets){
      t.y-=t.v;if(t.flash>0)t.flash--;
      if(t.y<30){t.y=420;t.type=rollType()}
    }
    if(g.reload>0)g.reload--;
    // aiming: pointer
    if(!g.arrow&&g.reload<=0){
      if(mi.ppress){g.aim=true}
      if(g.aim&&mi.pdown){const p=pullToV(mi.px,mi.py);g.pvx=p.vx;g.pvy=p.vy;g.pull=p.len}
      if(g.aim&&mi.prel){
        g.aim=false;
        if(g.pull>18){shoot(g.pvx,g.pvy)}
        g.pull=0;
      }
    }else if(mi.prel)g.aim=false;
    // aiming: keyboard
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
    // arrow
    const A=g.arrow;
    if(A){
      if(A.stuck>0){A.stuck--;if(A.stuck<=0){g.arrow=null;g.reload=20}}
      else{
        A.vy+=GRAV;A.x+=A.vx;A.y+=A.vy;
        const ang=Math.atan2(A.vy,A.vx),tx=A.x+Math.cos(ang)*12,ty=A.y+Math.sin(ang)*12;
        let hit=null,best=1e9;
        for(const t of g.targets){
          if(t.y>405||t.y<20)continue;
          const dx=tx-t.x,dy=ty-t.y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<radius(t)+3&&d<best){best=d;hit=t}
        }
        if(hit){
          const v=value(hit);
          g.pts=Math.max(0,g.pts+v);g.hits++;
          const cols=v>=100?['#ffd23f','#fff','#ff9f43']:v>0?['#ff6a6a','#fff']:['#8aa0ff','#fff'];
          mgSparkles(g.parts,hit.x,hit.y,v>=100?22:12,cols);
          g.texts.push({x:hit.x,y:hit.y-20,vy:-1.2,life:50,str:(v>0?'+':'')+v,col:v>=100?'#ffd23f':v>0?'#ffffff':'#ff6a6a'});
          if(v>=100)sfx.item();else if(v>0)sfx.coin();else sfx.bump();
          hit.type=rollType();hit.y=420;hit.flash=0;
          A.stuck=1;
        }else if(A.y>GROUND){A.y=GROUND;A.stuck=18;sfx.stomp&&0}
        else if(A.x>840||A.y<-300){g.arrow=null;g.reload=20}
      }
    }
    for(let i=g.parts.length-1;i>=0;i--){const p=g.parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.12;p.life--;if(p.life<=0)g.parts.splice(i,1)}
    for(let i=g.texts.length-1;i>=0;i--){const p=g.texts[i];p.y+=p.vy;p.life--;if(p.life<=0)g.texts.splice(i,1)}
    if(g.ft>=TOTAL){mgFinish(g,g.pts,g.pts+'てん','タイムアップ！');sfx.win()}
  };
  function drawTarget(t){
    const r=radius(t);
    if(t.y>470)return;
    if(t.type==='boss'){
      mgCircle(t.x,t.y,r,'#ffd23f',3.5);mgCircle(t.x,t.y,r*0.62,'#fff3b0',2.5);mgStar(t.x,t.y,r*0.5,'#ff9f43');
    }else if(t.type==='mid'){
      mgCircle(t.x,t.y,r,'#ffffff',3.5);mgCircle(t.x,t.y,r*0.68,'#ff6a6a',2.5);mgCircle(t.x,t.y,r*0.36,'#ffffff',2.5);mgCircle(t.x,t.y,r*0.14,'#ff6a6a',0);
    }else{
      mgBlob(t.x,t.y+r,r,'#8fc7ff',t.y*0.2,{face:-1});
      outlinedText('×',t.x,t.y-r-6,14,'#ff6a6a',OUT,4);
    }
  }
  g.draw=function(){
    mgBg('#8fd8ff','#d8f4ff');
    mgCloud(120,60,1.2);mgCloud(480,40,1);mgCloud(700,90,1.3);
    ctx.fillStyle='#bfe6a8';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(60+i*150,400,90,Math.PI,0);ctx.fill()}
    ctx.fillStyle='#6cc25a';ctx.fillRect(0,GROUND,W,H-GROUND);
    ctx.fillStyle='#8fd27a';ctx.fillRect(0,GROUND,W,6);
    // lane rails
    for(let l=0;l<3;l++){ctx.fillStyle='rgba(150,100,60,0.5)';ctx.fillRect(lanesX[l]-2,30,4,GROUND-30)}
    for(const t of g.targets)drawTarget(t);
    // shooter
    drawChar(55,GROUND+2,1.4,{face:1,vx:0,vy:0,onGround:true,t:g.t,sx:1,sy:1,blink:0,dead:false,rot:0});
    // aim
    const pulling=(g.aim&&g.pull>0)||g.charging;
    let aang=-0.35;
    if(pulling)aang=Math.atan2(g.pvy,g.pvx);
    else aang=-g.ang*Math.PI/180;
    const pl=pulling?g.pull:0;
    if(pulling&&!g.arrow){
      // preview
      let x=BX+10,y=BY,vx=Math.max(g.pvx,3),vy=g.pvy;
      for(let i=0;i<36;i++){
        vy+=GRAV;x+=vx;y+=vy;
        if(i%3===2){ctx.globalAlpha=1-i/40;mgCircle(x,y,3,'#fff',1.5);ctx.globalAlpha=1}
        if(y>GROUND)break;
      }
    }else if(!g.arrow&&g.t>120){
      // idle keyboard hint line
      ctx.globalAlpha=0.5;const ha=-g.ang*Math.PI/180;
      mgCircle(BX+Math.cos(-ha)*0+40*Math.cos(ha),BY+40*Math.sin(ha),3,'#fff',1.5);ctx.globalAlpha=1;
    }
    // bow
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
    // pointer pull marker
    if(g.aim&&mi.pdown){ctx.setLineDash&&ctx.setLineDash([4,6]);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.moveTo(BX,BY);ctx.lineTo(mi.px,mi.py);ctx.stroke();ctx.setLineDash&&ctx.setLineDash([]);mgCircle(mi.px,mi.py,7,'#fff',2.5)}
    // arrow in flight
    if(g.arrow){
      const A=g.arrow,a=A.stuck>0&&A.y>=GROUND?Math.atan2(A.vy,A.vx):Math.atan2(A.vy,A.vx);
      ctx.save();ctx.translate(A.x,A.y);ctx.rotate(a);
      ctx.lineWidth=5;ctx.strokeStyle=OUT;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(14,0);ctx.stroke();
      ctx.lineWidth=2.5;ctx.strokeStyle='#fff3d6';ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(14,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(10,-6);ctx.lineTo(10,6);ctx.closePath();ctx.fillStyle='#ff6a6a';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=OUT;ctx.stroke();
      ctx.restore();
    }
    for(const p of g.parts){ctx.globalAlpha=mgClamp(p.life/20,0,1);mgStar(p.x,p.y,4,p.col);ctx.globalAlpha=1}
    for(const p of g.texts)outlinedText(p.str,p.x,p.y,26,p.col);
    // charge gauge for keyboard
    if(g.charging){
      rr(30,60,120,16,8);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=OUT;ctx.stroke();
      rr(33,63,Math.max(8,114*g.charge),10,5);ctx.fillStyle='#ff9f43';ctx.fill();
    }
    // HUD
    outlinedText(g.pts+'てん',90,28,24,'#fff');
    outlinedText(Math.ceil(Math.max(0,TOTAL-g.ft)/60)+'びょう',710,28,24,'#fff');
    mgTitle(g);mgCountdown(g.t,'ゆびを うしろに ひっぱって はなす！ (キー: ▲▼ かくど / スペースながおし) ともだちは うたないでね');
    mgEndBanner(g);
  };
  return g;
}

const MINIGAMES=[
  {id:'hop',name:'ぴょんぴょんレース',desc:'おちる いたを ダッシュで わたりきれ！',help:'あたまの うえの やじるしと おなじ ボタンを おして すすめ！',create:function(){return mgCreateHop()}},
  {id:'cherry',name:'クルクルチェリー',desc:'さくらんぼを ぐるぐる まわして とおくへ とばそう',help:'ゆびで さくらんぼの まわりを ぐるぐる！ はなすと とんでいく',create:function(){return mgCreateCherry()}},
  {id:'dodge',name:'よけろ！ボールシュート',desc:'とんでくる ボールを 30びょう よけつづけよう',help:'ゆびで うごいて ボールを よけろ！ (キー: ◀▶▲▼)',create:function(){return mgCreateDodge()}},
  {id:'archery',name:'まとあてアーチェリー',desc:'うごく まとを ねらいうち！ ともだちには あてないで',help:'うしろに ひっぱって はなす！ (キー: ▲▼ かくど / スペース ながおし)',create:function(){return mgCreateArchery()}}
];
