const playlist=[
{title:"Midnight Dreams",artist:"Luna Wave",duration:"3:45",color:"#6c5ce7"},
{title:"Summer Breeze",artist:"Coastal Beats",duration:"4:12",color:"#00b894"},
{title:"Neon Lights",artist:"Synthwave FM",duration:"3:58",color:"#e17055"},
{title:"Rainy Day",artist:"ChillHop",duration:"4:30",color:"#0984e3"},
{title:"Mountain High",artist:"Folk Tales",duration:"3:22",color:"#fdcb6e"},
{title:"Electric Soul",artist:"Digital Pulse",duration:"4:05",color:"#fd79a8"},
{title:"Ocean Waves",artist:"Nature Sounds",duration:"5:15",color:"#00cec9"},
{title:"City Nights",artist:"Jazz Café",duration:"3:50",color:"#a29bfe"}
];

let current=0,playing=false,shuffle=false,repeat=false,volume=75,progress=0,progressInterval=null;

function loadTrack(i){
    current=i;
    document.getElementById('songTitle').textContent=playlist[i].title;
    document.getElementById('songArtist').textContent=playlist[i].artist;
    document.getElementById('albumArt').textContent=['🎵','🎶','🎸','🎹','🎺','🎻','🥁','🎤'][i%8];
    document.getElementById('albumArt').style.background=`linear-gradient(135deg,${playlist[i].color},${playlist[i].color}88)`;
    document.getElementById('duration').textContent=playlist[i].duration;
    progress=0;
    document.getElementById('progress').style.width='0%';
    document.getElementById('currentTime').textContent='0:00';
    renderPlaylist();
}

function togglePlay(){
    playing=!playing;
    document.getElementById('playBtn').textContent=playing?'⏸':'▶';
    document.getElementById('albumArt').classList.toggle('playing',playing);
    if(playing)startProgress();else clearInterval(progressInterval);
}

function startProgress(){
    clearInterval(progressInterval);
    const parts=playlist[current].duration.split(':');
    const totalSecs=parseInt(parts[0])*60+parseInt(parts[1]);
    progressInterval=setInterval(()=>{
        progress+=1;
        const pct=(progress/totalSecs)*100;
        document.getElementById('progress').style.width=pct+'%';
        const m=Math.floor(progress/60);
        const s=progress%60;
        document.getElementById('currentTime').textContent=m+':'+String(s).padStart(2,'0');
        if(progress>=totalSecs){clearInterval(progressInterval);nextTrack();if(playing)togglePlay()}
    },1000);
}

function nextTrack(){
    if(shuffle){let n;do{n=Math.floor(Math.random()*playlist.length)}while(n===current);loadTrack(n)}
    else{loadTrack((current+1)%playlist.length)}
    if(playing)togglePlay();
}

function prevTrack(){loadTrack(current>0?current-1:playlist.length-1);if(playing)togglePlay()}

function setVolume(v){volume=v}

function toggleShuffle(){shuffle=!shuffle;document.getElementById('shuffleBtn').classList.toggle('active',shuffle)}
function toggleRepeat(){repeat=!repeat;document.getElementById('repeatBtn').classList.toggle('active',repeat)}

function renderPlaylist(){
    document.getElementById('playlistContainer').innerHTML=playlist.map((s,i)=>`
        <div class="playlist-item ${i===current?'active':''}" onclick="loadTrack(${i});if(playing){togglePlay();togglePlay()}">
            <span class="num">${i===current?'▶':' '+(i+1)}</span>
            <div class="info"><h4>${s.title}</h4><span>${s.artist} · ${s.duration}</span></div>
        </div>`).join('');
}

loadTrack(0);
