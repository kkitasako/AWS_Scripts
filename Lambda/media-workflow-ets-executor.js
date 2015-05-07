//----------------------------------------------------------------------------------------
// Media Workflow Elastic Transcoder Executor by Lambda
//
//----------------------------------------------------------------------------------------

console.log('Loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var ets = new aws.ElasticTranscoder({apiVersion:'2012-09-25', region: 'ap-northeast-1'});
var dynamo = new aws.DynamoDB({apiVersion: '2012-08-10', region: 'ap-northeast-1'});

// Lambda Function Handler
exports.handler = function(event, context) {
	console.log('Starting Media-Workflow Elastic Transcoder Executor Event.......');
	console.log(JSON.stringify(event, null, '  '));
	
	// Media-Workflow ETS Pipeline ID
	var pipelineId= '1430389745074-iavo69'; 
	// Transcode Preset Map
	var preset_map = {hls:'1430400493292-6ie7ib', hlsAES:'1430400493292-6ie7ib', mp4: '1430400578156-laf7zb'};
	
	// Get S3 Bucket Name
	var bucket = event.Records[0].s3.bucket.name;
	// Get S3 Object Name
	var input_key = event.Records[0].s3.object.key;
	// Split Upload Object Path
	var transcode_type = input_key.split('/')[0];
	var input_filename = input_key.substring(input_key.lastIndexOf('/')+1, input_key.length).split('.')[0];
	console.log('Transcode Type: ' + transcode_type);
	// Create Time
	var date = new Date()
	var create_time = date.getFullYear() + '/' + eval(date.getMonth()+1)  + '/' + date.getDate() + ' ' + date.toLocaleTimeString();
	// Create Output File Name from Unix Time
	var output_filename = (Math.floor( new Date().getTime() / 1000 )).toString();
	console.log('Input Filename: ' + input_filename + ' / Output Filename:  ' +output_filename);
	// Output Folder as Output File Name
	output_keyprefix = output_filename + "/";
	// HLS Segment Duration
	segment_duration = 10;
	
	// Define Transcoding Preset Type and set Preset ID
	var presetId=preset_map[transcode_type]
	console.log('Preset ID: ' +presetId);
	
	// Elastic Transcoder Prams
	var ets_params ='';
	var contents_url = 'http://mediacdn.aws-jp.com/';
	var img_url = contents_url;
	
	// Contents Type (Normal / Secure)
	var contents_type = '';
	
	// Decide Transcode type to create elastic transcoder  parameter
	switch (transcode_type) {
		// HLS Format
		case 'hls':
			console.log ('Configure Elastic Transcoding with HLS format: ' + input_key );
			ets_params = {
				PipelineId: pipelineId,
				OutputKeyPrefix: 'hls/' + output_filename +'/',
				Input:{
					Key: input_key,
					AspectRatio: 'auto',
					Container: 'auto',
					Interlaced: 'auto',
					FrameRate: 'auto',
					Resolution: 'auto'
				},
				Output: {
					Key: output_filename.toString(),
					PresetId: presetId,
    				ThumbnailPattern: output_filename +'-img-{count}',
					Rotate: 'auto',
					SegmentDuration: segment_duration.toString()
				},
				Playlists:[
					{
						Format: 'HLSv3',
						Name: output_filename + '_main',
						OutputKeys: [output_filename]
					}
				],
				UserMetadata: {
					cid: output_filename
				}
			};
			// Set contents & img access URL
			contents_url = contents_url + 'hls/' + output_filename + '/' + output_filename  + '_main.m3u8';
			img_url = img_url + 'hls/' + output_filename + '/' + output_filename  + '-img-00002.png';
			contents_type = 'NORMAL';
			break;
		// HLS with AES Encryption Format
		case 'hlsAES' :
			console.log ('Configure Elastic Transcoding with HLS AES format: ' + input_key );
			ets_params = {
				PipelineId: pipelineId,
				OutputKeyPrefix: 'hlsAES/' + output_filename +'/',
				Input:{
					Key: input_key,
					AspectRatio: 'auto',
					Container: 'auto',
					Interlaced: 'auto',
					FrameRate: 'auto',
					Resolution: 'auto'
				},
				Output: {
					Key: output_filename,
					PresetId: presetId,
    				ThumbnailPattern: output_filename +'-img-{count}',
					Rotate: 'auto',
					SegmentDuration: segment_duration.toString()
				},
				Playlists:[
					{
						Format: 'HLSv3',
						Name: output_filename.toString() + '_main',
						OutputKeys: [output_filename],
						HlsContentProtection: {
							KeyStoragePolicy: 'WithVariantPlaylists',
							Method: 'aes-128'
						}
					}
				],
				UserMetadata: {
					cid: output_filename
				}
			};
			// Set contents & image access URL
			contents_url = contents_url + 'hlsAES/' + output_filename + '/' + output_filename  +  '_main.m3u8';
			img_url = img_url + 'hlsAES/' + output_filename + '/' + output_filename  + '-img-00002.png';
			contents_type = 'SECURE';
			break;
		// MP4 format
		case 'mp4':
			console.log ('Configure Elastic Transcoding with MP4 format: ' + input_key );
			ets_params = {
				PipelineId: pipelineId,
				OutputKeyPrefix: 'mp4/' + output_filename +'/',
				Input:{
					Key: input_key,
					AspectRatio: 'auto',
					Container: 'auto',
					Interlaced: 'auto',
					FrameRate: 'auto',
					Resolution: 'auto'
				},
				Output: {
					Key: output_filename + '.mp4',
					PresetId: presetId,
    				ThumbnailPattern: output_filename +'-img-{count}',
					Rotate: 'auto'
				},
				UserMetadata: {
					cid: output_filename
				}
			};
			// Set contents & image access URL
			contents_url = contents_url + 'mp4/' + output_filename +  '/' + output_filename  + '.mp4';
			img_url = img_url + 'mp4/' + output_filename + '/' + output_filename  + '-img-00002.png';
			contents_type = 'NORMAL';
			break;
		// Other or Unknown
		default:
			console.log('Terminating Job for Archive or unknown preset type......');
			context.done(null,' ');
			return;
	}
	// Executing Elastic Transcode Job
	console.log('Starting Elastic Transcoding Job......');
	ets.createJob(ets_params, function(error,data){
		if(error) {
			console.log('Elastic Transcoding Job Error... ' + error + error.stack);
			context.done(null,' ');
		} else {
			console.log('Elastic Transcoding Job Submitted... ' + data);
			context.done(null,' ');
		}
	});
	
	// create DynamoDB put Params
	var dynamo_params = {
		Item:{
			cid: {S: output_filename},
			contents_url: {S: contents_url},
			image_url: {S: img_url},
			status: {S: 'TRANSCODING'},
			type: {S: contents_type},
			last_modified: {S: create_time}
		},
		TableName: 'media-workflow-contents-tbl'
	};
	
	// Execute DynamoDB putItem
	console.log('Executing DynamoDB putItem......');
	dynamo.putItem(dynamo_params, function(error, data) {
		if(error) {
			console.log('DynamoDB putItem Error... ' + error + error.stack);
			context.done(null,' ');
		} else {
			console.log('DynamoDB putItem Submitted... ' + data);
			context.done(null,' ');
		}		
	});
	
};
