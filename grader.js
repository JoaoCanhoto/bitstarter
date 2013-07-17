#!/usr/bin/env node
/*
   Automatically grade files for the presence of specified HTML tags/attributes.
   Uses commander.js and cheerio. Teaches command line application development
   and basic DOM parsing.

References:

+ cheerio
- https://github.com/MatthewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+ commander.js
- https://github.com/visionmedia/commander.js
- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ JSON
- http://en.wikipedia.org/wiki/JSON
- https://developer.mozilla.org/en-US/docs/JSON
- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var HTMLURL_DEFAULT = "https://spark-public.s3.amazonaws.com/startup/code/bitstarter.html";


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};
var assertURLExists = function(infile) {
//    rest.get(infile).on('complete',  function(result){
    rest.get(infile).on('success',  function(result){
	    if ( result instanceof Error) {
	    console.log('Error: ' + result.message);
	    process.exit(0); 
	    return;
	    } 
	    });
    return infile.toString(); 
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};
var checkHtmlUrl = function(url , checksfile) {
    //    rest.get('http://stark-inlet-4919.herokuapp.com').on('complete', function(data){
    var outt = rest.get(url).on('complete', function(data) {
	    $ = cheerio.load(data);
	    var checks = loadChecks(checksfile).sort();
	    var out = {};
	    for(var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	    }
	    //console.log("ccc"+ out );
	    return out;
	    });
            console.log(outt);
    return outt;
};

var checkUrl = function(url, checksfile) {
    //rest.get('./index.html').on('complete', function(data) {
    rest.get(url).on('complete', function(data) {
            if ( data  instanceof Error) {
            console.log('Error: ' + data.message);
            process.exit(0);
            return;
            }
        $ = cheerio.load(data);
        var checks = loadChecks(checksfile).sort();
        var out = {};
        for(var ii in checks) {
            var present = $(checks[ii]).length > 0;
            out[checks[ii]] = present;
        }
        var outJson = JSON.stringify(out, null, 4);
        console.log(outJson);
    });
}
var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Path to url' )
//	.option('-u, --url <url>', 'Path to url',  clone(assertURLExists), HTMLURL_DEFAULT )
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.parse(process.argv);

    if ( program.file !="" &&0){
	console.log("aaa1111" + program.file +HTMLFILE_DEFAULT );
	if( program.url){
	    console.log("Error: canot use file and url at same time.");
	    return;
	}
    }

    if(program.url){
checkUrl(program.url, program.checks);
} else {
        var checkJson = checkHtmlFile(program.file, program.checks);
var outJson = JSON.stringify(checkJson, null, 4);
console.log(outJson);
}
/*        var checkJson = checkHtmlUrl(program.url , program.checks);
console.log("checkJson: " + checkJson);
var outJson = JSON.stringify(checkJson, null, 4);
console.log(outJson);*/
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
