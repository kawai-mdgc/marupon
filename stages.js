'use strict';
// ============================================================
//  ステージ定義  (ここに足していけば 100 ステージまで増やせます)
// ------------------------------------------------------------
//  { name:'8もじまで', theme:'grass', build(L){ ... } }
//
//  theme : grass desert snow night sunset cave candy forest volcano   (ゆかの色・空・氷など)
//
//  L は「左から右へ 1 パーツずつ並べる」ためのペン。
//  パーツを置くたびに L.s (そのパーツの左端) が決まり、
//  下の dx はすべて「そのパーツの左端から何マス目か」。
//
//  [ ち め ん ]
//   L.flat(n)          n マスの地面
//   L.gap(n)           n マスの穴(この中に足場を置ける)
//   L.finish(階段の高さ) ゴール。最後に 1 回だけ呼ぶ
//  [ ブロック ]  y は行番号(8=ジャンプで届く低め, 7=高め)
//   L.row(dx,y,'B?M')  文字: B=レンガ ?=コイン M=キノコ(大きいとフラワー)
//                            S=スター U=1UP F=フラワー H=かくしブロック
//   L.plat(dx,y,len)   石の足場   L.pipe(dx,高さ)   L.stairs(dx,段数,true=上り)
//  [ コイン ]  L.coin(dx,y)  L.coins(dx,y,個数)  L.arc(dx,y,個数)
//  [ てき・ワナ ]
//   L.walker(dx)  てくてく        L.hopper(dx)  ぴょんぴょん
//   L.flyer(dx,y,はば)  ふわふわ   L.spike(dx)   かくれトゲ(近づくと飛び出す)
//   L.spikes(dx,n)  見えてるトゲ   L.thwomp(dx)  落ちてくる石
//  [ 動く足場 ]  (穴の中で使う)
//   L.liftH(y,はやさ)  穴いっぱいに左右     L.liftV(dx,y,はば,はやさ) 上下
//   L.drop(dx,y)       のると落ちる足場
//  [ ちかへのいりぐち ]
//   L.pipeIn(dx,高さ,'id')  入れる土管(上で ↓ キー)   L.door(dx,'id')  とびら(前で ↓ キー)
//   L.zone('id','theme',zTreasure('M','p'))  地下へやを作る (部品は下の zTreasure など)
//  [ あたらしい てき ] L.ghost(dx,行) おばけ  L.bat(dx,行) コウモリ  L.penguin(dx) ペンギン
//  [ アイテムブロックの文字 ] E=バリア J=つばさ N=じしゃく D=ダッシュブーツ Z=とけい
//  [ しかけ ]
//   L.spring(dx)        ジャンプだい(乗ると高く跳ぶ)
//   L.spiny(dx)         とげとげてき(ふめない。たまで倒せる)
//   L.cannon(dx)        たいほう(弾は ふんで倒せる)
//   L.pod(dx)           ようがんの火の玉(穴の中で使う)
//   L.belt(dx,n,向き)   ベルトコンベア(向き: 1=右 -1=左)
//  ステージに news:'..' をつけると、開始時に「あたらしい」と表示
//  L.check(dx)  チェックポイントの旗
//
//  むずかしさの目安: ステージ1=はじめて … 10=中ボス … 20=ラスボス
// ============================================================

// ---- 地下へや・とびら用の部品 (L.zone('id','theme',zTreasure('M','p')) のように使う) ----
//   第2引数 k : 'p'=土管でもどる  'd'=とびらでもどる
const _ex=(L,k,dx)=>k==='d'?L.exitDoor(dx):L.exitPipe(dx,2);
const zTreasure=(item,k)=>function(L){L.flat(26);L.row(4,8,'?'+item+'?');L.arc(9,10,8);L.coins(15,10,5);_ex(L,k,22)};
const zGauntlet=(item,k)=>function(L){L.flat(14);L.row(2,8,'?'+item+'?');L.spikes(7,2);L.hopper(10);L.flat(14);L.walker(3);L.coins(4,10,4);L.cannon(11);_ex(L,k,8)};
const zSpooky=(item,k)=>function(L){L.flat(14);L.row(3,8,'?'+item+'?');L.ghost(8,9);L.flat(14);L.ghost(4,9);L.coins(6,10,5);_ex(L,k,9)};
const zBats=(item,k)=>function(L){L.flat(14);L.bat(5,4);L.row(8,8,'?'+item+'?');L.flat(14);L.bat(4,4);L.bat(9,4);L.coins(5,10,4);_ex(L,k,10)};

