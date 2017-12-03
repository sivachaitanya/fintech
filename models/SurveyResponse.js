var mongoose = require('mongoose');
var  Web3 = require('web3');
const gcs = require('@google-cloud/storage')({  
    projectId: 'fast-environs-187008',
    keyFilename: './application_default_credentials.json'
});
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient({
   projectId: 'fast-environs-187008',
    keyFilename: './application_default_credentials.json'
});
const bucket = gcs.bucket('gspeech_api');

const audioConfig = {
    sampleRateHertz: 8000,
    encoding: 'LINEAR16',
    languageCode: 'en-US'
  };

var gfid;
var account;
var accounts;

var web3 = new Web3(new Web3.providers.HttpProvider("http://647513dd.ngrok.io"));



// Define survey response model schema
var SurveyResponseSchema = new mongoose.Schema({
    // phone number of participant
    phone: String,

    // status of the participant's current survey response
    complete: {
        type: Boolean,
        default: false
    },

    // record of answers
    responses: [mongoose.Schema.Types.Mixed]
});

// For the given phone number and survey, advance the survey to the next
// question
SurveyResponseSchema.statics.advanceSurvey = function(args, cb) {
    var surveyData = args.survey;
    var phone = args.phone;
    var input = args.input;
    var surveyResponse;

    // Find current incomplete survey
    SurveyResponse.findOne({
        phone: phone,
        complete: false
    }, function(err, doc) {
        surveyResponse = doc || new SurveyResponse({
            phone: phone
        });
        processInput();
    });

    // fill in any answer to the current question, and determine next question
    // to ask
    function processInput() {
        // If we have input, use it to answer the current question
        var responseLength = surveyResponse.responses.length
        var currentQuestion = surveyData[responseLength];

        // if there's a problem with the input, we can re-ask the same question
        function reask() {
            cb.call(surveyResponse, null, surveyResponse, responseLength);
        }

        // If we have no input, ask the current question again
        if (!input) return reask();

        // Otherwise use the input to answer the current question
        var questionResponse = {};
        if (currentQuestion.type === 'boolean') {
            // Anything other than '1' or 'yes' is a false
            var isTrue = input === '1' || input.toLowerCase() === 'yes';
            questionResponse.answer = isTrue;
        } else if (currentQuestion.type === 'number') {
            // Try and cast to a Number
            var num = Number(input);
            if (isNaN(num)) {
                // don't update the survey response, return the same question
                return reask();
            } else {
                questionResponse.answer = num;
            }
        } else if(currentQuestion.type === 'text') {
            // input is a recording URL
            
            console.log('INPUT var is - '+JSON.stringify(input))
            // save the twilio recording to google bucket here such that it can be extracted by google speech later
             console.log('Before Speech to Text')
             console.log('Args - '+ JSON.stringify(args))

                            // experiment 
                            questionResponse.recordingUrl = input;
                            questionResponse.twilioanswer = input;
                            
                            // questionResponse.gcloudObj = 'gs://gspeech_api/REfbc3e8204b9ec865409e7c740a67a000';
                              // Save type from question
                            //questionResponse.type = currentQuestion.type;

                            if(currentQuestion.text === 'State the amount to transfer ?'){
                                web3.eth.getAccounts(function(err,accs){
                                    if(!err){

                                    
                                  console.log('Fetched accounts from localhost - '+accs)

                                    web3.eth.defaultAccount= accs[0];

                                        web3.eth.sendTransaction({
                                            from: accs[0],
                                            to: accs[1],
                                            value: web3.toWei('1')
                                        }, function(err,data){
                                            console.log('TX HASH - '+data)
                                                questionResponse.TxHash = data;
                                                surveyResponse.responses.push(questionResponse);

                                                // If new responses length is the length of survey, mark as done
                                                if (surveyResponse.responses.length === surveyData.length) {
                                                    surveyResponse.complete = true;
                                                }
                                             console.log('Before Save')
                                                // Save response
                                                surveyResponse.save(function(err) {
                                                    if (err) {
                                                        reask();
                                                    } else {
                                                        cb.call(surveyResponse, err, surveyResponse, responseLength+1);
                                                    }
                                                });
                                        })
                                        
                                    }
                                    else{
                                    console.log('Error getting the accounts from testrpc - '+err)
                                    
                                    }

                                    
                                })
                            } // only for question 3 perform blockchain Tx amd save the data

                            if(currentQuestion.text !== 'State the amount to transfer ?'){
                                    surveyResponse.responses.push(questionResponse);

                                            // If new responses length is the length of survey, mark as done
                                            if (surveyResponse.responses.length === surveyData.length) {
                                                surveyResponse.complete = true;
                                            }

                                            // Save response
                                            surveyResponse.save(function(err) {
                                                if (err) {
                                                    reask();
                                                } else {
                                                    cb.call(surveyResponse, err, surveyResponse, responseLength+1);
                                                }
                                            });
                            } // for other questions just save the data
                            
          } 

       
    }
};

// Export model
delete mongoose.models.SurveyResponse
delete mongoose.modelSchemas.SurveyResponse
var SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);
module.exports = SurveyResponse;
