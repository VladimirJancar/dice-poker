const currentPlayerSpan = document.getElementById('current-player');
const rollsUsedSpan = document.getElementById('rolls-used');
const diceDiv = document.getElementById('dice');
const rollBtn = document.getElementById('roll-btn');
const endBtn = document.getElementById('end-btn');
const startBtn = document.getElementById('start-btn');
const statusDiv = document.getElementById('status');
const scoreboardDiv = document.getElementById('scoreboard');
const resultDiv = document.getElementById('result');

function initUI(){
  diceDiv.innerHTML = '';
  for(let i=0;i<5;i++){
    const b = document.createElement('button');
    b.className = 'die';
    b.textContent = DIE_FACE[0];
    b.disabled = true;
    b.addEventListener('click', ()=>toggleHold(i));
    diceDiv.appendChild(b);
  }
  renderScoreboard();
  updateStatus();
}

function renderScoreboard(){
  scoreboardDiv.innerHTML = '';
  game.players.forEach((p,idx)=>{
    const box = document.createElement('div');
    box.className = 'player-box';
    const title = document.createElement('div');
    title.style.fontWeight='700';
    title.textContent = p.name + (game.currentPlayer===idx && game.roundActive ? ' ←' : '');
    box.appendChild(title);
    const info = document.createElement('div');
    info.style.marginTop='8px';
    if(p.finished){
      info.innerHTML = `<div><strong>Final:</strong> ${p.hand.map(n=>DIE_FACE[n-1]).join(' ')}</div>
                        <div><strong>Hand:</strong> ${p.score || '—'}</div>`;
    } else {
      info.innerHTML = `<div><strong>Status:</strong> ${p.rollsUsed>0?`rolled (${p.rollsUsed}/3)`:'not played'}</div>`;
    }
    box.appendChild(info);
    scoreboardDiv.appendChild(box);
  });
}