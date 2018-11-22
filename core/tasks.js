
/**
 * Lists tasks titles and IDs.
 */
function listTaskLists() {
  var taskLists = Tasks.Tasklists.list();
  if (taskLists.items) {
    for (var i = 0; i < taskLists.items.length; i++) {
      var taskList = taskLists.items[i];
      Logger.log('Task list with title "%s" and ID "%s" was found.',
                 taskList.title, taskList.id);
    }
  } else {
    Logger.log('No task lists found.');
  }
}

/**
 * Adds a task to a tasklist.
 * @param {string} taskListId The tasklist to add to.
 */
function addTask(d) {
  //Logger.log('adding task...');
  var t0 = new Date();
  var ss = SpreadsheetApp.openById(ssID);
  var sh = ss.getSheetByName("Queue");
  
  var task = {
    title: d.protocol + (d.batch && (' B' + d.batch)) + ' - ' + d.reqCode,
    notes: d.client + ' (' + d.requestorNames[0] + ' ' + d.requestorNames[1][0] + '.)',
    due: ISODateString(d.hardDueDate.toDate())
  };
  task = Tasks.Tasks.insert(task, taskListID);
 // Logger.log('Task with ID "%s" was created.', task.id);
  sh.getRange(d.row, getColNumByName(sh, "Task ID")).setValue(task.id);
  rec(null, arguments.callee.name, d.row, null, t0);
}

function testAddTask() {
  addTask(getRequest(33, false));
}

function addTasksForSelected() {
  getSelectedRows().forEach(addTaskByRow);
  
  function addTaskByRow(value) {
      var d = getRequest(value, false);
      d.ss.toast(d.client + ' ' + d.protocol,'Adding task...');
      if (d.asst) {
        addTask(d);
        d.ss.toast(d.client + ' ' + d.protocol + (d.batch && (' Batch ' + d.batch)) + ' - ' + d.reqCode + ' - Due: ' + d.hardDue, 'Task Added');
      } else {
        ss.toast(d.client + ' ' + d.protocol + ' not assigned to anyone.','Task Not Added');
      }
  }
}