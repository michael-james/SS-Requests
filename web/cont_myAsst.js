function showMyLoggedTime() {
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
  return data
}
