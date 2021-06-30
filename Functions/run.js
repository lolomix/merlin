const exchanges = require("../Index/exchanges").default;
const pools = require("../Index/pools").default;
const { LocalStorage } = require("node-localstorage");
const Web3 = require("web3");
const { RPC, inputAmount, mainAcc } = require("../config").default;
const analyse = require("./analyse").default;
const rates = require("./rates").default;

const localStorage = new LocalStorage("./monitor");

const web3 = new Web3(RPC);

const run = () => {
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

  total = 0;
  count = 0;

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
  }

  p = 0;

  const update = () => {
    let progress = ((count / total) * 100).toFixed(2);

    if (progress !== p) {
      console.log(progress, "% retrieved");
      p = progress;
    }

    if (count > total * 0.94) {
      // localStorage.setItem('ratesUpdated', 'true');
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

exports.default = run;
