(()=>{
'use strict';
const $=id=>document.getElementById(id);
const bgm=new Audio('./브금.mp3'),first=new Audio('./1등.mp3'),others=new Audio('./나머지등수.mp3'),click=new Audio('./버튼 클릭음.mp3');
bgm.loop=true;bgm.preload='auto';[first,others,click].forEach(a=>{a.preload='auto';a.volume=.8});
const key='ainsight-lucky-audio-v1';let enabled=true,volume=35,started=false,winner=null;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&typeof saved.enabled==='boolean')enabled=saved.enabled;if(saved&&Number.isFinite(saved.volume))volume=Math.max(0,Math.min(100,saved.volume));}catch(e){}
function persist(){try{localStorage.setItem(key,JSON.stringify({enabled,volume}));}catch(e){}}
function sync(){ $('bgmToggle').textContent=!enabled?'♫ BGM OFF':started?'♫ BGM ON':'♫ BGM 시작';$('bgmToggle').setAttribute('aria-pressed',String(enabled&&started));$('bgmVolume').value=volume;$('bgmVolumeValue').textContent=volume+'%';bgm.volume=volume/100;}
function playBgm(){if(!enabled)return;if(!bgm.paused){started=true;sync();return;}const result=bgm.play();if(result)result.then(()=>{if(!enabled){bgm.pause();return;}started=true;sync();$('audioStatus').textContent='배경음악 반복 재생 중';}).catch(()=>{started=false;sync();$('audioStatus').textContent='BGM 시작 버튼을 눌러 주세요. 재생되지 않으면 음원 파일과 기기 음량을 확인해 주세요.';});}
function effect(audio){audio.currentTime=0;const result=audio.play();if(result)result.catch(()=>{$('audioStatus').textContent='효과음 재생 실패: 음원 파일과 브라우저 소리 설정을 확인해 주세요.';});}
function stopWinner(){if(winner){winner.pause();winner.currentTime=0;winner=null;}}
window.luckyAudio={playWinner(rank){stopWinner();winner=rank===1?first:others;effect(winner);},stopWinner};
$('bgmToggle').onclick=()=>{if(enabled&&started){enabled=false;bgm.pause();$('audioStatus').textContent='배경음악 OFF · 당첨음과 클릭음은 재생됩니다';}else{enabled=true;playBgm();}persist();sync();};
$('bgmVolume').oninput=()=>{volume=Number($('bgmVolume').value);persist();sync();playBgm();};
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||button.disabled)return;effect(click);if(button.id!=='bgmToggle')playBgm();},true);
bgm.addEventListener('error',()=>{started=false;sync();$('audioStatus').textContent='브금.mp3 파일을 불러오지 못했습니다. HTML과 같은 폴더에 있는지 확인해 주세요.';});
sync();if(!enabled)$('audioStatus').textContent='배경음악 OFF · 당첨음과 클릭음은 재생됩니다';
})();
