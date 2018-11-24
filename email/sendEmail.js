function sendEmail(d) {
  var t0 = new Date();
  var s = getRequestsSummary();
  
 Logger.log(d);
    
 var t = HtmlService.createTemplateFromFile('NewRequest');
  t.d = d;
  t.s = s;
// var data = null;
// t.data = data;
 var html = t.evaluate().getContent();
// console.log(html);
    
  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: 'Hi',
    htmlBody: html,
    //htmlBody: 'Hi',
    name: "SS Requests"
  });
  
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return true;
}

function testRun() {
  console.log('hi michael...!');
}

function testSendEmail() {
  console.log(sendEmail(getRequest(80)));
}