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
      $.getJSON('artifacts/CTFManager.json', function(data) {
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

        // Challenge 1 deploy
        $('#challenge1-deploy').click(App.deployLottery);
        $('#challenge1-button').click(function(){window.location.href = "./lottery.html"});

        // Challenge 2 deploy
        $('#challenge2-deploy').click(App.deployTokenSale);
        $('#challenge2-button').click(function(){window.location.href = "./token-sale.html"});

        // Challenge 3 deploy
        $('#challenge3-deploy').click(App.deployRetirementFund);
        $('#challenge3-button').click(function(){window.location.href = "./retirement-fund.html"});

        // Challenge 4 deploy
        $('#challenge4-deploy').click(App.deployAccountTakeover);
        $('#challenge4-button').click(function(){window.location.href = "./account-takeover.html"});
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
          if(username){
            $('#username').text('Welcome back, ' + username + '!');
          }
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
            // Show play button instead of deploy if the challenge is deployed
            $('#challenge'+challengeId+'-play').show();
            $('#challenge'+challengeId+'-deploy').hide();
            
            // Mark the challenge when completed
            if (challenge[1] === true) { $('#challenge'+challengeId+'-status').text('COMPLETED!!!') };
          }
        }).catch(function(err) {
            console.log(err.message);
        });
      });
    },

    deployChallenge: function(challengeId){

      App.initCTFManagerInstance(function (account, CTFManagerInstance){
        if(challengeId < 4){
          CTFManagerInstance.deployChallenge(challengeId, {from: account, value:'1000000000000000000'}).then(function() {
            location.reload();
        }).catch(function(err) {
            console.log(err.message);
        });
        } else {
          CTFManagerInstance.deployChallenge(challengeId, {from: account}).then(function() {
            location.reload();
          }).catch(function(err){
            console.log(err.message);
          });
        }
      });
    },

    deployLottery: function(){
      App.deployChallenge(1);
    },

    deployTokenSale: function(){
      App.deployChallenge(2);
    },

    deployRetirementFund: function(){
      App.deployChallenge(3);
    },

    deployAccountTakeover: function(){
      App.deployChallenge(4);
    }
};

$(function() {
    $(window).load(function() {
      App.init();
    });
  });