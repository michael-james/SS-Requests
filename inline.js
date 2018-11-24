const inlineCss = require('inline-css');
const fs = require('fs');

// var fileToRead = 'email/email.html';
var fileToRead = 'emailtest.html';
// var fileToRead = 'ReqUpdate.html';

var fileToWrite = "email/email-inline.html";

fs.readFile(fileToRead, 'utf8', (err, data) => {
  	if (err) throw err;

  	inlineCss(data, {url: ' '}).then(function(html) {
		fs.writeFile(fileToWrite, html, function(err) {
		    if(err) throw err;

		    console.log("The file " + fileToRead + ' was inlined and saved to ' + fileToWrite + "!");
		}); 
	});
});