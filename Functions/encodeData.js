const Web3 = require('web3');
const { mainAcc, RPC } = require('../config').default;

const encodeData = (amountIn, amountOutMin, path, txParams) => {
    
    const web3 = new Web3(RPC);

    if (!path) { return }

    let deadline = (Date.now() + 180000).toString().substring(0, 10);

    txParams.data =  web3.eth.abi.encodeFunctionCall({
        name: 'swapExactTokensForTokens',
        type: 'function',
        inputs: [{
                type: 'uint256',
                name: 'amountIn'    
            },{
                type: 'uint256',
                name: 'amountOutMin'
            },{
                type: 'address[]',
                name: 'path'
            },{
                type: 'address',
                name: 'to'
            },{
                type: 'uint256',
                name: 'deadline'
        }]
    }, [
        amountIn, amountOutMin, path, mainAcc, deadline
    ])
}

exports.default = encodeData;