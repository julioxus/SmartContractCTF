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
        App.contracts.CTFManager = TruffleContract(CTFManagerArtifact, '0xB5fD08E05DB07D31b836252B29aD004Cd4e98d37');
      
        // Set the provider for our contract
        App.contracts.CTFManager.setProvider(App.web3Provider);
      
        // Initialize Hidden Buttons
        App.initInterface();

        // Use our contract to retrieve the username
        App.getUsername();

        // Check wether the user challenges are completed or not
        for (let i = 1; i <= 4; i++) {
          App.getChallenge(i);
        }

      });
  
      return App.bindEvents();
    },
  
    bindEvents: function() {
        $('#register-form').submit(App.createUser);
        $('#challenge1-deploy').click(App.deployLottery);
        $('#challenge1-button').click(function(){window.location.replace("lottery.html")});
    },

    initInterface: function() {
      $('.play-buttons').hide();
    },

    createUser: function(event) {

        event.preventDefault();
    
        var username = $('#username-input').val()
    
        var CTFManagerInstance;
    
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
    
          var account = accounts[0];
    
          App.contracts.CTFManager.deployed().then(function(instance) {
            CTFManagerInstance = instance;
    
            // Execute as a transaction by sending account
            return CTFManagerInstance.createUser(username, {from: account});
          }).then(function(result) {
            console.log(result);
            location.reload();
          }).catch(function(err) {
            console.log(err.message);
          });
        });
      },

    getUsername: function() {
        var CTFManagerInstance;

        App.contracts.CTFManager.deployed().then(function(instance) {
            CTFManagerInstance = instance;

        return CTFManagerInstance.getUsername();
        }).then(function(username) {
            $('#username').text(username)
        }).catch(function(err) {
        console.log(err.message);
        });
    },

    getChallenge: function(challengeId){
      var CTFManagerInstance;

        App.contracts.CTFManager.deployed().then(function(instance) {
            CTFManagerInstance = instance;
      
      return CTFManagerInstance.getChallenge(challengeId)
      }).then(function(challenge){

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
    },

    addChallenge: function(challengeId, challengeAddr, account){
      var CTFManagerInstance;

      App.contracts.CTFManager.deployed().then(function(instance) {
          CTFManagerInstance = instance;

      return CTFManagerInstance.addChallenge(challengeId, challengeAddr, {from: account});
      }).then(function() {
          console.log('challenge ' + challengeId + ' deployed at: ' + challengeAddr);
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    deployLottery: function(){
      $.getJSON('LotteryChallenge.json', function(data) {

        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var LotteryChallengeArtifact = data;
        App.contracts.LotteryChallenge = TruffleContract(LotteryChallengeArtifact);

        // Set the provider for our contract
        App.contracts.LotteryChallenge.setProvider(App.web3Provider);

        // Get user accounts
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
              console.log(error);
            }
      
            var account = accounts[0];

            // Generate new contract in the provider network.
            App.contracts.LotteryChallenge.new({from: account, value: "1000000000000000000"}).then((newContract) => {
              App.addChallenge(1, newContract.address, account);
              location.reload();
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