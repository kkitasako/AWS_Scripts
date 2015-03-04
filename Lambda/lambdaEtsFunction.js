console.log('Loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var ets = new aws.ElasticTranscoder({apiVersion:'2012-09-25', region: 'us-east-1'});

exports.handler = function(event, context) {
	console.log('Received event:');
	console.log(JSON.stringify(event, null, '  '));
	var bucket = event.Records[0].s3.bucket.name;
	var key = event.Records[0].s3.object.key;
	var pipelineId = 'XXXXXXXXXXXXXXXX';
	var presetId = 'XXXXXXXXXX-XXXXXXX';
	var ext = '.mp4';
	var filename = key.substring(key.lastIndexOf('/')+1, key.length).split('.')[0];
	console.log('Filename:' + filename);
	
	console.log('Starting ETS Job:' + key);
	ets.createJob({
		 PipelineId : pipelineId,
		 OutputKeyPrefix: 'output/',
		 Input: {
			 Key: key,
			 FrameRate: 'auto',
			 Resolution: 'auto',
			 AspectRatio: 'auto',
			  Interlaced: 'auto',
			 Container: 'auto',
		 },
		 Output: {
			 Key: filename + '.mp4',
			 PresetId: presetId,
			 Rotate: 'auto'
		 }
	 }, function(error, data) {
		 if (error) {
			 console.log('ETS Transcoding Job Error.' + error + erro.stack);
			 context.done(null,' ');
		 } else {
			 console.log('ETS Transcoding Job Submitted' + data);
			 context.done(null,' ');
		 }
	 });
	 
};
