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

var sources = {
  0: 'Edit',
  1: 'Perform',
  2: 'Files Ready',
  3: 'Review',
  4: 'Feedback'
}

function processForm(arr, source) {
  var source = (typeof source !== 'undefined') ? source : null;
// try {
  var t0 = new Date();
  var send = send || false;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Queue");

  var obj = objectifyForm(arr);
  var headers = sh.getRange(headerRows, 1, 1, sh.getLastColumn()).getValues()[0];
  
  if (obj.row) {
    var data = sh.getRange(obj.row, 1, 1, sh.getLastColumn()).getValues()[0];
  } else {
    obj['Email Address'] = user().email;
    obj['office'] = user().office;
    obj['Timestamp'] = new Date();
  }

  var newRow = headers.map(function(header, index) {
    var base;
    if (obj.row) {
      base = data[index];
    } else {
      base = "";
    }

    if (typeof obj[header] == 'undefined') {
      return base
    } else {

      if (obj[header] && ((obj.row && typeof data[index] == 'object' && typeof obj[header] == 'string') || (header == "Expected Date Files Will Be Available" || header == "Preferred Deadline" || header == "Exp First Rtrn Date"))) {
        console.log("%s: %s", header, obj[header], typeof obj[header], obj[header].length)
        // console.log("header: %s, orig: %s (type %s), upd: %s (type %s)", header, data[index], typeof data[index], obj[header], typeof obj[header]);
        // (header == "Expected Date Files Will Be Available" || header == "Preferred Deadline" || header == "Exp First Rtrn Date"))
        // console.log("%s was changed but SHOULD be a DATE", header);
        var badDate = obj[header];
        var newDate = new Date(badDate.substring(0, 4), badDate.substring(5, 7) - 1, badDate.substring(8, 10));
        // console.log("%s new date: %s", header, newDate);
        return newDate

      } else {
        // console.log("%s was submitted", header);
        return obj[header]
      }
    }
  });

  var rowIdx = getColNumByNameData(headers, "row") - 1;
  if (!newRow[rowIdx]) { 
    newRow[rowIdx] = parseInt(SpreadsheetApp.openById(ssID).getSheetByName('Queue').getLastRow()) + 1;
  } else {
    newRow[rowIdx] = parseInt(newRow[rowIdx]);
  }
  
  var uR = updateReq(newRow[getColNumByNameData(headers, "row") - 1],
                     newRow[getColNumByNameData(headers, "ID") - 1],
                     newRow[getColNumByNameData(headers, "Status") - 1],
                     newRow[getColNumByNameData(headers, "Client") - 1],
                     newRow[getColNumByNameData(headers, "Protocol Number") - 1],
                     newRow[getColNumByNameData(headers, "Batch #") - 1],
                     newRow[getColNumByNameData(headers, "Req Code") - 1],
                     newRow[getColNumByNameData(headers, "Expected Date Files Will Be Available") - 1],
                     newRow[getColNumByNameData(headers, "Date WFS") - 1],
                     newRow[getColNumByNameData(headers, "Date Files") - 1],
                     newRow[getColNumByNameData(headers, "Your Office") - 1],
                     newRow[getColNumByNameData(headers, "Hard Deadline") - 1],
                     newRow[getColNumByNameData(headers, "Hard Deadline Time") - 1]);
  // console.log(uR);
  var uRTransposed = {ID: uR.id && uR.id,
                      Status: uR.status && uR.status,
                      'Date Files': uR.dFiles && uR.dFiles,
                      'Date WFS': uR.dWFS && uR.dWFS,
                      'Hard Deadline': uR.hardDueDate && uR.hardDueDate.toDate()};
  // console.log(uRTransposed);

  var chgdCols = {};

  var updRow = headers.map(function(header, index) {
    var val = (typeof uRTransposed[header] !== 'undefined') ? uRTransposed[header] : newRow[index]

    if (obj.row) {
      if (typeof data[index] == 'object' && typeof val == 'object') {
        if (data[index].toString() !== val.toString()) {
          chgdCols[index] = {old: data[index], upd: val, header: header};  
        }
      } else if (typeof data[index] == 'number' && typeof val !== 'number') {
        if (data[index] !== parseInt(val)) {
          chgdCols[index] = {old: data[index], upd: val, header: header};  
        }
      } else if (data[index] !== val) {
        console.log("%s: %s (type %s), %s (type %s)", header, data[index], typeof data[index], val, typeof val);
        chgdCols[index] = {old: data[index], upd: val, header: header};  
      }
    }

    return val
  });

  // console.log(data);
  // console.log(newRow);
  // console.log(updRow);
  // console.log(chgdCols);
  // console.log(Object.keys(chgdCols).length);

  var row = updRow[getColNumByName(sh, "row") - 1];
  var d = getRequestData([headers, updRow]);

  if (obj.row) {
    console.log('...updating existing row %s', obj.row);
    sh.getRange(obj.row, 1, 1, newRow.length).setValues([updRow])

    // status changed
    console.log("source is #%s %s", source, sources[source]);
    var statusIdx = getColNumByNameData(headers, "Status") - 1;
    
    if (data[statusIdx] !== updRow[statusIdx]) {
      console.log("...status is different...going to chgStatus")
      chgStatus(obj.row, obj['Status'], data[statusIdx], d);
    }


    // var expRetDateIdx = getColNumByNameData(headers, "Exp First Rtrn Date") - 1;
    // console.log(expRetDateIdx);
    // console.log(Object.keys(chgdCols));
    // console.log(Object.keys(chgdCols).indexOf(expRetDateIdx + ""));
    // console.log(Object.keys(chgdCols).indexOf(expRetDateIdx + "") > -1);

    // assistant wanted to send an update
    if (source == 1 || (source == 3 && (Object.keys(chgdCols).indexOf(expRetDateIdx + "") > -1))) {
      console.log("...source is Review or Perform...sending asst update")
      sendEmail(d, 1, chgdCols);
    
    // request was edited by TC with form
    } else if ((source == 0 || source == 2 || source == 4) && !user().asst) {
      console.log("...source is edit...checking if something changed")

      // something was changed during the edit
      if (Object.keys(chgdCols).length) {
        console.log("...something changed...sending email")
        // var chgdCols = {};
        // for (var h = 0; h < headers.length; h++) {
        //   console.log("header idx %s, header %s, old %s, new %s, same? %s", h, headers[h], data[h], updRow[h], data[h] == updRow[h])
        //   if (data[h] !== updRow[h]) {
        //     console.log("updated %s property: %s (type %s)", headers[h], updRow[h], typeof updRow[h]);
        //     chgdCols[parseInt(h)] = {old: data[h]};
        //   //   chgdCols[parseInt(h)] = {old: data[h], new: updRow[h], same: data[h] == updRow[h]};
        //   }
        // }
        console.log(chgdCols);
        // var old = getRequestData([headers, data]);
        sendEmail(d, 2, chgdCols);
      }
    }
  } else {
    console.log('...appending new row %s', updRow[0]);
    sh.appendRow(updRow);
  
    sendEmail(d, 0);

    // // copy prediction formulas
    // var predWkbksCol = getColNumByName(sh, "Pred. Wkbk. Cnt.");
    // var predWkbksFormula = sh.getRange(2, predWkbksCol).getFormula();
    // sh.getRange(sh.getLastRow(), predWkbksCol).setFormula(predWkbksFormula);
    // var predHrsCol = getColNumByName(sh, "Pred. Wkbk. Cnt.");
    // var predHrsFormula = sh.getRange(2, predHrsCol).getFormula();
    // sh.getRange(sh.getLastRow(), predHrsCol).setFormula(predHrsFormula);
  }

  updateEvent(d);
  
  var dur = new Date().getTime() - t0.getTime(); console.info({ type: 'perf', message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') ? page : '', dur), func: "doGet", row: (typeof row !== 'undefined') ? row : '', page: (typeof page !== 'undefined') ? page : '', source: (typeof source !== 'undefined') ? source : '', dur: dur, user: user().email});
  return row
// } catch (e) {
//     throwAlert(e, "Request not updated.");
//   }
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