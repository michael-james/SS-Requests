function rec(page, func, row, source, t0) {
  var dur;
  if (t0) {
    dur = new Date().getTime() - t0.getTime();
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Queue");
  var email = Session.getActiveUser().getEmail();

  var info = [moment().format("MM/DD/YYYY h:mm:ss a"), email || "", page || "", func || "", source || "", dur || "", row || ""];
  if (row) {
    info.push(sh.getRange(row, getColNumByName("Client")).getValue(),
              sh.getRange(row, getColNumByName("Protocol Number")).getValue(),
              sh.getRange(row, getColNumByName("Req Code")).getValue(),
              sh.getRange(row, getColNumByName("Status")).getValue());
  }
  ss.getSheetByName("[activity]").insertRowBefore(2).getRange(2, 1, 1, info.length).setValues([info]);
  
  // re-applies Column 1 filter whenever Column 1 is changed
  var filter = ss.getSheetByName("[activity]").getFilter();
  var currCriteria = filter.getColumnFilterCriteria(2);
  var newCriteria = currCriteria && filter.setColumnFilterCriteria(2, currCriteria);
  var currCriteria = filter.getColumnFilterCriteria(1);
  var newCriteria = currCriteria && filter.setColumnFilterCriteria(1, currCriteria);
}