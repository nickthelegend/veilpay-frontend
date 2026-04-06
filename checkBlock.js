const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://testnet.conflux.validationcloud.io/v1/bC52X43z8nneoh11p4JiDs7eQLLw1rqv4URTn-AOpfg');
provider.getBlockNumber().then(n => {
    console.log('CURRENT_BLOCK:' + n);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
