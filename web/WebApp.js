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

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Queue");

  var obj = objectifyForm(arr);
  // console.log(obj);
  // console.log("obj.row is '%s' so it's not %s", obj.row, !obj.row);
  if (obj.row) {
    if (typeof obj['Status'] !== 'undefined') {
      chgStatus(obj.row, obj['Status']);
    }
    var data = sh.getRange(obj.row, 1, 1, sh.getLastColumn()).getValues()[0];
  } else {
    obj['Email Address'] = user().email;
    obj['office'] = user().office;
    obj['Timestamp'] = new Date();
  }

  // console.log(obj);
  
  var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
  var newRow = headers.map(function(header, index) {
    var base;
    if (obj.row) {
      base = data[index];
    } else {
      base = "";
    }

    return typeof obj[header] !== 'undefined' ? obj[header] : base;
  });

  if (!newRow[getColNumByName(sh, "row") - 1]) { 
    newRow[getColNumByName(sh, "row") - 1] = SpreadsheetApp.openById(ssID).getSheetByName('Queue').getLastRow() + 1;
  }
  
  var uR = updateReq(newRow[getColNumByName(sh, "row") - 1],
                     newRow[getColNumByName(sh, "ID") - 1],
                     newRow[getColNumByName(sh, "Status") - 1],
                     newRow[getColNumByName(sh, "Batch #") - 1],
                     newRow[getColNumByName(sh, "Req Code") - 1],
                     newRow[getColNumByName(sh, "Expected Date Files Will Be Available") - 1],
                     newRow[getColNumByName(sh, "Date WFS") - 1],
                     newRow[getColNumByName(sh, "Date Files") - 1],
                     newRow[getColNumByName(sh, "Your Office") - 1],
                     newRow[getColNumByName(sh, "Hard Deadline") - 1],
                     newRow[getColNumByName(sh, "Hard Deadline Time") - 1]);
  // console.log(uR);
  var uRTransposed = {ID: uR.id && uR.id,
                      Status: uR.status && uR.status,
                      'Date Files': uR.dFiles && uR.dFiles,
                      'Date WFS': uR.dWFS && uR.dWFS,
                      'Hard Deadline': uR.hardDueDate && uR.hardDueDate.toDate()};
  // console.log(uRTransposed);

  var updRow = headers.map(function(header, index) {
    return typeof uRTransposed[header] !== 'undefined' ? uRTransposed[header] : newRow[index]
  })

  var row = updRow[getColNumByName(sh, "row") - 1];

  if (obj.row) {
    console.log('...updating existing row %s', obj.row);
    sh.getRange(obj.row, 1, 1, newRow.length).setValues([updRow])
  } else {
    console.log('...appending new row %s', updRow[0]);
    sh.appendRow(updRow)

    // // copy prediction formulas
    // var predWkbksCol = getColNumByName(sh, "Pred. Wkbk. Cnt.");
    // var predWkbksFormula = sh.getRange(2, predWkbksCol).getFormula();
    // sh.getRange(sh.getLastRow(), predWkbksCol).setFormula(predWkbksFormula);
    // var predHrsCol = getColNumByName(sh, "Pred. Wkbk. Cnt.");
    // var predHrsFormula = sh.getRange(2, predHrsCol).getFormula();
    // sh.getRange(sh.getLastRow(), predHrsCol).setFormula(predHrsFormula);
  }
  
  if (send || update) {
    var d = getRequest(row);

    if (send) {
      sendSummary(d);
    }
    
    if (update) {
      updateEvent(d);
    }
  }
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof row !== 'undefined') ? row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return row
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
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof row !== 'undefined') ? row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
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