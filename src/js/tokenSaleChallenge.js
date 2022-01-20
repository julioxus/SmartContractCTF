App = {
    web3Provider: null,
    contracts: {},
  
    init: async function() {
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });;
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');   
      }
      web3 = new Web3(App.web3Provider);

      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON('TokenSaleChallenge.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var TokenSaleChallengeArtifact = data;
        App.contracts.TokenSaleChallenge = TruffleContract(TokenSaleChallengeArtifact);
      
        // Set the provider for our contract
        App.contracts.TokenSaleChallenge.setProvider(App.web3Provider);

        // Initialize UI with user info
        App.initInterface();

      });

      return App.bindEvents();
    },
  
    bindEvents: function() {

    },
}