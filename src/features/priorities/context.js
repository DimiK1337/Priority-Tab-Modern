//src/features/priorities/context.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.context = (() => {
  const createContext = () => {
    const { listNames } = window.Prioritab.priorities.constants;

    const lists = listNames.reduce((acc, listName) => {
      acc[listName] = {
        form: document.querySelector(`#todo-form-${listName}`),
        items: document.querySelector(`#shown-items-${listName}`),
      };

      return acc;
    }, {});

    const forms = listNames.map((listName) => lists[listName].form).filter(Boolean);
    const itemLists = listNames.map((listName) => lists[listName].items).filter(Boolean);

    const sweepDoneButtons = document.querySelectorAll('.sweep-link');
    const clearAllButtons = document.querySelectorAll('.clear-all-link');
    const newTodoInputs = document.querySelectorAll('.todo');

    return {
      lists,
      forms,
      itemLists,
      sweepDoneButtons,
      clearAllButtons,
      newTodoInputs,
    };
  };

  return {
    createContext,
  };
})();

