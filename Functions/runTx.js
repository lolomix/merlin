const createTxParams = require('./createTxParams').default;
const encodeData = require('./encodeData').default;
const transact = require('./transact').default;
// const { LocalStorage } = require('node-localstorage');
const { inputAmount, minOutput } = require('../config').default;

const runTx = async ({ routes, txParams }) => {
    
    // const localStorage = new LocalStorage('./monitor')

    // if (localStorage.getItem('readyTx') !== 'true') { return }

    // localStorage.setItem('readyTx', 'false');
    // localStorage.setItem('ratesUpdated', 'false');
    // localStorage.setItem('RPCCount', parseInt(localStorage.getItem('RPCCount')) + 1);

    if (routes.length === 0) {
        return;
    }

    createTxParams(routes[0], txParams);
    encodeData(inputAmount, minOutput, txParams.path, txParams);
    await transact(txParams.exchange, txParams.data, txParams.pathNumber, routes);
}

exports.default = runTx;