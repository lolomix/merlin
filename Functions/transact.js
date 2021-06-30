var Tx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common").default;
const Web3 = require("web3");
const { mainAcc, pkey, RPC, gasPrice, baseGasLimit, gasIncrements } =
  require("../config").default;
const exchanges = require("../Index/exchanges").default;
const { LocalStorage } = require("node-localstorage");
const emitter = require("../emitter").default;
const fs = require("fs");
const path = require("path");

const localStorage = new LocalStorage("./monitor");

const transact = async (exchange, data, pathNumber, routes) => {
  const web3 = new Web3(RPC);

  if (!data) {
    console.log("no data");
    return;
  }

  const privateKey = Buffer.from(pkey, "hex");
  web3.eth.defaultAccount = mainAcc;

  const common = Common.forCustomChain(
    "mainnet",
    {
      name: "bnb",
      networkId: 56,
      chainId: 56,
    },
    "petersburg"
  );

  const customChain = {
    networkId: "0x38",
    chainId: "0x38",
  };

  let gasLimit = (baseGasLimit + gasIncrements * (pathNumber - 2)).toString();

  const txObject = {
    nonce: web3.utils.toHex(localStorage.getItem("txCount")),
    from: mainAcc,
    to: exchanges[exchange].address,
    gasLimit: web3.utils.toHex(gasLimit),
    gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice, "gwei")),
    value: web3.utils.toHex("0"),
    data: data,
    common: { customChain },
  };

  const tx = new Tx(txObject, { common });
  tx.sign(privateKey);

  const serializedTx = tx.serialize();
  const raw = "0x" + serializedTx.toString("hex");

  console.log("sending Tx...");
  console.timeEnd("response");
  console.time("tx");

  await web3.eth
    .sendSignedTransaction(raw, () => {
      console.timeEnd("tx");

      console.log(`\n`);
      let obj = {
        exchange: routes[0][0][0],
        route: routes[0].slice(1).join(" - "),
        return: routes[0][0][1],
        percent: routes[0][0][2],
      };

      let hold = [];
      hold.push(obj);

      console.table(hold);
      console.log(`\n`);
    })
    .then((res) => {
      console.log(res);
      fs.appendFile(
        path.join(__dirname, "../", "log.txt"),
        `
${new Date(Date.now())} - success - ${res.transactionHash} - ${routes[0][0][2]}
            `,
        "utf8",
        (err) => {
          if (err) {
            console.log(err.message);
          }
        }
      );
      localStorage.setItem(
        "txCount",
        (parseInt(localStorage.getItem("txCount")) + 1).toString()
      );
      setTimeout(() => {
        emitter.emit("run");
      }, 2000);
    })
    .catch((err) => {
      console.log(err.message);

      if (err.message.includes("Transaction has been reverted by the EVM:")) {
        fs.appendFile(
          path.join(__dirname, "../", "log.txt"),
          `
${new Date(Date.now())} - failed - ${routes[0][0][2]}
                `,
          "utf8",
          (err) => {
            if (err) {
              console.log(err.message);
            }
          }
        );
        localStorage.setItem(
          "txCount",
          (parseInt(localStorage.getItem("txCount")) + 1).toString()
        );
        setTimeout(() => {
          emitter.emit("run");
        }, 2000);
      } else {
        setTimeout(() => {
          localStorage.setItem("updateTxCount", "true");
          emitter.emit("run");
        }, 2000);
      }
    });
};

exports.default = transact;
