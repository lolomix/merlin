const Web3 = require('web3');
const { RPC } = require('../config').default;
const abi = require('../Index/poolAbi').default.pancakeSwap.abi;
const pools = require('../Index/pools').default;
const tokens = require('../Index/tokens').default;
const fs = require('fs');
const path = require('path');


const dex = 'pancakeSwapV2';
const pairs = Object.keys(pools[dex])
const poolAddresses = Object.values(pools[dex])
const tokenNames = Object.keys(tokens)

const web3 = new Web3(RPC);

const checkPairs = async () => {

    for (let i = 0; i < poolAddresses.length; i++) {
    
        let contract = new web3.eth.Contract(abi, poolAddresses[i]);
        
        await contract.methods.token0().call().then( async (t0) => {
            
            let token0 = t0;
    
            await contract.methods.token1().call().then(t1 => {
    
                let token1 = t1
    
                let tok0, tok1;
    
                for (let j = 0; j < tokenNames.length; j++) {
    
                    if (tokens[tokenNames[j]].address.toLowerCase() === token0.toLowerCase()) {
                        tok0 = tokenNames[j]
                    }
    
                    if (tokens[tokenNames[j]].address.toLowerCase() === token1.toLowerCase()) {
                        tok1 = tokenNames[j]
                    }
    
                }
    
                if (`${tok0}-${tok1}` === pairs[i]) {
                    fs.appendFile(path.join(__dirname, 'pools.txt'), `
                    ${pairs[i]} --- true
                    `, 'utf8', (err) => {
                        if (err) console.log(`problem writing pair ${pairs[i]} true`)
                    })
                }
    
                else {
    
                    fs.appendFile(path.join(__dirname, 'pools.txt'), `
                    ${pairs[i]} --- false --- should be ${tok0}-${tok1}
                    `, 'utf8', (err) => {
                        if (err) console.log(`problem writing pair ${pairs[i]} false`)
                    } )
                }
    
            }).catch(err => console.log(err))
    
        }).catch(err => console.log(err))
    
    }
}

checkPairs();



