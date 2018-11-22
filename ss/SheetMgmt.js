function onEdit(e) {
  var sheet = e.range.getSheet();
  var columnOfCellEdited = e.range.getColumn();
  //Logger.log(e.value);
  //Logger.log(e.range.getA1Notation());
  var stCol = getColNumByName(sheet, "Status");
  
  if (columnOfCellEdited == stCol && sheet.getName() == "Queue") {// Column 1 is Column A
    var row = e.range.getRow();
    var today = new Date();
    //Logger.log(sheet.getRange(row, 3).getValues()[0][0]);
        
    switch (e.value) {
      case "Assigned":
        //addTask(getRequest(e.range.getRow()));
        break;
      case "In-progress":
        var c = sheet.getRange(row, getColNumByName(sheet, "Date Strtd"));
        if (!c.getValue()) {c.setValue(today);}
        break;
      case "Unresolved Issues":
        var c = sheet.getRange(row, getColNumByName(sheet, "Date First Rtrnd"));
        if (!c.getValue()) {c.setValue(today);}
        var c = sheet.getRange(row, getColNumByName(sheet, "Date Rtrnd w/ Issues"));
        if (!c.getValue()) {c.setValue(today);}
        break;
      case "Pending Confirmation":
        var c = sheet.getRange(row, getColNumByName(sheet, "Date First Rtrnd"));
        if (!c.getValue()) {c.setValue(today);} 
        var c = sheet.getRange(row, getColNumByName(sheet, "Date Pend Conf"));
        if (!c.getValue()) {c.setValue(today);}
        break;
      case "Completed":
        var c = sheet.getRange(row, getColNumByName(sheet, "Date Cmpld"));
        if (!c.getValue()) {c.setValue(today);}
        break;
      case "On-hold":
        var c = sheet.getRange(row, getColNumByName(sheet, "Date First Rtrnd"));
        if (!c.getValue()) {c.setValue(today);}
        var c = sheet.getRange(row, getColNumByName(sheet, "Date On-hold"));
        if (!c.getValue()) {c.setValue(today);}
        break;
    }
  
      // re-applies Column 1 filter whenever Column 1 is changed
      var filter = sheet.getFilter();
      var currCriteria = filter.getColumnFilterCriteria(stCol);
      var newCriteria = filter.setColumnFilterCriteria(stCol, currCriteria);
      
      //Logger.log("are we going to sort?");
      //sortRequests();
  };
};

///**
// * Creates a trigger for when a spreadsheet is edited.
// */
//function createSpreadsheetEditTrigger() {
//  var ss = SpreadsheetApp.getActive();
//  ScriptApp.newTrigger('onEditAdv')
//      .forSpreadsheet(ss)
//      .onEdit()
//      .create();
//}

function onEditAdv(e) {
  var sheet = e.range.getSheet();
  var columnOfCellEdited = e.range.getColumn();
  
  if (columnOfCellEdited == getColNumByName(sheet, "Status") && sheet.getName() == "Queue") {// Column 1 is Column A
    var row = e.range.getRow();
    var d = getRequest(row);
        
    switch (e.value) {
      case "Assigned":
        addTask(d);
        break;
      case "Unresolved Issues":
        sendSummaryAlert(d);
        break;
      case "Pending Confirmation":
        sendSummaryAlert(d);
        break;
      case "On-hold":
        sendSummaryAlert(d);
        break;
    }
    
    updateEvent(d);
  }
}

function sortRequestsStatusRec(){
  var ss=SpreadsheetApp.getActive();
  var sh=ss.getSheetByName('Queue');
  var sortCol1 = "Status";
  var sortCol2 = "Timestamp";
  var sortObj={'Pending Confirmation':1,'Unresolved Issues':2,'In-progress':3,'Assigned':4,'Reviewed':5,'Needs Information':6,'Received':7, 'Waiting for Start':8, 'On-hold':9, 'Completed':10};
  
  var rows=sh.getLastRow() + headerRows;
  var cols=sh.getLastColumn();//sort column
  //Logger.log({headerRows: headerRows, columnToSortBy: getColNumByName(sh, sortCol1), rows: rows, cols: cols});
  var rg=sh.getRange(headerRows + 1, getColNumByName(sh, sortCol1),rows, 1);
  var v1=rg.getValues();
  var col=[];
  for(var i=0;i<v1.length;i++){
    col.push([sortObj[v1[i]]]);
  }
  sh.getRange(headerRows + 1,cols + 1,rows,1).setValues(col);
  sh.getRange(headerRows + 1,1,rows,sh.getLastColumn())
    .sort([{column:getColNumByName(sh, sortCol2),ascending: true}]) // regular sort
    .sort([{column:sh.getLastColumn(),ascending: true}]) // custom sort
  sh.deleteColumn(sh.getLastColumn());

//  var vf=sh.getDataRange().getValues();
//  for(var i=0; i < vf.length; i++){
//    vf[i].splice(vf[i].length-1,1);
//  }
//  Logger.log(vf.length);
//  sh.clear();
//  var df = sh.getRange(1, 1, rows + headerRows, cols).getValues();
//  Logger.log(df.length);
//  sh.getRange(1, 1, rows + headerRows, cols).setValues(vf);

  ss.toast('Sorted by: ' + sortCol1 + ", " + sortCol2,'Sort Complete');
}

function sortRequestsTime(){
  var ss=SpreadsheetApp.getActive();
  var sh=ss.getSheetByName('Queue');
  var sortCol1 = "Hard Deadline";
  var sortCol2 = "Preferred Deadline";
  var sortCol3 = "Expected Date Files Will Be Available";
  var sortCol4 = "Timestamp";
  var sortObj={'Pending Confirmation':1,'Unresolved Issues':2,'In-progress':3,'Assigned':4,'Reviewed':5,'Needs Information':6,'Received':7, 'Waiting for Start':8, 'On-hold':9, 'Completed':10};
  
  var rows=sh.getLastRow() + headerRows;
  //Logger.log("last column: " + sh.getLastColumn());
  sh.getRange(headerRows + 1,1,rows,sh.getLastColumn() - 1) // doesn't wort last column
    .sort([{column:getColNumByName(sh, sortCol1),ascending: true}, {column:getColNumByName(sh, sortCol2),ascending: true},
    {column:getColNumByName(sh, sortCol3),ascending: true}, {column:getColNumByName(sh, sortCol4),ascending: true}]) // regular sort
    
  ss.toast('Sorted by: ' + sortCol1 + ", " + sortCol2 + ", " + sortCol3 + ", " + sortCol4,'Sort Complete');
}