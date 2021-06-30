const pools = require("../Index/pools").default;

let arr = Object.keys(pools.pancakeSwapV2);

let excess = [];

arr.forEach((pool) => {
  let each = pool.split("-");

  each.forEach((token) => {
    let count = 0;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === pool) {
        continue;
      }

      if (arr[i].includes(token)) {
        count++;
      }
    }

    if (count === 0) {
      excess.push(pool);
    }
  });
});

console.log(excess);
