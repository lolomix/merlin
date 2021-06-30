# merlin

A Binance Smart Chain node.js script arbitrage trading bot.

Merlin takes circular routes (e.g. WBNB - BUSD - CAKE - WBNB) in a single trade.

## General

Merlin takes circular trades from a set base currency, looking for a minimum profit. Binance Smart Chain is a suitable host for this type of bot owing to the fast transaction times and low gas costs.

Merlin will likely not be successful in most taken trades as the time-window for executing a profitable trade is incredible slim. However in high-volume periods, Merlin can perform profitably, making more on successful trades than the sum of trading costs. If a trade would be executed for any type of loss, the transaction will be reverted and no swap will take place, you will only be charged the gas cost of mining. These 'failed' transactions will show an error message of insufficient output amount on www.bscscan.com because the return amount will be below the specified minimum return amount for the transaction. Successful transactions will appear as completed transactions on www.bscscan.com and will have been executed because at least the `inputAmount` plus the value of `tradeCost` was recovered by the output amount of the transaction.

Some factors should be taken into consideration

The default RPC Endpoint is httpsbsc-dataseed.binance.org. This is free to use, however has a rate-limit of 2000 calls per minute. Merlin functions by calling the RPC to get liquidity pool reserve values. In order to stay within this limit, reserve values for only 17 pools may be requested from the RPC on every call iteration.

Owing to the rate-limit, using the public RPC Endpoint means that you can only use one exchange at a time. The default is set to Pancake Swap V2. Exchanges can be activtated or deactivated by commenting un-commenting the exchange objects in the `exchanges.js` file within the Index folder. Please ensure to also comment un-comment respective liquidity pools within the `pools.js` file within the Index folder.

You can add new tokens, pools or exchanges by entering their valid details in the same format as shown in the respective `tokens.js`, `pools.js` and `exchanges.js` files within the Index folder.

You may be able to make more calls to the blockchain if you are using a private RPC Endpoint. If you are using a private RPC (http or wss), you can change the settings in the `config.js` file within the root folder.

It is possible to use a private RPC Endpoint for just the transactions, if you wish to benefit from faster transaction speeds. Just create a new property in the config.js file, such as `txRPC` and import it as a variable into the `transact.js` file in the Functions folder. Then, within the `transact.js` file, adjust the web3 instantiation according.

## Usage

### Setting up config.js

---

In the `config.js` file within the root folder, enter your BSC wallet address and private key within the double quotes of the `mainAcc` and `pKey` config properties.

For example

>const config = {
>
>mainAcc 0x1a1111aa11a11aaa111a11a1a1a1a1111a1a11a1,
>
>pkey 123123123123123123123123123123123123123123123123123123123123,

It is recommended that you use the default trade size (1.7 WBNB). Please ensure you have sufficient balance in your BSC wallet. If you wish to change this, please enter your chosen trade amount (in wei format) within the double quotes of the `inputAmount` property.

The base currency is set as WBNB. It is recommended that you stay with this as it is the highest volume most liquid coin on Binance Smart Chain however you can also use BUSD if you prefer, although please ensure to change the other relevant propertyvariable values such as `inputAmount`, `minGain` and `tradeCost`. If you wish to use another coin as the base currency, you can do so but you must ensure that sufficient pool addresses to allow a reasonable number of circular trades are being analysed by adding pools on the used exchange(s) to the `pools.js` file inside the Index folder.

The trigger gain property (`minGain`) is set to 0.417%. This is the amount of profit that, if anticipated, the bot will take a trade. If you wish to change this, please also calculate a new trade cost value to enter into the double quotes of the `tradeCost` variable on line 26. This is the anticipated cost (in wei format) calculated in the base currency, taking into account the specified gas price. Please also note that circular trades require more mining than normal transactions, so gas costs will likely be higher than a standard swap for example.

### Initialise the merlin folder

---

In your terminal and with node.js installed, cd into the merlin root folder and run `npm install`.

### Running merlin

---

Once the relevant node packages are installed, you can run merlin in two modes

`node merlin` or `npm run merlin` to run merlin on an infinite loop.
`node main` to run merlin for one hour.

Please note, you may need to restart merlin every 24 hours or so.

Please be aware that you need BNB to trade on Binance Smart Chain. There is no functionality in merlin to check your balances so please take responsibility for ensuring that you have a sufficient BNB balance to trade. Please also note that circular trades require more mining than normal transactions, so gas costs will likely be higher than a standard swap for example.

### Using Tools

---

Some tools have been included to assist with administration of new exchangespoolstokens.

Tools are seperate javascript files that contain code to run specific functions that may assist you. They either print output to the `pools.txt` file within the Tools folder, or by printing output directly to the console. In the case of tools that print output to the `pools.txt` file, you may wish to delete the contents of the file between uses.

In order to use these files, you should update the files with the relevant information such as factory contract address for the exchanges or abi for contracts where necessary.

The tools available are

checkPairs
Checks whether the pairs in the `pools.js` file are formatted correctly for a specified exchange, i.e. whether they are the right way round and whether they are named correctly.

excess
Checks pools from the `pools.js` file for a specified exchange to check for pools that are not sufficiently connected to other currencies. Pools that are returned in an array in the console should be deleted as they are not useful for circular trades.

getAllPairs
Creates a list of all pairs returned from the factory contract that are not present in the `pools.js` file in the Index folder but for which both tokens are already known. This will output a list to the `pools.txt` file in the Tools folder. If the token is known to merlin (i.e. it is listed in the tokens.js file in the Index folder) then the token name will be shown, otherwise the BSC contract address of the token will be displayed. It is recommended that if you are using the `getAllPairs` tool to find new pools to add, you should first check the balances of the pools at www.bscscan.com to ensure that the reserve values are sufficient for your trade size.

getPairs
Creates a list of all the pairs that contain a specified token from a specified exchange factory contract, showing only those pairs that merlin doesn't already know about. This will output a list to the `pools.txt` file in the Tools folder. It is recommended that if you are using the `getPairs` tool to find new pools to add, you should first check the balances of the pools at www.bscscan.com to ensure that the reserve values are sufficient for your trade size.

Any of these tools can be run by doing the following from your terminal once inside the merlin root folder

>cd tools
>
>node (tool-name)

### Legal

---

This software is open source and available for anyone to use, edit or reproduce.

I am making this software available for demonstration only and by no means ensure profitibility as the market and defined configuration will dictate the success of Merlin's performance. As such, performance may vary from user to user. Any financial loss is the responsibiliity of the user and the author accepts no responsibility for any losses incurred through the use of Merlin.
