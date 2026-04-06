const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://testnet.conflux.validationcloud.io/v1/bC52X43z8nneoh11p4JiDs7eQLLw1rqv4URTn-AOpfg');

async function check() {
    const stealthAddr = '0x72B933a2f0865E8124bD0666C6402Bc318Aa5545';
    const balance = await provider.getBalance(stealthAddr);
    console.log(`BALANCE_OF_${stealthAddr}: ${ethers.formatEther(balance)} CFX`);
    
    const txHash = '0xf4021a488f1176e55aefc574ed852b476416673be26e240a76c3646043b4956a';
    const receipt = await provider.getTransactionReceipt(txHash);
    console.log(`TX_STATUS: ${receipt ? receipt.status : 'NOT_FOUND'}`);
    console.log(`BLOCK_NUMBER: ${receipt ? receipt.blockNumber : 'N/A'}`);
}

check().catch(console.error);
