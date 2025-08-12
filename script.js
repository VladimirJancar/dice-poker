/*************************************************************************
     * Dice Poker — Pass & Play
     * A single-file web app suitable for beginners: create index.html and open in a browser.
     * This implements a 2-player pass-and-play Dice Poker with up to 3 rolls per player.
     *
     * Files: just this HTML file. No build tools required.
     *************************************************************************/

    // ---------- Utility constants & functions ----------
    const DIE_FACE = ['⚀','⚁','⚂','⚃','⚄','⚅']; // unicode dice
    function randDie(){ return Math.floor(Math.random()*6)+1; }

    function clone(x){ return JSON.parse(JSON.stringify(x)); }

    // Lexicographic compare for score arrays
    function compareScores(a,b){
      for(let i=0;i<Math.max(a.length,b.length);i++){
        const ai = a[i]||0;
        const bi = b[i]||0;
        if(ai>bi) return 1;
        if(ai<bi) return -1;
      }
      return 0; // exact tie
    }

    // ---------- Game state ----------
    const game = {
      currentPlayer: 0, // 0 or 1
      players: [
        {name:'Player 1', hand:[0,0,0,0,0], rollsUsed:0, finished:false, score:null, scoreArray:null},
        {name:'Player 2', hand:[0,0,0,0,0], rollsUsed:0, finished:false, score:null, scoreArray:null}
      ],
      held: [false,false,false,false,false], // which dice are held DURING current player's turn
      roundActive: false
    };

    // ---------- DOM references ----------
    const currentPlayerSpan = document.getElementById('current-player');
    const rollsUsedSpan = document.getElementById('rolls-used');
    const diceDiv = document.getElementById('dice');
    const rollBtn = document.getElementById('roll-btn');
    const endBtn = document.getElementById('end-btn');
    const startBtn = document.getElementById('start-btn');
    const statusDiv = document.getElementById('status');
    const scoreboardDiv = document.getElementById('scoreboard');
    const resultDiv = document.getElementById('result');

    // Initialize UI with empty dice
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

    // Render scoreboard (players' finished hands and evaluations)
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

    // Update top status and dice UI
    function updateStatus(){
      if(!game.roundActive){
        statusDiv.textContent = 'Press "Start Round" to begin';
        currentPlayerSpan.textContent = '—';
        rollsUsedSpan.textContent = '0';
        rollBtn.disabled = true;
        endBtn.disabled = true;
        resultDiv.style.display = 'none';
        return;
      }

      const p = game.players[game.currentPlayer];
      statusDiv.textContent = `${p.name}'s turn`;
      currentPlayerSpan.textContent = p.name;
      rollsUsedSpan.textContent = p.rollsUsed;

      // enable / disable buttons
      rollBtn.disabled = (p.rollsUsed>=3);
      endBtn.disabled = (p.rollsUsed===0);

      // update dice buttons
      const diceButtons = diceDiv.querySelectorAll('.die');
      diceButtons.forEach((b,i)=>{
        const val = p.hand[i];
        b.textContent = val?DIE_FACE[val-1]:DIE_FACE[0];
        b.disabled = (p.rollsUsed===0); // only allow hold toggling after first roll
        if(game.held[i]) b.classList.add('held'); else b.classList.remove('held');
      });

      renderScoreboard();
    }

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
      if(p.rollsUsed>=3) return; // safety

      if(p.rollsUsed===0){
        // initial roll: roll all five dice
        p.hand = [randDie(),randDie(),randDie(),randDie(),randDie()];
      } else {
        // re-roll only dice that are NOT held
        for(let i=0;i<5;i++) if(!game.held[i]) p.hand[i]=randDie();
      }
      p.rollsUsed++;

      // automatically clear holds when rolls are exhausted? keep them as-is
      // If player used all rolls, disable further rerolls
      updateStatus();

      // If they've used all 3 rolls, automatically disable roll button (handled in updateStatus)
    }

    // End current player's turn and switch or finish round
    function onEndTurn(){
      const p = game.players[game.currentPlayer];
      if(p.rollsUsed===0) return; // cannot end without rolling

      // Evaluate their hand and mark finished
      const {name,scoreArray} = evaluateAndLabel(p.hand);
      p.score = name;
      p.scoreArray = scoreArray;
      p.finished = true;

      // reset held for next player
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

    // Evaluate hand and return readable label + score array used for tie-breaking
    // scoreArray is an array where higher is better; compare lexicographically
    function evaluateAndLabel(hand){
      // hand is array length 5 with numbers 1..6
      const counts = {};
      hand.forEach(d=>counts[d] = (counts[d]||0)+1);
      // convert to array of {value,count}
      let countPairs = Object.keys(counts).map(v=>({value:parseInt(v),count:counts[v]}));
      // sort by count desc, then by value desc
      countPairs.sort((a,b)=> (b.count - a.count) || (b.value - a.value) );

      // helper: expanded values (grouped by count desc then value desc)
      const expanded = [];
      countPairs.forEach(cp=>{
        for(let i=0;i<cp.count;i++) expanded.push(cp.value);
      });

      // detect straight (5 unique sequential values)
      const uniqueSorted = Array.from(new Set(hand)).sort((a,b)=>a-b);
      const isStraight = (uniqueSorted.length===5 && uniqueSorted[4] - uniqueSorted[0] === 4);

      // Determine rank
      const countsSorted = countPairs.map(cp=>cp.count);
      let label = 'High Die';
      let rank = 0;
      let scoreArray = [];

      if(countsSorted[0] === 5){ label = 'Five of a Kind'; rank = 7; scoreArray = [rank, ...expanded]; }
      else if(countsSorted[0] === 4){ label = 'Four of a Kind'; rank = 6; scoreArray = [rank, ...expanded]; }
      else if(countsSorted[0] === 3 && countsSorted[1] === 2){ label = 'Full House'; rank = 5; scoreArray = [rank, ...expanded]; }
      else if(isStraight){ label = 'Straight'; rank = 4; scoreArray = [rank, uniqueSorted[4]]; }
      else if(countsSorted[0] === 3){ label = 'Three of a Kind'; rank = 3; scoreArray = [rank, ...expanded]; }
      else if(countsSorted[0] === 2 && countsSorted[1] === 2){ label = 'Two Pair'; rank = 2; scoreArray = [rank, ...expanded]; }
      else if(countsSorted[0] === 2){ label = 'One Pair'; rank = 1; scoreArray = [rank, ...expanded]; }
      else { label = 'High Die'; rank = 0; scoreArray = [rank, ...hand.slice().sort((a,b)=>b-a)]; }

      return {name: label, scoreArray};
    }

    // Compare both players and show result block
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

    // ---------- Wire up buttons ----------
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

    // ---------- Initial setup ----------
    initUI();

    // Helpful developer tip: open browser console (F12) if something doesn't work.