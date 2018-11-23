function getPrevReq(id, currRow) {
  var t0 = new Date();
  // Logger.log("getting prev requests...");
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue");
  var stIdx = getColNumByName(sh, "Status") - 1;
  var idIdx = getColNumByName(sh, "Protocol Number") - 1;
  
  // get and sort data
  var sortColA = getColNumByName(sh, "Date CPL");
  var sortColB = getColNumByName(sh, "Timestamp");
  var q = sh.getRange(headerRows + 1, 1, sh.getLastRow(), sh.getLastColumn()).getValues(); //.sort({column: idCol, ascending: false}).getValues();
    
  var prev = [];
  for (var i = 0; i < q.length; i++) {
     //Logger.log(q[i][idCol - 1] + " == " + id);
    //console.log(q[i][stIdx]);
    // Logger.log(q[i][stIdx])
    if (!(q[i][stIdx].length == 0) && !(headerRows + 1 + i == currRow) && (q[i][idIdx] == id)) {
      // Logger.log(q[i]);
      q[i].unshift(headerRows + 1 + i)
      prev.push(q[i]);
      //Logger.log(prev);
      //Logger.log(q[i]);
    }
  }
  
  prev.sort(function(a, b) {
    var sortA = b[sortColA - 1] - a[sortColA - 1];
  
//    Logger.log("sorting A...");
//    Logger.log(a[sortColA - 1]);
//    Logger.log(b[sortColA - 1]);
//    Logger.log(sortA + '\n');
    
    if (sortA == 0) {
      var sortB = b[sortColB - 1] - a[sortColB - 1];
      
//      Logger.log("sorting B...");
//      Logger.log(a[2]);
//      Logger.log(b[2]);
//      Logger.log(a[sortColB - 1]);
//      Logger.log(b[sortColB - 1]);
//      Logger.log(sortB + '\n');
       return sortB;
    } else {
      return sortA;
    }
  });
  
  var colNames = ["Status", "Date CPL", "Asgd To", "Req Code", "Batch #", "Act. Wkbk. Cnt.", "Internal Notes", "TB-syn Build # Used", "HH-syn Build # Used"];
  var cols = getColNumByName(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue"), colNames);
  //Logger.log(cols);
  var properties = [];
  for (var c in colNames) {
    properties.push(colNames[c].replace(/\W/g, '').toLowerCase());
  }
//  Logger.log(properties);
  
  var info = [];
  //Logger.log(prev.length);
  //Logger.log(prev[0])
  for (var i = 0; i < prev.length; i++) {
    var req = {};
//    Logger.log(q[i][idCol - 1] + " == " + id);
    //Logger.log(sh.getRange(3, idCol).getValue())
    //Logger.log(prev[i][0])
    //Logger.log(prev[i][idCol])
    if (prev[i][idIdx + 1] == id) {
      //Logger.log("hi")
      req['row'] = prev[i][0];
      for (var j = 0; j < cols.length; j++) {
        if (cols[j]) {
          req[properties[j]] = prev[i][cols[j]];
        }
      }
      
      //Logger.log(req.row);
      info.push(req);
    }
  }
  return info;
}

function okgetPrevReq(id, currRow) {
  Logger.log("getting prev requests...");
  return id
}

function testGetPrevReq() {
  Logger.log(getPrevReq("DCC-2618-03-002"));
}

function processForm(arr, send, update, source) {
try {
  var t0 = new Date();
  var send = send || false;

  //Logger.log("processing form...");
  //Logger.log(arr);
  //Logger.log(arr[0]['value']);
  var obj = objectifyForm(arr);
  console.log(obj);

  if (typeof obj['Status'] !== 'undefined') {
    chgStatus(obj.row, obj['Status']);
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Queue");
    
  //Logger.log("Last Row: " + sh.getLastRow());
  
  var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
  var data = sh.getRange(obj.row, 1, 1, sh.getLastColumn()).getValues()[0];
  
  var uR = updateReq(oldStatus, batch, reqCode, startDate, dWFS, dFiles, office, hardDueDate, hardtime);
  var uRTransposed = {row: uR.row, id: uR.id, Status: uR.status, Date Files: uR.dFiles, Date WFS: uR.dWFS,
                    Hard Deadline: uR.hardDueDate.toDate()}
  console.log(uRTransposed);
  obj = Object.assign(uRTransposed, obj);
  console.log(obj);
  
  var newRow = headers.map(function(header, index) {
    //Logger.log("TYPE: " + typeof obj[header]);
    return typeof obj[header] !== 'undefined' ? obj[header] : data[index]
    // return obj[header] ? obj[header] : data[index];
  })
  
  //Logger.log(newRow);
  
  sh.getRange(obj.row, 1, 1, newRow.length).setValues([newRow])
  
  //console.log({statusVal: obj['Status'], statusChanged: statusChanged}); 
  
  if (send) {
    sendSummaryRow(obj.row);
  }
  
  if (update) {
    updateEventRow(obj.row);
  }
  
  var dur = new Date().getTime() - t0.getTime(); console.log({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof obj.row !== 'undefined') ? obj.row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return obj.row
} catch (e) {
    throwAlert(e, "Request not updated.");
  }
}

function doSomething() {
  Logger.log("I did something!");
}

//function processStatusModal(arr) {
//  Logger.log("I want to do something...");
//  
//  var obj = objectifyForm(arr);
//  Logger.log(obj);
//  
//  var page = "Dashboard";
//  var row = 0;
//  var html = HtmlService.createTemplateFromFile('Default');
////  if (e.parameter.page) {
////    page = e.parameter['page'];
////  }
////  if (e.parameter.row) {
////    row = e.parameter['row'];
////  }
//  // return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate();
//  var data = {page: page, row: row};
//  html.data = data;
//  // return html.evaluate().setTitle("SS Requests: " + page).getContent();
//}

function relReqAsstCounts(protocol) {
  var t0 = new Date();
  var cnts = formatCounts(countReqs(['Asgd To', 'Req Code'], ['Status', ['Cancelled']], ["Protocol Number", [protocol]]));
  var dur = new Date().getTime() - t0.getTime(); console.log({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof row !== 'undefined') ? row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return cnts
}

function getWorkComplDefaults() {
  var sh = SpreadsheetApp.openById(ssID).getSheetByName("(work compl)");
  var data = sh.getRange(2, 1, sh.getLastRow(), 4).getValues();
  var defaults = {};
  for (var d in data) {
    defaults[data[d][0]] = {workcompl: data[d][1], deliv: data[d][3]};
  }
  return defaults;
}