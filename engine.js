const stockfish = require('./node_modules/stockfish/src/stockfish.asm.js');
const engine = stockfish();

let currCP; // game score, in centipawns.

let toPlayMoves = ['d2d4', 'e7e5'];
let playedMoves = [];
let cpArr = [];
const ponderTime = 10;

function send(str) {
  console.log('Sending: ' + str);
  engine.postMessage(str);
}

const getNextMoveString = (played, toPlay) => {
  const moves = played.concat(toPlay[played.length]);
  return moves.join(' ');
};

const ponderNext = (played, toPlay) => {
  let playedTemp = played;
  cpArr = toPlay.reduce((arr, curr, idx, src) => {
    const movesStr = getNextMoveString(playedTemp, toPlay);
    console.log(movesStr);
    send('position ' + 'startpos moves ' + movesStr);
    send('go ponder');
    setTimeout(function() {
      send('stop');
      const cp = Number(currCP) / 100;
      cpArr.push(cp);
    }, 1000 * ponderTime);
    playedTemp[playedTemp.length] = toPlay[playedTemp.length];
    return cpArr;
  }, []);

  send('quit');
  console.log(cpArr);
};

engine.onmessage = function onmessage(event) {
  console.log(event);
  if (event == 'uciok') {
    send('ucinewgame');
    send('isready');
  }
  if (event == 'readyok') {
    ponderNext(playedMoves, toPlayMoves);
  }
  const responseArr = event.split(' ');
  if (responseArr[0] == 'info') {
    currCP = responseArr[9]; // TODO: get 'best move' event instead
  }
};

send('uci');
