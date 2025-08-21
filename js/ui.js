const rollsLeftSpan = document.getElementById('rolls-left');
const diceDiv = document.getElementById('dice');
const rollBtn = document.getElementById('roll-btn');
const endBtn = document.getElementById('end-btn');
const startBtn = document.getElementById('start-btn');
const statusDiv = document.getElementById('status');
const scoreboardDiv = document.getElementById('scoreboard');
const currentHandDiv = document.getElementById('current-hand');
const historyDiv = document.getElementById('round-history');
const resultDiv = document.getElementById('result');

function initUI() {
  diceDiv.innerHTML = '';
  for(let i=0;i<5;i++){
    const b = document.createElement('button');
    b.className = 'die';
    b.textContent = DIE_FACE[0];
    b.disabled = true;
    b.addEventListener('click', ()=>toggleHold(i));
    diceDiv.appendChild(b);
  }
  updateStatus();
}

function renderHistory() {
  historyDiv.innerHTML = ``;
  game.history.slice().reverse().forEach(rec => {
    const record = document.createElement('div');
    record.style = "display: flex; flex-direction: column; align-items: center;";
    record.innerHTML =
      `<hr><div>${rec.winner === 1 ? '<strong>P1</strong> > P2' : rec.winner === 2 ? 'P1 < <strong>P2</strong>' : 'P1 = P2'}</div>
      <div>${rec.p1Dice} — ${rec.p2Dice}</div>`;
    historyDiv.appendChild(record);
  });
}

function updateStatus(){
  if(!game.roundActive){
    rollsLeftSpan.textContent = '3';
    rollBtn.disabled = true;
    endBtn.disabled = true;
    resultDiv.style.display = 'none';
    return;
  }

  const p = game.players[game.currentPlayer];
  statusDiv.textContent = `${p.name}'s turn`;
  rollsLeftSpan.textContent = 3-p.rollsUsed;

  rollBtn.disabled = (p.rollsUsed>=3);
  endBtn.disabled = (p.rollsUsed===0);

  const diceButtons = diceDiv.querySelectorAll('.die');
  diceButtons.forEach((b,i)=>{
    const val = p.hand[i];
    b.textContent = val?DIE_FACE[val-1]:DIE_FACE[0];
    b.disabled = (p.rollsUsed===0); // only allow hold toggling after first roll
    if(game.held[i]) b.classList.add('held'); else b.classList.remove('held');
  });
}

function currentHandInfo() {
  const p = game.players[game.currentPlayer];
  if (p.finished) {
    currentHandDiv.innerHTML = '—';
    return;
  }
  const { name } = evaluateAndLabel(p.hand);
  currentHandDiv.innerHTML = `${name || '—'}`;
}