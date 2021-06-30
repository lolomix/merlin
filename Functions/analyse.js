const { baseCurrency, minGain } = require("../config").default;
const exchanges = require("../Index/exchanges").default;
const runTx = require("./runTx").default;
const emitter = require("../emitter").default;

const analyse = (amount, monitor) => {
  let highest = [];

  const getAmount = (exch, amount, reserveIn, reserveOut) => {
    let amountIn = amount * (1000 - exchanges[exch].fee * 1000);
    let amountOut = parseFloat(
      ((amountIn * reserveOut) / (reserveIn * 1000 + amountIn)).toFixed(7)
    );
    return amountOut;
  };

  let quoteA;

  let dex = Object.keys(monitor.tokenData);

  dex.forEach((exch) => {
    let pairs = Object.keys(monitor.tokenData[exch]);

    pairs.forEach((pair) => {
      if (pair.includes(baseCurrency)) {
        let arr = pair.split("-");
        let check = arr[0] === baseCurrency;

        base = check ? arr[0] : arr[1];
        quote = check ? arr[1] : arr[0];

        reserveIn = monitor.tokenData[exch][pair][`${base}Amount`];
        reserveOut = monitor.tokenData[exch][pair][`${quote}Amount`];

        let sum = getAmount(exch, amount, reserveIn, reserveOut);

        if (amount * (reserveOut / reserveIn) < reserveOut) {
          for (let i = 0; i < pairs.length; i++) {
            let comp = pairs[i].split("-");

            if (pairs[i] === pair || pairs[i].includes(base)) {
              continue;
            }

            if (
              pairs[i].includes(quote) &&
              (quote === comp[0] || quote === comp[1])
            ) {
              let arrA = pairs[i].split("-");
              let check = arrA[0] === quote;

              quoteA = check ? arrA[1] : arrA[0];

              reserveInA = monitor.tokenData[exch][pairs[i]][`${quote}Amount`];
              reserveOutA =
                monitor.tokenData[exch][pairs[i]][`${quoteA}Amount`];

              let sum1 = getAmount(exch, sum, reserveInA, reserveOutA);

              if (sum * (reserveOutA / reserveInA) > reserveOutA) {
                continue;
              }

              for (let j = 0; j < pairs.length; j++) {
                let comp2 = pairs[j].split("-");

                if (
                  pairs[j].includes(base) &&
                  pairs[j].includes(quoteA) &&
                  (quoteA === comp2[0] || quoteA === comp2[1])
                ) {
                  let reserveInB =
                    monitor.tokenData[exch][pairs[j]][`${quoteA}Amount`];
                  let reserveOutB =
                    monitor.tokenData[exch][pairs[j]][`${base}Amount`];

                  let sum2 = getAmount(exch, sum1, reserveInB, reserveOutB);

                  if (sum1 * (reserveOutB / reserveInB) > reserveOutB) {
                    continue;
                  }

                  let percentReturn = (sum2 / amount) * 100;
                  let output = [
                    [
                      exch,
                      sum2 / 1000000000000000000,
                      `${(percentReturn - 100).toFixed(2)}%`,
                    ],
                    base,
                    quote,
                    quoteA,
                    base,
                  ];

                  let obj = {
                    exchange: exch,
                    route: `${base}, ${quote}, ${quoteA}, ${base}`,
                    return: sum2 / 1000000000000000000,
                    percent: (percentReturn - 100).toFixed(2),
                  };

                  highest.push(obj);

                  if (percentReturn - 100 >= minGain) {
                    monitor.routes.push(output);
                  }

                  continue;
                }

                if (pairs[j] === pairs[i] || pairs[j].includes(base)) {
                  continue;
                }

                if (
                  pairs[j].includes(quoteA) &&
                  (quoteA === comp2[0] || quoteA === comp2[1])
                ) {
                  let arrC = pairs[j].split("-");
                  let check = arrC[0] === quoteA;

                  quoteB = check ? arrC[1] : arrC[0];

                  reserveInC =
                    monitor.tokenData[exch][pairs[j]][`${quoteA}Amount`];
                  reserveOutC =
                    monitor.tokenData[exch][pairs[j]][`${quoteB}Amount`];

                  let sum3 = getAmount(exch, sum1, reserveInC, reserveOutC);

                  if (sum1 * (reserveOutC / reserveInC) > reserveOutC) {
                    continue;
                  }

                  for (let k = 0; k < pairs.length; k++) {
                    let comp3 = pairs[k].split("-");

                    if (
                      pairs[k].includes(base) &&
                      pairs[k].includes(quoteB) &&
                      (quoteB === comp3[0] || quoteB === comp3[1])
                    ) {
                      let reserveInD =
                        monitor.tokenData[exch][pairs[k]][`${quoteB}Amount`];
                      let reserveOutD =
                        monitor.tokenData[exch][pairs[k]][`${base}Amount`];

                      let sum4 = getAmount(exch, sum3, reserveInD, reserveOutD);

                      if (sum3 * (reserveOutD / reserveInD) > reserveOutD) {
                        continue;
                      }

                      let percentReturn = (sum4 / amount) * 100;
                      let output1 = [
                        [
                          exch,
                          sum4 / 1000000000000000000,
                          `${(percentReturn - 100).toFixed(2)}%`,
                        ],
                        base,
                        quote,
                        quoteA,
                        quoteB,
                        base,
                      ];

                      let obj1 = {
                        exchange: exch,
                        route: `${base}, ${quote}, ${quoteA}, ${quoteB}, ${base}`,
                        return: sum4 / 1000000000000000000,
                        percent: (percentReturn - 100).toFixed(2),
                      };

                      highest.push(obj1);

                      if (percentReturn - 100 >= minGain) {
                        monitor.routes.push(output1);
                      }
                    }

                    // ********** five hops ************

                    // if (pairs[k] === pairs[j] || pairs[k].includes(base)) { continue }

                    // if (pairs[k].includes(quoteB) && (quoteB === comp3[0] || quoteB === comp3[1])) {

                    //     let arrD = pairs[k].split('-');
                    //     let check = arrD[0] === quoteB;

                    //     quoteC = check ? arrD[1] : arrD[0];

                    //     reserveInE = monitor.tokenData[exch][pairs[k]][`${quoteB}Amount`]
                    //     reserveOutE = monitor.tokenData[exch][pairs[k]][`${quoteC}Amount`];

                    //     let sum5 = getAmount(exch, sum3, reserveInE, reserveOutE)

                    //     if ((sum3 * (reserveOutE / reserveInE)) > reserveOutE) { continue }

                    //     for (let l = 0; l < pairs.length; l++) {

                    //         let comp4 = pairs[l].split('-');

                    //         if (pairs[l].includes(base) && pairs[l].includes(quoteC) && (quoteC === comp4[0] || quoteC === comp4[1])) {

                    //             let reserveInF = monitor.tokenData[exch][pairs[l]][`${quoteC}Amount`];
                    //             let reserveOutF = monitor.tokenData[exch][pairs[l]][`${base}Amount`];

                    //             let sum6 = getAmount(exch, sum5, reserveInF, reserveOutF)

                    //             if ((sum5 * (reserveOutF / reserveInF)) > reserveOutF) { continue }

                    //             let percentReturn = (sum6 / amount) * 100
                    //             let output2 = [[exch, sum6 / 1000000000000000000, `${(percentReturn - 100).toFixed(2)}%`], base, quote, quoteA, quoteB, quoteC, base];

                    //             let obj2 = {
                    //                 exchange: exch,
                    //                 route: `${base}, ${quote}, ${quoteA}, ${quoteB}, ${quoteC}, ${base}`,
                    //                 return: sum6 / 1000000000000000000,
                    //                 percent: (percentReturn - 100).toFixed(2)
                    //             }

                    //             highest.push(obj2);

                    //             if (percentReturn - 100 >= minGain) {
                    //                 monitor.routes.push(output2);
                    //             }
                    //         }
                    //     }
                    // }
                  }
                }
              }
            }
          }
        }
      }
    });
  });

  highest.sort((a, b) => {
    return b.return - a.return;
  });

  monitor.routes.sort((a, b) => {
    return b[0][1] - a[0][1];
  });

  if (monitor.routes.length > 0) {
    runTx(monitor);

    highest = null;
    quoteA = null;
    dex = null;
    pairs = null;
    arr = null;
    check = null;
    base = null;
    quote = null;
    reserveIn = null;
    reserveOut = null;
    sum = null;
    comp = null;
    arrA = null;
    reserveInA = null;
    reserveOutA = null;
    sum1 = null;
    comp2 = null;
    reserveInB = null;
    reserveOutB = null;
    sum2 = null;
    percentReturn = null;
    output = null;
    obj = null;
    arrC = null;
    quoteB = null;
    reserveInC = null;
    reserveOutC = null;
    sum3 = null;
    comp3 = null;
    reserveInD = null;
    reserveOutD = null;
    sum4 = null;
    output1 = null;
    obj1 = null;
  }

  if (monitor.routes.length === 0) {
    console.log(`\n`, "No arb ops to transact", `\n`);
    console.log(" best rejected trades:");
    console.table(highest.slice(0, 3));
    console.log(`\n`);

    highest = null;
    quoteA = null;
    dex = null;
    pairs = null;
    arr = null;
    check = null;
    base = null;
    quote = null;
    reserveIn = null;
    reserveOut = null;
    sum = null;
    comp = null;
    arrA = null;
    reserveInA = null;
    reserveOutA = null;
    sum1 = null;
    comp2 = null;
    reserveInB = null;
    reserveOutB = null;
    sum2 = null;
    percentReturn = null;
    output = null;
    obj = null;
    arrC = null;
    quoteB = null;
    reserveInC = null;
    reserveOutC = null;
    sum3 = null;
    comp3 = null;
    reserveInD = null;
    reserveOutD = null;
    sum4 = null;
    output1 = null;
    obj1 = null;

    console.timeEnd("response");

    emitter.emit("run");
  }
};

exports.default = analyse;
