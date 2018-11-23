/**
 * Get "home page", or a requested page.
 * Expects a 'page' parameter in querystring.
 *
 * @param {event} e Event passed to doGet, with querystring
 * @returns {String/html} Html to be served
 */
function doGet(e) {
  // Logger.log( Utilities.jsonStringify(e) );
  var t0 = new Date();
  var page = "Home";
  if (e.parameter.page) {
    page = e.parameter['page'];
  }
  var row = null;
  if (e.parameter.row) {
    row = e.parameter['row'];
  }
  // var timeLabel = page + " load time";  // Labels the timing log entry.
  
  // console.time(timeLabel); 

  var html = HtmlService.createTemplateFromFile('Default');
  var s = null;
  var view = null;
  var role = null; // 0 = basic, 1 = asst, 2 = lead, 3 = admin
  var u = user();
  
    if (e.parameter.status) {
    s = e.parameter['status'];
    if (row) {
      chgStatus(row, statuses[s]);
    }
  }
  if (e.parameter.view) {
    view = e.parameter['view'];
  }
  if (e.parameter.role) {
    if (u.admin) {
//      Logger.log(user());
//      Logger.log(typeof admin);
//      Logger.log('isAdmin');
      role = e.parameter['role'];
    }
  }  
  // return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate();
  var data = {page: page, row: row, status: statuses[s], view: view, role: role, email: u.email, u: u, admin: u.admin, asst: u.asst, lead: u.lead};
  html.data = data;
  // var favicon = "http://michael-james.github.io/ERT/ert-logo.png";
  // var favicon = "http://michael-james.github.io/ERT/favicon.ico";
  var evalHTML = html.evaluate()
    .setTitle("SS Requests: " + page + (Boolean(row) ? (" " + row) : ""))
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, shrink-to-fit=no');
    // .setFaviconUrl(favicon);
  // console.timeEnd(timeLabel);
  // console.log(evalHTML.getFaviconUrl());

  var dur = new Date().getTime() - t0.getTime(); console.log({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof row !== 'undefined') ? row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  // rec(page, null, row, null, t0);

  return evalHTML;
}

function include(filename, data) {
  // Logger.log(filename);
  // try {
    var html = HtmlService.createTemplateFromFile(filename);
    html.data = data;
    return html.evaluate().getContent();
  // } catch(e) {
    // console.error('%s (line %s, file "%s"', e, e.lineNumber, e.fileName);
    // throwAlert(e, "The requested page is not accessible at this time.");
    // try {
    //   var html = HtmlService.createTemplateFromFile('Home');
    //   html.data = data;
    //   return html.evaluate().getContent();
    // } catch(e) {
    //     throwAlert(e, "The requested page is not accessible at this time.");
    // }
  // }
}

/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

var url = getScriptUrl();

function chgStatus(row, newStatus) {
  try {
    var t0 = new Date();
    var ss = SpreadsheetApp.openById(ssID);
    var sh = ss.getSheetByName("Queue");
    var statusData = sh.getRange(row, getColNumByName(sh, "Status"));
    var oldStatus = statusData.getValue();
    statusData.setValue(newStatus);
    
    var today = new Date();
    
//    console.log("status was %s but now is %s", oldStatus, newStatus)
    
    if (oldStatus == "On-hold") {
      var c = sh.getRange(row, getColNumByName(sh, "Date ONH End"));
      if (!c.getValue()) {c.setValue(today);}
    }
    
    if (oldStatus == "Waiting for Start" && newStatus == "Received") {
      var d = getRequest(row);
      sendNewRequest(d);
    }
  
    switch (newStatus) {
        case "Received":
          var c = sh.getRange(row, getColNumByName(sh, "Date Files"));
          if (!c.getValue()) {c.setValue(today);}
        case "Waiting for Start":
          var c = sh.getRange(row, getColNumByName(sh, "Date WFS"));
          if (!c.getValue()) {c.setValue(today);}
          break;
        case "Needs Information":
          var c = sh.getRange(row, getColNumByName(sh, "Date NIF"));
          if (!c.getValue()) {c.setValue(today);}
          break;
        case "Reviewed":
          var c = sh.getRange(row, getColNumByName(sh, "Date REV"));
          if (!c.getValue()) {c.setValue(today);}
          break;
        case "Assigned":
          var c = sh.getRange(row, getColNumByName(sh, "Date ASG"));
          if (!c.getValue()) {c.setValue(today);}
          // addTask(getRequest(e.range.getRow()));
          // addTask(d);
          break;
        case "In-progress":
          var c = sh.getRange(row, getColNumByName(sh, "Date INP"));
          if (!c.getValue()) {c.setValue(today);}
          break;
        case "Unresolved Issues":
//          var c = sh.getRange(row, getColNumByName(sh, "Date Ret"));
//          if (!c.getValue()) {c.setValue(today);}
          var c = sh.getRange(row, getColNumByName(sh, "Date UNR"));
          if (!c.getValue()) {c.setValue(today);}
          // sendSummary(getRequest(row));
          break;
        case "Pending Confirmation":
//          var c = sh.getRange(row, getColNumByName(sh, "Date Ret"));
//          if (!c.getValue()) {c.setValue(today);} 
          var c = sh.getRange(row, getColNumByName(sh, "Date PND"));
          if (!c.getValue()) {c.setValue(today);}
          // sendSummary(getRequest(row));
          break;
        case "On-hold":
//          var c = sh.getRange(row, getColNumByName(sh, "Date Ret"));
//          if (!c.getValue()) {c.setValue(today);}
          var c = sh.getRange(row, getColNumByName(sh, "Date ONH"));
          if (!c.getValue()) {c.setValue(today);}
          // sendSummary(getRequest(row));
          break;
        case "Completed":
          var c = sh.getRange(row, getColNumByName(sh, "Date CPL"));
          if (!c.getValue()) {c.setValue(today);}
          break;
        case "Cancelled":
          var c = sh.getRange(row, getColNumByName(sh, "Date CAN"));
          if (!c.getValue()) {c.setValue(today);}
          break;
      }
      
      var dur = new Date().getTime() - t0.getTime(); console.log({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof row !== 'undefined') ? row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
      return { st: newStatus, cls: stCls(newStatus), row: row, code: getStatusCode(newStatus) }
    } catch (e) {
      throwAlert(e, "Request status not changed.");
    }
}

function objectifyForm(formArray) {//serialize data function

  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}

function id() {
  Logger.log(SpreadsheetApp.getActiveSpreadsheet().getId());
}

///////////////////////////////
// formatting
///////////////////////////////

function urgency(diff, elem, style, outline) {
  var out = "";
  if (outline) {
    out = "-outline";
  }
  
  if (diff < 0) {
    return elem + out + "-" + style
  } else if (diff == 0) {
    return elem + out + "-primary"
  } else if (diff == 1) {
    return elem + out + "-info"
  } else if (diff == null) {
    return ""
  } else {
    return elem + out + "-secondary"
  }
}

function typClass(reqCode) {
  var typClass = "badge-secondary";

  switch (reqCode) {
    case "enV1":
      typClass = "swatch-teal";
      break;
    case "enCR":
      typClass = "badge-light";
      break;
    case "FLv1":
      typClass = "swatch-purple";
      break;
    case "FLCR":
      typClass = "swatch-pink";
      break;
    case "v1CR":
      typClass = "swatch-orange";
      break;
  }
  
  return typClass;
}

function stCls(st) {
  var tblClass = "";
  var btnClass = "btn-outline-dark";
  
  switch (st) {
    case "Completed":
      tblClass = "table-completed";
      btnClass = "btn-completed";
      break;
    case "Cancelled":
      tblClass = "table-dark";
      btnClass = "btn-dark";
      break;
    case "Pending Confirmation":
      tblClass = "table-success";
      btnClass = "btn-success";
      break;
    case "Unresolved Issues":
      tblClass = "table-danger";
      btnClass = "btn-danger";
      break;
    case "On-hold":
      tblClass = "table-warning";
      btnClass = "btn-warning";
      break;
    case "In-progress":
      tblClass = "table-inprogress";
      btnClass = "btn-inprogress";
      break;
    case "Assigned":
      tblClass = "table-assigned";
      btnClass = "btn-assigned";
      break;
    case "Waiting for Start":
      tblClass = "table-waiting";
      btnClass = "btn-outline-warning";
      break;
    case "Needs Information":
      tblClass = "table-needsinfo";
      btnClass = "btn-outline-danger";
      break;
    case "Reviewed":
      tblClass = "table-reviewed";
      btnClass = "btn-outline-success";
      break;
  }
  
  return { tbl: tblClass, btn: btnClass }
}

function testStCls() {
  Logger.log(stCls("In-progress"));
}

function throwAlert(e, info) {
  throw Utilities.formatString(info + " (%s: %s)", e.name, e.message);
}