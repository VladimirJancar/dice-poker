
const game = {
  currentPlayer: 0, // 0 or 1
  players: [
    {name:'Player 1', hand:[0,0,0,0,0], rollsUsed:0, finished:false, score:null, scoreArray:null},
    {name:'Player 2', hand:[0,0,0,0,0], rollsUsed:0, finished:false, score:null, scoreArray:null}
  ],
  held: [false,false,false,false,false], // during current player's turn
  roundActive: false
};

// Toggle hold on a die index (only during a player's turn after roll)
function toggleHold(i){
  const p = game.players[game.currentPlayer];
  if(p.rollsUsed===0) return; // can't hold before first roll
  game.held[i] = !game.held[i];
  updateStatus();
}
// Roll or re-roll
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
  // switch player or finish round
  if(game.currentPlayer === 0){
    game.currentPlayer = 1;
    updateStatus();
  } else {
    // both players have played -> compare and show winner
    game.roundActive = false; // freeze actions until user starts next round
    showResult();
  }
  updateStatus();
}
// Start a new round: reset players and let player 1 go first
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
  resultDiv.style.display = 'none';
  updateStatus();
}

function evaluateAndLabel(hand){
  const counts = {};
  hand.forEach(d=>counts[d] = (counts[d]||0)+1);
  let countPairs = Object.keys(counts).map(v=>({value:parseInt(v),count:counts[v]}));

  countPairs.sort((a,b)=> (b.count - a.count) || (b.value - a.value) );
  
  const expanded = [];
  countPairs.forEach(cp=>{
    for(let i=0;i<cp.count;i++) expanded.push(cp.value);
  });

  const uniqueSorted = Array.from(new Set(hand)).sort((a,b)=>a-b);
  const isStraight = (uniqueSorted.length===5 && uniqueSorted[4] - uniqueSorted[0] === 4);

  const countsSorted = countPairs.map(cp=>cp.count);
  let label = 'High Die';
  let rank = 0;
  let scoreArray = [];
  if(countsSorted[0] === 5){ label = 'Five of a Kind ☆☆☆☆☆☆☆'; rank = 7; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 4){ label = 'Four of a Kind ☆☆☆☆☆☆'; rank = 6; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 3 && countsSorted[1] === 2){ label = 'Full House ☆☆☆☆☆'; rank = 5; scoreArray = [rank, ...expanded]; }
  else if(isStraight){ label = 'Straight ☆☆☆☆'; rank = 4; scoreArray = [rank, uniqueSorted[4]]; }
  else if(countsSorted[0] === 3){ label = 'Three of a Kind ☆☆☆'; rank = 3; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 2 && countsSorted[1] === 2){ label = 'Two Pair ☆☆'; rank = 2; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 2){ label = 'One Pair ☆'; rank = 1; scoreArray = [rank, ...expanded]; }
  else { label = 'High Die'; rank = 0; scoreArray = [rank, ...hand.slice().sort((a,b)=>b-a)]; }
  return {name: label, scoreArray};
}

function showResult(){
  const p1 = game.players[0];
  const p2 = game.players[1];
  const cmp = compareScores(p1.scoreArray, p2.scoreArray);
  let text = `Player 1: ${p1.hand.map(n=>DIE_FACE[n-1]).join(' ')} — ${p1.score}\n`;
  text += `Player 2: ${p2.hand.map(n=>DIE_FACE[n-1]).join(' ')} — ${p2.score}\n\n`;
  if(cmp>0){ text += '🏆 Player 1 wins!'; }
  else if(cmp<0){ text += '🏆 Player 2 wins!'; }
  else { text += "It's a tie!"; }
  resultDiv.textContent = text;
  resultDiv.style.display = 'block';
  renderScoreboard();
  statusDiv.textContent = 'Round finished. Start a new round to play again.';
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
  // enable roll button for the starting player
  updateStatus();
});


initUI();