
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

  // for testing purposes
  // var email = "alicia.cagle@ert.com"

  var email = (email + "").trim();
  var firstRow = 2;
  var sh = SpreadsheetApp.openById(ssID).getSheetByName('users');
  var emails = sh.getRange(firstRow, 1, sh.getLastRow()).getValues();
  
  var row;
  for( var i = 0; i < emails.length; i++ ) {
      if( (emails[i][0] + "").trim() === email ) {
          row = i + firstRow;
          break;
      }
  }
  
  if (row) {
    var dt = sh.getRange(row, 2, 1, sh.getLastColumn() - 1).getValues();
    
    var userObj = {email: email, fname: dt[0][0], lname: dt[0][1], office: dt[0][2], asst: dt[0][3], lead: dt[0][4], admin: dt[0][5]};
    // var userObj = {email: 'alicia.cagle@ert.com', fname: 'Alicia', lname: 'Cagle', office: 'Pittsburgh', asst: null, lead: null, admin: null};
    // console.log(userObj);
    return userObj
  } else {
    var userObj = {email: email, fname: "", lname: "", office: "", asst: "", lead: "", admin: ""};
    return userObj
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