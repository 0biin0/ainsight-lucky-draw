(()=>{
'use strict';const $=id=>document.getElementById(id);
const tracks=['브금1.mp3','브금2.mp3','브금3.mp3','브금4.mp3','브금5.mp3'];
const bgm=new Audio();bgm.loop=false;bgm.preload='metadata';
const first=new Audio('./1등.mp3?v=4'),second=new Audio('./2등.mp3?v=4'),third=new Audio('./3등.mp3?v=4'),others=new Audio('./나머지등수.mp3'),click=new Audio('./버튼 클릭음.mp3');
[first,second,third,others,click].forEach(a=>{a.preload='auto';a.volume=.8});
const key='ainsight-lucky-audio-v1';let enabled=true,volume=35,started=false,starting=false,winner=null,current=-1,revision=0;const failed=new Set();
try{const s=JSON.parse(localStorage.getItem(key));if(s&&typeof s.enabled==='boolean')enabled=s.enabled;if(s&&Number.isFinite(s.volume))volume=Math.max(0,Math.min(100,s.volume));}catch(e){}
function persist(){try{localStorage.setItem(key,JSON.stringify({enabled,volume}));}catch(e){}}
function sync(){ $('bgmToggle').textContent=!enabled?'♫ BGM OFF':starting?'♫ BGM 준비 중':started?'♫ BGM ON':'♫ BGM 시작';$('bgmToggle').setAttribute('aria-pressed',String(enabled&&(started||starting)));$('bgmVolume').value=volume;$('bgmVolumeValue').textContent=volume+'%';bgm.volume=volume/100;}
function choose(){const choices=tracks.map((_,i)=>i).filter(i=>i!==current&&!failed.has(i));return choices.length?choices[Math.floor(Math.random()*choices.length)]:-1;}
function nextTrack(){if(!enabled)return;const next=choose();if(next<0){revision++;bgm.pause();started=false;starting=false;sync();$('audioStatus').textContent='BGM 파일을 재생할 수 없습니다. 브금1~5.mp3 업로드를 확인한 뒤 BGM 시작을 눌러 주세요.';return;}revision++;bgm.pause();current=next;started=false;starting=false;bgm.src='./'+tracks[current];playBgm();}
function failedTrack(error,rev){if(rev!==revision||!enabled||error?.name==='AbortError')return;starting=false;started=false;if(error?.name==='NotAllowedError'){sync();$('audioStatus').textContent='음악을 계속하려면 BGM 시작 버튼을 눌러 주세요.';return;}failed.add(current);nextTrack();}
function playBgm(){if(!enabled||starting)return;if(current<0){nextTrack();return;}if(!bgm.paused){started=true;sync();return;}const rev=revision;starting=true;sync();try{const result=bgm.play();Promise.resolve(result).then(()=>{if(rev!==revision||!enabled)return;starting=false;started=true;sync();$('audioStatus').textContent=tracks[current]+' 재생 중 · 최대 2분 후 랜덤 전환';}).catch(e=>failedTrack(e,rev));}catch(e){failedTrack(e,rev);}}
// Count actual playback time, so pausing or buffering does not consume the two minutes.
bgm.addEventListener('timeupdate',()=>{if(enabled&&bgm.currentTime>=120)nextTrack();});
bgm.addEventListener('ended',()=>{if(enabled&&bgm.ended)nextTrack();});
bgm.addEventListener('error',()=>{if(bgm.error)failedTrack(bgm.error,revision);});
// Each effect gets a clean media instance; cancelled requests cannot restart later.
let clickVoice=null;const cancelled=new WeakSet();
function halt(audio){if(!audio)return;cancelled.add(audio);try{audio.pause();}catch(e){} }
function effect(template){
 const audio=new Audio(template.src);audio.preload='auto';audio.volume=template.volume;
 function report(error){if(cancelled.has(audio)||error?.name==='AbortError')return;$('audioStatus').textContent='효과음을 재생하지 못했습니다. 기기 음량과 브라우저 소리 설정을 확인해 주세요.';}
 function play(retry){if(cancelled.has(audio))return;try{const promise=audio.play();if(promise)promise.catch(error=>{if(cancelled.has(audio)||error?.name==='AbortError')return;if(retry&&error?.name!=='NotAllowedError'){try{audio.load();}catch(e){}play(false);}else report(error);});}catch(error){report(error);}}
 play(true);return audio;
}
function stopWinner(){const old=winner;winner=null;halt(old);}
window.luckyAudio={playWinner(rank){stopWinner();winner=effect(rank===1?first:rank===2?second:rank===3?third:others);},stopWinner};

$('bgmToggle').onclick=()=>{if(enabled&&(started||starting)){enabled=false;revision++;bgm.pause();started=false;starting=false;$('audioStatus').textContent='배경음악 OFF · 당첨음과 클릭음은 재생됩니다';}else{enabled=true;failed.clear();playBgm();}persist();sync();};
$('bgmVolume').oninput=()=>{volume=Number($('bgmVolume').value);persist();sync();playBgm();};
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||button.disabled)return;halt(clickVoice);clickVoice=effect(click);if(button.id!=='bgmToggle')playBgm();},true);
sync();$('audioStatus').textContent=enabled?'BGM 시작을 누르면 5곡을 랜덤으로 재생합니다.':'배경음악 OFF · 당첨음과 클릭음은 재생됩니다';
})();
