const DIE_FACE = ['⚀','⚁','⚂','⚃','⚄','⚅'];

function randDie(){
    return Math.floor(Math.random()*6)+1;
}

// Lexicographic compare
function compareScores(a,b){
  for(let i=0;i<Math.max(a.length,b.length);i++){
    const ai = a[i]||0;
    const bi = b[i]||0;
    if(ai>bi) return 1;
    if(ai<bi) return -1;
  }
  return 0; // tie
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
  if(countsSorted[0] === 5){ label = 'Five of a Kind ★★★★★★★'; rank = 7; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 4){ label = 'Four of a Kind ★★★★★★☆'; rank = 6; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 3 && countsSorted[1] === 2){ label = 'Full House ★★★★★☆☆'; rank = 5; scoreArray = [rank, ...expanded]; }
  else if(isStraight){ label = 'Straight ★★★★☆☆☆'; rank = 4; scoreArray = [rank, uniqueSorted[4]]; }
  else if(countsSorted[0] === 3){ label = 'Three of a Kind ★★★☆☆☆☆'; rank = 3; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 2 && countsSorted[1] === 2){ label = 'Two Pair ★★☆☆☆☆☆'; rank = 2; scoreArray = [rank, ...expanded]; }
  else if(countsSorted[0] === 2){ label = 'One Pair ★☆☆☆☆☆☆'; rank = 1; scoreArray = [rank, ...expanded]; }
  else { label = 'High Die'; rank = 0; scoreArray = [rank, ...hand.slice().sort((a,b)=>b-a)]; }
  return {name: label, scoreArray};
}