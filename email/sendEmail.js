var emailEvents = {
  0: 'new request',
  1: 'asst update',
  2: 'TC change',
  3: 'waiting reminder'
}

function sendEmail(d, ev, chg, old, msg) {
  var t0 = new Date();
  var today = new Date();

  var eventID = eventID || null;
  var u = user();
  var isRequestor = ((u.email == d.email));

  // var url = ScriptApp.getService().getUrl();
  // var devEnv = url.slice(-3) == "dev";
  // console.log(devEnv);
  // console.log("we " + (devEnv ? "ARE" : "are NOT") + " in a dev environment");
  var testing = true; //devEnv;
  
  // var queue = HtmlService.createTemplateFromFile('Queue');
  // queue.data = {view: null, email: null, send: true};


  /////////////////////////////////////////////////
  // Determine to, cc, reply to, and title
  /////////////////////////////////////////////////

  // get asst email
  var asstEmail = "";
  var allAssts = 'michael.james@ert.com, affoua.jasnault@ert.com, alexandre.cortez@ert.com';
  var allAsstsArray = ['michael.james@ert.com', 'affoua.jasnault@ert.com', 'alexandre.cortez@ert.com'];
    
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

  // determine who to send to
  var to = "";
  var cc = "";
  var replyTo = "";
  var mainTitle = "SS Request";
  console.log(d.statusCode);
  var otherPerson = allAsstsArray.indexOf(u.email) == -1;
  
  // if MJ is the requestor, just send to MJ (testing)
  // if (d.email == 'michael.james@ert.com') {
  //   to = 'michael.james@ert.com';
  //   cc = "";
  // }

  // if new request, email initiator and cc all Assts
  if (ev == 0) {

      to = d.email;
      cc = allAssts;
      replyTo = allAssts;

      mainTitle = 'New SS Request';

      // if (!testing) {
        d.sh.getRange(d.row, getColNumByName("lastSentTo")).setValue(today);
      // }
  }

  // if current user who initiated email is also the person who made this request
  // and the request is not completed or cancelled
  // and the request is not new
  else if (!(ev == 1 || d.statusCode == "ONH" || d.statusCode == "CPL" || d.statusCode == "CAN") && (otherPerson || isRequestor)) {

    if (asstEmail) {
      to = asstEmail;
      cc = d.email;
    } else {
      to = allAssts;
      cc = d.email;
    }

    replyTo = d.email;

    if (otherPerson) {
      replyTo += ", " + u.email;
      cc += ", " + u.email;
    }

    mainTitle = 'SS Request Changed';
  } 

  // otherwise send to requestor and cc initiator and/or assistant
  else {

    to = d.email;

    if (asstEmail) {
      cc = asstEmail;
      replyTo = asstEmail;
    } else {
      cc = allAssts;
      replyTo = allAssts;
    }

    mainTitle = 'SS Request Update';

    // if (!testing) {
      d.sh.getRange(d.row, getColNumByName("lastSentTo")).setValue(today);
    // }
  }

  var title = mainTitle + ' / ' + d.id + ' / ' + d.status;
  
  // store first date returned if applicable
  var c = d.sh.getRange(d.row, getColNumByName("Date Ret"));
  if (!c.getValue() && (d.statusCode == 'UNR' || d.statusCode == 'PND' || d.statusCode == 'ONH' || d.statusCode == 'CPL')) {
    c.setValue(today);
  }


  var htmlServ = HtmlService.createTemplateFromFile('email/email-inline');
  htmlServ.u = u;
  htmlServ.d = d;
  htmlServ.ev = (typeof ev == 'undefined' ? null : ev);
  htmlServ.chg = (typeof chg == 'undefined' ? null : chg);
  htmlServ.old = (typeof old == 'undefined' ? null : old);
  htmlServ.mainTitle = mainTitle;
  htmlServ.testing = testing;
  htmlServ.mail = {to: to, cc: cc, replyTo: replyTo};
  htmlServ.hello = to == d.email;
  htmlServ.isRequestor = isRequestor;
  htmlServ.msg = msg;
  htmlOut = htmlServ.evaluate();

  if (testing) {
    to = 'michael.james@ert.com';
    cc = 'michael.james@ert.com';
    replyTo = 'michael.james@ert.com';
  }

  // send email
  MailApp.sendEmail({
    to: to,
    cc: cc,
    bcc: 'michael.james@ert.com',
    replyTo: replyTo,
    name: "SS Requests",
    
    subject: title,
    htmlBody: htmlOut.getContent(),
    attachments: htmlOut.setTitle(title + ' - ' + moment().format(ERTdf)).getAs(MimeType.PDF)
    // attachments: [htmlOut.getAs(MimeType.PDF),
                  // queue.evaluate().setTitle('SS Requests Queue as of ' + moment().format(ERTdf)).getAs(MimeType.PDF)]
  });
  console.log({message: Utilities.formatString('EMAIL "%s" sent to %s', title, d.email), subject: title, to: to, cc: cc, replyTo: replyTo, type: "email"});
  
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: arguments.callee.name, row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
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
  
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: arguments.callee.name, row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
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

var zones = {
  0: 'Geneva',
  1: 'US EST'
}

var officeZones = {
  'GNV': 0,
  'PGH': 1,
  'PHL': 1,
  'BOS': 1
}

function sendDailyUpdates(zone) {
  // exclude statuses other than Waiting for Start, Needs Information, Unresolved Issues, Pending Confirmation, or On-hold
  var reqsWaiting = getSortedReqs(null, null, ['Received', 'Reviewed', 'Assigned', 'In-progress', 'Completed', 'Cancelled']);
  var emailsSent = 0;
  var emailsSentTo = "";
  var log = "";
  
  log += "Zone: " + zones[zone] + "\n\n<strong>All Emails We Are Waiting On:</strong>\n";

  var sh = SpreadsheetApp.openById(ssID).getSheetByName("Queue");
  var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
  var rowIdx = getColNumByNameData(headers, "row") - 1;
  var officeIdx = getColNumByNameData(headers, "office") - 1;
  var startIdx = getColNumByNameData(headers, "Expected Date Files Will Be Available") - 1;
  var statusIdx = getColNumByNameData(headers, "Status") - 1;
  var lastSentToIdx = getColNumByNameData(headers, "lastSentTo") - 1;
  var emailIdx = getColNumByNameData(headers, "Email Address") - 1;
  var idIdx = getColNumByNameData(headers, "ID") - 1;

  for (var r = 1; r < reqsWaiting.length; r++) {
    var thisLog = "";

    var timeSinceSentTo = moment().diff(moment(reqsWaiting[r][lastSentToIdx]), 'hours', true);
    var hrsSinceSentTo = 21;
    console.log("last email was sent to ")

    var info = "<u>" + reqsWaiting[r][emailIdx] + "</u> (" + reqsWaiting[r][officeIdx] + ") &mdash; " + reqsWaiting[r][idIdx] + ' / ' + reqsWaiting[r][statusIdx] + ' ' + (timeSinceSentTo ? '/ ' + timeSinceSentTo.toFixed(1) + ' hours ' : ''); 
    thisLog += info;

    if (officeZones[reqsWaiting[r][officeIdx]] == zone && timeSinceSentTo >= 21) {

      if (reqsWaiting[r][statusIdx] == 'Waiting for Start') {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var startDate = new Date(reqsWaiting[r][startIdx]);
        startDate.setHours(0, 0, 0, 0);
        thisLog += " / expected " + (startDate.getMonth() + 1) + "/" + startDate.getDate() + ((startDate.getTime() == today.getTime()) ? " (today)" : "") + "\n"

        if (startDate.getTime() !== today.getTime()) {
          log += thisLog;
          continue;
        }
      } else {
        thisLog += "\n"
      }

      var d = getRequest(reqsWaiting[r][rowIdx]);
      sendEmail(d, 3);

      emailsSent += 1;
      emailsSentTo += info + "\n";
      log += '\n' + thisLog + '<strong>...sent email to <u>' + reqsWaiting[r][7] + '</u> on ' + new Date() + '</strong>\n\n';
    } else {
      log += thisLog + "\n"
    }
  }

  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: 'SS Requests: Daily Updates Sent to ' + zones[zone] + " at " + moment().format(dtf),
    htmlBody: "<div style='white-space: pre-wrap'><strong>Emails Sent:</strong> " + emailsSent + "\n" + emailsSentTo + "\n<strong>Log:</strong>\n" + log + "</div>",
    name: "SS Requests"
  });

  return "<div style='white-space: pre-wrap'><strong>Emails Sent:</strong> " + emailsSent + "\n" + emailsSentTo + "\n<strong>Log:</strong>\n" + log + "</div>"
}

