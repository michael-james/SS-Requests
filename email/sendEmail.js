function sendEmail(d) {
  var t0 = new Date();
    
  // var t = HtmlService.createTemplateFromFile("emailtest");
  // var data = null;
  // t.data = data;
  // t.d = d;
    
  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: 'Hi',
    // htmlBody: t.evaluate().getContent(),
    htmlBody: 'Hi',
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