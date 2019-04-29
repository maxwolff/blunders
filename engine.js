const stockfish = require('./node_modules/stockfish/src/stockfish.asm.js');
const engine = stockfish();
var kokopu = require('kokopu');

const depth = 10;
const blunderLimit = 400; // in centipawns

const send = str => {
  // console.log('Sending: ' + str);
  engine.postMessage(str);
};

// translate chess formats.
// from: string of portable game notation (PGN) eg. '1. d4 d5 2. c4 c5'
// to: array of standard algorithmic notation (SAN) eg. ['d2d4', 'e5e7']
const getSANmoves = pgnString => {
  const position = new kokopu.Position();
  const moveArr = pgnString.split(' ').filter(elem => isNaN(elem[0])); // exclude move numbers
  return moveArr.reduce((result, pgnMove) => {
    let sanMove;
    // kokopu's castle notation does not match UCI SAN
    if (pgnMove == 'O-O') sanMove = 'e1g1';
    else if (pgnMove == 'O-O-O') sanMove = 'e1c1';
    else {
      sanMove = position.notation(pgnMove).toString();
    }
    result.push(sanMove);
    position.play(pgnMove);
    return result;
  }, []);
};

const init = async () => {
  return new Promise((resolve, reject) => {
    engine.onmessage = function onmessage(event) {
      // console.log(event);
      if (event == 'uciok') {
        send('ucinewgame');
        send('isready');
      }
      if (event == 'readyok') resolve();
    };
    send('uci');
  });
};

const getEval = async moves => {
  return new Promise((resolve, reject) => {
    let eval;
    engine.onmessage = function onmessage(event) {
      // console.log(event);
      if (event.startsWith('info depth ' + depth)) {
        eval = Number(event.split(' ')[9]);
      }
      if (event.startsWith('bestmove')) {
        const bestmove = event.split(' ')[1];
        send('stop');
        resolve({ eval: eval, bestmove: bestmove });
      }
    };
    send('position ' + 'startpos moves ' + moves.join(' '));
    send('go depth ' + depth);
  });
};
// white has even turn numbers, black odd
const isPlayerTurn = (isWhite, turnNumber) => {
  return (
    (isWhite && turnNumber % 2 === 0) || (!isWhite && turnNumber % 2 !== 0)
  );
};

const getBlunders = async (pgnString, isWhite) => {
  const allMoves = getSANmoves(pgnString);
  const evals = await allMoves.reduce(async (acc, curr, idx, src) => {
    const resultArray = await acc;
    const playedMoves = src.slice(0, idx);
    const result = await getEval(playedMoves);
    resultArray.push({ ...result, moves: playedMoves });
    return resultArray;
  }, []);
  return evals.reduce((acc, curr, idx, src) => {
    if (idx == src.length) return acc;
    if (isPlayerTurn(isWhite, idx)) {
      const playerMove = src[idx + 1];
      const centipawnLoss = curr.eval + playerMove.eval; // opponent's evals are negative.
      if (centipawnLoss > blunderLimit) {
        acc.push({
          ...curr,
          newEval: playerMove.eval,
          playerMove: playerMove.moves[playerMove.moves.length - 1],
          moveNumber: idx
        });
      }
    }
    return acc;
  }, []);
};

(async () => {
  const pgnString =
    '1. d4 d5 2. c4 c5 3. Nc3 Nf6 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 cxd4 7. cxd4 Qa5+ 8. Bd2 Qd8 9. Nf3 e6 10. e5 Nc6 11. Bd3 Nxd4 12. Qa4+ Nc6 13. O-O Qxd3 14. Rfd1 Bd7 15. Be3 Qf5 16. Nd4 Qxe5 17. Rab1 Nxd4 18. Bxd4 Bxa4 19. Bxe5 Bxd1 20. Rxd1 Bc5 21. Bxg7 Rg8 22. Bf6 Rg6 23. Be5 Rd8 24. Rxd8+ Kxd8 0-1';
  const isWhite = true;

  await init();

  const blunders = await getBlunders(pgnString, isWhite);
  console.log(blunders);
})();
