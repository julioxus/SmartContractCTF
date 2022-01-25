App = {
    web3Provider: null,
    contracts: {},
    challengeAddr : null,
  
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
      $.getJSON('artifacts/CTFManager.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var CTFManagerArtifact = data;
        App.contracts.CTFManager = TruffleContract(CTFManagerArtifact);
      
        // Set the provider for our contract
        App.contracts.CTFManager.setProvider(App.web3Provider);

        // Use our contract to retrieve the Challenge status
        App.getChallenge(2);

      });

      return App.bindEvents();
    },
  
    bindEvents: function() {
      $('#buy-form').submit(App.buy);
      $('#sell-form').submit(App.sell);
      $('#checkSolutionButton').click(App.checkSolution);
    },

    initCTFManagerInstance: function(myCallback){

      web3.eth.getAccounts(async function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          var instance = await App.contracts.CTFManager.deployed().then(async function(instance) {
            return instance;
        });
        myCallback(account, instance);
      });    
    },

    initTokenSaleChallengeInstance: function(address, myCallback){

      web3.eth.getAccounts(async function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          var instance = await App.contracts.TokenSaleChallenge.at(address).then(async function(instance) {
            return instance;
        });
        myCallback(account, instance);
      });
    },

    getChallenge: function(challengeId){
      App.initCTFManagerInstance(function (account, CTFManagerInstance){
        CTFManagerInstance.getChallenge(challengeId, {from: account}).then(function(challenge){
          // Check which challenges the user has deployed
          if(challenge[0] !== '0x0000000000000000000000000000000000000000'){
            $('#contractAddressLink').text(challenge[0]);
            $('#contractAddressLink').attr("href", 'https://ropsten.etherscan.io/address/' + challenge[0]);
            
            $.getJSON('artifacts/TokenSaleChallenge.json', function(data) {
              // Get the necessary contract artifact file and instantiate it with @truffle/contract
              var TokenSaleChallengeArtifact = data;
              App.contracts.TokenSaleChallenge = TruffleContract(TokenSaleChallengeArtifact);
            
              // Set the provider for our contract
              App.contracts.TokenSaleChallenge.setProvider(App.web3Provider);
            
              // Use our contract to retrieve if the challenge is complete
              App.challengeAddr = challenge[0];
              App.isComplete();
              App.getBalance();
        
            });
          } else {
            console.log('Contract is not deployed');
          }
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    isComplete: function() {

      App.initTokenSaleChallengeInstance(App.challengeAddr, function (account, tokenSaleInstance){
        tokenSaleInstance.isComplete({from: account}).then(function(complete) {
            if (complete){
              $('#isCompleted').text('Challenge is completed!')
            } else {
              $('#isCompleted').text('Challenge is NOT completed!')
            }
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    getBalance: function(){
      App.initTokenSaleChallengeInstance(App.challengeAddr, function (account, tokenSaleInstance){
        tokenSaleInstance.balanceOf(account).then(function(result){
          const balance = result.c[0];
          $('#balance-text').text('My current token balance: ' + balance);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    buy: function(event){

      event.preventDefault();
      var n = parseInt($('#buy-input').val())
      console.log('n = ' + n);
      const tokenValue = n*10**18;


      App.initTokenSaleChallengeInstance(App.challengeAddr, function (account, tokenSaleInstance){
        tokenSaleInstance.buy(n, {from: account, value: tokenValue}).then(function(){
          console.log('tokens buyed: ' + n);
          location.reload();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    sell: function(event){

      event.preventDefault();
      var n = parseInt($('#sell-input').val())
      console.log('n = ' + n);

      App.initTokenSaleChallengeInstance(App.challengeAddr, function (account, tokenSaleInstance){
        tokenSaleInstance.sell(n, {from: account}).then(function(){
          console.log('tokens sold: ' + n);
          location.reload();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    checkSolution: function(event){

      event.preventDefault();
  
      App.initCTFManagerInstance(function (account, CTFManagerInstance){
          CTFManagerInstance.checkChallenge(2, {from: account}).then(function(solved) {
            console.log(solved);
            if(solved === true){
              window.location.replace("index.html");
            }
          });
      });
    }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});