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
//  L.check(dx)  チェックポイントの旗
//
//  むずかしさの目安: ステージ1=はじめて … 10=中ボス … 20=ラスボス
// ============================================================
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
 {name:'おかのうえ',theme:'grass',build(L){
  L.flat(12); L.walker(8);
  L.flat(10); L.row(2,8,'?B?'); L.walker(6); L.spike(8);
  L.gap(3); L.row(1,8,'H'); L.arc(0,9,3);
  L.flat(14); L.check(1); L.stairs(4,4,true); L.stairs(8,4,false); L.coins(4,6,8);
  L.flat(12); L.walker(4); L.walker(9); L.row(5,8,'BMB');
  L.gap(4); L.plat(1,9,2);
  L.flat(16); L.pipe(4,2); L.spike(8); L.walker(12); L.pipe(13,3);
  L.gap(3);
  L.flat(12); L.row(3,8,'?B?B?'); L.walker(8); L.spike(10);
  L.gap(4); L.arc(0,9,4);
  L.flat(14); L.walker(5); L.walker(10);
  L.finish(5);
 }},
 // 3 ------------------------------------------------ ぴょんぴょん・見えるトゲ
 {name:'さばく',theme:'desert',build(L){
  L.flat(10); L.hopper(7);
  L.flat(12); L.row(3,8,'?U?'); L.walker(6); L.spikes(9,2);
  L.gap(4); L.plat(1,10,2);
  L.flat(14); L.check(1); L.hopper(6); L.walker(11); L.pipe(8,2);
  L.flat(14); L.thwomp(7); L.row(2,8,'BMB'); L.coins(5,10,3);
  L.gap(3); L.arc(0,9,3);
  L.flat(16); L.spikes(4,3); L.arc(3,8,5); L.hopper(11); L.walker(14);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.hopper(5); L.hopper(10); L.spike(8);
  L.flat(8); L.thwomp(4); L.walker(6);
  L.finish(5);
 }},
 // 4 ------------------------------------------------ 石・階段
 {name:'いせき',theme:'desert',build(L){
  L.flat(12); L.walker(8); L.hopper(10);
  L.flat(14); L.thwomp(5); L.thwomp(11); L.row(2,8,'?M?');
  L.gap(3); L.row(1,8,'H');
  L.flat(16); L.check(1); L.stairs(3,5,true); L.stairs(8,5,false); L.coins(4,6,7);
  L.flat(14); L.spikes(3,3); L.arc(2,8,5); L.hopper(10); L.walker(13); L.row(10,8,'S');
  L.gap(4); L.plat(1,9,2);
  L.flat(14); L.spike(4); L.spike(7); L.thwomp(10);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(18); L.check(1); L.pipe(3,3); L.hopper(7); L.walker(12); L.row(8,8,'BMB');
  L.gap(4);
  L.flat(12); L.thwomp(4); L.hopper(8);
  L.finish(6);
 }},
 // 5 ------------------------------------------------ 氷(すべる)・ふわふわ
 {name:'ゆきやま',theme:'snow',build(L){
  L.flat(12); L.walker(8);
  L.flat(14); L.row(3,8,'?B?'); L.walker(7); L.walker(11);
  L.gap(3);
  L.flat(14); L.check(1); L.flyer(7,8,4); L.row(5,8,'BMB');
  L.flat(16); L.pipe(5,2); L.flyer(10,9,4); L.walker(13);
  L.gap(4); L.plat(1,10,2);
  L.flat(14); L.spikes(4,2); L.walker(9); L.arc(3,8,4);
  L.gap(3);
  L.flat(14); L.flyer(5,8,3); L.flyer(10,9,3); L.row(6,8,'U');
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(16); L.check(1); L.walker(5); L.hopper(9); L.flyer(12,8,3);
  L.gap(4);
  L.flat(12); L.pipe(4,3); L.walker(9);
  L.finish(5);
 }},
 // 6 ------------------------------------------------ 動く足場
 {name:'そらのゆき',theme:'snow',build(L){
  L.flat(10);
  L.gap(7); L.liftH(11,.03);
  L.flat(12); L.check(1); L.walker(8); L.row(3,8,'?M?');
  L.gap(8); L.liftH(10,.035); L.flyer(2,7,3);
  L.flat(14); L.flyer(6,8,4); L.hopper(10); L.row(3,8,'S');
  L.gap(8); L.drop(1,11); L.drop(4,11);
  L.flat(12); L.walker(5); L.spikes(8,2);
  L.gap(7); L.liftV(2,10,1.6,.04);
  L.flat(14); L.check(1); L.flyer(5,8,3); L.hopper(9); L.row(4,8,'BMB');
  L.gap(9); L.liftH(10,.04);
  L.flat(12); L.walker(6);
  L.gap(8); L.drop(1,10); L.drop(4,11);
  L.flat(12);
  L.finish(5);
 }},
 // 7 ------------------------------------------------ 石のならぶ夜道
 {name:'よるのもり',theme:'night',build(L){
  L.flat(10); L.hopper(7);
  L.flat(14); L.thwomp(4); L.thwomp(9); L.spike(12); L.row(1,8,'?');
  L.gap(3); L.row(1,8,'H');
  L.flat(14); L.check(1); L.hopper(5); L.spike(8); L.spike(11); L.walker(7);
  L.flat(14); L.thwomp(3); L.spikes(6,2); L.thwomp(11); L.row(8,8,'BMB');
  L.gap(4); L.plat(1,9,2);
  L.flat(16); L.hopper(4); L.hopper(8); L.hopper(12); L.coins(5,9,6);
  L.gap(5); L.plat(1,10,1); L.row(2,8,'H');
  L.flat(14); L.check(1); L.thwomp(4); L.spike(7); L.thwomp(10); L.walker(12); L.row(1,8,'U');
  L.flat(16); L.stairs(3,4,true); L.stairs(7,4,false); L.hopper(12);
  L.gap(4);
  L.flat(14); L.thwomp(3); L.thwomp(7); L.thwomp(11);
  L.finish(5);
 }},
 // 8 ------------------------------------------------ 長い穴・空の道
 {name:'ゆうやけ',theme:'sunset',build(L){
  L.flat(10);
  L.gap(8); L.drop(1,11); L.drop(4,11);
  L.flat(12); L.check(1); L.hopper(6); L.flyer(9,8,3); L.row(3,8,'?M?');
  L.gap(9); L.liftH(10,.04); L.flyer(3,8,3);
  L.flat(14); L.spikes(3,3); L.hopper(10); L.walker(13);
  L.gap(8); L.liftV(2,10,1.5,.045);
  L.flat(12); L.check(1); L.flyer(4,8,3); L.flyer(8,9,3); L.row(5,8,'S');
  L.gap(7); L.drop(1,10); L.drop(4,11);
  L.flat(14); L.hopper(4); L.hopper(9); L.spike(6);
  L.gap(10); L.liftH(10,.045);
  L.flat(12); L.thwomp(5); L.flyer(9,8,3);
  L.gap(8); L.drop(1,11); L.drop(4,10);
  L.flat(10);
  L.finish(5);
 }},
 // 9 ------------------------------------------------ トゲ・石・ぴょんぴょん
 {name:'どうくつ',theme:'cave',build(L){
  L.flat(10); L.hopper(7);
  L.flat(17); L.spikes(3,3); L.spikes(9,3); L.arc(3,7,4); L.arc(9,7,4);
  L.gap(4); L.plat(1,9,2);
  L.flat(14); L.check(1); L.thwomp(5); L.hopper(9); L.row(2,8,'?M?');
  L.flat(16); L.spike(3); L.spike(5); L.spikes(9,2); L.hopper(13);
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(14); L.thwomp(4); L.thwomp(8); L.thwomp(12); L.row(1,8,'U');
  L.flat(16); L.check(1); L.stairs(3,5,true); L.stairs(8,5,false);
  L.gap(4); L.row(1,8,'H');
  L.flat(14); L.hopper(4); L.hopper(8); L.spikes(11,2);
  L.gap(6); L.drop(1,11); L.drop(4,10);
  L.flat(16); L.check(1); L.spike(3); L.thwomp(6); L.spikes(9,2); L.hopper(13);
  L.finish(5);
 }},
 // 10 ----------------------------------------------- ぜんぶ入り
 {name:'キャンディ',theme:'candy',build(L){
  L.flat(10); L.walker(7); L.row(3,8,'?M?');
  L.flat(14); L.hopper(5); L.flyer(10,8,3); L.spikes(7,2);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(5); L.hopper(9); L.spike(12);
  L.gap(8); L.liftH(10,.04); L.flyer(2,7,3);
  L.flat(16); L.row(3,8,'BSB'); L.spikes(7,3); L.hopper(13); L.arc(6,6,5);
  L.gap(4); L.row(1,8,'H');
  L.flat(18); L.check(1); L.stairs(3,5,true); L.stairs(8,5,false); L.flyer(14,8,3);
  L.gap(8); L.drop(1,11); L.drop(4,10);
  L.flat(14); L.thwomp(3); L.spike(6); L.thwomp(9); L.hopper(12); L.row(1,8,'U');
  L.gap(9); L.liftH(11,.045); L.flyer(4,7,3);
  L.flat(14); L.check(1); L.hopper(4); L.hopper(8); L.flyer(11,8,3);
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(16); L.thwomp(3); L.spikes(7,3); L.thwomp(13); L.row(9,8,'M');
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(14); L.walker(5); L.hopper(9); L.flyer(12,8,3);
  L.finish(6);
 }},
 // 11 ----------------------------------------------- 20ステージ編はここから
 {name:'もりのいりぐち',theme:'forest',build(L){
  L.flat(10); L.walker(7); L.row(3,8,'?M?');
  L.flat(14); L.hopper(7); L.walker(12); L.spikes(3,2);
  L.gap(4); L.plat(1,10,1);
  L.flat(14); L.check(1); L.flyer(6,8,3); L.spike(10);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(16); L.row(3,8,'BSB'); L.hopper(8); L.thwomp(12); L.walker(14);
  L.gap(5); L.arc(0,8,5);
  L.flat(12); L.walker(6);
  L.finish(5);
 }},
 // 12
 {name:'ふくろうのおか',theme:'grass',build(L){
  L.flat(10); L.hopper(6);
  L.flat(14); L.row(2,8,'?U?'); L.walker(7); L.spikes(9,3);
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(14); L.check(1); L.hopper(6); L.hopper(11); L.flyer(8,7,3);
  L.gap(9); L.liftH(10,.05);
  L.flat(16); L.thwomp(4); L.spikes(8,2); L.walker(12); L.row(13,8,'M');
  L.gap(6); L.plat(1,10,1); L.plat(4,9,1);
  L.flat(14); L.hopper(5); L.walker(9); L.spike(11);
  L.finish(6);
 }},
 // 13
 {name:'さばくのよる',theme:'desert',build(L){
  L.flat(12); L.walker(6); L.hopper(9);
  L.flat(14); L.spikes(3,3); L.hopper(9); L.walker(12);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(4); L.thwomp(9); L.walker(12);
  L.gap(8); L.liftV(2,10,1.8,.05);
  L.flat(16); L.row(2,8,'?M?'); L.hopper(7); L.spike(10); L.spikes(12,2);
  L.gap(6); L.drop(1,11); L.drop(4,10);
  L.flat(16); L.flyer(4,8,4); L.hopper(8); L.thwomp(12);
  L.finish(6);
 }},
 // 14
 {name:'こおりのどうくつ',theme:'snow',build(L){
  L.flat(12); L.walker(6); L.flyer(9,8,3);
  L.flat(16); L.spikes(5,3); L.hopper(11); L.walker(14);
  L.gap(5); L.plat(1,10,1); L.plat(3,10,1);
  L.flat(16); L.check(1); L.hopper(5); L.hopper(10); L.flyer(7,7,3); L.row(12,8,'S');
  L.gap(9); L.liftH(10,.05); L.flyer(3,7,3);
  L.flat(14); L.thwomp(4); L.spike(8); L.walker(11);
  L.gap(7); L.drop(1,11); L.drop(4,11);
  L.flat(16); L.spikes(4,3); L.flyer(9,8,3); L.hopper(13);
  L.finish(6);
 }},
 // 15
 {name:'かざんのふもと',theme:'volcano',build(L){
  L.flat(12); L.hopper(6); L.walker(9);
  L.flat(16); L.spikes(3,3); L.spikes(9,3); L.arc(3,7,4); L.arc(9,7,4);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(4); L.hopper(8); L.thwomp(12);
  L.gap(9); L.liftH(11,.055); L.flyer(4,7,3);
  L.flat(16); L.row(2,8,'BMB'); L.hopper(7); L.spike(10); L.walker(13);
  L.gap(8); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(14); L.walker(5); L.hopper(9);
  L.finish(6);
 }},
 // 16
 {name:'ほしぞらのみち',theme:'night',build(L){
  L.flat(10); L.flyer(5,8,3);
  L.gap(9); L.liftH(10,.05); L.flyer(3,7,3);
  L.flat(16); L.check(1); L.hopper(5); L.hopper(9); L.flyer(12,8,3);
  L.gap(8); L.drop(1,11); L.drop(4,10);
  L.flat(16); L.spikes(4,3); L.thwomp(9); L.hopper(13);
  L.gap(9); L.liftV(2,10,1.8,.055);
  L.flat(16); L.check(1); L.thwomp(3); L.flyer(7,8,4); L.walker(11); L.row(13,8,'U');
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(14); L.hopper(5); L.hopper(10);
  L.finish(6);
 }},
 // 17
 {name:'ゆうやけのはし',theme:'sunset',build(L){
  L.flat(12); L.hopper(6); L.walker(9);
  L.gap(6); L.plat(1,10,1); L.plat(4,9,1);
  L.flat(14); L.spikes(3,3); L.hopper(9); L.flyer(12,8,3);
  L.gap(7); L.drop(1,11); L.drop(4,11);
  L.flat(16); L.check(1); L.thwomp(4); L.spikes(7,3); L.thwomp(13);
  L.gap(10); L.liftH(11,.06); L.flyer(4,7,3);
  L.flat(16); L.hopper(5); L.spike(9); L.hopper(13); L.row(2,8,'M');
  L.gap(5); L.arc(0,8,5);
  L.flat(14); L.walker(5); L.flyer(9,8,3);
  L.finish(6);
 }},
 // 18
 {name:'ふかいどうくつ',theme:'cave',build(L){
  L.flat(12); L.hopper(6); L.spike(9);
  L.flat(16); L.spikes(3,3); L.spikes(9,3); L.walker(13);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(14); L.check(1); L.thwomp(3); L.thwomp(7); L.thwomp(11);
  L.gap(9); L.liftV(2,10,1.9,.055);
  L.flat(16); L.hopper(4); L.hopper(8); L.spikes(11,3);
  L.gap(8); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(16); L.check(1); L.spike(4); L.spike(6); L.thwomp(10); L.hopper(13);
  L.finish(6);
 }},
 // 19
 {name:'おかしのしろ',theme:'candy',build(L){
  L.flat(12); L.hopper(6); L.flyer(9,8,3);
  L.gap(6); L.plat(1,10,1); L.plat(4,10,1);
  L.flat(16); L.spikes(3,3); L.hopper(9); L.thwomp(13);
  L.gap(9); L.liftH(10,.06); L.flyer(3,7,3);
  L.flat(16); L.check(1); L.hopper(5); L.spikes(8,3); L.hopper(13);
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(16); L.thwomp(4); L.spike(8); L.thwomp(11); L.row(13,8,'S');
  L.gap(9); L.liftV(2,10,1.9,.06); L.flyer(6,7,3);
  L.flat(14); L.hopper(5); L.hopper(9);
  L.finish(6);
 }},
 // 20 ----------------------------------------------- ラスボス
 {name:'まおうのおしろ',theme:'volcano',build(L){
  L.flat(10); L.walker(6); L.row(3,8,'?M?');
  L.flat(16); L.hopper(5); L.spikes(8,3); L.hopper(13);
  L.gap(5); L.plat(1,10,1); L.plat(3,9,1);
  L.flat(16); L.check(1); L.thwomp(4); L.spikes(7,3); L.thwomp(13);
  L.gap(9); L.liftH(10,.06); L.flyer(3,7,3);
  L.flat(18); L.hopper(4); L.hopper(8); L.spikes(11,3); L.flyer(16,8,3); L.row(2,8,'U');
  L.gap(10); L.drop(1,11); L.drop(4,10); L.drop(7,11);
  L.flat(18); L.check(1); L.thwomp(4); L.spike(8); L.thwomp(11); L.hopper(15);
  L.gap(10); L.liftV(2,10,2,.06); L.flyer(6,7,3);
  L.flat(18); L.spikes(4,3); L.spikes(10,3); L.hopper(15); L.row(7,8,'S');
  L.gap(6); L.plat(1,10,1); L.plat(4,9,1);
  L.flat(16); L.hopper(5); L.flyer(8,8,3); L.thwomp(12);
  L.finish(7);
 }},
];
