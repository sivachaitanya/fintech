var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://647513dd.ngrok.io"));
 var obj = []

// Grab all the latest survey data for display in a quick and dirty UI
module.exports = function(request, response) {
    SurveyResponse.find({
        complete: true
    }).limit(100).exec(function(err, docs) {
        if (err) {
            response.status(500).send(err);
        } else {
            // get the balances of first 2 ethereum accounts
            web3.eth.getAccounts(function(err,accs){
                if(err){
                    console.log('Error fetching accounts in the results page'+err)
                }
                if(!err){
                   
                    for(var i=0;i<2;i++){
                        web3.eth.getBalance(accs[i],function(err,data){
                            if(err)
                                console.log('Error getting balances at results'+err)
                            if(!err){
                                console.log('Fetched accounts - '+accs)
                                console.log('Balance of current account - '+data.toNumber())
                              obj[accs[i]] = web3.fromWei(data.toNumber(),"ether")
                              
                                console.log('handle executed')
                                
                            }
                        })
                        
                      
                    }
                   
                }
            })
              response.send({
                                        survey: survey,
                                        results: docs
                                    });         
           
        }
    });
};