// Club Pulse canonical Scriptable device loader.
// Install this file once in Scriptable. Runtime updates are fetched from the
// dedicated club-pulse repository's deployment branch.

const U='https://raw.githubusercontent.com/48wr9f4wgp-lab/club-pulse/club-pulse-runtime/scriptable/club-pulse.js',
      F=FileManager.local(),
      P=F.joinPath(F.documentsDirectory(),'ClubPulseRuntime.js');

let c;
try{
  const r=new Request(U+'?v='+Date.now());
  r.timeoutInterval=10;
  c=await r.loadString();
  if(!c||c.length<1000)throw new Error('Invalid runtime');
  F.writeString(P,c);
}catch(e){
  if(!F.fileExists(P))throw e;
  c=F.readString(P);
}

let p=String(args.widgetParameter||'manutd').trim()||'manutd';
if(config.runsInApp){
  const baseClub=(p.split(':')[0]||'manutd').trim()||'manutd';
  const a=new Alert();
  a.title='Club Pulse QA';
  a.message='実機確認したい状態を選択';
  ['通常','LIVE 67分 2-1','試合終了 2-1勝利','CL次戦','FA杯次戦','EFL杯次戦'].forEach(x=>a.addAction(x));
  a.addCancelAction('キャンセル');
  const i=await a.presentSheet();
  if(i<0){Script.complete();return}
  const m=['auto','live','post','cl','fa','efl'][i];
  p=baseClub+(m==='auto'?'':':'+m);
}

await new Function('args','return (async()=>{\n'+c+'\n})()')({widgetParameter:p});
