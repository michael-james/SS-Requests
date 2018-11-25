function sendEmail(d) {
  var t0 = new Date();
  var s = getRequestsSummary();
  
 console.log(d);
    
 var t = HtmlService.createTemplateFromFile('email/email-inline');
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

function sendEmailHTML(HTMLOUT, d) {
  var t0 = new Date();
  
  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: 'SS Request Update / ' + d.id + ' / ' + d.status,
    htmlBody: HTMLOUT.setTitle('SS Request Update / ' + d.id + ' / ' + d.status + ' - ' + moment().format(ERTdf)).getContent(),
    name: "SS Requests",
    // replyTo: asstEmail,
    attachments: HTMLOUT.getAs(MimeType.PDF)
  });
  
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return true;
}

function sendDailyUpdatesGeneva() {
  console.log('... pretending to send daily updates for Geneva folks');
  sendTestEmail(arguments.callee.name);
}

function sendDailyUpdatesUS() {
  console.log('... pretending to send daily updates for US folks');
  sendTestEmail(arguments.callee.name);
}

function sendWeeklyUpdatesGeneva() {
  console.log('... pretending to send weekly update to Geneva folks');
  sendTestEmail(arguments.callee.name);
}

function sendWeeklyUpdatesUS() {
  console.log('... pretending to send weekly update US folks');
  sendTestEmail(arguments.callee.name);
}

function sendMonthlyUpdatesGeneva() {
  console.log('... pretending to send monthly update to Geneva folks');
  sendTestEmail(arguments.callee.name);
}

function sendMonthlyUpdatesUS() {
  console.log('... pretending to send monthly update US folks');
  sendTestEmail(arguments.callee.name);
}

function sendTestEmail(func) {
  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: "Sending you a test from " + func + "...",
    htmlBody: "It is " + moment().format(ldtf) + " right now!<br><br>Your friend,<br>" + func,
    name: "SS Requests",
  });
}