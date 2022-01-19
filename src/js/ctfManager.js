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

        // Initialize UI with user info
        App.initInterface();

      });

      return App.bindEvents();
    },
  
    bindEvents: function() {
        $('#register-form').submit(App.createUser);
        $('#challenge1-deploy').click(App.deployLottery);
        $('#challenge1-button').click(function(){window.location.replace("lottery.html")});
    },

    initInterface: function() {
      // Use our contract to retrieve the username
      App.getUsername();
      // Hide all play buttons by default
      $('.play-buttons').hide();
      // Check wether the user challenges are completed or not and show play buttons accordingly
      for (let i = 1; i <= 4; i++) {
        App.getChallenge(i);
      }
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

    initLotteryChallengeInstance: function(myCallback){

      web3.eth.getAccounts(async function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          var instance = await App.contracts.LotteryChallenge.deployed().then(async function(instance) {
            return instance;
        });
        myCallback(account, instance);
      });

    },

    createUser: function(event) {

        event.preventDefault();
        var username = $('#username-input').val()
    
        App.initCTFManagerInstance(function (account, CTFManagerInstance){
            CTFManagerInstance.createUser(username, {from: account}).then(function(result) {
              location.reload();
            }).catch(function(err) {
              console.log(err.message);
            });
        });
      },

    getUsername: function() {

      App.initCTFManagerInstance(function (account, CTFManagerInstance){
        CTFManagerInstance.getUsername({from: account}).then(function(username) {
          $('#username').text(username)
        }).catch(function(err) {
            console.log(err.message);
        });
      });
    },

    getChallenge: function(challengeId){
      
      App.initCTFManagerInstance(function (account, CTFManagerInstance){
        CTFManagerInstance.getChallenge(challengeId, {from: account}).then(function(challenge){
          // Check which challenges the user has deployed
          if(challenge[0] !== '0x0000000000000000000000000000000000000000'){
            switch(challengeId){
              case 1: 
                $('#challenge1-play').show();
                $('#challenge1-deploy').hide();
                // Mark the challenge when completed
                if (challenge[1] === true) { $('#challenge1-status').text('COMPLETED!!!') };
                break;
              case 2:
                $('#challenge2-play').show();
                $('#challenge2-deploy').hide();
                // Mark the challenge when completed
                if (challenge[1] === true) { $('#challenge2-status').text('COMPLETED!!!') };
                break;
              case 3:
                $('#challenge3-play').show();
                $('#challenge3-deploy').hide();
                // Mark the challenge when completed
                if (challenge[1] === true) { $('#challenge3-status').text('COMPLETED!!!') };
                break;
              case 4:
                $('#challenge4-play').show();
                $('#challenge4-deploy').hide();
                // Mark the challenge when completed
                if (challenge[1] === true) { $('#challenge4-status').text('COMPLETED!!!') };
                break;
            }
          }
        }).catch(function(err) {
            console.log(err.message);
        });
      });
    },

    addChallenge: function(challengeId, challengeAddr){

      App.initCTFManagerInstance(function (account, CTFManagerInstance){
          CTFManagerInstance.addChallenge(challengeId, challengeAddr, {from: account}).then(function() {
            console.log('challenge ' + challengeId + ' deployed at: ' + challengeAddr);
            location.reload();
        }).catch(function(err) {
            console.log(err.message);
        });
      });
    },

    deployLottery: function(){
      $.getJSON('LotteryChallenge.json', function(data) {

        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var LotteryChallengeArtifact = data;
        App.contracts.LotteryChallenge = TruffleContract(LotteryChallengeArtifact);

        // Set the provider for our contract
        App.contracts.LotteryChallenge.setProvider(App.web3Provider);

        App.initLotteryChallengeInstance(function (account, LotteryChallengeInstance){
            // Generate new contract in the provider network.
            App.contracts.LotteryChallenge.new({from: account, value: "1000000000000000000"}).then((newContract) => {
              App.addChallenge(1, newContract.address);
            });
        });
      });
    }
};

$(function() {
    $(window).load(function() {
      App.init();
    });
  });