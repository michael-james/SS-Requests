

var defaultHour = 9;
var endDateOff = 0;

function createEvent(d) {
  try {
    var t0 = new Date();
    if (d.startDate && d.hardDueDate) {
      var ss = SpreadsheetApp.openById(ssID);
      var sh = ss.getSheetByName("Queue");
      var cal = CalendarApp.getCalendarById(calendarID);
      var title = 'SS Req: ' + d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode + " (" + d.status.toUpperCase() + ")";
      var desc = HtmlService.createTemplateFromFile('calDesc');
      desc.d = d;
      //Logger.log(d.startDate.hour(defaultHour).toDate() + " to " + d.hardDueDate.toDate());
      // var event = cal.createAllDayEvent(title,
      var event = cal.createEvent(title,
        d.startDate.hour(defaultHour).toDate(),
        d.hardDueDate.toDate(),
        {guests: d.email, description: desc.evaluate().getContent()});
      //Logger.log("created event " + event.getTitle());
    //  Logger.log(event.getId());
    //  Logger.log(getColNumByName(sh, "Calendar Event ID"));
      sh.getRange(d.row, getColNumByName(sh, "Calendar Event ID")).setValue(event.getId());
      ss.toast(d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode, 'Event Created');
      var dur = new Date().getTime() - t0.getTime(); console.log({ message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') && page, dur), func: "doGet", row: (typeof row !== 'undefined') && row, page: (typeof page !== 'undefined') && page, source: (typeof source !== 'undefined') && source, dur: dur, user: user().email});
    }
  } catch(e) {
    throw e
  }
}

function updateEvent(d) {
  try {
    var t0 = new Date();
    if (d.startDate && d.hardDueDate) {
      //Logger.log("updating event..." + d.client + " " + d.protocol);
      var cal = CalendarApp.getCalendarById(calendarID);
      var eventID;
      if (!(eventID = d.getByName("Calendar Event ID"))) {
        createEvent(d);
        return
      } 
      else {
        var event = cal.getEventById(eventID);
        var desc = HtmlService.createTemplateFromFile('calDesc');
        desc.d = d;
        //Logger.log(d.startDate.hour(defaultHour).toDate() + " to " + d.hardDueDate.toDate());
        event
          .setTitle('SS Req: ' + d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode + " (" + d.status.toUpperCase() + ")")
          .setDescription(desc.evaluate().getContent())
          .setTime(d.startDate.hour(defaultHour).toDate(), d.hardDueDate.toDate())
          //.setAllDayDates(d.startDate.hour(defaultHour).toDate(), d.hardDueDate.add(endDateOff, 'hour').hour(defaultHour).toDate());
        //Logger.log("updated event " + event.getTitle());
        d.ss.toast(d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode, 'Event Updated');
      }
      var dur = new Date().getTime() - t0.getTime(); console.log({ message: Utilities.formatString('perf: %s %s %sms', arguments.callee.name, (typeof page !== 'undefined') && page, dur), func: "doGet", row: (typeof row !== 'undefined') && row, page: (typeof page !== 'undefined') && page, source: (typeof source !== 'undefined') && source, dur: dur, user: user().email});
    }
  } catch(e) {
    throw e
  }
}

function updateEventRow(row) {
  return updateEvent(getRequest(row));
}

function updateEventSel() {
  //updateEvent(getSelRequest());
  getSelectedRows().forEach(updateEventByRow);
  
  function updateEventByRow(value) {
      var d = getRequest(value, false);
      updateEvent(d);
  }
}

function testCreateEvent() {
  createEvent(getRequest(20, false));
}

function testUpdateEvent() {
  updateEvent(getRequest(20, false));
}

function testTime() {
  //loadMoment();
  //loadMomentTimeZone();
  //eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js').getContentText());
  //eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.23/moment-timezone-with-data.min.js').getContentText());
//  var date = moment().format("MMM Do YY hh:mm z");
//  Logger.log(date);
  
  // yyyy-MM-dd'T'HH:mm:ss'Z'
  
  var d = getRequest(20, false);
  //moment.tz.setDefault("America/New_York");
  var m = moment();
  Logger.log(d.timestamp);
  Logger.log(m.format());
  Logger.log(m.format("dddd, MMMM D"));
  Logger.log(m.format("dddd, MMMM Do, YYYY h:mm a"));
  Logger.log(m.tz("America/New_York").format("dddd, MMMM Do, YYYY h:mm a z"));
  
//  var dtf = "EEEE, MMMM d h:mm a"; // fix time zone
//  var tz = "GMT";
//  var t = Utilities.formatDate(d.timestamp, tz, dtf) || "";
//  Logger.log(t);
  
//  var newTime = moment.tz("2013-11-18 11:55", "America/New York");
//  Logger.log(newTime.format("MMM Do YY hh:mm"));
}

function testDates() {
  var d = getRequest(20, false);
  Logger.log('\n' + d.hardDue + '\n' + d.prefDue + '\n' + d.start);
}