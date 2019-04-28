const axios = require('axios');
var kokopu = require('kokopu');

const main = async () => {
  // const res = await axios.get(
  //   'https://lichess.org/api/games/user/lasergun?max=1&opening=true'
  // );
  // // console.log(res.data);

  // const lines = res.data.split('\n');
  // const moves = lines[19]; // in PGN
  const pgnMoves =
    '1. d4 d5 2. c4 c5 3. Nc3 Nf6 4. cxd5 Nxd5 5. e4 Nxc3 6. bxc3 cxd4 7. cxd4 Qa5+ 8. Bd2 Qd8 9. Nf3 e6 10. e5 Nc6 11. Bd3 Nxd4 12. Qa4+ Nc6 13. O-O Qxd3 14. Rfd1 Bd7 15. Be3 Qf5 16. Nd4 Qxe5 17. Rab1 Nxd4 18. Bxd4 Bxa4 19. Bxe5 Bxd1 20. Rxd1 Bc5 21. Bxg7 Rg8 22. Bf6 Rg6 23. Be5 Rd8 24. Rxd8+ Kxd8 0-1';
  const parsedMoves = pgnMoves.split(' ').filter(elem => isNaN(elem[0])); // make list of pgn moves
  const position = new kokopu.Position();

  console.log(position.notation('d4').toString());

  const algorithmicMoves = parsedMoves.reduce((arr, move) => {
    const algMove = position.notation(move).toString();
    arr.push(algMove);
    position.play(move);
    console.log(position.ascii());
    return arr;
  }, []);
  console.log(algorithmicMoves);
};

(async () => {
  await main();
})();

// movesArr;
// ratingArr;
// for each move:
//   add move to engine.
//   add to ratings arr

// computeWorstMove(ratingsArr);
