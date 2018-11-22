function showMyLoggedTime() {
  var t0 = new Date();
  var sh = SpreadsheetApp.openById(ssID).getSheetByName("Queue");
  var data = getSortedReqs('dsc', null, false);
  var headers = data.shift();
  if (!user().fname) {
    throw "Not a known user.";
  }
  var fname = user().fname;
  var asgInd = getColNumByName(sh, "Asgd To") - 1;
  data = data.filter(function(row) {
    return row[asgInd] == fname;
  });
  data.unshift(headers);
  var dur = new Date().getTime() - t0.getTime(); console.log({ message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') && page, dur), func: "doGet", row: (typeof row !== 'undefined') && row, page: (typeof page !== 'undefined') && page, source: (typeof source !== 'undefined') && source, dur: dur, user: user().email});
  return data
}
