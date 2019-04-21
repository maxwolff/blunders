const axios = require('axios');

(async () => {
  const res = await axios.get(
    'https://lichess.org/api/games/user/lasergun?max=1'
  );
  console.log(res.data);
})();

/* 

movesArr; 
ratingArr;
for each move:
  add move to engine. 
  add to ratings arr

computeWorstMove(ratingsArr);

*/
