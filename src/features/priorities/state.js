//src/features/priorities/state.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.state = (() => {
  const state = {
    counters: {
      left: 1,
      mid: 1,
      right: 1,
    },
    dones: [],
    order: [],
    draggingTodoCard: null,
  };

  const checkIfCompleted = (todoID) => state.dones.includes(todoID);

  const setDones = (dones) => {
    state.dones = Array.isArray(dones) ? dones : [];
  };

  const addDone = (todoID) => {
    if (checkIfCompleted(todoID)) return;
    state.dones.push(todoID);
  };

  const removeDone = (todoID) => {
    const index = state.dones.indexOf(todoID);
    if (index < 0) return;
    state.dones.splice(index, 1);
  };

  const resetOrder = () => {
    state.order.length = 0;
  };

  const addToOrder = (todoID) => {
    state.order.push(todoID);
  };

  return {
    state,
    checkIfCompleted,
    setDones,
    addDone,
    removeDone,
    resetOrder,
    addToOrder,
  };
})();
