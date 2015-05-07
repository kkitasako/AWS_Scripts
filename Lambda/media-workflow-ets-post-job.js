//----------------------------------------------------------------------------------------
// Media Workflow Elastic Transcoder Post Job by Lambda
//
//----------------------------------------------------------------------------------------

console.log('Loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var dynamo = new aws.DynamoDB({apiVersion: '2012-08-10', region: 'ap-northeast-1'});

exports.handler = function(event, context) {
	console.log('Starting Media-Workflow Elastic Transcoder Post Job.......');
	console.log(JSON.stringify(event, null, '  '));

	// S3 upload bucket infomation
	var s3_upload_bucket_name = 'media-workflow-upload';
	var s3_archive_path = 'archive/';
	// Update Time
	var date = new Date()
	var update_time = date.getFullYear() + '/' + eval(date.getMonth()+1)  + '/' + date.getDate() + ' ' + date.toLocaleTimeString();

	// Parse SNS JSON format messages
	var message = JSON.parse(event.Records[0].Sns.Message);
	// Get Elastic Transcoding Job Status
	var ets_status = message.state;
	// Get Uploaded Contents ID
	var contents_id = message.userMetadata.cid;
	// Get Uploaded File Path
	var ets_input_file = message.input.key;
	console.log('Status: ' + ets_status + '/ CID: ' + contents_id + ' / Input File: ' + ets_input_file );
		
	// create DynamoDB update Params	
	var dynamo_params = {
		TableName: 'media-workflow-contents-tbl',
		Key:{
			cid :{S: contents_id},
		},
		UpdateExpression: 'SET #stat = :ets_stat,  #update = :uptime',
		ExpressionAttributeNames: {'#stat': 'status', '#update': 'last_modified'},
		ExpressionAttributeValues: {':ets_stat': {S: ets_status}, ':uptime':{S: update_time}}
	};
	
	// Execute DynamoDB updateItem
	dynamo.updateItem(dynamo_params, function(error, data){
		if(error) {
			console.log('DynamoDB updateItem Error... ' + error + error.stack);
			context.done(null,' ');
		} else {
			console.log('DynamoDB updateItem Submitted... ' + data);
			context.done(null,' ');
		}		
	})
		
	// Archive Input File if Transcoding is COMPELETED
	if (ets_status == 'COMPLETED') {
		//Copy S3 INPUT File to Archive Path
		var s3_params = {
			Bucket: s3_upload_bucket_name,
			CopySource: s3_upload_bucket_name + '/' + ets_input_file,
			Key: s3_archive_path + ets_input_file + '-' + contents_id,
		};
		
		// Execute S3 Copy
		s3.copyObject(s3_params, function(error, data){
			if(error) {
				console.log('S3 Copy Error.. ' + error + error.stack);
				context.done(null,' ');
			} else {
				console.log('S3 Archive Copy Submitted... ' + data);
				context.done(null,' ');
			}
		})
	}
	
};