function testSendDailyUpdates() {
  return sendDailyUpdates(1);
}

function sendDailyUpdatesGeneva() {
  sendDailyUpdates(0);
  console.log('...sent daily updates to Geneva folks');
}

function sendDailyUpdatesUS() {
  sendDailyUpdates(1);
  console.log('...sent daily updates to US folks');
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
  var func = func || arguments.callee.name;

  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: "Sending you a test from " + func + "...",
    htmlBody: "It is " + moment().format(ldtf) + " right <a href='<?= url ?>'>now!</a><br><br>Your friend,<br>" + func,
    name: "SS Requests",
    replyTo: "thelivingpc@gmail.com, mj@michaeljames.design"
  });
}

function sendTestEmailConstURL(func) {
  var func = arguments.callee.name;

  // var url = ScriptApp.getService().getUrl();

  // var constURL = "https://script.google.com/a/macros/ert.com/s/AKfycbxhBM6eBwsmO66MT0On_K9MPtupzF_YzWxJGRL4CSqKFNsIEn4/exec";

  MailApp.sendEmail({
    to: 'michael.james@ert.com',
    subject: "Sending you a test from " + func + "...",
    htmlBody: "It is " + moment().format(ldtf) + " right <a href='" + url + "'>now!</a><br><br>url: " + url + "<br>constURL: " + constURL + "<br><br>Your friend,<br>" + func,
    name: "SS Requests",
    replyTo: "thelivingpc@gmail.com, mj@michaeljames.design"
  });
}