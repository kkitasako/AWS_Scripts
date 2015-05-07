//----------------------------------------------------------------------------------------
// Media Workflow Elastic Transcoder Post Job by Lambda
//
//----------------------------------------------------------------------------------------

console.log('Loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var ets = new aws.ElasticTranscoder({apiVersion:'2012-09-25', region: 'ap-northeast-1'});

exports.handler = function(event, context) {
	console.log('Starting Media-Workflow Elastic Transcoder Post Job.......');
	console.log(JSON.stringify(event, null, '  '));
	
	context.done(null,' ');			
};
