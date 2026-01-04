module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
  },

  contracts_directory: './src/contracts',
  contracts_build_directory: './src/truffle_abis',
  migrations_directory: './migrations',

  compilers: {
    solc: {
      version: "0.8.13",  // Lower version for Ganache v2 compatibility
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "london"  // Use London EVM version
      }
    }
  }
};
