const axios = require('axios');
var kokopu = require('kokopu');

const main = async () => {
  const res = await axios.get(
    'https://lichess.org/api/games/user/lasergun?max=1&opening=true'
  );
  console.log(res.data);

  // const lines = res.data.split('\n');
  // const moves = lines[19]; // in PGN
};

(async () => {
  await main();
})();
