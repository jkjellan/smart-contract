const CoinBank = artifacts.require('CoinBank');

module.exports = async function(callback) {
    let coinBank = await CoinBank.deployed()
    await coinBank.issueTokens()
    console.log("Tokens issued!")

    callback()
};