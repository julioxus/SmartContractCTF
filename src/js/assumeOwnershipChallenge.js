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
        App.web3Provider = new Web3.providers.HttpProvider('http://ganache:7545');   
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
        App.getChallenge(4);

      });

      return App.bindEvents();
    },
  
    bindEvents: function() {
      $('#authenticate-button').click(App.authenticate);
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

    initAssumeOwnershipChallengeInstance: function(address, myCallback){

      web3.eth.getAccounts(async function(error, accounts) {
          if (error) {
            console.log(error);
          }
          var account = accounts[0];
          var instance = await App.contracts.AssumeOwnershipChallenge.at(address).then(async function(instance) {
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
            $('#contractAddressLink').attr("href", 'https://ethereum-web:4001/address/' + challenge[0]);
            
            $.getJSON('artifacts/AssumeOwnershipChallenge.json', function(data) {
              // Get the necessary contract artifact file and instantiate it with @truffle/contract
              var AssumeOwnershipChallengeArtifact = data;
              App.contracts.AssumeOwnershipChallenge = TruffleContract(AssumeOwnershipChallengeArtifact);
            
              // Set the provider for our contract
              App.contracts.AssumeOwnershipChallenge.setProvider(App.web3Provider);
            
              // Save challenge address
              App.challengeAddr = challenge[0];

              // Check if the challenge is complete
              const complete = challenge[1];
              if (complete){
                CTFManagerInstance.solveChallenge.call(challengeId, {from: account}).then(function(flag){
                  var obj = $('#isCompleted').text('Challenge is completed!\n FLAG{'+flag+'}');
                  obj.html(obj.html().replace(/\n/g,'<br/>'));
                });
              } else {
                $('#isCompleted').text('Challenge is NOT completed!');
              }
        
            });
          } else {
            console.log('Contract is not deployed');
          }
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    authenticate: function(event){

      event.preventDefault();

      App.initAssumeOwnershipChallengeInstance(App.challengeAddr, function (account, assumeOwnershipInstance){
        assumeOwnershipInstance.authenticate({from: account}).then(function(){
          console.log('Acces Granted');
          location.reload();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    checkSolution: function(event){

      event.preventDefault();
  
      App.initCTFManagerInstance(function (account, CTFManagerInstance){
        CTFManagerInstance.solveChallenge(4, {from: account}).then(function() {
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