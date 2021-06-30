const config = {
  mainAcc: "", // enter your BSC wallet address within the double quotes,

  pkey: "", // enter your BSC wallet adddress' private key within the double quotes

  RPC: "https://bsc-dataseed.binance.org/",

  //alternative free to use BSC RPC Endpoints
  //'https://bsc-dataseed.binance.org/'
  //'https://bsc-dataseed1.defibit.io/'
  //'https://bsc-dataseed1.ninicoin.io/'

  baseCurrency: "WBNB", // change between "WBNB" and "BUSD"

  inputAmount: "1700000000000000000",

  minGain: 0.417, // % Percentage gain the bot will take a trade at

  gasPrice: "8.02", //Gwei

  baseGasLimit: 210000,

  gasIncrements: 60000,
};

const tradeCost = "2600000000000000"; // anticipated cost of trade -- update with wei cost in base currency if you change gas price. used for minOutput calculation below

(config.minOutput = (
  BigInt(config.inputAmount) + BigInt(tradeCost)
).toString()),
  (exports.default = config);
