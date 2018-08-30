import { MAIN_URL, TOKEN } from "./config";

export const api = {
  async fetchTasks() {
    const response = await fetch(MAIN_URL, {
      method: "GET",
      headers: {
        Authorization: TOKEN
      }
    });

    const { data: tasks } = await response.json();

    if (response.status !== 200) {
      throw new Error("Tasks were not fetched.");
    }

    return tasks;
  },
  async createTask(newTaskMessage) {
    const response = await fetch(MAIN_URL, {
      method: "POST",
      headers: {
        Authorization: TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: newTaskMessage })
    });

    const { data: task } = await response.json();

    if (response.status !== 200) {
      throw new Error("Task was not created.");
    }

    return task;
  },
  async updateTask(updatedTask) {
    const response = await fetch(MAIN_URL, {
      method: "PUT",
      headers: {
        Authorization: TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([updatedTask])
    });

    const {
      data: [updatedTaskFromResponse]
    } = await response.json();

    if (response.status !== 200) {
      throw new Error("Task was not updated.");
    }

    return updatedTaskFromResponse;
  },
  async removeTask(taskId) {
    const response = await fetch(`${MAIN_URL}/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: TOKEN
      }
    });

    if (response.status !== 204) {
      throw new Error("Task was not deleted.");
    }
  },
  async completeAllTasks(tasks) {
    const promises = [];

    for (const task of tasks) {
      promises.push(
        fetch(MAIN_URL, {
          method: "PUT",
          headers: {
            Authorization: TOKEN,
            "Content-Type": "application/json"
          },
          body: JSON.stringify([{ ...task, completed: true }])
        })
      );
    }

    const responses = await Promise.all(promises);

    const success = responses.every(result => result.status === 200);

    if (!success) {
      throw new Error("Tasks were not completed");
    }
  }
};
