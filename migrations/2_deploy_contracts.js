// puts new smart contracts on the blockchain. The blockchain state updates because you created a new "transaction" on the chain.
// you can think of it like migrating a database, in the sense that a blockchain is a database.
const LimuCoin = artifacts.require('LimuCoin');
const DaiToken = artifacts.require('DaiToken');
const CoinBank = artifacts.require('CoinBank');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  await deployer.deploy(LimuCoin)
  const limuCoin = await LimuCoin.deployed()
  
  await deployer.deploy(CoinBank, limuCoin.address, daiToken.address)
  const coinBank = await CoinBank.deployed()

  await limuCoin.transfer(coinBank.address, '1000000000000000000000000')

  await daiToken.transfer(accounts[1], '100000000000000000000')
  await daiToken.transfer(accounts[2], '1000000000000000000000')
};
