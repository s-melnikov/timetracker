import { dateToFormatString, timeSpetnToString, ls } from './utils';

let nextTaskId = 1;
let nextTimestampId = 1;

let _tasks, _timestamps;

if ((_tasks = ls('tasks')) && (_timestamps = ls('timestamps'))) {
  nextTaskId = _tasks.pop().id + 1;
  nextTimestampId = _timestamps.pop().id + 1;
}

const getLatestDaysTasks = ({ latestTasks, timestamps }) => {
  let daysTasks = [];
  latestTasks.slice().reverse().forEach(task => {
    if (task.id === 0) return;
    task = Object.assign(task);
    let date = new Date(task.lastTimestamp);
    let day = dateToFormatString(date, 'd.m D');
    let dayTasks = daysTasks.find(_dayTasks => _dayTasks.day === day);
    if (!dayTasks) {
      dayTasks = {
        day,
        tasks: []
      };
      daysTasks.push(dayTasks);
    }
    dayTasks.tasks.push(task);
    dayTasks.lastTimestamp = task.lastTimestamp;
  });
  daysTasks.forEach(dayTasks => {
    let now = Date.now();
    let date = new Date(dayTasks.lastTimestamp);
    let fromTime, toTime;
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    fromTime = date.getTime();
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    toTime = date.getTime();
    let dayTimestamps = timestamps.filter(({
      timestamp
    }) => (timestamp > fromTime && timestamp < toTime));
    if (now > fromTime && now < toTime) {
      dayTasks.current = true;
    }
    dayTasks.timeStart = 0;
    dayTasks.timeSpent = 0;
    dayTimestamps.map((timestamp, i) => {
      let skiped = timestamp.task === 0;
      let nextTimestamp = dayTimestamps[i + 1];
      if (!skiped && dayTasks.timeStart === 0) {
        dayTasks.timeStart = timestamp.timestamp;
      }
      if (nextTimestamp) {
        if (!skiped) {
          dayTasks.timeSpent += nextTimestamp.timestamp - timestamp.timestamp;
        }
      } else {
        dayTasks.timeEnd = timestamp.timestamp;
        if (dayTasks.current && !skiped) {
          dayTasks.timeSpent += now - timestamp.timestamp
        }
      }
    });
  });
  return daysTasks;
};

const init = () => (state, { getLatestTasks }) => getLatestTasks();

const startNewTask = () => ({ tasks, timestamps, latestTasks}, { sync }) => {
  const now = Date.now();
  const newTask = {
    id: nextTaskId,
    title: `New task #${nextTaskId++}`
  };
  const newTimestamp = {
    id: nextTimestampId++,
    task: newTask.id,
    timestamp: now
  };
  latestTasks.map((task, i) => {
    if (task.current) {
      task.timeSpent += (now - task.lastTimestamp);
      delete task.current;
    }
  });
  requestIdleCallback(sync);
  tasks = [...tasks, newTask];
  timestamps = [...timestamps, newTimestamp];
  latestTasks = [...latestTasks, Object.assign({
    timeStart: now,
    timeSpent: 0,
    lastTimestamp: now,
    current: true
  }, newTask)];
  let daysTasks = getLatestDaysTasks({
    latestTasks,
    timestamps
  });
  return {
    tasks,
    timestamps,
    latestTasks,
    daysTasks,
  };
};
init, startNewTask, startTask
const startTask = id => ({ timestamps, latestTasks }, { sync }) => {
  const now = Date.now();
  const newTimestamp = {
    id: nextTimestampId++,
    task: id,
    timestamp: now
  };
  const targetTask = latestTasks.find(task => task.id === id);
  latestTasks.splice(latestTasks.indexOf(targetTask), 1);
  latestTasks.forEach(task => {
    if (task.current) {
      task.timeSpent += (now - task.lastTimestamp);
      delete task.current;
    }
    return task;
  });
  targetTask.current = true;
  targetTask.lastTimestamp = now;
  timestamps = [...timestamps, newTimestamp];
  latestTasks = [...latestTasks, targetTask];
  const daysTasks = getLatestDaysTasks({
    latestTasks,
    timestamps
  });
  requestIdleCallback(sync);
  return {
    timestamps,
    latestTasks,
    daysTasks
  };
};

const getLatestTasks = () => ({ tasks, timestamps }) => {
  const now = Date.now();
  const oldest = now - 14 * 24 * 60 * 60 * 1000;
  const lastTimestamps = timestamps.filter(timestamp => timestamp.timestamp > oldest || !timestamp.task);
  const latestTasks = [];
  lastTimestamps.forEach((timestamp, i) => {
    const nextTimestamp = lastTimestamps[i + 1];
    let task = latestTasks.find(_task => _task.id === timestamp.task);
    if (task) {
      latestTasks.splice(latestTasks.indexOf(task), 1);
    } else {
      task = Object.assign({
        timeStart: timestamp.timestamp,
        timeSpent: 0
      }, tasks.find(_task => _task.id === timestamp.task));
    }
    latestTasks.push(task);
    if (nextTimestamp) {
      task.timeSpent += (nextTimestamp.timestamp - timestamp.timestamp);
      task.lastTimestamp = timestamp.timestamp;
    } else {
      task.timeSpent += (now - timestamp.timestamp);
      task.lastTimestamp = now;
      task.current = true;
    }
  });
  let daysTasks = getLatestDaysTasks({
    latestTasks,
    timestamps
  });
  return {
    latestTasks,
    daysTasks
  };
};

const makeTaskEditable = id => ({ latestTasks }) => {
  const task = latestTasks.find(task => task.id === id);
  task.editable = true;
  return { latestTasks };
};

const editTitle = ({ id, title }) => ({ latestTasks }) => {
  const task = latestTasks.find(task => task.id === id);
  task.title = title;
  return { latestTasks };
};

const saveTitle = id => ({ tasks, latestTasks }, { sync }) => {
  const task = latestTasks.find(task => task.id === id);
  task.editable = false;
  const _task = tasks.find(task => task.id === id);
  _task.title = task.title;
  requestIdleCallback(sync);
  return { latestTasks };
};

const sync = () => ({ tasks, timestamps }) => {
  ls('tasks', tasks);
  ls('timestamps', timestamps);
};

const showTaskInfo = id => ({ latestTasks }) => {
  const task = Object.assign({}, latestTasks.find(t => t.id === id));
  task.lastTimestamp = new Date(task.lastTimestamp).toUTCString();
  task.timeStart = new Date(task.timeStart).toUTCString();
  task.timeSpent = timeSpetnToString(task.timeSpent);
  console.log(task);
};

const showTaskTimestamps = id => ({ timestamps }) => {
  const taskTimestamps = timestamps
    .filter(timestamp => timestamp.task === id)
    .map(timestamp => Object.assign({}, timestamp, {
      timestamp: new Date(timestamp.timestamp).toUTCString()
    }));
  console.log(taskTimestamps);
}

export default {  
  init,
  startNewTask,
  startTask,
  getLatestTasks,
  makeTaskEditable,
  editTitle,
  saveTitle,
  sync,
  showTaskInfo,
  showTaskTimestamps,
};
