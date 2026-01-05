const { Web3 } = require('web3');
const TetherJSON = require('./src/truffle_abis/Tether.json');
const MigrationsJSON = require('./src/truffle_abis/Migrations.json');
const fs = require('fs');

async function deploy() {
  // Connect to Ganache
  const web3 = new Web3('http://127.0.0.1:7545');

  // Get accounts
  const accounts = await web3.eth.getAccounts();
  console.log('Deploying from account:', accounts[0]);

  // Get network ID
  const networkId = await web3.eth.net.getId();
  console.log('Network ID:', networkId);

  try {
    // Deploy Migrations contract
    console.log('\nDeploying Migrations contract...');
    const Migrations = new web3.eth.Contract(MigrationsJSON.abi);
    const migrationsInstance = await Migrations.deploy({
      data: MigrationsJSON.bytecode
    }).send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '20000000000'
    });
    console.log('Migrations deployed at:', migrationsInstance.options.address);

    // Update Migrations JSON with network data
    MigrationsJSON.networks[networkId] = {
      events: {},
      links: {},
      address: migrationsInstance.options.address,
      transactionHash: migrationsInstance._requestManager.provider.lastBlockHash
    };
    fs.writeFileSync(
      './src/truffle_abis/Migrations.json',
      JSON.stringify(MigrationsJSON, null, 2)
    );

    // Deploy Tether contract
    console.log('\nDeploying Tether contract...');
    const Tether = new web3.eth.Contract(TetherJSON.abi);
    const tetherInstance = await Tether.deploy({
      data: TetherJSON.bytecode
    }).send({
      from: accounts[0],
      gas: 3000000,
      gasPrice: '20000000000'
    });
    console.log('Tether deployed at:', tetherInstance.options.address);

    // Get Tether details
    const name = await tetherInstance.methods.name().call();
    const symbol = await tetherInstance.methods.symbol().call();
    const totalSupply = await tetherInstance.methods.totalSupply().call();
    const balance = await tetherInstance.methods.balanceOf(accounts[0]).call();

    console.log('\nTether Token Details:');
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Total Supply:', web3.utils.fromWei(totalSupply, 'ether'), symbol);
    console.log('Deployer Balance:', web3.utils.fromWei(balance, 'ether'), symbol);

    // Update Tether JSON with network data
    TetherJSON.networks[networkId] = {
      events: {},
      links: {},
      address: tetherInstance.options.address,
      transactionHash: tetherInstance._requestManager.provider.lastBlockHash
    };
    fs.writeFileSync(
      './src/truffle_abis/Tether.json',
      JSON.stringify(TetherJSON, null, 2)
    );

    console.log('\n✓ Deployment successful!');
    console.log('Network data saved to truffle_abis/');

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
