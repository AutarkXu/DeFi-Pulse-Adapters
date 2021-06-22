/*==================================================
  Modules
==================================================*/

const sdk = require("../../sdk");
const _ = require("underscore");
const BigNumber = require("bignumber.js");

/*==================================================
    Settings
 ==================================================*/

const contracts = [
    "0x75c23271661d9d143dcb617222bc4bec783eff34", //WETH-USDC
    "0x562c0b218cc9ba06d9eb42f3aef54c54cc5a4650", //LINK-USDC
    "0xc226118fcd120634400ce228d61e1538fb21755f", //LEND-USDC
    "0xca7b0632bd0e646b0f823927d3d2e61b00fe4d80", //SNX-USDC
    "0x0d04146b2fe5d267629a7eb341fb4388dcdbd22f", //COMP-USDC
    "0x2109f78b46a789125598f5ad2b7f243751c2934d", //WBTC-USDC
    "0x1b7902a66f133d899130bf44d7d879da89913b2e", //YFI-USDC
    "0x9baa4cb7e2a470a37a984cfeb5a2ba3d07ca9fe5", //USDT-USDC (CLASSICAL)
    "0x13d3cfc092bd6156e60375ac0b236c130c81f61a", //AMPL-USDC (DVM)
    "0x45021500fa6d83c8adca14c7519aff3e43e61779", //USDT-RAI (DVM)
    "0xc9f93163c99695c6526b799ebca2207fdf7d61ad", //USDT-USDC (DPP)
    "0x3058ef90929cb8180174d74c507176cca6835d73", //DAI-USDT (DSP)
    "0xd84820f0e66187c4f3245e1fe5ccc40655dbacc9", //SDSD-USDT (DSP)
];

const tokens = [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0x514910771af9ca656af840dff83e8264ecf986ca", // LINK
    "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03", // LEND
    "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", // SNX
    "0xc00e94cb662c3520282e6f5717214004a7f26888", // COMP
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", // YFI
    "0xdac17f958d2ee523a2206206994597c13d831ec7", //USDT
    "0xff20817765cb7f73d4bde2e66e067e58d11095c2", //AMPL
    "0xf30547ff2Df1F1CBE5C8DD758B3dd098C856e38f", //RAI
    "0x6b175474e89094c44da98b954eedeac495271d0f", //DAI
    "0x57ab1ec28d129707052df4df418d58a2d46d5f51", //SUSD
];

/*==================================================
  Main
==================================================*/

async function tvl(timestamp, block) {
    const balances = {};

    let balanceOfCalls = [];
    _.forEach(contracts, (contract) => {
        balanceOfCalls = [
            ...balanceOfCalls,
            ..._.map(tokens, (token) => ({
                target: token,
                params: contract,
            })),
        ];
    });

    const balanceOfResult = (
        await sdk.api.abi.multiCall({
            block,
            calls: balanceOfCalls,
            abi: "erc20:balanceOf",
        })
    ).output;

    /* combine token volumes on multiple contracts */
    _.forEach(balanceOfResult, (result) => {
        let balance = new BigNumber(result.output || 0);
        if (balance <= 0) return;

        let asset = result.input.target;
        let total = balances[asset];

        if (total) {
            balances[asset] = balance.plus(total).toFixed();
        } else {
            balances[asset] = balance.toFixed();
        }
    });

    return balances;
}

/*==================================================
  Exports
==================================================*/

module.exports = {
    name: "DODO",
    token: null,
    category: "dexes",
    start: 1597126986, // Aug-07-2020 03:56:08 PM +UTC
    tvl,
};
