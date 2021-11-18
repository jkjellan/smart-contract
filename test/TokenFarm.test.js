const { assert } = require('chai');

const LimuCoin = artifacts.require('LimuCoin');
const DaiToken = artifacts.require('DaiToken');
const CoinBank = artifacts.require('CoinBank');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('CoinBank', ([owner, investor]) => {
    let daiToken, limuCoin, coinBank

    before(async () => {
        daiToken = await DaiToken.new();
        limuCoin = await LimuCoin.new();
        coinBank = await coinBank.new(limuCoin.address, daiToken.address)

        // Transfer all Dapp tokens to farm (1 millioin)
        await limuCoin.transfer(coinBank.address, tokens('1000000'))

        // Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    })

    describe('Mock Dai deployment', async() => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async() => {
        it('has a name', async () => {
            const name = await limuCoin.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm', async() => {
        it('has a name', async () => {
            const name = await coinBank.name()
            assert.equal(name, 'Dapp Token Farm')
        })
        it('contract has tokens', async () => {
            let balance = await limuCoin.balanceOf(coinBank.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result

            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

            // Stake Mock DAI Tokens
            await daiToken.approve(coinBank.address, tokens('100'), { from: investor })
            await coinBank.stakeTokens(tokens('100'), { from: investor })

            // Check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(coinBank.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after staking')

            result = await coinBank.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

            result = await coinBank.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue Tokens
            await coinBank.issueTokens({ from: owner })

            // Check balances after issuance
            result = await limuCoin.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Dapp token wallet balance correct after issuance')

            // Ensure that only owner can issue tokens
            await coinBank.issueTokens({ from: investor }).should.be.rejected;

            // Unstake tokens
            await coinBank.unstakeTokens({ from: investor })

            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after unstaking')

            result = await daiToken.balanceOf(coinBank.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after investor unstakes')

            result = await coinBank.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unstaking')

            result = await coinBank.isStaking(investor)
            assert.equal(result.toString(), 'false', 'invesrtor staking status correct after unstaking')

        })
    })
})