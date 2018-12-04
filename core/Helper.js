function getByName(colName, row, data) {
  //var data = sheet.getRange(2, 1, 1, sheet.getMaxColumns()).getValues();
  var col = data[1].indexOf(colName); //1 for column names
  if (col != -1) {
    return data[row-1][col];
  }
}

function getColNumByName(colName) {
  try {
    var ss = SpreadsheetApp.openById(ssID);
    var sh = ss.getSheetByName("Queue");
    var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
    return getColNumByNameData(headers, colName)
  } catch (e) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName("Queue");
      var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
      return getColNumByNameData(headers, colName)
    } catch (e) {
      throw e
    }
  }
}

function getColNumByNameData(data, colName) {
  if (typeof colName == "string") {
    return col = data.indexOf(colName) + 1;
  } else if (typeof colName == "object") {
    
    var cols = [];
    for (var n in colName) {
      var num = data.indexOf(colName[n]) + 1;
      cols.push(num ? num : "");
    }
    return cols;
  }
}

function testGetColNumByName() {
  Logger.log(getColNumByName(["Status", "Requestor", "Asgd To", "Protocol Number"]));
  Logger.log(getColNumByName("Asgd To"));
}

function getRequest(row) {
//  var colNames = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues();
//  var data = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues();
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue");
  var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
  var rowData = sh.getRange(row, 1, 1, sh.getLastColumn()).getValues()[0];
  var data = [headers, rowData];
  return getRequestData(data);
}

function testGetRequest() {
  Logger.log(getRequest(4));
}

