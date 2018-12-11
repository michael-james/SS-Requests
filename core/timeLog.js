function getReqTimeLogs(req) {
	var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("timeLog");
	var data = sh.getDataRange().getValues();

	var total = 0;

	var filtered = data.filter(function(log) {
		if (log[0] == req) {
			total += (log[2] - log[1]) / (60*60*1000);
			return true
		} else {
			return false
		}
	});

	return {entries: filtered, total: total}
}