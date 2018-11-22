function sendSummaryAlert(d) {
  alertMsg = "Are you sure you want to send an email to " + d.requestor + " about the following request?\n\n" +
    d.status + "\n" +
    d.client + " " + d.protocol + (d.batch && (' Batch ' + d.batch)) + " - " + d.reqCode + "\n" +
    "Due: " + d.hardDue;
  
  if (!showAlert(alertMsg)) {
    return;
  } else {
    sendSummary(d);
  }
}

function sendSummary(d) {
  try {
    rec('',arguments.callee.name,d.row);
    //Logger.log(d.row);
    var t = HtmlService.createTemplateFromFile('ReqUpdateInline');
    t.d = d;
    var data = {row: d.row};
    t.data = data;
    
    var title = 'SS Request Update - ' + d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode + " - " + moment().format(ERTdf).toUpperCase();
    var doc = makeSummaryDoc(d, title);
    
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
    
    MailApp.sendEmail({
      name: "SS Requests",
      to: "michael.james@ert.com", //d.email,
      cc: asstEmail,
      subject: title,
      htmlBody: t.evaluate().getContent(),
      replyTo: asstEmail,
      attachments: doc.getAs(MimeType.PDF)
    });
      
    d.ss.toast(d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode, 'Request Update Sent');
    
    var today = new Date();
    var c = d.sh.getRange(d.row, getColNumByName(d.sh, "Date Ret"));
    if (!c.getValue() && (d.status == 'Unresolved Issues' || d.status == 'Pending Confirmation' || d.status == 'On-hold' || d.status == 'Completed')) {c.setValue(today);} 
    
    return d.requestor + " (" + d.email + ")";
  } catch (e) {
    throw Utilities.formatString("Update not sent to %s (%s: %s)", d.email, e.name, e.message);
  }
}

function sendSelectedSummary() {
  getSelectedRows().forEach(sendSummaryByRow);
  
  function sendSummaryByRow(value) {
      var d = getRequest(value, false);
      sendSummaryAlert(d);
  }
}

function sendSummaryRow(row) {
  return sendSummary(getRequest(row));
}