// ---- 縦(のぼり)ステージ ----
//  { tower:{rows:54} } のステージは「うえへ のぼる」。うえへ のぼって ゴールを めざす
//  cols=足場の左はし(左から何マス目) 3マスずつ高くなる / len=足場の長さ
//  coins/spikes/fly/bat/ghost/cannon = 何こごとに置くか   items=[[足場番号,'E']..]
function buildTower(L,o){
  const len=o.len||4,dh=3,n=o.cols.length;
  o.cols.forEach((c,i)=>{
    const h=dh*(i+1),nxt=o.cols[i+1]===undefined?c:o.cols[i+1],far=nxt>c?c:c+len-1;
    L.tplat(c,h,len);
    if(o.coins&&i%2===0)L.tcoins(c,h,len);
    if(i<1)return;
    if(o.spikes&&i%o.spikes===o.spikes-1)L.tspikes(far,h,1);
    if(o.fly&&i%o.fly===o.fly-1)L.tflyer(c,h,3);
    if(o.bat&&i%o.bat===o.bat-1)L.tbat(c+1,h);
    if(o.ghost&&i%o.ghost===o.ghost-1)L.tghost(c,h);
    if(o.cannon&&i%o.cannon===o.cannon-1)L.tcannon(far,h);
  });
  (o.items||[]).forEach(([i,ch])=>{const c=o.cols[i],nxt=o.cols[i+1]===undefined?c:o.cols[i+1],far=nxt>c?c:c+len-1;L.tblock(far,dh*(i+1),ch)});
  L.tcheck(o.cols[Math.floor(n/2)]+1,dh*(Math.floor(n/2)+1));
  const gh=dh*(n+1),lc=o.cols[n-1];if(lc>=12){L.tplat(17,gh,7);L.tgoal(20,gh)}else{L.tplat(12,gh,10);L.tgoal(19,gh)}
  if(o.rise)L.tlava(o.delay||300,o.rise,o.hazard);   // (今は どのステージも つかっていません)
}
const _zz=[8,14,19,13,7,11,17,20,14,8,12,17,20,14,8,13];
const _mir=a=>a.map(c=>21-c);

