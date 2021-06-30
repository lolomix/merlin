const { RPC } = require('../config').default;
const pools = require('../Index/pools').default;
const abi = require('../Index/poolAbi').default.pancakeSwap.abi;
const updateRates = require('./updateRates').default;
const Web3 = require('web3')

const web3 = new Web3(RPC)

const rates = async (pair, exchange, tokenData) => {
    
    let arr = pair.split('-');
    let token1 = arr[0], token2 = arr[1];

    let pool = pools[exchange][pair] || 0;

    if (pool === 0) return;

    let contract = new web3.eth.Contract(abi, pool)

    await contract.methods.getReserves().call().then((res) => {
        
        let t1Amount = parseInt(res['0'])
        let t2Amount = parseInt(res['1']);

        updateRates(token1, token2, t1Amount, t2Amount, pair, exchange, tokenData);

    }).catch(err => console.log('Error: ', pair, exchange))


    arr = null; token1 = null; token2 = null; contract = null; t1Amount = null; t2Amount = null; pool = null; 

}

exports.default = rates;