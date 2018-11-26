function arrayDailyWkbks() {
  var sh = SpreadsheetApp.openById(ssID).getSheetByName('Pivot Table - Daily Wkbks');
  var data = sh.getRange(3, 1, sh.getLastRow() - 3, sh.getLastColumn()).getValues();
  data.unshift([{label: 'Due Date', type: 'string'},
                {label: 'enCR', type: 'number'},
                {label: 'enV1', type: 'number'},
                {label: 'FLCR', type: 'number'},
                {label: 'FLv1', type: 'number'},
                {label: 'OTH', type: 'number'},
                {label: 'v1CR', type: 'number'},
                {type: 'number', role: 'annotation'}]); //
  return JSON.stringify(data);
}

function testArrayDailyWkbks() {
  Logger.log(arrayDailyWkbks());
}

function arrayCalendar() {
  var sh = SpreadsheetApp.openById(ssID).getSheetByName('Pivot Table - Daily Wkbks');
  var data = sh.getRange(3, 1, sh.getLastRow() - 3, sh.getLastColumn()).getValues();
  var out = ([[{label: 'Due Date', type: 'date', id: 'Date'},
                {label: 'Workbooks', type: 'number', id: 'Won/Loss'}]]);
  for (var r in data) {
//    Logger.log(data[r][0]);
    var dt = data[r][0];
    Logger.log("%s-%s-%s", dt.substring(0, 4), dt.substring(5, 7), dt.substring(8, 10));
    out.push([new Date(dt.substring(0, 4), dt.substring(5, 7) - 1, dt.substring(8, 10)), data[r][7]]);
  }
 Logger.log(out);
  return JSON.stringify(out);
}

function arrayTimeline() {
  var sh = SpreadsheetApp.openById(ssID).getSheetByName('Queue');
//  var data = getSortedReqs(null, null, ['Cancelled']);
  var data = getSortedReqs();
  var cols = ["ID", "Expected Date Files Will Be Available", "Date Files", "Hard Deadline", "Requestor", "Act. Wkbk. Cnt.", "Pred. Wkbk. Cnt."];
  var inds = [];
  for (var s in cols) {
    inds.push(getColNumByName(cols[s]) - 1);
  }
  
  var arr = [];
  for (var r = 1; r < data.length; r++) {
    var lbl = data[r][inds[4]].split(" ")[0] + ' (' + (data[r][inds[5]] || data[r][inds[6]] && ("~" + data[r][inds[6]].toFixed(0))) + ")";
//    Logger.log(lbl);
    var row = [data[r][inds[0]], lbl, data[r][inds[2]] ? data[r][inds[2]] : (data[r][inds[1]] && data[r][inds[1]]), data[r][inds[3]]];
    arr.push(row);
  }
//  Logger.log(arr);
  return JSON.stringify(arr);
}