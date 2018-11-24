///////////////////////////////////////////////
// Basic Variables
///////////////////////////////////////////////

var headerRows = 3;

var statuses = {
  "RCD": "Received",
  "WFS": "Waiting for Start",
  "NIF": "Needs Information",
  "REV": "Reviewed",
  "ASG": "Assigned",
  "INP": "In-progress",
  "UNR": "Unresolved Issues",
  "PND": "Pending Confirmation",
  "ONH": "On-hold",
  "CPL": "Completed",
  "CAN": "Cancelled"
}

var types = {
  "enV1": "enUS v1.00",
  "enCR": "enUS corrections",
  "FLv1": "foreign language v0.01",
  "FLCR": "foreign language corrections",
  "v1CR": "foreign language v0.01 and corrections",
  "OTH": "other"
}

var offices = {
  "PGH": "Pittsburgh",
  "PHL": "Philadelphia",
  "BOS": "Boston",
  "GNV": "Geneva"
}

///////////////////////////////////////////////
// Date Formats
///////////////////////////////////////////////

var ERTdf = "DDMMMYYYY"; // 3Oct18

var sdf = "MMM D"; // Oct 3
var sdtf = "MMM D, ha"; // Oct 3, 9a

var df = "ddd, MMM D"; // Thurs, Oct 3
var dfo = "ddd, MMM Do"; // Thurs, Oct 3
var tf = "h:mm a"; // 3:44 pm
var dtf = "ddd, MMM D, h:mm a"; // Thurs, Oct 3, 3:44 pm
var dtfo = "ddd, MMM Do, h:mm a"; // Thurs, Oct 3, 3:44 pm

var ldf = "dddd, MMMM Do"; // Thursday, October 3rd
var ldtf = "dddd, MMMM Do h:mm a"; // Thursday, October 3rd 3:44 pm

var dfform = "YYYY-MM-DD";
var dffiles = "YYYY.MM.DD";

///////////////////////////////////////////////

function onOpen() {
  Logger.log("opening...");
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Requests')
      .addSubMenu(ui.createMenu('Send')
          .addItem('Request update(s)', 'sendSelectedSummary')
          .addSeparator()
          .addItem('New request notification(s)', 'sendSelectedNewRequest'))
      .addItem('Update event(s)', 'updateEventSel')
      .addSeparator()
      .addItem('Add task(s)', 'addTasksForSelected')
//      .addSubMenu(ui.createMenu('Sort')
//          .addItem('By Status/Timestamp', 'sortRequestsStatusRec')
//          .addItem('By Hard Date/Pref Date/Timestamp', 'sortRequestsTime'))
//      .addSeparator()
      .addItem('Set new ID', 'setIDSel')
      .addToUi();
}

function loadMoment() {
  var javascript = HtmlService
       .createTemplateFromFile("moment").getRawContent();
  eval(javascript);
}

function loadMomentTimeZone() {
  var javascript = HtmlService
       .createTemplateFromFile("moment-timezone").getRawContent();
  eval(javascript);
}
 
loadMoment();
loadMomentTimeZone();