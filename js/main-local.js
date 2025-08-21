
const game = {
  currentPlayer: 0, // 0 or 1
  players: [
    {name:'Player 1', hand:[0,0,0,0,0], rollsUsed:0, finished:false, score:null, scoreArray:null},
    {name:'Player 2', hand:[0,0,0,0,0], rollsUsed:0, finished:false, score:null, scoreArray:null}
  ],
  roundNumber: 0,
  history: [],
  held: [false,false,false,false,false],
  roundActive: false
};

function toggleHold(i){
  const p = game.players[game.currentPlayer];
  if(p.rollsUsed===0) return;
  game.held[i] = !game.held[i];
  updateStatus();
}

function onRoll(){
  const p = game.players[game.currentPlayer];
  if(p.rollsUsed>=3) return;
  if(p.rollsUsed===0){
    p.hand = [randDie(),randDie(),randDie(),randDie(),randDie()];
  } else {
    for(let i=0;i<5;i++) if(!game.held[i]) p.hand[i]=randDie();
  }
  p.rollsUsed++;

  updateStatus();
  currentHandInfo();
}

function onEndTurn(){
  const p = game.players[game.currentPlayer];
  if(p.rollsUsed===0) return;

  const {name,scoreArray} = evaluateAndLabel(p.hand);
  p.score = name;
  p.scoreArray = scoreArray;
  p.finished = true;

  currentHandInfo();

  game.held = [false,false,false,false,false];

  if(game.currentPlayer === 0){
    game.currentPlayer = 1;
    updateStatus();
  } else {
    opponentHandDiv.innerHTML = ``;
    addHistoryRecord();
    renderHistory();
    const latestRecord = game.history[game.history.length - 1]; // More efficient than game.roundNumber-1
    statusDiv.innerHTML = latestRecord.winner === 0
      ? '<strong>Tie!</strong>'
      : `<strong>Player ${latestRecord.winner} Wins!</strong>`;
    game.roundActive = false;
  }
  updateStatus();
}

function startRound(){
  game.roundActive = true;
  game.currentPlayer = 0;
  game.players.forEach(p=>{
    p.hand = [0,0,0,0,0];
    p.rollsUsed = 0;
    p.finished = false;
    p.score = null;
    p.scoreArray = null;
  });
  game.held = [false,false,false,false,false];
  statusDiv.textContent = 'Press "New Game" to begin';
  updateStatus();
}

function addHistoryRecord() {
  const cmp = compareScores(game.players[0].scoreArray, game.players[1].scoreArray);
  let winner = 0; //tie
  if (cmp > 0) { winner = 1; }
  else if (cmp < 0) { winner = 2; }

  game.history.push({
    round: ++game.roundNumber,
    winner: winner,
    p1Dice: `${game.players[0].hand.map(n=>DIE_FACE[n-1]).join(' ')}`,
    p2Dice: `${game.players[1].hand.map(n=>DIE_FACE[n-1]).join(' ')}`
  });
}

rollBtn.addEventListener('click', ()=>{
  if(!game.roundActive) return;
  onRoll();
});
endBtn.addEventListener('click', ()=>{
  if(!game.roundActive) return;
  onEndTurn();
});
startBtn.addEventListener('click', ()=>{
  startRound();
  updateStatus();
});


initUI();