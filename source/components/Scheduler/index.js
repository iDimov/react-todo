import React, { Component } from "react";
import Task from "../Task";
import Spinner from "../Spinner";

import Checkbox from "../../theme/assets/Checkbox";
import { sortTasksByGroup } from "../../instruments";

// Instruments
import Styles from "./styles.m.css";
import { api } from "../../REST"; // ! Импорт модуля API должен иметь именно такой вид (import { api } from '../../REST')

export default class Scheduler extends Component {
  state = {
    newTaskMessage: "",
    tasksFilter: "",
    isTasksFetching: false,
    tasks: []
  };

  componentDidMount() {
    this._fetchTasksAsync();
  }

  _updateTasksFilter = e => {
    const tasksFilter = e.target.value.toLowerCase();

    this.setState({
      tasksFilter
    });
  };

  _updateNewTaskMessage = e => {
    const newTaskMessage = e.target.value;

    this.setState({
      newTaskMessage
    });
  };

  _getAllCompleted = () => this.state.tasks.every(task => task.completed);

  _setTasksFetchingState = state => {
    this.setState({
      isTasksFetching: state
    });
  };

  _setTasksFetchingState = isTasksFetching => {
    this.setState({
      isTasksFetching
    });
  };

  _fetchTasksAsync = async () => {
    this._setTasksFetchingState(true);

    const tasks = await api.fetchTasks();

    this.setState({
      tasks: sortTasksByGroup(tasks)
    });

    this._setTasksFetchingState(false);
  };

  _createTaskAsync = async event => {
    event.preventDefault();
    const { newTaskMessage } = this.state;

    if (!newTaskMessage) {
      return null;
    }

    this._setTasksFetchingState(true);

    const task = await api.createTask(newTaskMessage);

    this.setState(({ tasks }) => ({
      tasks: sortTasksByGroup([task, ...tasks]),
      newTaskMessage: ""
    }));

    this._setTasksFetchingState(false);
  };

  _updateTaskAsync = async updatedTask => {
    this._setTasksFetchingState(true);

    const updatedTaskFromResponse = await api.updateTask(updatedTask);

    this.setState(({ tasks }) => {
      const indexToReplace = tasks.indexOf(
        tasks.find(task => task.id === updatedTask.id)
      );

      const newTasks = [...tasks.filter(task => task.id !== updatedTask.id)];

      newTasks.splice(indexToReplace, 0, updatedTaskFromResponse);

      const sortedTasks = sortTasksByGroup(newTasks);

      return {
        tasks: sortedTasks
      };
    });
    this._setTasksFetchingState(false);
  };

  _removeTaskAsync = async taskId => {
    ``;
    this._setTasksFetchingState(true);

    await api.removeTask(taskId);

    this.setState(({ tasks }) => ({
      tasks: tasks.filter(task => task.id !== taskId),
      isTasksFetching: false
    }));

    this._setTasksFetchingState(false);
  };

  _completeAllTasksAsync = async () => {
    if (this._getAllCompleted()) {
      return null;
    }

    this._setTasksFetchingState(true);

    await api.completeAllTasks(this.state.tasks);

    this.setState(({ tasks }) => ({
      tasks: sortTasksByGroup(tasks.map(task => ({ ...task, completed: true })))
    }));
    this._setTasksFetchingState(false);
  };

  render() {
    const { tasks, newTaskMessage, tasksFilter, isTasksFetching } = this.state;

    const allCompleted = this._getAllCompleted();
    const todoList = tasks
      .filter(task => task.message.toLowerCase().includes(tasksFilter))
      .map(props => (
        <Task
          _removeTaskAsync={this._removeTaskAsync}
          _updateTaskAsync={this._updateTaskAsync}
          key={props.id}
          {...props}
        />
      ));

    return (
      <section className={Styles.scheduler}>
        <main>
          <Spinner isSpinning={isTasksFetching} />
          <header>
            <h1 className={Styles.test}>Планировщик задач</h1>
            <input
              placeholder="Поиск"
              type="search"
              value={tasksFilter}
              onChange={this._updateTasksFilter}
            />
          </header>
          <section>
            <form onSubmit={this._createTaskAsync}>
              <input
                className={Styles.createTask}
                maxLength={50}
                placeholder="Описaние моей новой задачи"
                type="text"
                value={newTaskMessage}
                onChange={this._updateNewTaskMessage}
              />
              <button>Добавить задачу</button>
            </form>
            <div className={Styles.overlay}>
              <ul>{todoList}</ul>
            </div>
          </section>
          <footer>
            <Checkbox
              checked={allCompleted}
              color1="#363636"
              color2="#fff"
              onClick={this._completeAllTasksAsync}
            />
            <span className={Styles.completeAllTasks}>
              Все задачи выполнены
            </span>
          </footer>
        </main>
      </section>
    );
  }
}
