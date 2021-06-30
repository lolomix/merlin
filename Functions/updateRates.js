const updateRates = (token1, token2, t1Amount, t2Amount, pair, exchange, tokenData) => {
    if (!tokenData[exchange]) {
        tokenData[exchange] = {}
    }

    if(!tokenData[exchange][pair]) {
        tokenData[exchange][pair] = {}
    }

    tokenData[exchange][pair][`${token1}Amount`] = t1Amount;
    tokenData[exchange][pair][`${token2}Amount`] = t2Amount;
}

exports.default = updateRates;