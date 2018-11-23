function newRequest(e) {
  var row = e.range.getRow();
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue")
  var id = sh.getRange(row, getColNumByName(sh, "ID")).getValue();
  var d = getRequest(row, !id);
  sendNewRequest(d);
  updateEvent(d);
  //Utilities.sleep(1200);
  //sortRequestsTime();
}

function sendNewRequest(d) {
  var t0 = new Date();
  var s = getRequestsSummary();
    
  var t = HtmlService.createTemplateFromFile('NewRequest');
  t.d = d;
  t.s = s;
  
  var to = 'michael.james@ert.com,affoua.jasnault@ert.com,alexandre.cortez@ert.com'; // assistants' emails
  if (d.email == 'michael.james@ert.com') {
    to = 'michael.james@ert.com';
  }
  
  MailApp.sendEmail({
    to: to,
    subject: 'New SS Request - ' + d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode + ' - Due: ' + d.hardDue,
    htmlBody: t.evaluate().getContent(),
    name: "SS Requests"
  });
  
  d.ss.toast(d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode + " - Due: " + d.hardDue, 'New Request Notification Sent');
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  
//  Logger.log(t.getCode());
//  Logger.log(t.evaluate().getContent());
}

function sendSelectedNewRequest() {
  //var currRow = SpreadsheetApp.getActiveSpreadsheet().getSelection().getCurrentCell().getRow();
  //Logger.log(currRow);
  
  getSelectedRows().forEach(sendNewRequestByRow);

  function sendNewRequestByRow(value) {
      var d = getRequest(value);
      
      alertMsg = "Are you sure you want to send a new request notification about the following request?\n\n" +
        d.status + "\n" +
        d.client + " " + d.protocol + (d.batch && (' Batch ' + d.batch)) + " - " + d.reqCode + "\n" +
        "Due: " + d.hardDue;
      if (showAlert(alertMsg)) {
        sendNewRequest(d);
      }
  }
}

function testNewRequest() {
  var row = 28;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Queue");
  var range = sh.getRange(row, 1, 1, sh.getLastColumn());
  var e = {range: range};
  
  newRequest(e);
}