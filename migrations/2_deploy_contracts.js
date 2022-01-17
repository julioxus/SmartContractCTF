var CTFManager = artifacts.require("CTFManager");

module.exports = function(deployer, accounts) {
    deployer.deploy(CTFManager);
};