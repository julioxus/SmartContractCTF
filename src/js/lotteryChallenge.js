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

    $.getJSON('CTFManager.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var CTFManagerArtifact = data;
      App.contracts.CTFManager = TruffleContract(CTFManagerArtifact);

      // Set the provider for our contract
      App.contracts.CTFManager.setProvider(App.web3Provider);

      // Use our contract to retrieve the Challenge status
      App.getChallenge(1);

    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $('#guess-form').submit(App.guess);
  },

  getChallenge: function(challengeId){
    var CTFManagerInstance;

      App.contracts.CTFManager.deployed().then( function(instance) {
          CTFManagerInstance = instance;
    
    return CTFManagerInstance.getChallenge(challengeId)
    }).then(function(challenge){

      // Check which challenges the user has deployed
      if(challenge[0] !== '0x0000000000000000000000000000000000000000'){
        $('#contractAddressLink').text(challenge[0]);
        $('#contractAddressLink').attr("href", 'https://ropsten.etherscan.io/address/' + challenge[0]);
        
        $.getJSON('LotteryChallenge.json', function(data) {
          // Get the necessary contract artifact file and instantiate it with @truffle/contract
          var LotteryChallengeArtifact = data;
          App.contracts.LotteryChallenge = TruffleContract(LotteryChallengeArtifact, challenge[0]);
        
          // Set the provider for our contract
          App.contracts.LotteryChallenge.setProvider(App.web3Provider);
        
          // Use our contract to retrieve if the challenge is complete
          App.isComplete();
    
        });


      } else {
        console.log('Contract is not deployed');
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  isComplete: function() {

    var lotteryInstance;

    App.contracts.LotteryChallenge.deployed().then(function(instance) {
      lotteryInstance = instance;

      return lotteryInstance.isComplete.call();
    }).then(function(complete) {
        if (complete){
          $('#isCompleted').text('Challenge is completed!')
        } else {
          $('#isCompleted').text('Challenge is NOT completed!')
        }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  guess: function(event) {
    event.preventDefault();

    var n = parseInt($('#guess-input').val())

    console.log('n = ' + n);

    var lotteryInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.LotteryChallenge.deployed().then(function(instance) {
        lotteryInstance = instance;

        // Execute as a transaction by sending account
        return lotteryInstance.guess(n, {value: "1000000000000000000", from: account});
      }).then(function(result) {
        console.log('number introduced: ' + n);
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
