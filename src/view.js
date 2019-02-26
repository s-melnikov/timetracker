import { h } from "hyperapp";
import { toTimeString, timeSpetnToString } from "./utils";

const TimeSpent = ({ timeSpent, active }) => {
  let clear = element => element.$clearInterval && element.$clearInterval();
  return (
    <span
      oncreate={element => {
        clear(element);
        if (active) TimeSpent.timer(element, timeSpent);
      }}
      onupdate={element => {
        clear(element);
        if (active) {
          TimeSpent.timer(element, timeSpent);
        }
      }}
      onremove={clear}
    >
      {timeSpetnToString(timeSpent)}
    </span>
  );
};

TimeSpent.timer = (element, time) => {
  let last = Date.now();
  let $interval = setInterval(() => {
    let now = Date.now();
    time += now - last;
    last = now;
    element.textContent = timeSpetnToString(time);
  }, 1000);
  element.$clearInterval = () => clearInterval($interval);
};

const TasksDayView = ({ tasks }) => (state, { startTask, makeTaskEditable, editTitle, saveTitle, showTaskInfo, showTaskTimestamps }) => (
  <div class="tasks_list">
    {tasks.map(({ id, title, timeStart, timeSpent, current, editable }) => {
      if (!id) return null;
      timeStart = new Date(timeStart);
      return (
        <div class={`task${current ? " current" : ""}`}>
          <div class="task-inner flex">
            <div class="btns">
              {
                current ? (
                  <button
                    class="btn btn-sm btn-warning"
                    onclick={() => startTask(0)}
                  >
                    stop
                  </button>
                ) : (
                    <button
                      class="btn btn-sm btn-primary"
                      onclick={() => startTask(id)}
                    >
                      start
                  </button>
                  )
              }
            </div>
            <div
              class="task_title"
              title={title}
              ondblclick={() => makeTaskEditable(id)}
            >
              {
                editable ? (
                  <input
                    class="input"
                    oninput={e => editTitle({ id, title: e.target.value })}
                    onkeyup={e => e.key === "Enter" && saveTitle(id)}
                    onblur={e => saveTitle(id)}
                    oncreate={el => el.focus()}
                    value={title}
                  />
                ) : (
                    <div class="inner">{title}</div>
                  )
              }
            </div>
            <div class="meta">
              <span
                class="task_started"
                onclick={() => showTaskInfo(id)}
              >
                {toTimeString(timeStart)}
              </span>
              <span
                class="task_spent"
                onclick={() => showTaskTimestamps(id)}
              >
                <TimeSpent
                  timeSpent={timeSpent}
                  active={current}
                />
              </span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const TasksListView = () => ({ daysTasks }) => (
  <div class="days_tasks">
    {daysTasks.map(({ day, timeStart, timeEnd, timeSpent, tasks }, index) => (
      <div class="day_tasks">
        <div class="day_title flex">
          <div class="col">{day}</div>
          <small class="col text-right">
            <span>{`Start: ${toTimeString(timeStart)}`}</span>
            <span>{`End: ${toTimeString(timeEnd)}`}</span>
            <TimeSpent
              timeSpent={timeSpent}
              active={!index}
            />
          </small>
        </div>
        <TasksDayView tasks={tasks} />
      </div>
    ))}
  </div>
);

const RootView = () => (state, { startNewTask }) => (
  <div id="container">
    <div class="bar">
      <button
        class="btn btn-lg btn-primary"
        onclick={startNewTask}
      >
        New task
      </button>
    </div>
    <TasksListView />
  </div>
);

export default RootView;