const STAGES=[
 // 1 ------------------------------------------------ はじめて
 {name:'そうげん',theme:'grass',build(L){
  L.flat(14); L.row(5,8,'?'); L.row(8,8,'BMB'); L.walker(12);
  L.flat(12); L.row(3,8,'B?B'); L.arc(2,10,5); L.walker(9);
  L.gap(3); L.arc(0,9,3);
  L.flat(14); L.check(1); L.pipe(6,2); L.walker(11);
  L.flat(14); L.row(4,8,'?B?'); L.walker(7); L.walker(11);
  L.gap(4); L.arc(0,9,4);
  L.flat(16); L.pipe(5,2); L.pipe(11,3); L.coins(11,8,2); L.walker(8);
  L.gap(3);
  L.flat(12); L.row(5,8,'?'); L.walker(8);
  L.finish(5);
 }},
 // 2 ------------------------------------------------ かくしブロック・トゲ登場
 {name:'おかのうえ',news:'ジャンプだい',theme:'grass',build(L){
  L.flat(12); L.walker(8);
  L.flat(10); L.row(2,8,'?B?'); L.walker(6); L.spike(8);
  L.gap(3); L.row(1,8,'H'); L.arc(0,9,3);
  L.flat(14); L.check(1); L.stairs(4,4,true); L.stairs(8,4,false); L.coins(4,6,8);
  L.flat(12); L.walker(4); L.walker(9); L.row(5,8,'BMB'); L.spring(10);
  L.gap(4); L.plat(1,9,2);
  L.flat(16); L.pipeIn(4,2,'a'); L.spike(8); L.walker(12); L.pipe(13,3);
  L.gap(3);
  L.flat(12); L.row(3,8,'?B?B?'); L.walker(8); L.spike(10);
  L.gap(4); L.arc(0,9,4);
  L.flat(14); L.walker(5); L.walker(10);
  L.zone('a','cave',zTreasure('N','p'));
  L.finish(5);
 }},
 // 3 ------------------------------------------------ ぴょんぴょん・見えるトゲ
 {name:'さばく',news:'とげとげてき(ふめない!)',theme:'desert',build(L){
  L.flat(10); L.hopper(7);
  L.flat(12); L.row(3,8,'?U?'); L.walker(6); L.spikes(9,2);
  L.gap(4); L.plat(1,10,2);
  L.flat(14); L.check(1); L.hopper(6); L.walker(11); L.pipe(8,2); L.spiny(11);
  L.flat(14); L.thwomp(7); L.row(2,8,'BMB'); L.coins(5,10,3); L.door(11,'a');
  L.gap(3); L.arc(0,9,3);
  L.flat(16); L.spikes(4,3); L.arc(3,8,5); L.hopper(11); L.walker(14);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.hopper(5); L.hopper(10); L.spike(8);
  L.flat(8); L.thwomp(4); L.walker(6);
  L.zone('a','cave',zTreasure('J','d'));
  L.finish(5);
 }},
 // 4 ------------------------------------------------ 石・階段
 {name:'いせき',news:'たいほう(ふんでたおせる)',theme:'desert',build(L){
  L.flat(12); L.walker(8); L.hopper(10);
  L.flat(14); L.thwomp(5); L.thwomp(11); L.row(2,8,'?M?');
  L.gap(3); L.row(1,8,'H');
  L.flat(16); L.check(1); L.stairs(3,5,true); L.stairs(8,5,false); L.coins(4,6,7);
  L.flat(14); L.spikes(3,3); L.arc(2,8,5); L.hopper(10); L.walker(13); L.row(10,8,'S');
  L.gap(4); L.plat(1,9,2);
  L.flat(14); L.spike(4); L.spike(7); L.thwomp(10);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(18); L.check(1); L.pipeIn(3,3,'a'); L.hopper(7); L.walker(12); L.row(8,8,'BMB'); L.cannon(16);
  L.gap(4);
  L.flat(12); L.thwomp(4); L.hopper(8);
  L.zone('a','cave',zGauntlet('D','p'));
  L.finish(6);
 }},
 // 5 ------------------------------------------------ 氷(すべる)・ふわふわ
 {name:'ゆきやま',news:'ペンギン(すべってくる!)',theme:'snow',build(L){
  L.flat(12); L.penguin(8);
  L.flat(14); L.row(3,8,'?B?'); L.penguin(7); L.penguin(11);
  L.gap(3);
  L.flat(14); L.check(1); L.flyer(7,8,4); L.row(5,8,'BMB');
  L.flat(16); L.pipe(5,2); L.flyer(10,9,4); L.penguin(13);
  L.gap(4); L.plat(1,10,2);
  L.flat(14); L.spikes(4,2); L.penguin(9); L.arc(3,8,4);
  L.gap(3);
  L.flat(14); L.flyer(5,8,3); L.flyer(10,9,3); L.row(6,8,'U');
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(16); L.check(1); L.penguin(5); L.hopper(9); L.flyer(12,8,3); L.spiny(13);
  L.gap(4);
  L.flat(12); L.pipe(4,3); L.penguin(9);
  L.finish(5);
 }},
 // 6 ------------------------------------------------ 動く足場
 // 6 ------------------------------------------------ のぼりステージ
 {name:'ゆきのとう',theme:'snow',news:'うえへ のぼれ! てっぺんの はたを めざそう',tower:{rows:54},build(L){
  buildTower(L,{cols:_zz,coins:1,spikes:5,fly:4,items:[[3,'E'],[9,'D']]});
 }},
 {name:'よるのもり',news:'おばけ(みているとうごかない)',theme:'night',build(L){
  L.flat(10); L.hopper(7);
  L.flat(14); L.thwomp(4); L.thwomp(9); L.spike(12); L.row(1,8,'?');
  L.gap(3); L.row(1,8,'H');
  L.flat(14); L.check(1); L.hopper(5); L.spike(8); L.spike(11); L.walker(7); L.ghost(8,9);
  L.flat(14); L.thwomp(3); L.spikes(6,2); L.thwomp(11); L.row(8,8,'BMB');
  L.gap(4); L.plat(1,9,2);
  L.flat(16); L.hopper(4); L.hopper(8); L.hopper(12); L.coins(5,9,6); L.cannon(14); L.ghost(8,9);
  L.gap(5); L.plat(1,10,1); L.row(2,8,'H');
  L.flat(14); L.check(1); L.thwomp(4); L.spike(7); L.thwomp(10); L.walker(12); L.row(1,8,'U');
  L.flat(16); L.stairs(3,4,true); L.stairs(7,4,false); L.hopper(12); L.ghost(8,9);
  L.gap(4);
  L.flat(14); L.thwomp(3); L.thwomp(7); L.thwomp(11); L.cannon(12); L.door(5,'a');
  L.zone('a','night',zSpooky('Z','d'));
  L.finish(5);
 }},
 // 8 ------------------------------------------------ 長い穴・空の道
 {name:'ゆうやけ',news:'ようがんの ひのたま',theme:'sunset',build(L){
  L.flat(10);
  L.gap(8); L.drop(1,11); L.drop(4,11);
  L.flat(12); L.check(1); L.hopper(6); L.flyer(9,8,3); L.row(3,8,'?M?');
  L.gap(9); L.liftH(10,.04); L.flyer(3,8,3);
  L.flat(14); L.spikes(3,3); L.hopper(10); L.walker(13);
  L.gap(8); L.liftV(2,10,1.5,.045); L.pod(4);
  L.flat(12); L.check(1); L.flyer(4,8,3); L.flyer(8,9,3); L.row(5,8,'S');
  L.gap(7); L.drop(1,10); L.drop(4,11);
  L.flat(14); L.hopper(4); L.hopper(9); L.spike(6); L.row(11,7,'D');
  L.gap(10); L.liftH(10,.045);
  L.flat(12); L.thwomp(5); L.flyer(9,8,3);
  L.gap(8); L.drop(1,11); L.drop(4,10);
  L.flat(10);
  L.finish(5);
 }},
 // 9 ------------------------------------------------ トゲ・石・ぴょんぴょん
 {name:'どうくつ',news:'コウモリ(ちかづくとおそってくる)',theme:'cave',build(L){
  L.flat(10); L.hopper(7);
  L.flat(17); L.spikes(3,3); L.spikes(9,3); L.arc(3,7,4); L.arc(9,7,4);
  L.gap(4); L.plat(1,9,2); L.pod(2);
  L.flat(14); L.check(1); L.thwomp(5); L.hopper(9); L.row(2,8,'?M?'); L.cannon(12); L.bat(7,4);
  L.flat(16); L.spike(3); L.spike(5); L.spikes(9,2); L.hopper(13); L.door(12,'a');
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(14); L.thwomp(4); L.thwomp(8); L.thwomp(12); L.row(1,8,'U'); L.bat(6,4);
  L.flat(16); L.check(1); L.stairs(3,5,true); L.stairs(8,5,false);
  L.gap(4); L.row(1,8,'H');
  L.flat(14); L.hopper(4); L.hopper(8); L.spikes(11,2);
  L.gap(6); L.drop(1,11); L.drop(4,10);
  L.flat(16); L.check(1); L.spike(3); L.thwomp(6); L.spikes(9,2); L.hopper(13);
  L.zone('a','cave',zBats('J','d'));
  L.finish(5);
 }},
 // 10 ----------------------------------------------- ぜんぶ入り
 {name:'キャンディ',theme:'candy',build(L){
  L.flat(10); L.walker(7); L.row(3,8,'?M?');
  L.flat(14); L.hopper(5); L.flyer(10,8,3); L.spikes(7,2); L.spring(11);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(5); L.hopper(9); L.spike(12); L.spiny(11); L.bat(8,4);
  L.gap(8); L.liftH(10,.04); L.flyer(2,7,3); L.pod(4);
  L.flat(16); L.row(3,8,'BSB'); L.spikes(7,3); L.hopper(13); L.arc(6,6,5); L.door(12,'a');
  L.gap(4); L.row(1,8,'H');
  L.flat(18); L.check(1); L.stairs(3,5,true); L.stairs(8,5,false); L.flyer(14,8,3); L.belt(1,14,-1); L.ghost(9,9);
  L.gap(8); L.drop(1,11); L.drop(4,10);
  L.flat(14); L.thwomp(3); L.spike(6); L.thwomp(9); L.hopper(12); L.row(1,8,'U'); L.cannon(12);
  L.gap(9); L.liftH(11,.045); L.flyer(4,7,3);
  L.flat(14); L.check(1); L.hopper(4); L.hopper(8); L.flyer(11,8,3);
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(16); L.thwomp(3); L.spikes(7,3); L.thwomp(13); L.row(9,8,'M');
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(14); L.walker(5); L.hopper(9); L.flyer(12,8,3);
  L.zone('a','candy',zTreasure('E','d'));
  L.finish(6);
 }},
 // 11 ----------------------------------------------- 20ステージ編はここから
 {name:'もりのいりぐち',theme:'forest',build(L){
  L.flat(10); L.walker(7); L.row(3,8,'?M?');
  L.flat(14); L.hopper(7); L.walker(12); L.spikes(3,2); L.spring(11); L.bat(9,4);
  L.gap(4); L.plat(1,10,1);
  L.flat(14); L.check(1); L.flyer(6,8,3); L.spike(10); L.door(11,'a');
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(16); L.row(3,8,'BSB'); L.hopper(8); L.thwomp(12); L.walker(14); L.spiny(13); L.bat(8,4);
  L.gap(5); L.arc(0,8,5);
  L.flat(12); L.walker(6);
  L.zone('a','cave',zTreasure('E','d'));
  L.finish(5);
 }},
 // 12
 // 12 -----------------------------------------------
 {name:'ふくろうのもり',theme:'forest',news:'コウモリが さがっている',tower:{rows:54},build(L){
  buildTower(L,{cols:_mir(_zz),coins:1,bat:3,items:[[4,'J']]});
 }},
 {name:'さばくのよる',theme:'desert',build(L){
  L.flat(12); L.walker(6); L.hopper(9);
  L.flat(14); L.spikes(3,3); L.hopper(9); L.walker(12);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(4); L.thwomp(9); L.walker(12); L.spring(11); L.ghost(9,9);
  L.gap(8); L.liftV(2,10,1.8,.05); L.pod(4);
  L.flat(16); L.row(2,8,'?M?'); L.hopper(7); L.spike(10); L.spikes(12,2); L.door(14,'a');
  L.gap(6); L.drop(1,11); L.drop(4,10);
  L.flat(16); L.flyer(4,8,4); L.hopper(8); L.thwomp(12); L.ghost(8,9);
  L.zone('a','night',zSpooky('N','d'));
  L.finish(6);
 }},
 // 14
 {name:'こおりのどうくつ',theme:'snow',build(L){
  L.flat(12); L.penguin(6); L.flyer(9,8,3);
  L.flat(16); L.spikes(5,3); L.hopper(11); L.penguin(14); L.spiny(13);
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(16); L.check(1); L.hopper(5); L.hopper(10); L.flyer(7,7,3); L.row(12,8,'S'); L.bat(7,4);
  L.gap(9); L.liftH(10,.05); L.flyer(3,7,3);
  L.flat(14); L.thwomp(4); L.spike(8); L.penguin(11); L.cannon(12); L.door(13,'a');
  L.gap(7); L.drop(1,11); L.drop(4,11);
  L.flat(16); L.spikes(4,3); L.flyer(9,8,3); L.hopper(13); L.bat(6,4);
  L.zone('a','cave',zBats('D','d'));
  L.finish(6);
 }},
 // 15
 // 15 -----------------------------------------------
 {name:'かざんのとう',theme:'volcano',news:'たいほうと トゲに ちゅうい!',tower:{rows:54},build(L){
  buildTower(L,{cols:_zz,spikes:3,cannon:4,fly:5,items:[[5,'Z'],[10,'N']]});
 }},
 {name:'ほしぞらのみち',theme:'night',build(L){
  L.flat(10); L.flyer(5,8,3);
  L.gap(9); L.liftH(10,.05); L.flyer(3,7,3); L.pod(4);
  L.flat(16); L.check(1); L.hopper(5); L.hopper(9); L.flyer(12,8,3); L.ghost(8,9);
  L.gap(8); L.drop(1,11); L.drop(4,10);
  L.flat(16); L.spikes(4,3); L.thwomp(9); L.hopper(13); L.cannon(14); L.ghost(8,9); L.row(4,7,'Z');
  L.gap(9); L.liftV(2,10,1.8,.055);
  L.flat(16); L.check(1); L.thwomp(3); L.flyer(7,8,4); L.walker(11); L.row(13,8,'U'); L.ghost(8,9);
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(14); L.hopper(5); L.hopper(10); L.door(13,'a');
  L.zone('a','night',zSpooky('J','d'));
  L.finish(6);
 }},
 // 17
 {name:'ゆうやけのはし',theme:'sunset',build(L){
  L.flat(12); L.hopper(6); L.walker(9);
  L.gap(6); L.plat(1,10,1); L.plat(4,9,1);
  L.flat(14); L.spikes(3,3); L.hopper(9); L.flyer(12,8,3); L.row(3,7,'N');
  L.gap(7); L.drop(1,11); L.drop(4,11);
  L.flat(16); L.check(1); L.thwomp(4); L.spikes(7,3); L.thwomp(13); L.belt(1,12,1);
  L.gap(10); L.liftH(11,.06); L.flyer(4,7,3);
  L.flat(16); L.hopper(5); L.spike(9); L.hopper(13); L.row(2,8,'M'); L.spiny(13); L.door(13,'a');
  L.gap(5); L.arc(0,8,5);
  L.flat(14); L.walker(5); L.flyer(9,8,3); L.cannon(12);
  L.zone('a','cave',zGauntlet('J','d'));
  L.finish(6);
 }},
 // 18
 {name:'ふかいどうくつ',theme:'cave',build(L){
  L.flat(12); L.hopper(6); L.spike(9);
  L.flat(16); L.spikes(3,3); L.spikes(9,3); L.walker(13); L.spring(13); L.bat(8,4);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(3); L.thwomp(7); L.thwomp(11); L.door(12,'a');
  L.gap(9); L.liftV(2,10,1.9,.055); L.pod(4);
  L.flat(16); L.hopper(4); L.hopper(8); L.spikes(11,3); L.bat(8,4);
  L.gap(8); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(16); L.check(1); L.spike(4); L.spike(6); L.thwomp(10); L.hopper(13); L.cannon(14); L.bat(8,4);
  L.zone('a','cave',zBats('E','d'));
  L.finish(6);
 }},
 // 19
 // 19 -----------------------------------------------
 {name:'おかしのとう',theme:'candy',news:'おばけに ちゅうい',tower:{rows:54},build(L){
  buildTower(L,{cols:_mir(_zz),coins:1,ghost:3,fly:4,items:[[2,'E'],[8,'J'],[12,'D']]});
 }},
 {name:'まおうのおしろ',theme:'volcano',build(L){
  L.flat(10); L.walker(6); L.row(3,8,'?M?');
  L.flat(16); L.hopper(5); L.spikes(8,3); L.hopper(13); L.spring(13); L.row(5,7,'E');
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(16); L.check(1); L.thwomp(4); L.spikes(7,3); L.thwomp(13); L.belt(1,12,-1); L.ghost(10,9);
  L.gap(9); L.liftH(10,.06); L.flyer(3,7,3); L.pod(4);
  L.flat(18); L.hopper(4); L.hopper(8); L.spikes(11,3); L.flyer(16,8,3); L.row(2,8,'U'); L.cannon(16); L.door(13,'a');
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(18); L.check(1); L.thwomp(4); L.spike(8); L.thwomp(11); L.hopper(15); L.spiny(15); L.bat(9,4);
  L.gap(10); L.liftV(2,10,2,.06); L.flyer(6,7,3); L.pod(5);
  L.flat(18); L.spikes(4,3); L.spikes(10,3); L.hopper(15); L.row(7,8,'S'); L.cannon(16); L.penguin(10);
  L.gap(6); L.plat(1,10,1); L.plat(4,9,1);
  L.flat(16); L.hopper(5); L.flyer(8,8,3); L.thwomp(12);
  L.zone('a','night',zGauntlet('Z','d'));
  L.finish(7);
 }},
];

