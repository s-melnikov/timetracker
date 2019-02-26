import { ls } from './utils';

export default {
  tasks: ls('tasks') || [{
    id: 0,
    title: '[Ignored task]'
  }],
  timestamps: ls('timestamps') || [{
    id: 0,
    task: 0,
    timestamp: 0
  }],
  latestTasks: [],
  daysTasks: []
};