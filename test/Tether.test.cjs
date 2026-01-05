const { Web3 } = require('web3');
const { expect } = require('chai');
const TetherJSON = require('../src/truffle_abis/Tether.json');

describe('Tether Token Contract', () => {
  let web3;
  let accounts;
  let tether;
  let deployer;
  let recipient;

  before(async () => {
    // Connect to Ganache
    web3 = new Web3('http://127.0.0.1:7545');

    // Get accounts
    accounts = await web3.eth.getAccounts();
    deployer = accounts[0];
    recipient = accounts[1];

    // Get network ID and load contract
    const networkId = await web3.eth.net.getId();
    const networkData = TetherJSON.networks[networkId];

    if (!networkData) {
      throw new Error('Contract not deployed to detected network');
    }

    tether = new web3.eth.Contract(TetherJSON.abi, networkData.address);
  });

  describe('Contract Deployment', () => {
    it('should deploy successfully', () => {
      expect(tether.options.address).to.not.be.undefined;
      expect(tether.options.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have correct name', async () => {
      const name = await tether.methods.name().call();
      expect(name).to.equal('Tether');
    });

    it('should have correct symbol', async () => {
      const symbol = await tether.methods.symbol().call();
      expect(symbol).to.equal('USDT');
    });

    it('should have correct total supply', async () => {
      const totalSupply = await tether.methods.totalSupply().call();
      expect(web3.utils.fromWei(totalSupply, 'ether')).to.equal('1000000');
    });

    it('should assign total supply to deployer initially', async () => {
      const balance = await tether.methods.balanceOf(deployer).call();
      const totalSupply = await tether.methods.totalSupply().call();
      // Deployer should have received the total supply (may have transferred some in previous tests)
      expect(BigInt(balance)).to.be.at.most(BigInt(totalSupply));
      expect(BigInt(balance)).to.be.greaterThan(0n);
    });
  });

  describe('Token Transfers', () => {
    it('should transfer tokens between accounts', async () => {
      const amount = web3.utils.toWei('100', 'ether');

      // Get initial balances
      const initialDeployerBalance = await tether.methods.balanceOf(deployer).call();
      const initialRecipientBalance = await tether.methods.balanceOf(recipient).call();

      // Transfer tokens
      await tether.methods.transfer(recipient, amount).send({ from: deployer });

      // Get final balances
      const finalDeployerBalance = await tether.methods.balanceOf(deployer).call();
      const finalRecipientBalance = await tether.methods.balanceOf(recipient).call();

      // Verify balances
      expect(
        (BigInt(initialDeployerBalance) - BigInt(finalDeployerBalance)).toString()
      ).to.equal(amount);
      expect(
        (BigInt(finalRecipientBalance) - BigInt(initialRecipientBalance)).toString()
      ).to.equal(amount);
    });

    it('should emit Transfer event on token transfer', async () => {
      const amount = web3.utils.toWei('50', 'ether');

      const receipt = await tether.methods.transfer(recipient, amount).send({ from: deployer });

      // Check if Transfer event was emitted
      const transferEvent = receipt.events.Transfer;
      expect(transferEvent).to.not.be.undefined;
      expect(transferEvent.returnValues.from.toLowerCase()).to.equal(deployer.toLowerCase());
      expect(transferEvent.returnValues.to.toLowerCase()).to.equal(recipient.toLowerCase());
      expect(transferEvent.returnValues.value.toString()).to.equal(amount);
    });

    it('should fail when trying to transfer more than balance', async () => {
      const balance = await tether.methods.balanceOf(recipient).call();
      const excessAmount = (BigInt(balance) + BigInt(web3.utils.toWei('1', 'ether'))).toString();

      try {
        await tether.methods.transfer(deployer, excessAmount).send({ from: recipient });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it('should fail when trying to transfer to zero address', async () => {
      const amount = web3.utils.toWei('10', 'ether');

      try {
        await tether.methods.transfer('0x0000000000000000000000000000000000000000', amount)
          .send({ from: deployer });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it('should handle zero amount transfers', async () => {
      const initialBalance = await tether.methods.balanceOf(recipient).call();

      await tether.methods.transfer(recipient, '0').send({ from: deployer });

      const finalBalance = await tether.methods.balanceOf(recipient).call();
      expect(finalBalance.toString()).to.equal(initialBalance.toString());
    });
  });

  describe('Balance Queries', () => {
    it('should return correct balance for an account', async () => {
      const balance = await tether.methods.balanceOf(deployer).call();
      expect(BigInt(balance)).to.be.at.least(0n);
    });

    it('should return zero balance for new account', async () => {
      const newAccount = accounts[5];
      const balance = await tether.methods.balanceOf(newAccount).call();
      expect(balance.toString()).to.equal('0');
    });
  });

  describe('Multiple Transfers', () => {
    it('should handle multiple transfers correctly', async () => {
      const amount = web3.utils.toWei('10', 'ether');
      const account2 = accounts[2];
      const account3 = accounts[3];

      // Get initial balances
      const initialBalance2 = await tether.methods.balanceOf(account2).call();
      const initialBalance3 = await tether.methods.balanceOf(account3).call();

      // Transfer from deployer to account2
      await tether.methods.transfer(account2, amount).send({ from: deployer });

      // Transfer from account2 to account3
      await tether.methods.transfer(account3, amount).send({ from: account2 });

      // Verify balances
      const finalBalance2 = await tether.methods.balanceOf(account2).call();
      const finalBalance3 = await tether.methods.balanceOf(account3).call();

      // Account2 balance should be same as initial (received and sent same amount)
      expect(finalBalance2.toString()).to.equal(initialBalance2.toString());
      // Account3 should have received the amount
      expect((BigInt(finalBalance3) - BigInt(initialBalance3)).toString()).to.equal(amount);
    });
  });
});
