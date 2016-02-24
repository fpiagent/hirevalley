var Types = require('hapi').types;
var Boom = require("boom");
var joi = require('joi');
var fs = require('fs');
var pathLib = require('path');
var diff = require('deep-diff').diff;

function ISODate(d) {return d;}

module.exports = [{
    method: 'GET',
    path: '/api/candidate',
    handler: candidatesHandler,
    config: {
        tags: ['api']
    }
}, {
    method: 'GET',
    path: '/api/history/{candidateId}',
    handler: historyHandler,
    config: {
        tags: ['api'],
        validate: { 
				params: {
					candidateId: joi
						.string()
						.required()
						.description('the candidate id (Email)')
						.default('charles.darwin@gmail.com')				
				}

			}
    }
}, {
    method: 'GET',
    path: '/api/resume/{candidateId}',
    handler: resumeHandler,
    config: {
        tags: ['api'],
        validate: { 
				params: {
					candidateId: joi
						.string()
						.required()
						.description('the candidate id (Email)')
						.default('charles.darwin@gmail.com')				
				}

			}        
    }
},
{
    method: 'POST',
    path: '/api/candidate/{candidateId}',
    handler: updateCandidateHandler,
    config: {
        tags: ['api'],
        validate: { 
				params: {
					candidateId: joi
						.string()
						.required()
						.description('the candidate id (Email)')
						.default('charles.darwin@gmail.com')				
				},
				payload: joi.object()
		}        
    }
},
{
    method: 'POST',
    path: '/api/resume/{candidateId}',
    config: {
		tags: ['api'],

        payload: {
            output: 'file'
        },

        handler: function (request, reply) {
            var uploadedFile = request.payload.path;
            console.log("Got a file and params " + request.params );
            if (uploadedFile) {
                var fileUri = "/resume/" + request.params.candidateId + ".doc";
                var resumePath = __dirname + "/.." + fileUri ;

				console.log("Will save to " + resumePath);

				fs.readFile(uploadedFile , function(err, data) {
				    fs.writeFile(resumePath, data, function(err) {
				        fs.unlink(uploadedFile, function(){
				            if(err) throw err;
				            reply({success: true, uri: fileUri});
				        });
				    }); 
				}); 
				
				console.log("File saves to " + resumePath);

            }

        }
    }
}



];


function candidatesHandler(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('candidates').find().toArray(function(err, result) {

        if (err) {
            return reply(Boom.internal('Internal MongoDB error', err));
        } else {

        }
        reply(result);
    });
};

function updateCandidateHandler(request, reply) {
	//console.log(request.payload);
	
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

	db.collection('candidates').findOne({
        _id: request.params.candidateId
    },function(err, result) {
        if (err) {
            return reply(Boom.internal('Internal MongoDB error', err));
        } else {
			var delta = diff(result, request.payload);
			saveHistory(request.params.candidateId,delta,db);
        }
    });
		

	db.collection('candidates').update(
		{ _id: request.params.candidateId },
		request.payload,
		{upsert: true},
		function(err, result) {

        if (err) {
	        console.log(err);
            return reply(Boom.internal('Internal MongoDB error', err));
        } else {
			
        }
		reply('Success');
    	}
	);
	
};

function saveHistory(id,delta,db){
	
	console.log(id + " >> " + delta);
	
	db.collection('histories').update(
		{ _id: id },
			{$push : {
			"entries":{
				"date_update" : new Date(),
				"user" : "fpiagentini",
				"changes" : delta
			}
			
		}},	
		{upsert: true},	
		function(err, result) {

        if (err) {
	        console.log(err);
            return reply(Boom.internal('Internal MongoDB error', err));
        } else {
			console.log("history updated");			
        }

    	}
	);	
}

function resumeHandler(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('resumes').findOne({
        _id: request.params.candidateId
    }, function(err, result) {

        if (err) {
            return reply(Boom.internal('Internal MongoDB error', err));
        } else {

        }
        reply(result);
    });
};

function historyHandler(request, reply) {
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

    db.collection('histories').findOne({
        _id: request.params.candidateId
    }, function(err, result) {

        if (err) {
            return reply(Boom.internal('Internal MongoDB error', err));
        } else {

        }
        reply(result);
    });
};





