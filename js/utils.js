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