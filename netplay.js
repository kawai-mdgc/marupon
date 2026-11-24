'use strict';
// ============================================================
//  ミニゲームのオンライン対戦 (ルームコード方式 / WebRTC = PeerJS)
//  ・ホストが 4もじのルームコードを作る → ともだちがコードを入力して参加
//  ・通信は ブラウザ同士 (サーバーは つなぐ時の仲介だけ)。さいだい 4人
//  ・ホストが あそぶゲームを えらんで スタート。同じシード(なぞの数)で
//    同時にプレイし、リアルタイムの得点を見せあって 最後に順位がでる
// ============================================================
const Net=(()=>{
  const CODE_CHARS='ABCDEFGHJKLMNPRSTUWXYZ';        // まぎらわしい文字(I O Q V)は なし
  const NAMES=['うさぎ','ねこ','くま','ぺんぎん','ひよこ','きつね'];
  const COLORS=['#ff8aa8','#7ad6ff','#ffe45c','#9aff9a'];
  const MAX=4;
  const S={status:'idle',error:'',code:'',isHost:false,meId:'',phase:'lobby',game:0,seed:0,players:[],on:{}};
  let peer=null,conns=[],tickN=0,dirty=false,retry=0;

  const emit=(k,a,b)=>{try{S.on[k]&&S.on[k](a,b)}catch(e){}};
  const mkCode=()=>{let c='';for(let i=0;i<4;i++)c+=CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)];return c};
  const pub=()=>S.players.map(p=>({id:p.id,name:p.name,color:p.color,live:p.live,done:p.done,score:p.score,text:p.text,host:p.host}));
  const sendTo=(c,m)=>{try{c.open!==false&&c.send(m)}catch(e){}};
  const bcast=m=>{for(const c of conns)sendTo(c,m)};
  function newPlayer(id,host){
    const used=S.players.map(p=>p.name),name=NAMES.find(n=>!used.includes(n))||('P'+(S.players.length+1));
    return {id,name,color:COLORS[S.players.length%COLORS.length],live:0,done:false,score:0,text:'',host:!!host};
  }
  function broadcastState(){
    dirty=false;
    bcast({t:'state',phase:S.phase,game:S.game,seed:S.seed,players:pub()});
  }
  function checkAllDone(){
    if(S.phase!=='play')return;
    if(S.players.length&&S.players.every(p=>p.done)){S.phase='result';dirty=true;emit('state')}
  }
  function reset(){
    try{peer&&peer.destroy()}catch(e){}
    peer=null;conns=[];S.status='idle';S.error='';S.code='';S.isHost=false;S.meId='';S.phase='lobby';S.players=[];tickN=0;dirty=false;
  }

  // ---- host ----
  function hostOpen(code){
    S.code=code;
    try{peer=new Peer('marupon-'+code,{debug:0})}catch(e){S.status='error';S.error='つうしんを はじめられません';emit('state');return}
    peer.on('open',id=>{S.status='lobby';S.meId=id;S.isHost=true;S.players=[newPlayer(id,true)];emit('state')});
    peer.on('error',err=>{
      if(err&&err.type==='unavailable-id'&&retry++<4){try{peer.destroy()}catch(e){}hostOpen(mkCode());return}
      S.status='error';S.error=err&&err.type==='network'?'ネットに つながりません':'つうしんエラー';emit('state');
    });
    peer.on('connection',c=>{
      c.on('open',()=>{
        if(S.players.length>=MAX||S.phase==='play'){sendTo(c,{t:'full',why:S.phase==='play'?'play':'full'});setTimeout(()=>{try{c.close()}catch(e){}},300);return}
        conns.push(c);const p=newPlayer(c.peer,false);S.players.push(p);c._pid=c.peer;
        sendTo(c,{t:'welcome',id:c.peer});dirty=true;emit('state');
      });
      c.on('data',m=>{
        if(!m||typeof m!=='object')return;
        const p=S.players.find(p=>p.id===c.peer);if(!p)return;
        if(m.t==='live'){
          p.live=+m.live||0;if(m.done){p.done=true;p.score=Math.max(0,Math.floor(+m.score||0));p.text=String(m.text||'').slice(0,24)}
          dirty=true;checkAllDone();
        }
      });
      const gone=()=>{
        const i=conns.indexOf(c);if(i>=0)conns.splice(i,1);
        const j=S.players.findIndex(p=>p.id===c.peer);if(j>=0)S.players.splice(j,1);
        dirty=true;emit('state');checkAllDone();
      };
      c.on('close',gone);c.on('error',gone);
    });
  }
  // ---- guest ----
  function guestOpen(code){
    S.code=code;
    try{peer=new Peer(undefined,{debug:0})}catch(e){S.status='error';S.error='つうしんを はじめられません';emit('state');return}
    peer.on('error',err=>{
      S.status='error';
      S.error=err&&err.type==='peer-unavailable'?'ルームが みつかりません':err&&err.type==='network'?'ネットに つながりません':'つうしんエラー';
      emit('state');
    });
    peer.on('open',id=>{
      S.meId=id;
      const c=peer.connect('marupon-'+code,{reliable:true});
      const timer=setTimeout(()=>{if(S.status==='joining'){S.status='error';S.error='つながりませんでした (ネットのせいかも)';emit('state')}},12000);
      c.on('open',()=>{clearTimeout(timer);conns=[c]});
      c.on('data',m=>{
        if(!m||typeof m!=='object')return;
        if(m.t==='full'){S.status='error';S.error=m.why==='play'?'いま ゲームちゅうです':'ルームが まんいんです';emit('state');return}
        if(m.t==='welcome'){S.status='lobby';return}
        if(m.t==='state'){
          const prevPhase=S.phase;
          S.status='lobby';S.phase=m.phase;S.game=m.game;S.players=m.players;S.seed=m.seed;
          if(m.phase==='play'&&prevPhase!=='play')emit('start',m.game,m.seed);
          if(m.phase==='lobby'&&prevPhase!=='lobby')emit('lobby');
          emit('state');
        }
      });
      const lost=()=>{if(S.status!=='error'&&S.status!=='idle'){S.status='error';S.error='ルームが とじられました';emit('state');emit('closed')}};
      c.on('close',lost);c.on('error',lost);
    });
    S.status='joining';
  }

  return {
    S,
    available(){return typeof Peer==='function'},
    chars:CODE_CHARS,
    host(){reset();retry=0;if(!this.available()){S.status='error';S.error='つうしん部品を よみこめませんでした';emit('state');return}S.status='opening';hostOpen(mkCode())},
    join(code){reset();if(!this.available()){S.status='error';S.error='つうしん部品を よみこめませんでした';emit('state');return}S.status='joining';guestOpen(String(code).toUpperCase())},
    leave(){reset()},
    // ホスト: ゲームを えらぶ / スタート / ロビーへ もどる
    select(i){if(!S.isHost||S.phase!=='lobby')return;S.game=i;dirty=true},
    start(){
      if(!S.isHost||S.phase!=='lobby')return false;
      S.seed=1+Math.floor(Math.random()*2147483000);S.phase='play';
      for(const p of S.players){p.live=0;p.done=false;p.score=0;p.text=''}
      broadcastState();emit('start',S.game,S.seed);emit('state');return true;
    },
    backToLobby(){if(!S.isHost)return;S.phase='lobby';for(const p of S.players){p.live=0;p.done=false;p.score=0;p.text=''}broadcastState();emit('lobby');emit('state')},
    // 毎フレーム呼ぶ: 自分の得点を送る(ゲーム中)
    report(live,done,score,text){
      const me=S.players.find(p=>p.id===S.meId);
      if(S.isHost){
        if(me){me.live=live;if(done&&!me.done){me.done=true;me.score=score;me.text=String(text||'')}}
        if(done)checkAllDone();dirty=true;
      }else if(conns[0]&&(done||tickN%6===0)){sendTo(conns[0],{t:'live',live,done:!!done,score,text})}
    },
    tick(){tickN++;if(S.isHost&&(dirty&&tickN%5===0||tickN%30===0)&&S.status==='lobby')broadcastState()},
    me(){return S.players.find(p=>p.id===S.meId)||null},
    others(){return S.players.filter(p=>p.id!==S.meId)},
    ranking(){return S.players.slice().sort((a,b)=>b.score-a.score)},
    mkCode,
  };
})();
