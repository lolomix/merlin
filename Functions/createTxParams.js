const tokens = require('../Index/tokens').default;

const createTxParams = (arr, txParams) => {

    if (arr.length === 0 || !arr) { return }

    txParams.exchange = arr[0][0];
    txParams.pathNumber = arr.length - 1;

    let routes = arr.slice(1);

    txParams.path = [];

    routes.forEach(token => {
        txParams.path.push(tokens[token].address);
    })
}

exports.default = createTxParams;