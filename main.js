const { LocalStorage } = require("node-localstorage");
const rates = require("./Functions/rates").default;
const { inputAmount, RPC, mainAcc } = require("./config").default;
const exchanges = require("./Index/exchanges").default;
const pools = require("./Index/pools").default;
const analyse = require("./Functions/analyse").default;
const Web3 = require("web3");
const emitter = require("./emitter").default;

console.log(`\n`, "starting merlin @1.0.0", `\n`);

const web3 = new Web3(RPC);

const localStorage = new LocalStorage("./monitor");

try {
  localStorage.setItem("readyToRun", "false");
  localStorage.setItem("RPCCount", "0");
  localStorage.setItem("txCount", "0");
  localStorage.setItem("updateTxCount", "true");
} catch (e) {
  console.log(e);
  localStorage.setItem("readyToRun", "false");
  localStorage.setItem("RPCCount", "0");
  localStorage.setItem("txCount", "0");
  localStorage.setItem("updateTxCount", "true");
}

let run = () => {
  console.time("reserves");

  try {
    localStorage.setItem("readyToRun", "false");
  } catch (e) {
    console.log(e);
    localStorage.setItem("readyToRun", "false");
  }

  let monitor = {
    tokenData: {},
    routes: [],
    txParams: {},
  };

  let total = 0;
  let count = 0;
  let p = 0;
  let arr = [];
  let array = [];
  let pairs = [];

  if (localStorage.getItem("updateTxCount") === "true") {
    console.log(`\n`, `updating txCount...`, `\n`);

    web3.eth.getTransactionCount(mainAcc, (err, txCount) => {
      if (err) {
        console.log(`unable to retrieve txCount this time`, `\n`);
      }

      if (txCount) {
        try {
          localStorage.setItem("txCount", txCount);
          localStorage.setItem("updateTxCount", "false");
        } catch (e) {
          console.log(e);
          localStorage.setItem("txCount", txCount);
          localStorage.setItem("updateTxCount", "false");
        }
      }
    });

    try {
      localStorage.setItem(
        "RPCCount",
        parseInt(localStorage.getItem("RPCCount")) + 1
      );
    } catch (e) {
      console.log(e);
      localStorage.setItem(
        "RPCCount",
        parseInt(localStorage.getItem("RPCCount")) + 1
      );
    }
  }

  console.log(`\n`, "fetching reserve values...", `\n`);

  arr = Object.keys(exchanges);

  arr.forEach((exch) => {
    pairs = Object.keys(pools[exch]);
    total += pairs.length;
  });

  try {
    localStorage.setItem(
      "RPCCount",
      parseInt(localStorage.getItem("RPCCount")) + total
    );
  } catch (e) {
    console.log(e);
    localStorage.setItem(
      "RPCCount",
      parseInt(localStorage.getItem("RPCCount")) + total
    );
  }

  const update = () => {
    let progress = ((count / total) * 100).toFixed(2);

    if (progress !== p) {
      console.log(progress, "% retrieved");
      p = progress;
    }

    if (count > total * 0.94) {
      clearInterval(interval);
      console.timeEnd("reserves");
      console.time("response");

      analyse(parseInt(inputAmount), monitor);

      monitor = null;
      p = null;
      count = null;
      total = null;
      arr = null;
      pairs = null;
      array = null;
    }
  };

  let interval = setInterval(update, 200);

  arr.forEach((exch) => {
    array = Object.keys(pools[exch]);

    array.forEach(async (val) => {
      await rates(val, exch, monitor.tokenData);
      count++;
    });
  });
};

emitter.on("run", () => {
  setTimeout(() => {
    run();
  }, 415);
});

run();

setTimeout(() => {
  run = () => {
    console.log("starting new instance...");
    return;
  };
}, 3585000);
