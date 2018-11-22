function getByName(colName, row, data) {
  //var data = sheet.getRange(2, 1, 1, sheet.getMaxColumns()).getValues();
  var col = data[1].indexOf(colName); //1 for column names
  if (col != -1) {
    return data[row-1][col];
  }
}

function getColNumByName(sheet, colName) {
  var data = sheet.getRange(headerRows, 1, 1, sheet.getLastColumn()).getValues();
  //Logger.log(sheet + " " + colName + " " + data);
  if (typeof colName == "string") {
    return col = data[0].indexOf(colName) + 1;
  } else if (typeof colName == "object") {
    
    var cols = [];
    for (var n in colName) {
      var num = data[0].indexOf(colName[n]) + 1;
      cols.push(num ? num : "");
    }
    return cols;
  }
}

function testGetColNumByName() {
  Logger.log(getColNumByName(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue"), ["Status", "Requestor", "Asgd To", "Protocol Number"]));
  Logger.log(getColNumByName(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue"), "Asgd To"));
}

function getRequest(row, newReq) {
//  var colNames = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues();
//  var data = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues();
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue");
  var data = sh.getRange(headerRows, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  return getRequestData(data, row, newReq);
}

function testGetRequest() {
  Logger.log(getRequest(4));
}

function getRequestData(data, i, newReq, keepSt, filt) {
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue");
  var newReq = newReq || false;
  var keepSt = keepSt || false;
  var rowOffset = filt ? 0 : headerRows;
  var row = filt ? data[i - rowOffset][getColNumByName(sh, "row") - 1] : i;

  d = {
    sh:    sh,
    ss:    ss,
    row:   row,
    getByName: function(colName) {
      var col = data[0].indexOf(colName); //1 for column names
      Logger.log("%s is col %s and its value in row %s (array row %s) is...", colName, col, row, i);
      if (col != -1) {
        Logger.log(data);
        return data[i - rowOffset][col];
      }
      //Logger.log(" is %s", i, data[i - rowOffset][col]);
    },
    getColNumByName: function(colName) {
      var col = data[0].indexOf(colName) + 1;
      if (col != -1) {
        return col;
      }
    }
  };
  
  // Request Basics
  d.id = d.getByName("ID") || "";
  Logger.log(d.id);
  d.reqType = d.getByName("Request Type") || "";
  d.client = d.getByName("Client") || "";
  d.protocol = d.getByName("Protocol Number") || "";
  d.batch = d.getByName("Batch #") || "";
  d.reqCode = d.getByName("Req Code") || "OTH";
  d.email = d.getByName("Email Address") || "";
  d.requestor = d.getByName("Requestor") || "";
  d.office = d.getByName("Your Office") || "";
  d.asst = d.getByName("Asgd To") || "";
  d.langs = d.getByName("Languages for v0.01") + " " + d.getByName("Languages for corrections") || "None";
  d.langsV001 = d.getByName("Languages for v0.01") || "";
  d.langsCR = d.getByName("Languages for corrections") || "";
  d.cpyast = d.getByName("Copyrighted assessments for this request") || "";
  d.nonast = d.getByName("Non-copyrighted assessments for this request") || "";
  d.addlnotes = d.getByName("Additional Notes") || "";
  d.astCnt = d.getByName("# of assessments for this request");
  d.langCnt = d.getByName("# of languages/countries for this request");
  d.estwkbks = d.getByName("Est. Ast. x Lang.") || "";
  d.predwkbks = d.getByName("Pred. Wkbk. Cnt.") && d.getByName("Pred. Wkbk. Cnt.").toFixed(0) || "";
  d.actwkbks = d.getByName("Act. Wkbk. Cnt.") || "";
  d.predhrs = d.getByName("Pred. Bill Hrs") || "";
  d.hardtime = d.getByName("Hard Deadline Time");
  
  // device & build
  var dvcbld = "";
  var device = d.getByName("Device");
  d.TBbld = d.getByName("TB-syn Build #");
  d.HHbld = d.getByName("HH-syn Build #");
  d.TBbldused = d.getByName("TB-syn Build # Used");
  d.HHbldused = d.getByName("HH-syn Build # Used");
  if (device) {
    if (device.indexOf("TB-syn")>-1) {
      dvcbld += "TB-syn";
      if (d.TBbld) {
        dvcbld += " build " + d.TBbld;
      }
      if (d.TBbldused) {
        dvcbld += " (used " + d.TBbldused + ")";
      }
    }
    if (device.indexOf(",")>-1) {
      dvcbld += ",\n"
    }
    if (device.indexOf("HH-syn")>-1) {
      dvcbld += "HH-syn";
      if (d.HHbld) {
        dvcbld += " build " + d.HHbld;
      }
      if (d.HHbldused) {
        dvcbld += " (used " + d.HHbldused + ")";
      }
    }
  }
  d.dvcbld = dvcbld;
  
  // dates
  d.timestamp = d.getByName("Timestamp") && moment(d.getByName("Timestamp"));
  d.dateRec = d.timestamp && d.timestamp.format(df) || "";
  d.dateTimeRec = d.timestamp && d.timestamp.format(ldtf) || "";
  d.dateRet = moment().format(df) || "";
  d.hardDueDate = d.getByName("Hard Deadline") && moment(d.getByName("Hard Deadline"));
  d.hardDue = d.hardDueDate && d.hardDueDate.format(df) || "";
  d.prefDueDate = d.getByName("Preferred Deadline") && moment(d.getByName("Preferred Deadline"));
  d.prefDue = d.prefDueDate && d.prefDueDate.format(df) || "";
  d.startDate = d.getByName("Expected Date Files Will Be Available") && moment(d.getByName("Expected Date Files Will Be Available"));
  d.start = d.startDate && d.startDate.format(df) || "";
  d.expRetDate = d.getByName("Exp First Rtrn Date") && moment(d.getByName("Exp First Rtrn Date"));
  d.startDateForm = d.startDateDue && d.startDateDue.format(dfform);
  d.prefDueDateForm = d.prefDueDate && d.prefDueDate.format(dfform);
  d.hardDueDateForm = d.hardDueDate && d.hardDueDate.format(dfform);
  d.expRetDateForm = d.expRetDate && d.expRetDate.format(dfform);
  
  //Logger.log('\nHard Due: ' + d.hardDue + '\nPref Due: ' + d.prefDue + '\n Start: ' + d.start);
  
  // Work Summary
  d.status = d.getByName("Status") || "";
  d.workcompl = d.getByName("Work Completed") || "";
  d.deliv = d.getByName("Deliverables") || "";
  d.fileloc = d.getByName("File Location") || "";
  d.incmplwkbks = d.getByName("# Incomplete Wkbks");
  d.astJSONcorr = d.getByName("# Ast. Req JSON Chg");
  d.billhrs = d.getByName("Bill Hrs OG") + d.getByName("Bill Hrs RV");
  
  // Notes
  d.majIssues = d.getByName("Major Unresolved ERT Issues") || "";
  d.minIssues = d.getByName("Minor Unresolved ERT Issues") || "";
  d.gennotes = d.getByName("General Notes") || "";
  d.vendiss = d.getByName("Vendor Issues") || "";
  d.tcfdbk = d.getByName("TC Feedback") || "";
  d.waitfor = d.getByName("On-Hold: Waiting For") || "";
  d.jira = d.getByName("Associated JIRA Defects") || "";
  d.timelog = d.getByName("Time Log");
  d.intnotes = d.getByName("Internal Notes");
  
  d. alerts = "";
  if (d.majIssues || d.minIssues) {
    d.alerts = "Please note there are unresolved issues with this request. Let me know which issues, if any, I should log as JIRA defects.";
  }
  
  // Logger.log(d.status + ' - ' + d.client + ' ' + d.protocol)
  // metrics
  d.daysDue = workdaysWhole(moment(), d.hardDueDate); // d.getByName("Days to DUE");
  d.daysPref = workdays(moment(), d.prefDueDate); // d.getByName("Days to Pref");
  d.daysStart = workdays(moment(), d.startDate);
  d.daysExp = workdays(moment(), d.expRetDate); // d.getByName("Days to Start");
  
  // details
  d.temp = d.getByName("Excel Macro template");
  d.server = d.getByName("Which server is this study on?");
  d.vend = d.getByName("Translations Vendor(s)");
  d.msgbx = d.getByName("Messageboxes screen capture required?");
  d.manscr = d.getByName("Manual screenshots required?");
  d.naming = d.getByName("Naming Conventions");
  
  // internal dates
  d.dWFS = d.getByName("Date WFS") && moment(d.getByName("Date WFS"));
  d.dFiles = d.getByName("Date Files") && moment(d.getByName("Date Files"));
  d.dNIF = d.getByName("Date NIF") && moment(d.getByName("Date NIF"));
  d.dASG = d.getByName("Date ASG") && moment(d.getByName("Date ASG"));
  d.dREV = d.getByName("Date REV") && moment(d.getByName("Date REV"));
  d.dINP = d.getByName("Date INP") && moment(d.getByName("Date INP"));
  d.dRet = d.getByName("Date Ret") && moment(d.getByName("Date Ret"));
  d.dUNR = d.getByName("Date UNR") && moment(d.getByName("Date UNR"));
  d.dPND = d.getByName("Date PND") && moment(d.getByName("Date PND"));
  d.dONH = d.getByName("Date ONH") && moment(d.getByName("Date ONH"));
  d.dONHend = d.getByName("Date ONH End") && moment(d.getByName("Date ONH End"));
  d.dCPL = d.getByName("Date CPL") && moment(d.getByName("Date CPL"));
  d.dCAN = d.getByName("Date CAN") && moment(d.getByName("Date CAN"));
  
  d.filesDate = d.dFiles ? d.dFiles : (d.startDate && d.startDate);
  // console.log("request %s: files ready/exp on %s", d.row, d.filesDate);
  d.daysFiles = workdays(moment(), d.filesDate);
  
  if (newReq) {
    sh.getRange(row, d.getColNumByName("row")).setValue(d.row);
    
    d.requestor = d.email.substr(0, d.email.indexOf("@")).replace(".", " ");
    d.requestor = d.requestor && toTitleCase(d.requestor);
    //d.daysDue = d.getByName("Hard Deadline") && daysTo(d.getByName("Hard Deadline")).toFixed(0);
    //d.daysPref = d.getByName("Preferred Deadline") && daysTo(d.getByName("Preferred Deadline")).toFixed(0);
    //d.daysStart = d.getByName("Expected Date Files Will Be Available") && daysTo(d.getByName("Expected Date Files Will Be Available")).toFixed(0);
    
    switch (d.reqType) {
    case "enUS v1.00":
        d.reqCode = "enV1";
        break;
    case "enUS corrections":
        d.reqCode = "enCR";
        break;
    case "foreign language v0.01":
        d.reqCode = "FLv1";
        break;
    case "foreign language corrections":
        d.reqCode = "FLCR";
        break;
    case "foreign language v0.01 and corrections":
        d.reqCode = "v1CR";
        break;
    default: 
        d.reqCode = "OTH";
    }
    
    sh.getRange(row, d.getColNumByName("Req Code")).setValue(d.reqCode);
    
    if (!keepSt) {
      var today = new Date();
      var diff = d.startDate && d.startDate.diff(moment(), 'days', true);
      if (Math.ceil(diff) >= 1) {
        d.status = "Waiting for Start";
        var c = sh.getRange(row, d.getColNumByName("Date WFS"));
        if (!c.getValue()) {c.setValue(today);}
      } else {
        d.status = "Received";
        var c = sh.getRange(row, d.getColNumByName("Date Files"));
        if (!c.getValue()) {c.setValue(today);}
      }
      console.log("moment (float - ceil): Starts %s in %s days (%s) so status is %s.", d.startDate.format(sdtf), Math.ceil(diff), diff, d.status);
      sh.getRange(row, d.getColNumByName("Status")).setValue(d.status);
      
      d.id = setReqID(d); 
    }
    
    if (!isNaN(d.astCnt) && !isNaN(d.langCnt)) {
      if (d.langCnt == 0) {
        d.langCnt = 1;
      }
      d.estwkbks = (d.astCnt * d.langCnt).toFixed(0);
    }
    
    if (d.office == "Geneva") {
    if (d.hardtime == "Open of Business") {
        d.hardDueDate.hour(3);
    } else {
        d.hardDueDate.hour(11);
    }
  } else {
    if (d.hardtime == "Open of Business") {
        d.hardDueDate.hour(9);
    } else {
        d.hardDueDate.hour(17);
    }
  }
  
  sh.getRange(row, d.getColNumByName("Hard Deadline")).setValue(d.hardDueDate.toDate());
  }
  
  if (d.requestor) {
    d.requestorNames = d.requestor.split(" ");
  }
  
  d.statusCode = getStatusCode(d.status);
  
  return d;
}

function getRequestsSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pivot - Counts");
//  var pivotAnchor = sheet.getPivotTables()[0].getAnchorCell();
//  var data = sheet.getRange(pivotAnchor.getRow(), pivotAnchor.getColumn(), 10, 2).getValues();
  var data = sheet.getDataRange().getValues();
  
  var summary = {};
  for (var i = 0; i < data.length; i++) {
      if (data[i][1] && !isNaN(data[i][1])) {
        var property = data[i][0].replace(/\W/g, '').toLowerCase();
        summary[property] = data[i][1];
      }
  }
  
//  for(var propertyName in summary) {
//    Logger.log(propertyName + ": " + summary[propertyName]);
//  }
  
  return summary;
}

function refreshAllRequestData() {
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue");
  var data = sh.getRange(headerRows, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  
  for (var i = 1; i < data.length; i++) { // skips header
    if (data[i][0]) {
      getRequestData(data, headerRows + i, true, true);
    }
  }
}

function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

function daysTo(date) {
  var one_day = 1000*60*60*24; // in ms
  if (typeof date == "object") {
    return Math.ceil((date.getTime() - new Date().getTime())/(one_day));
  }
}

function workdaysWhole(start, end) {
  //var start = new Date();
  if (start && end) {
    var first = start.clone().endOf('week'); // end of first week
    var last = end.clone().startOf('week'); // start of last week
    //Logger.log("hours: " + Math.floor(last.diff(first,'days', true)))
    var days = Math.floor(last.diff(first,'days', true) * (5 / 7)); // this will always multiply of 7
    
    //Logger.log({first: first.format("dddd, MMMM Do h:mm a"), start: start.format("dddd, MMMM Do h:mm a")})
    //Logger.log({end: end.format("dddd, MMMM Do h:mm a"), last: last.format("dddd, MMMM Do h:mm a")})
    
    var wfirstHrs = first.diff(start, 'hours');
    var wfirstDays = Math.floor(wfirstHrs / 24);
    
    if(start.day() == 0) --wfirstDays; // -1 if start with sunday 
    
    var wlastHrs = end.diff(last, 'hours') - 9.5;
    var wlastDays = Math.floor((wlastHrs) / 24);
    
    if(end.day() == 6) --wlastDays; // -1 if end with saturday
    
    //Logger.log({wfirstHrs: wfirstHrs, wfirstDays: wfirstDays, days: days, wlastHrs: wlastHrs, wlastDays: wlastDays});
    //Logger.log((wfirstDays + days + wlastDays - 1) + '\n');
    //Logger.log(start.format(dtf) + "; " + end.format(dtf));
    //Logger.log(end.diff(start,'days') + " w " + (wfirst + days + wlast));
    //Logger.log(wfirst + ' ' + days + ' ' + wlast);
    
    return wfirstDays + days + wlastDays - 1; // get the total
  } else {
    return null
  }
}

//function workdaysCeil(start, end) {
//  //var start = new Date();
//  if (start && end) {
//    var first = start.clone().endOf('week'); // end of first week
//    var last = end.clone().startOf('week'); // start of last week
//    //Logger.log("hours: " + Math.floor(last.diff(first,'days', true)))
//    var days = Math.floor(last.diff(first,'days', true) * (5 / 7)); // this will always multiply of 7
//    
//    //Logger.log({first: first.format("dddd, MMMM Do h:mm a"), start: start.format("dddd, MMMM Do h:mm a")})
//    //Logger.log({end: end.format("dddd, MMMM Do h:mm a"), last: last.format("dddd, MMMM Do h:mm a")})
//    
//    var wfirstHrs = first.diff(start, 'hours');
//    var wfirstDays = Math.ceil(wfirstHrs / 24);
//    
//    if(start.day() == 0) --wfirstDays; // -1 if start with sunday 
//    
//    var wlastHrs = end.diff(last, 'hours') - 9.5;
//    var wlastDays = Math.ceil((wlastHrs) / 24);
//    
//    if(end.day() == 6) --wlast; // -1 if end with saturday
//    
//    //Logger.log({wfirstHrs: wfirstHrs, wfirstDays: wfirstDays, days: days, wlastHrs: wlastHrs, wlastDays: wlastDays});
//    //Logger.log((wfirstDays + days + wlastDays - 1) + '\n');
//    //Logger.log(start.format(dtf) + "; " + end.format(dtf));
//    //Logger.log(end.diff(start,'days') + " w " + (wfirst + days + wlast));
//    //Logger.log(wfirst + ' ' + days + ' ' + wlast);
//    
//    return wfirstDays + days + wlastDays - 1; // get the total
//  } else {
//    return null
//  }
//}

function workdays(start, end) {
  //var start = new Date();
  //console.log("calculating workdays between %s to %s", start, end);
  if (start && end) {
    var first = start.clone().endOf('week'); // end of first week
    var last = end.clone().startOf('week'); // start of last week
    //Logger.log("hours: " + Math.floor(last.diff(first,'days', true)))
    var days = Math.floor(last.diff(first,'days', true) * (5 / 7)); // this will always multiply of 7
    
    //Logger.log({start: first.format("dddd, MMMM Do h:mm a"), first: start.format("dddd, MMMM Do h:mm a")})
    //Logger.log({end: end.format("dddd, MMMM Do h:mm a"), last: last.format("dddd, MMMM Do h:mm a")})
    var wfirst = first.day() - start.day(); // check first week
    if(start.day() == 0) --wfirst; // -1 if start with sunday 
    var wlast = end.day() - last.day(); // check last week
    if(end.day() == 6) --wlast; // -1 if end with saturday
    
    //Logger.log({wfirst: wfirst, days: days, wlast: wlast});
    
    //Logger.log(start.format(dtf) + "; " + end.format(dtf));
    //Logger.log(end.diff(start,'days') + " w " + (wfirst + days + wlast));
    //Logger.log(wfirst + ' ' + days + ' ' + wlast);
    
    return wfirst + days + wlast - 1; // get the total
  } else {
    return null
  }
}

function testWorkdays() {
  var t1 = moment("11/29/2018 9:00:00");
  var t2 = moment("11/29/2018 17:00:00");
  Logger.log(workdays(moment(), t1));
  Logger.log(workdays(moment(), t2));
}

function showAlert(msg) {
  var msg = msg || "Are you having a great day?";
  
  var ui = SpreadsheetApp.getUi(); // Same variations
  
  var result = ui.alert(
    'Please confirm',
    msg,
    ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
//    ui.alert('Confirmation received.');
    return true;
  } else {
    // User clicked "No" or X in the title bar.
//    ui.alert('Permission denied.');
    return false;
  }
}

function ISODateString(d){
 function pad(n){return n<10 ? '0'+n : n}
 return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
}

function testSSTime() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log(ss.getSpreadsheetTimeZone());
}

function getSelectedRows() {
  var activeSheet = SpreadsheetApp.getActiveSheet();
  var rows = [];
  
  var selection = activeSheet.getSelection();
  var ranges =  selection.getActiveRangeList().getRanges();
  for (var i = 0; i < ranges.length; i++) {
    var rg = ranges[i];
    var fRow = rg.getRow();
      for (var j = 0; j < rg.getNumRows(); j++) {
        var row = fRow + j;
        rows.push(row);
      }
  }
  
  return rows;
}

function getStatusCode(status) {
  for(var s in statuses) {
    if(statuses[s] === status) {
        return s
    }
  }
}

function testGetStatusCode() {
  Logger.log(getStatusCode("Reviewed"));
}

function testMatch() {
  // request ID
  var client = "Janssen";
  var protocol = "53718678RSV2002";
  var numLetters = 3;
  var clientRegEx = /([A-Za-z]){3}/g;
  var clientShort = client.match(clientRegEx)[0].toUpperCase();
  var protocolRegEx = /-?([A-Za-z])/g; // characeters and hyphens if before characters
  var protocolShort = protocol.match(protocolRegEx).join('').toUpperCase();
  
  var scriptProperties = PropertiesService.getScriptProperties();
  var num = scriptProperties.getProperty('lastID') + 1;
  // scriptProperties.setProperty('lastID', num);
  
  var id = clientShort + "-" + (protocolShort && (protocolShort + "-")) + "17" + "-"  + num;
  //console.log("id %s", id);
  Logger.log("id %s", id);
  //sh.getRange(row, d.getColNumByName("ID")).setValue(id);
}

function properties() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var last = parseInt(scriptProperties.getProperty('lastID'));
  var num = last + 1;
  scriptProperties.setProperty('lastID', num);
  var now = scriptProperties.getProperty('lastID');
  Logger.log("the number was %s (type %s) but I set it to %s so now it is %s", last, typeof last, num, now);
}

function setReqID(d) {
  //console.log({client: d.client, protocol: d.protocol, batch: d.batch, reqCode: d.reqCode, timestamp: d.timestamp.format(), row: d.row});
  var clientRegEx = /([A-Za-z]){3}/g;
  var clientShort = (typeof d.client == 'string') ? d.client.match(clientRegEx)[0].toUpperCase() : '';
  var protocolRegEx = /-?([A-Za-z])/g; // characeters and hyphens if before characters
  var protocolShort = (typeof d.protocol == 'string') ? d.protocol.match(protocolRegEx) : '';
  protocolShort = protocolShort && protocolShort.join('').toUpperCase();
  var batchRegEx = /([^A-Za-z0-9]+)/g;
  var batch = (typeof d.batch == 'string') ? d.batch.replace(batchRegEx, '') : '';
    
  //var scriptProperties = PropertiesService.getScriptProperties();
  //var last = parseInt(scriptProperties.getProperty('lastID'));
  //var num = last + 1;
  var id = d.row + '-' + d.timestamp.date() + '-' + clientShort + "-" + (protocolShort && (protocolShort + "-")) + (batch && batch + '-') + d.reqCode.toUpperCase();
  //console.log("id %s", id);
  d.sh.getRange(d.row, d.getColNumByName("ID")).setValue(id);
  return id;
}

function setIDSel() {
  getSelectedRows().forEach(setIDbyRow);

  function setIDbyRow(value) {
     var d = getRequest(value);
     
     if (d.id) {
       alertMsg = Utilities.formatString("Are you sure you want to create a new ID for request %s?\n\n%s\n%s %s%s- %s", d.id, d.status, d.client, d.protocol, (d.batch && (' Batch ' + d.batch)), d.reqCode);
      if (showAlert(alertMsg)) {
        setReqID(d);
      }
     } else {
       setReqID(d);
     }
  }
}

function countReqs(fields, exc, inc) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue");
  var reqs = sh.getRange(headerRows, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  var headers = reqs.shift();
  
  var inds = [];
  for (var f in fields) {
    inds.push(getColNumByName(sh, fields[f]) - 1);
  }
  //Logger.log(inds);
      
  // filter out closed requests
  var stIdx = getColNumByName(sh, "Status") - 1;
  var excIdx = exc && getColNumByName(sh, exc[0]) - 1;
  var incIdx = inc && getColNumByName(sh, inc[0]) - 1;
  function isOpen(value) {
    return value[stIdx].length !== 0 && (exc ? exc[1].indexOf(value[excIdx]) < 0 : true) && (inc ? inc[1].indexOf(value[incIdx]) >= 0 : true);
  }
  //Logger.log("filtering %s records...", reqs.length - 1);
  reqs = reqs.filter(isOpen);
  //Logger.log("filtered - now %s", reqs.length - 1);
  
  var counts = {};
  for (var r in reqs) {
    var val1 = reqs[r][inds[0]];
    var val2 = reqs[r][inds[1]];
    //Logger.log(Utilities.formatString("%s - %s - %s", val1, val2, reqs[r][28]));
    if (val1) {
        if (val1 in counts) {
          //Logger.log(Utilities.formatString("%s in first obj!", val1));
          if (val2 in counts[val1]) {
            //Logger.log(Utilities.formatString("%s in second obj!", val2));
            counts[val1][val2] += 1;
          } else {
            counts[val1][val2] = 1;
          }
        } else {
          counts[val1] = {};
          counts[val1][val2] = 1;
        }
      }
      //Logger.log(counts);
  }
  return counts;
}

function formatCounts(counts) {
  var formatted = [];
  for (var i in counts) {
    var cnt = 0;
    var types = "";
    for (var j in counts[i]) {
      cnt += counts[i][j];
      types += (types.length ? ", " : '') + Utilities.formatString("%s (%s)", j, counts[i][j].toFixed(0));
      // Logger.log("%s %s %s", i, j, counts[i][j])
    }
    formatted.push([i, cnt, types]);
  }
  
  formatted.sort(function(a, b) {
    return b[1] - a[1]
  });
  
  return formatted
}

function testCountReqs() {
  var fields = ['Asgd To', 'Req Code'];
  var exc = ["Status", ["Completed"]];
  var inc = ["Protocol Number", ["TD-1473-0157"]];
  var counts = countReqs(fields, null, inc);
  
  Logger.log(counts);
  Logger.log(formatCounts(counts));
}

function testWFS() {
  var d = {startDate: moment("2018-11-19")};
  
  var diff = d.startDate && d.startDate.diff(moment(), 'days');
  if (diff >= 1) {
    d.status = "Waiting for Start";
  } else {
    d.status = "Received";
  }
  Logger.log("moment (int): Starts %s in %s days so status %s.", d.startDate.format(sdtf), diff, d.status);
  
  var diff = d.startDate && d.startDate.diff(moment(), 'days', true);
  if (diff >= 1) {
    d.status = "Waiting for Start";
  } else {
    d.status = "Received";
  }
  Logger.log("moment (float): Starts %s in %s days so status %s.", d.startDate.format(sdtf), diff, d.status);
  
  var diff = d.startDate && Math.ceil(d.startDate.diff(moment(), 'days', true));
  if (diff >= 1) {
    d.status = "Waiting for Start";
  } else {
    d.status = "Received";
  }
  Logger.log("moment (float - ceil): Starts %s in %s days so status %s.", d.startDate.format(sdtf), diff, d.status);
  
  var diff = d.startDate && workdaysWhole(moment(), d.startDate);
  if (diff >= 1) {
    d.status = "Waiting for Start";
  } else {
    d.status = "Received";
  }
  Logger.log("workdaysWhole: Starts %s in %s days so status %s.", d.startDate.format(sdtf), diff, d.status);
  
  var diff = d.startDate && workdays(moment(), d.startDate);
  if (diff >= 1) {
    d.status = "Waiting for Start";
  } else {
    d.status = "Received";
  }
  Logger.log("workdays: Starts %s in %s days so status %s.", d.startDate.format(sdtf), diff, d.status);
  
  //sh.getRange(row, d.getColNumByName("Status")).setValue(d.status);
}