// ============================================================
//  コースをのばす部品 (どのステージも ゴールの前に、ここから 4〜8こ つなぎます)
//  min = 何ばんめのステージから出るか / themes = そのテーマのときだけ
// ============================================================
const EXT_PARTS=[
 {min:1,f:L=>{L.flat(14);L.row(3,8,'?B?');L.walker(7);L.walker(11)}},
 {min:1,f:L=>{L.gap(4);L.arc(0,9,4);L.flat(12);L.row(2,8,'B?B');L.walker(8)}},
 {min:1,f:L=>{L.flat(16);L.pipe(4,2);L.walker(8);L.pipe(12,3);L.coins(12,8,2)}},
 {min:2,f:L=>{L.flat(14);L.spike(5);L.walker(9);L.coins(3,10,3)}},
 {min:2,f:L=>{L.flat(14);L.row(2,8,'BMB');L.walker(8);L.spike(11)}},
 {min:3,f:L=>{L.flat(16);L.spikes(5,2);L.arc(4,8,4);L.hopper(11)}},
 {min:3,f:L=>{L.flat(14);L.hopper(4);L.hopper(9);L.coins(5,10,3)}},
 {min:3,f:L=>{L.flat(14);L.spring(10);L.coins(9,4,4);L.walker(5)}},
 {min:4,f:L=>{L.flat(14);L.thwomp(5);L.walker(10);L.row(1,8,'?')}},
 {min:4,f:L=>{L.gap(5);L.plat(1,10,1);L.plat(3,9,1);L.flat(12);L.walker(6)}},
 {min:4,f:L=>{L.flat(16);L.cannon(14);L.walker(6);L.row(8,7,'?')}},
 {min:5,f:L=>{L.flat(16);L.flyer(5,8,3);L.flyer(11,9,3);L.spikes(8,2)}},
 {min:5,f:L=>{L.flat(18);L.stairs(3,4,true);L.stairs(8,4,false);L.coins(4,6,7);L.walker(14)}},
 {min:5,f:L=>{L.flat(14);L.row(3,7,'E');L.hopper(8);L.walker(11)}},
 {min:6,f:L=>{L.gap(9);L.liftH(10,.04);L.flat(12);L.walker(6)}},
 {min:6,f:L=>{L.gap(8);L.drop(1,11);L.drop(4,10);L.flat(12);L.hopper(6)}},
 {min:6,f:L=>{L.flat(16);L.belt(1,12,-1);L.hopper(8);L.coins(5,10,5)}},
 {min:7,f:L=>{L.flat(16);L.spikes(4,3);L.hopper(11);L.walker(14)}},
 {min:7,f:L=>{L.flat(14);L.row(3,7,'J');L.spikes(7,2);L.hopper(11)}},
 {min:8,f:L=>{L.flat(14);L.thwomp(3);L.spike(7);L.thwomp(10);L.walker(12)}},
 {min:8,f:L=>{L.gap(7);L.pod(3);L.drop(1,10);L.drop(4,11);L.flat(12);L.walker(5)}},
 {min:9,f:L=>{L.gap(9);L.liftV(2,10,1.7,.05);L.flat(12);L.hopper(5);L.hopper(9)}},
 {min:9,f:L=>{L.flat(16);L.spikes(3,3);L.spikes(9,3);L.arc(3,7,4);L.arc(9,7,4)}},
 {min:10,f:L=>{L.flat(16);L.cannon(14);L.hopper(5);L.spike(9);L.row(2,7,'D')}},
 {min:11,f:L=>{L.flat(18);L.thwomp(4);L.spikes(7,3);L.thwomp(13);L.row(15,7,'N')}},
 {min:11,f:L=>{L.gap(10);L.liftH(11,.05);L.flyer(4,7,3);L.flat(12);L.hopper(6)}},
 {min:13,f:L=>{L.flat(18);L.hopper(4);L.hopper(8);L.spikes(11,3);L.flyer(16,8,3)}},
 {min:14,f:L=>{L.gap(10);L.drop(1,11);L.drop(4,10);L.drop(7,11);L.flat(14);L.hopper(6);L.cannon(12)}},
 {min:3,themes:['snow'],f:L=>{L.flat(16);L.penguin(6);L.penguin(11);L.row(3,8,'?M?')}},
 {min:5,themes:['snow'],f:L=>{L.flat(18);L.penguin(5);L.spikes(9,2);L.penguin(14);L.coins(4,10,3)}},
 {min:5,themes:['cave','forest','volcano'],f:L=>{L.flat(14);L.bat(5,4);L.bat(9,4);L.walker(11)}},
 {min:7,themes:['cave','forest'],f:L=>{L.flat(16);L.bat(4,4);L.spikes(7,2);L.bat(11,4);L.row(2,8,'?M?')}},
 {min:4,themes:['night','candy','sunset'],f:L=>{L.flat(14);L.ghost(8,9);L.walker(5);L.coins(4,10,4)}},
 {min:7,themes:['night','candy'],f:L=>{L.flat(16);L.ghost(6,9);L.ghost(12,9);L.row(2,7,'Z')}},
];
function stageExtension(L,n,theme){
  let a=(n*2654435761)>>>0;
  const rnd=()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const pool=EXT_PARTS.filter(p=>p.min<=n&&(!p.themes||p.themes.includes(theme)));
  // 目標のながさ(マス): ステージが進むほど長く、コースごとに ±40マスの差
  const target=Math.round(260+n*10+(rnd()-.5)*80),start=L.c;
  const cnt=Math.max(2,Math.ceil((target-start)/15)),picks=[];
  for(let i=0;i<cnt;i++){
    let k,tries=0;
    do{k=Math.min(pool.length-1,Math.floor(Math.pow(rnd(),0.8)*pool.length))}while(picks.length&&picks[picks.length-1]===pool[k]&&++tries<6);
    picks.push(pool[k]);
  }
  picks.sort((x,y)=>x.min-y.min);
  const mid=start+(target-start)/2;let checked=false;
  for(const p of picks){
    if(L.c>=target)break;
    if(!checked&&L.c>=mid){checked=true;L.flat(12);L.check(1);L.walker(7)}
    p.f(L);
  }
}
STAGES.forEach((st,i)=>{
  if(st.tower)return;
  const orig=st.build;
  st.build=function(L){
    const fin=L.finish;
    L.finish=function(n){L.finish=fin;stageExtension(L,i+1,st.theme);fin.call(L,n)};
    orig.call(this,L);
  };
});
