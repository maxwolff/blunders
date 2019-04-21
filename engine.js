const stockfish = require('./node_modules/stockfish/src/stockfish.asm.js');
const engine = stockfish();

let cp; // game score, in centipawns.

function send(str) {
  console.log('Sending: ' + str);
  engine.postMessage(str);
}

engine.onmessage = function onmessage(event) {
  console.log(event);
  if (event == 'uciok') {
    send('ucinewgame');
    send('isready');
  }
  if (event == 'readyok') {
    send('position ' + 'startpos moves ' + 'e2e4 e7e5 f1a6');
    send('go ponder');
    setTimeout(function() {
      send('stop');
      console.log(Number(cp) / 100);
    }, 1000 * 1);
  }
  const responseArr = event.split(' ');
  if (responseArr[0] == 'info') {
    cp = responseArr[9];
  }
};

send('uci');