function getRequestData(data, i) {
  var i = i || 1;
  var t0 = new Date();
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue");
  var row = data[i][getColNumByNameData(data[0], "row") - 1];

  d = {
    ss:    ss,
    sh:    sh,
    row:   row,

    getByName: function(colName) {
      var col = data[0].indexOf(colName); //1 for column names
      if (col != -1) {
        return data[i][col];
      }
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
  d.reqCode = d.getByName("Req Code") || "";
  d.reqType = d.reqCode && types[d.reqCode];
  d.client = d.getByName("Client") || "";
  d.protocol = d.getByName("Protocol Number") || "";
  d.batch = d.getByName("Batch #") || "";
  d.email = d.getByName("Email Address") || "";
  d.office = d.getByName("office") && offices[d.getByName("office")] || "";
  d.asst = d.getByName("Asgd To") || "";
  d.langs = d.getByName("Languages for v0.01") + " " + d.getByName("Languages for corrections") || "None";
  d.langsV001 = d.getByName("Languages for v0.01") || "";
  d.langsCR = d.getByName("Languages for corrections") || "";
  d.cpyast = d.getByName("Copyrighted assessments for this request") || "";
  d.nonast = d.getByName("Non-copyrighted assessments for this request") || "";
  d.addlnotes = d.getByName("Additional Notes") || "";
  d.actwkbks = d.getByName("Act. Wkbk. Cnt.") || "";
  d.predhrs = d.getByName("Pred. Bill Hrs") || "";
  d.hardtime = d.getByName("Hard Deadline Time");

  var o = getCounts(d);
  for (var prop in o) {
    d[prop] = o[prop];
  }
  
  // device & build
  var dvcbld = "";
  d.device = d.getByName("Device");
  d.TBbld = d.getByName("TB-syn Build #");
  d.HHbld = d.getByName("HH-syn Build #");
  d.TBbldused = d.getByName("TB-syn Build # Used");
  d.HHbldused = d.getByName("HH-syn Build # Used");
  if (d.device) {
    if (d.device.indexOf("TB-syn")>-1) {
      dvcbld += "TB-syn";
      if (d.TBbld) {
        dvcbld += " build " + d.TBbld;
      }
      if (d.TBbldused) {
        dvcbld += " (used " + d.TBbldused + ")";
      }
    }
    if (d.device.indexOf(",")>-1) {
      dvcbld += ",\n"
    }
    if (d.device.indexOf("HH-syn")>-1) {
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
  d.startDateForm = d.startDate && d.startDate.format(dfform);
  d.prefDueDateForm = d.prefDueDate && d.prefDueDate.format(dfform);
  d.hardDueDateForm = d.hardDueDate && d.hardDueDate.format(dfform);
  d.expRetDateForm = d.expRetDate && d.expRetDate.format(dfform);

  if (d.hardDue == d.prefDue) {
    d.prefDue = "";
    d.prefDueDate = "";
    d.prefDueDateForm = "";
  }
  
  //Logger.log('\nHard Due: ' + d.hardDue + '\nPref Due: ' + d.prefDue + '\n Start: ' + d.start);
  // rec(null, arguments.callee.name + " - basics", d.row, null, t0);
  
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
  d.daysDueWhole = workdaysWhole(moment(), d.hardDueDate); // d.getByName("Days to DUE");
  d.daysDue = workdays(moment(), d.hardDueDate); // d.getByName("Days to DUE");
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
  
  // determine if files are ready
  d.filesDate = d.dFiles ? d.dFiles : (d.startDate && d.startDate);
  d.daysFiles = workdays(moment(), d.filesDate);

  // requestor name
  d.requestor = d.email && d.email.substr(0, d.email.indexOf("@")).replace(".", " ");
  d.requestor = d.requestor && toTitleCase(d.requestor);

  if (d.requestor) {
    d.requestorNames = d.requestor.split(" ");
  }

  // status code (get rid of)
  d.statusCode = getStatusCode(d.status);
  
  // var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: arguments.callee.name, row: (typeof d.row !== 'undefined') ? d.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return d;
}

function getCounts(d, r) {
  if (Array.isArray(d)) {
    var inds = {langsV001: getColNumByNameData(d[0], "Languages for v0.01") - 1, langsCR: getColNumByNameData(d[0], "Languages for corrections") - 1, cpyast: getColNumByNameData(d[0], "Copyrighted assessments for this request") - 1, nonast: getColNumByNameData(d[0], "Non-copyrighted assessments for this request") - 1, actwkbks: getColNumByNameData(d[0], "Act. Wkbk. Cnt.") - 1};
    d = {langsV001: d[r][inds.langsV001], langsCR: d[r][inds.langsCR], cpyast: d[r][inds.cpyast], nonast: d[r][inds.nonast], actwkbks: d[r][inds.actwkbks]};
  }
  Logger.log(d.langsV001 + '\n' + d.cpyast);

  o = {};
  o.langCnt = ((typeof d.langsV001 == 'string' && d.langsV001) ? d.langsV001.split(",").length : 0) + ((typeof d.langsCR == 'string' && d.langsCR) ? d.langsCR.split(",").length : 0) + ((d.reqCode == 'enV1' || d.reqCode == 'enCR') ? 1 : 0);
  o.astCnt = ((typeof d.cpyast == 'string' && d.cpyast) ? d.cpyast.split(",").length : 0) + ((typeof d.nonast == 'string' && d.nonast) ? d.nonast.split(",").length : 0);

  // estimated workbooks
  if (!isNaN(o.astCnt) && !isNaN(o.langCnt)) {
    o.estwkbks = (o.astCnt * o.langCnt).toFixed(0);
  }
  o.predwkbks = o.estwkbks;
  o.bestwkbks = d.actwkbks || o.predwkbks;

  Logger.log(o);
  return o
}

function updateReq(row, id, oldStatus, client, protocol, batch, reqCode, startDate, dWFS, dFiles, office, hardDueDate, hardtime) {

  var obj = {};
  
  //////////////////////////////////////////////////////////
  // determine request ID (id)
  //////////////////////////////////////////////////////////

  var updatedId = setReqID(row, client, protocol, batch, reqCode);
  if (id !== updatedId) {
    obj.id = updatedId;
  }

  //////////////////////////////////////////////////////////
  // determine whether request is ready to start (status)
  //////////////////////////////////////////////////////////
  
  if (!oldStatus && startDate) {
    var today = new Date();
    if (startDate.constructor.name !== 'Moment') {
      startDate = moment(startDate);
    }
    var diff =  startDate.diff(moment(), 'days', true);
    if (Math.ceil(diff) >= 1) {
      obj.status = "Waiting for Start";
      if (!dWFS) {
        obj.dWFS = today;
      }
    } else {
      obj.status = "Received";
      if (!dFiles) {
        obj.dFiles = today;
      }
    }
   }

  //////////////////////////////////////////////////////////
  // combine hard due date and time (hardDueDate)
  //////////////////////////////////////////////////////////

  if (hardDueDate) {
    if (hardDueDate.constructor.name !== 'Moment') {
      hardDueDateUpd = moment(hardDueDate);
    }
    if (office == "Geneva") {
      switch (hardtime) {
        case "Open of Business":
          hardDueDateUpd.hour(3);
          break;
        case "Early afternoon":
          hardDueDateUpd.hour(7);
          break;
        default:
          hardDueDateUpd.hour(11);
      }
    } else {
      switch (hardtime) {
        case "Open of Business":
          hardDueDateUpd.hour(9);
          break;
        case "Early afternoon":
          hardDueDateUpd.hour(13);
          break;
        default:
          hardDueDateUpd.hour(17);
      }
    }

    if (hardDueDate !== hardDueDateUpd) {
      obj.hardDueDate = hardDueDateUpd;
    }
  }
  
  // logging only
//  obj.hardDueDate = obj.hardDueDate.format(dtf);

  return obj
}

 function testUpdateReq() {
   Logger.log( updateReq("", "1, 2", "FLCR", moment('2018-11-26'), "", "", "Geneva", moment('2018-11-28'), "Early afternoon") );
 }

// console.log(testUpdateReq());

function setReqID(row, client, protocol, b, reqCode) {
  //console.log({client: d.client, protocol: d.protocol, batch: d.batch, reqCode: d.reqCode, timestamp: d.timestamp.format(), row: d.row});
  var clientRegEx = /([A-Za-z])/g;

  if (typeof client == 'string') {
    var clientShort = client.match(clientRegEx)[0].slice(0,3).toUpperCase() : '';
  }
  
  var protocolRegEx = /-?([A-Za-z])/g; // characeters and hyphens if before characters
  var protocolShort = (typeof protocol == 'string') ? protocol.match(protocolRegEx) : '';
  protocolShort = protocolShort && protocolShort.join('').toUpperCase();
  var batchRegEx = /([^A-Za-z0-9,]+)/g;
  var batch = (typeof b == 'string') ? b.toUpperCase().replace(batchRegEx, '') : '';
  batch = batch.split(',');
  batch = batch.join('-B');
    
  //var scriptProperties = PropertiesService.getScriptProperties();
  //var last = parseInt(scriptProperties.getProperty('lastID'));
  //var num = last + 1;
  var id = (clientShort && (clientShort + '-')) + (protocolShort && (protocolShort + '-')) + (batch && ('B' + batch + '-')) + (reqCode ? reqCode.toUpperCase() : "OTH") + (row ? ('-' + row) : ""); 
  //console.log("id %s", id);
  // d.sh.getRange(d.row, d.getColNumByName("ID")).setValue(id);
  return id
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
      getRequestData(data, i);
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

function countReqs(fields, exc, inc) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue");
  var reqs = sh.getRange(headerRows, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  var headers = reqs.shift();
  
  var inds = [];
  for (var f in fields) {
    inds.push(getColNumByName(fields[f]) - 1);
  }
  //Logger.log(inds);
      
  // filter out closed requests
  var stIdx = getColNumByName("Status") - 1;
  var excIdx = exc && getColNumByName(exc[0]) - 1;
  var incIdx = inc && getColNumByName(inc[0]) - 1;
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

  function ord(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
  }

  function bdText(date, days, pre) {
    if (days == 0) {
      if (pre) {
        return "is today, " + date
      } else {
        return "today, " + date
      }
    } else if (days == -1) {
      if (pre) {
        return "was yesterday, " + date
      } else {
        return "yesterday, " + date
      }
    } else if (days == 1) {
      if (pre) {
        return "is tomorrow, " + date
      } else {
        return "tomorrow, " + date
      }
    } else if (days < 0) {
      if (pre) {
        return "of " + date + " was " + (days * -1) + " business day ago"
      } else {
        return "on " + date + ", which was " + (days * -1) + " business day ago"
      }
    } else {
      if (pre) {
        return "of " + date + " is " + days + " business days away"
      } else {
        return "on " + date + ", which is " + days + " business days away"
      }
    }
  }