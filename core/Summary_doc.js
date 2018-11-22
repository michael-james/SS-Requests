function makeSummaryDoc(d, title) {
  var templateId = '1SGxNQ3cLNeI4kZc5kefWodOBur4dqnyYJXEtSLpjhTg';
  
  // create and rename document
  var documentId = DriveApp.getFileById(templateId).makeCopy().getId();
  
  DriveApp.getFileById(documentId).setName(title);
    
  // edit document
  var doc = DocumentApp.openById(documentId);
  var f = doc.getFooter();
  f.replaceText('##dateRetERT##', moment().format(ERTdf).toUpperCase());
  var b = doc.getBody();
  
  // Intro
  b.replaceText('##Client##', d.client);
  b.replaceText('##Protocol##', d.protocol);
  b.replaceText('##BatchSubtitle##', (d.batch && (' Batch ' + d.batch)));
  b.replaceText('##Batch##', d.batch || "");
  b.replaceText('##ReqCode##', d.reqCode);
  b.replaceText('##RequestorFName##', d.requestorNames[0]);
  b.replaceText('##Alerts##', d.alerts ? '\n' + d.alerts + '\n' : "");
  b.replaceText('##Asst##', d.asst);
  b.replaceText('##dateRetERT##', moment().format(ERTdf).toUpperCase());
  
  // Request Basics
  b.replaceText('##Requestor##', d.requestor);
  b.replaceText('##ReqType##', d.reqType);
  b.replaceText('##DeviceBuild##', d.dvcbld);
  b.replaceText('##Languages##', d.langs);
  b.replaceText('##CPYAst##', d.cpyast);
  b.replaceText('##NONAst##', d.nonast);
  b.replaceText('##HardDeadline##', d.hardDue + ', ' + d.hardtime);
  b.replaceText('##PrefDeadline##', d.prefDue);
  b.replaceText('##EarliestStart##', d.start);
  b.replaceText('##AddlNotes##', d.addlnotes || "None");
  
  // Work Summary
  b.replaceText('##Status##', d.status);
  b.replaceText('##DateRet##', d.dateRet);
  b.replaceText('##Asst##', d.asst);
  b.replaceText('##WorkCompl##', d.workcompl);
  b.replaceText('##Deliverables##', d.deliv);
  b.replaceText('##FileLoc##', d.fileloc);
  b.replaceText('##IncmplWkbks##', d.incmplwkbks || d.incmplwkbks == 0 ? d.incmplwkbks : "");
  b.replaceText('##AstJSONCorr##', d.astJSONcorr || d.astJSONcorr == 0 ? d.astJSONcorr : "");
  b.replaceText('##BillHrs##', d.billhrs || d.billhrs == 0 ? d.billhrs : "");
  
  // Notes
  b.replaceText('##MajorIssues##', d.majIssues || "None");
  b.replaceText('##MinorIssues##', d.minIssues || "None");
  b.replaceText('##GeneralNotes##', d.gennotes || "None");
  b.replaceText('##VendorIssues##', d.vendiss || "None");
  // b.replaceText('##TCFeedbackTitle##', d.tcfdbk && "Requestor Feedback\n" || "");
  // b.replaceText('##TCFeedback##', d.tcfdbk && d.tcfdbk + "\n\n");
  
  doc.saveAndClose();
  // doc.addEditor(d.email).saveAndClose();
  
  return doc;
  
  // Email a link to the Doc as well as a PDF copy.
//  var alertText = "";
//  if (d.alerts) {
//    alertText = "<p>" + d.alerts + "</p>";
//  }
  
//  MailApp.sendEmail({
//    to: d.email,
//    cc: "michael.james@ert.com",
//    subject: doc.getName(),
//    htmlBody: "<p>Hello " + d.requestorNames[0] + ",</p><p>Your screenshots request on " + d.dateRec + " for <u>" + d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' ' + d.reqType + "</u> has been performed.</p><p>Please review the attached summary regarding the status of your request then reply with any necessary revisions or confirm your request is complete.</p>" + alertText + (d.asst && ("<p>Thank you,<br>" + d.asst)),
//    attachments: doc.getAs(MimeType.PDF),
//    name: "SS Requests"
//  });
  
//  d.ss.toast(d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode, 'Request Update Sent');
}