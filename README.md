# Web3 Blockchain Project (বাংলা গাইড)

## 📋 প্রজেক্ট সেটআপ (Step by Step)

এই প্রজেক্টে একটি **React + TypeScript + Web3 + Truffle** দিয়ে blockchain application তৈরি করা হয়েছে।

---

## 🛠️ যা যা করা হয়েছে

### **ধাপ ১: Truffle Configuration ফাইল তৈরি**
📁 **File:** `truffle-config.js`

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
  },
  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis',
  migrations_directory: './migrations',
  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
```

**কাজ:**
- Ganache এর সাথে connection সেট করা (port 7545)
- Contract ফোল্ডার নির্ধারণ করা
- Solidity compiler version সেট করা

---

### **ধাপ ২: Migrations Contract তৈরি**
📁 **File:** `src/contracts/Migrations.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    constructor() {
        owner = msg.sender;
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function set_completed(uint completed) public restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.set_completed(last_completed_migration);
    }
}
```

**কাজ:**
- Truffle migration track করার জন্য standard contract
- কোন migration সম্পন্ন হয়েছে তা রাখে

---

### **ধাপ ৩: Migrations Deployment Script**
📁 **File:** `migrations/run_migrations.js`

```javascript
const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
```

**কাজ:**
- Migrations contract কে blockchain এ deploy করে

---

### **ধাপ ৪: Tether Token Contract তৈরি**
📁 **File:** `src/contracts/Tether.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Tether {
    string public name = "Tether";
    string public symbol = "USDT";
    uint256 public totalSupply = 1000000000000000000000000; // 1 million
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
```

**কাজ:**
- একটি simple ERC20 token (USDT)
- Transfer করার সুবিধা
- 1 million token supply

---

### **ধাপ ৫: Tether Deployment Script (Async/Await)**
📁 **File:** `migrations/2_deploy_contracts.js`

```javascript
const Tether = artifacts.require("Tether");

module.exports = async function(deployer) {
  await deployer.deploy(Tether);
};
```

**কাজ:**
- Tether contract কে blockchain এ deploy করে
- Modern async/await syntax ব্যবহার করা হয়েছে

---

## 📂 প্রজেক্ট স্ট্রাকচার

```
web3-blockchain/
├── src/
│   ├── contracts/              # Smart Contracts
│   │   ├── Migrations.sol      ✅ Migration tracking contract
│   │   └── Tether.sol          ✅ USDT token contract
│   ├── abis/                   # Compiled contract JSON (auto-generated)
│   ├── components/             # React components
│   ├── pages/                  # React pages
│   ├── App.tsx                 # Main React component
│   └── main.tsx                # React entry point
├── migrations/                 # Deployment scripts
│   ├── run_migrations.js       ✅ Deploy Migrations contract
│   └── 2_deploy_contracts.js   ✅ Deploy Tether contract (async/await)
├── public/                     # Static files
├── truffle-config.js           ✅ Truffle configuration
├── package.json                # Dependencies
├── vite.config.ts              # Vite build config
└── README.md                   # This file
```

---

## 🚀 কীভাবে চালাবেন

### **১. প্রয়োজনীয় Tools ইন্সটল করুন**

```bash
# Node.js এবং npm ইন্সটল করুন (nodejs.org থেকে)

# Dependencies ইন্সটল
npm install
```

---

### **২. Ganache চালু করুন**

- Ganache খুলুন (GUI বা CLI)
- Port: `7545` তে চলছে তা নিশ্চিত করুন
- Network ID: `5777`

---

### **৩. Smart Contract Compile করুন**

```bash
truffle compile
```

**Output:**
- `src/abis/Migrations.json` তৈরি হবে
- `src/abis/Tether.json` তৈরি হবে

---

### **৪. Smart Contract Deploy করুন**

```bash
truffle migrate
```

**এটি করবে:**
- Migrations contract deploy
- Tether contract deploy
- Contract address দেখাবে

---

### **৫. Truffle Console এ Test করুন**

```bash
truffle console
```

**Console এ commands:**

```javascript
// Tether instance নিন
let tether = await Tether.deployed()

// Token info দেখুন
await tether.name()        // "Tether"
await tether.symbol()      // "USDT"
await tether.totalSupply() // 1000000... (1 million)

// Accounts নিন
let accounts = await web3.eth.getAccounts()

// Balance check করুন
await tether.balanceOf(accounts[0])

// Transfer করুন (100 USDT)
await tether.transfer(accounts[1], web3.utils.toWei('100', 'ether'))

// নতুন balance দেখুন
await tether.balanceOf(accounts[1])
```

---

### **৬. React Frontend চালু করুন**

```bash
npm run dev
```

**Browser এ খুলুন:** `http://localhost:5173`

---

## 🎯 প্রধান Features

✅ **Truffle Framework** - Smart contract development
✅ **Ganache** - Local blockchain
✅ **Solidity 0.8.21** - Smart contract language
✅ **React 19 + TypeScript** - Modern frontend
✅ **Vite** - Fast build tool
✅ **Tailwind CSS** - Styling
✅ **Web3.js** - Blockchain interaction

---

## 📚 Smart Contracts সম্পর্কে

### **Migrations.sol**
- Migration track করে
- Contract upgrade সুবিধা দেয়
- Owner-only functions

### **Tether.sol**
- Simple ERC20 token
- 1 million USDT supply
- Transfer function
- Balance tracking
- Beginner-friendly

---

## 💡 পরবর্তী ধাপ

1. ✅ React components তৈরি করুন wallet connection এর জন্য
2. ✅ Web3.js ব্যবহার করে contract এর সাথে interact করুন
3. ✅ UI তৈরি করুন token transfer এর জন্য
4. ✅ আরো smart contracts যোগ করুন

---

## 🛠️ Useful Commands

```bash
# Compile contracts
truffle compile

# Deploy to Ganache
truffle migrate

# Reset and redeploy
truffle migrate --reset

# Run tests
truffle test

# Open console
truffle console

# Start React app
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

---

## 📖 Dependencies

### **Production:**
- `react` - UI library
- `react-dom` - React DOM renderer
- `web3` - Ethereum JavaScript API
- `truffle` - Smart contract framework
- `tailwindcss` - CSS framework

### **Testing:**
- `chai` - Assertion library
- `chai-as-promised` - Promise assertions
- `chai-bignumber` - BigNumber assertions

### **Development:**
- `vite` - Build tool
- `typescript` - Type safety
- `eslint` - Code quality

---

## 🎓 বাংলা শব্দকোষ

| English | বাংলা |
|---------|-------|
| Smart Contract | স্মার্ট চুক্তি |
| Deploy | স্থাপন করা |
| Compile | কম্পাইল করা |
| Migration | স্থানান্তর |
| Token | টোকেন |
| Balance | ব্যালেন্স |
| Transfer | স্থানান্তর |
| Account | অ্যাকাউন্ট |
| Blockchain | ব্লকচেইন |
| Transaction | লেনদেন |

---

## 📞 সাহায্য দরকার?

- Truffle Docs: https://trufflesuite.com/docs
- Web3.js Docs: https://web3js.readthedocs.io
- Solidity Docs: https://docs.soliditylang.org

---

**তৈরি করেছেন:** Beginner-friendly Web3 Project
**তারিখ:** 2026
**লাইসেন্স:** MIT
