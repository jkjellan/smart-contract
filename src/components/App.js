import React, { Component } from 'react'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import LimuCoin from '../abis/LimuCoin.json'
import CoinBank from '../abis/CoinBank.json'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})

    const networkId = await web3.eth.net.getId();
    console.log(networkId);

    // load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      // create javascript version of daiToken contract using web3
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({daiToken})
      console.log({daiToken})
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({daiTokenBalance: daiTokenBalance.toString()})
      console.log({daiTokenBalance})
    } else {
      window.alert('DaiToken contract not deployed to detected network')
    }

    // Load LimuCoin
    const limuCoinData = LimuCoin.networks[networkId]
    if(limuCoinData) {
      // create javascript version of daiToken contract using web3
      const limuCoin = new web3.eth.Contract(LimuCoin.abi, limuCoinData.address)
      this.setState({limuCoin})
      console.log({limuCoin})
      let limuCoinBalance = await limuCoin.methods.balanceOf(this.state.account).call()
      this.setState({limuCoinBalance: limuCoinBalance.toString()})
      console.log({limuCoinBalance})
    } else {
      window.alert('limuCoin contract not deployed to detected network')
    }

    // Load CoinBank
    const coinBankData = CoinBank.networks[networkId]
    if(coinBankData) {
      // create javascript version of daiToken contract using web3
      const coinBank = new web3.eth.Contract(CoinBank.abi, coinBankData.address)
      this.setState({coinBank})
      console.log({coinBank})
      let stakingBalance = await coinBank.methods.stakingBalance(this.state.account).call()
      this.setState({stakingBalance: stakingBalance.toString()})
      console.log({stakingBalance})
    } else {
      window.alert('CoinBank contract not deployed to detected network')
    }

    this.setState({loading: false})
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.coinBank._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.coinBank.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.coinBank.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      limuCoin: {},
      coinBank: {},
      daiTokenBalance: '0',
      limuCoinBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        limuCoinBalance={this.state.limuCoinBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
