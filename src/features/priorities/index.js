// src/features/priorities/index.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.index = (() => {
  const init = () => {
    const browser = window.browser ?? window.chrome;

    const {
      state,
      addDone,
      removeDone,
    } = window.Prioritab.priorities.state;

    const {
      lists,
      forms,
      itemLists,
      sweepDoneButtons,
      clearAllButtons,
      newTodoInputs,
    } = window.Prioritab.priorities.context.createContext();

    const { saveDones } = window.Prioritab.priorities.storage;

    const {
      constructToDoCard,
      regenerateList,
      addTodo,
      removeTodo,
      clearTodos,
      moveTodoHorizontally,
    } = window.Prioritab.priorities.actions.createActions({
      browser,
      lists,
      newTodoInputs,
    });

    const {
      bindInlineTodoEditing,
    } = window.Prioritab.priorities.editing.createEditing({
      browser,
    });

    const {
      bindNativeTodoSorting,
    } = window.Prioritab.priorities.dragging.createDragging({
      regenerateList,
    });

    const { bindPriorityEvents } = window.Prioritab.priorities.events;

    window.Prioritab.priorities.loader.loadInitialPriorities({
      browser,
      lists,
      constructToDoCard,
    });

    bindPriorityEvents({
      browser,
      forms,
      itemLists,
      sweepDoneButtons,
      clearAllButtons,
      newTodoInputs,

      state,
      addDone,
      removeDone,
      saveDones,

      addTodo,
      removeTodo,
      clearTodos,
      regenerateList,
      moveTodoHorizontally,

      bindInlineTodoEditing,
      bindNativeTodoSorting,
    });
  };

  return {
    init,
  };
})();
