function sendEmail(d, ev, chg, old) {
  var t0 = new Date();

  var eventID = eventID || null;
  var u = user();
  var isRequestor = (u.email == d.email);
  // var queue = HtmlService.createTemplateFromFile('Queue');
  // queue.data = {view: null, email: null, send: true};

  var htmlServ = HtmlService.createTemplateFromFile('email/email-inline');
  htmlServ.d = d;
  htmlServ.ev = ev || null;
  htmlServ.chg = chg || null;
  htmlServ.old = old || null;
  htmlOut = htmlServ.evaluate();

  // determine who to cc
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
  }

  if (d.email == 'michael.james@ert.com') { // for testing purposes, if requestor is MJ, only send to MJ
    asstEmail = 'michael.james@ert.com';
  }

  // determine who to send to
  var to;

  if (d.email == 'michael.james@ert.com') {
    to = 'michael.james@ert.com';
  } else if (isRequestor) {
    if (asstEmail) {
      to = asstEmail;
    } else {
      to = 'michael.james@ert.com, affoua.jasnault@ert.com, alexandre.cortez@ert.com';
    }
  } else {
    to = d.email;
  }

  var cc;
  if (d.email == 'michael.james@ert.com') {
    cc = "";
  } else if (asstEmail) {
    cc = asstEmail;
  }

  // set email subject and PDF title
  var title;
  if (ev == 0) {
    title = 'New SS Request';
  } else if (isRequestor) {
    title = 'SS Request Changed'
  } else {
    title = 'SS Request Update';
  }
  title += ' / ' + d.id + ' / ' + d.status;
  
  // store first date returned if applicable
  var today = new Date();
  var c = d.sh.getRange(d.row, getColNumByName(d.sh, "Date Ret"));
  if (!c.getValue() && (d.statusCode == 'UNR' || d.statusCode == 'PND' || d.statusCode == 'ONH' || d.statusCode == 'CPL')) {
    c.setValue(today);
  } 

  // send email
  MailApp.sendEmail({
    to: to,
    cc: cc,
    bcc: 'michael.james@ert.com',
    replyTo: "",//(isRequestor ? d.email : asstEmail),
    name: "SS Requests",
    
    subject: title,
    htmlBody: htmlOut.getContent(),
    attachments: htmlOut.setTitle(title + ' - ' + moment().format(ERTdf)).getAs(MimeType.PDF)
    // attachments: [htmlOut.getAs(MimeType.PDF),
                  // queue.evaluate().setTitle('SS Requests Queue as of ' + moment().format(ERTdf)).getAs(MimeType.PDF)]
  });
  console.log({message: Utilities.formatString('email "%s" sent to %s', title, d.email), subject: title, to: d.email, type: "email"});
  
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return d
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

function sendEmailUpdate(row) {
  var d = getRequest(row);
  if (sendEmail(d, 1)) {
    return d.requestor  
  } else {
    throw "Email not sent."
  }
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