// address of deployed contract
var contractAddress = '0xDA071d11370Ef41c9714fDE174a093da6eEF26E2';
// get storage at slot 0
var storageAt0;
web3.eth.getStorageAt(contractAddress, 0).then(console.log);