function getSortedReqs(direction, sortBy, stExclude) {
  var t0 = new Date();
  //Logger.log("started getSortedReqs...");
  var sortBy = sortBy || ['Hard Deadline','Preferred Deadline', 'Expected Date Files Will Be Available', 'Timestamp'];
  // Logger.log(typeof stExclude);
  if (!(stExclude === false)) {
    var stExclude = stExclude || ['Completed', 'Cancelled'];
  }
  var dir = direction == "dsc" ? -1 : 1;
  
  //Logger.log(stExclude);
  
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Queue");
  var reqs = sh.getRange(headerRows, 1, sh.getLastRow(), sh.getLastColumn()).getValues(); //.sort({column: idCol, ascending: false}).getValues();
  var headers = reqs.shift();
  
  var inds = [];
  for (var s in sortBy) {
    inds.push(getColNumByName(sh, sortBy[s]) - 1);
  }
        
  // filter out closed requests
  var stIdx = getColNumByName(sh, "Status") - 1;
  function isOpen(value) {
    return value[stIdx].length !== 0 && (stExclude ? stExclude.indexOf(value[stIdx]) < 0 : true);
  }
  //Logger.log("filtering %s records...", reqs.length - 1);
  reqs = reqs.filter(isOpen);
  //Logger.log("filtered");
  
  //Logger.log("sorting %s records...", reqs.length - 1);
  reqs.sort(function(a, b) {
    //Logger.log("a row %s, %s, %s, %s, %s", a[0].toFixed(0), a[1], a[getColNumByName(sh, "Requestor") - 1], a[getColNumByName(sh, "Protocol Number") - 1], a[getColNumByName(sh, "Req Code") - 1]);
    //Logger.log("b row %s, %s, %s, %s, %s", b[0].toFixed(0), b[1], b[getColNumByName(sh, "Requestor") - 1], b[getColNumByName(sh, "Protocol Number") - 1], b[getColNumByName(sh, "Req Code") - 1]);
  
    var sortVal;
    for (var i in inds) {
      //Logger.log("sorting by %s...", sortBy[i]);
      //Logger.log("a %s", a[inds[i]]);
      //Logger.log("b %s", b[inds[i]]);
    
      sortVal = a[inds[i]] - b[inds[i]];
      //Logger.log("sort val = %s", sortVal);
      
      if (sortVal !== 0) {
        //Logger.log('sorted! %s comes before %s!\n', sortVal ? "a" : "b", sortVal ? "b" : "a");
        return sortVal * dir;
      }
    }
  });
  //Logger.log("sorted");
  
  var sorted = [];
  for (var r in reqs) {
    //sorted.push(reqs[r].slice(0, getColNumByName(sh, "Request Overview")));
    //Logger.log("%s > %s (%s, %s, %s)", moment(reqs[r][getColNumByName(sh, "Hard Deadline") - 1]).format(sdtf), moment(reqs[r][getColNumByName(sh, "Preferred Deadline") - 1]).format(sdtf), reqs[r][0], reqs[r][1], reqs[r][getColNumByName(sh, "Requestor") - 1])
  }
  
  reqs.unshift(headers);
  rec(null, arguments.callee.name, null, null, t0);
  return reqs
}

function testGetSortedReqs() {
  Logger.log(getSortedReqs());
  //getSortedReqs('asc', ['Hard Deadline','Preferred Deadline', 'Expected Date Files Will Be Available', 'Timestamp'], ['Completed']);
}

function tesetGetSortedReqsHelper() {
  Logger.log(getRequestData(getSortedReqs(), 1, false, true, true))
}