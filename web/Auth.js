function rec(page, func, row, source, dur) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Queue");
  var email = Session.getActiveUser().getEmail();
  var info = [moment().format("MM/DD/YYYY h:mm:ss a"), email || "", page || "", func || "", source || "", dur || "", row || ""];
  if (row) {
    info.push(sh.getRange(row, getColNumByName(sh, "Client")).getValue(),
              sh.getRange(row, getColNumByName(sh, "Protocol Number")).getValue(),
              sh.getRange(row, getColNumByName(sh, "Req Code")).getValue(),
              sh.getRange(row, getColNumByName(sh, "Status")).getValue());
  }
  ss.getSheetByName("[activity]").insertRowBefore(2).getRange(2, 1, 1, info.length).setValues([info]);
  
  // re-applies Column 1 filter whenever Column 1 is changed
  var filter = ss.getSheetByName("[activity]").getFilter();
  var currCriteria = filter.getColumnFilterCriteria(2);
  var newCriteria = currCriteria && filter.setColumnFilterCriteria(2, currCriteria);
  var currCriteria = filter.getColumnFilterCriteria(1);
  var newCriteria = currCriteria && filter.setColumnFilterCriteria(1, currCriteria);
}

//function user(refresh) {
//  var userProperties = PropertiesService.getUserProperties();
//  var props = userProperties.getProperties();
//  if (props && !refresh) {
//    Logger.log('got user props...');
//    Logger.log(Boolean(props.admin));
//    return props
//  } else {
//    var details = getActiveUserDetails();
//    if (details) {
//      Logger.log('setting user props...');
//      userProperties.setProperties(details);
//      return details;
//    }
//  }
//}

function user() {
  return getUserDetails(Session.getActiveUser().getEmail());
}

function getUserDetails(email) {
  var firstRow = 2;
  var sh = SpreadsheetApp.openById(ssID).getSheetByName('users');
  var emails = sh.getRange(firstRow, 1, sh.getLastRow()).getValues();
  
  var row;
  for( var i = 0; i < emails.length; i++ ) {
      if( emails[i][0] === email ) {
          row = i + firstRow;
          break;
      }
  }
  
  if (row) {
    var dt = sh.getRange(row, 2, 1, sh.getLastColumn() - 1).getValues();
    //var userObj = {email: 'alicia.cagle@ert.com', fname: 'Alicia', lname: 'Cagle', office: 'Pittsburgh', asst: null, lead: null, admin: null};
    var userObj = {email: email, fname: dt[0][0], lname: dt[0][1], office: offices[dt[0][2]], asst: dt[0][3], lead: dt[0][4], admin: dt[0][5]};
    return userObj
  } else {
    return false
  }
}

function testAuth() {
  var user = user().admin;
  Logger.log(user);
//  Logger.log(Boolean(user(true).admin));
}

//function refreshAllUsers() {
//  var firstRow = 2;
//  var sh = SpreadsheetApp.openById(ssID).getSheetByName('users');
//  var emails = sh.getRange(firstRow, 1, sh.getLastRow()).getValues();
//  
//  for( var i = 0; i < emails.length; i++ ) {
//    var details = getActiveUserDetails();
//    if (details) {
//      Logger.log('setting user props...');
//      userProperties.setProperties(details);
//      return details;
//    }
//  }
//}