function sendEmail(d, ev) {
  var eventID = eventID || null;
  var t0 = new Date();
  // var queue = HtmlService.createTemplateFromFile('Queue');
  // queue.data = {view: null, email: null, send: true};

  var htmlServ = HtmlService.createTemplateFromFile('email/email-inline');
  htmlServ.d = d;
  htmlServ.ev = ev;
  htmlOut = htmlServ.evaluate();

  var asstEmail = "";
    
  switch (d.asst) {
    case "Michael":
      asstEmail = "michael.james@ert.com";
      break;
    case "Alex":
      asstEmail = "alexandre.cortez@ert.com";
      break;
    case "Affoua":
      asstEmail = "affoua.jasnault@ert.com";
      break;
    case "Carla":
      asstEmail = "carla.heuer@ert.com";
      break;
    default:
      asstEmail = "michael.james@ert.com";
  }

  if (d.email == 'michael.james@ert.com') { // for testing purposes, if requestor is MJ, only send to MJ
    asstEmail = 'michael.james@ert.com';
  }

  var title = (ev == 0 ? 'New SS Request / ' : 'SS Request Update / ') + d.id + ' / ' + d.status;
  
  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    cc: ((ev == 0 && user().email !== 'michael.james@ert.com') ? 'michael.james@ert.com, affoua.jasnault@ert.com, alexandre.cortez@ert.com' : asstEmail),
    bcc: 'michael.james@ert.com',
    replyTo: asstEmail,
    name: "SS Requests",
    
    subject: title,
    htmlBody: htmlOut.getContent(),
    attachments: htmlOut.setTitle(title + ' - ' + moment().format(ERTdf)).getAs(MimeType.PDF)
    // attachments: [htmlOut.getAs(MimeType.PDF),
                  // queue.evaluate().setTitle('SS Requests Queue as of ' + moment().format(ERTdf)).getAs(MimeType.PDF)]
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
  // var queue = HtmlService.createTemplateFromFile('Queue');
  // queue.data = {view: null, email: null, send: true};
  
  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    bcc: 'michael.james@ert.com',
    subject: 'SS Request Update / ' + d.id + ' / ' + d.status,
    htmlBody: HTMLOUT.setTitle('SS Request Update / ' + d.id + ' / ' + d.status + ' - ' + moment().format(ERTdf)).getContent(),
    name: "SS Requests",
    // replyTo: asstEmail,
    attachments: HTMLOUT.getAs(MimeType.PDF)
    // attachments: [HTMLOUT.getAs(MimeType.PDF),
                  // queue.evaluate().setTitle('SS Requests Queue as of ' + moment().format(ERTdf)).getAs(MimeType.PDF)]
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