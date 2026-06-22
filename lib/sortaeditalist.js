// An editable, sortable list
// http://web.koesbong.com/2011/01/24/sortable-and-editable-to-do-list-using-html5s-localstorage/

document.addEventListener('DOMContentLoaded', () => {
  const browser = (window.browser) ?? window.chrome;

  const {
    listNames,
    storageKeys,
  } = window.Prioritab.priorities.constants;

  const {
    state,
    setDones,
    addDone,
    removeDone
  } = window.Prioritab.priorities.state;


  const {
    lists,
    forms,
    itemLists,
    sweepDoneButtons,
    clearAllButtons,
    newTodoInputs,
  } = window.Prioritab.priorities.context.createContext();

  const {
    getInitialTodoData,
    getTodoTexts,
    saveDones,
  } = window.Prioritab.priorities.storage;

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

  const { bindInlineTodoEditing } = window.Prioritab.priorities.editing.createEditing({ browser });
  const { bindNativeTodoSorting } = window.Prioritab.priorities.dragging.createDragging({ regenerateList });
  const { bindPriorityEvents } = window.Prioritab.priorities.events;

  const renderTodoList = (orderList, listElement) => {
    getTodoTexts(browser, orderList, (result) => {
      orderList.forEach((key) => {
        const todoText = result[key];
        if (todoText === undefined) return; // Ignore zombie todos
        listElement.append(constructToDoCard(key, todoText));
      });
    });
  };

  getInitialTodoData(browser, (result) => {
    listNames.forEach(listName => {
      const counterValue = result[storageKeys.counter(listName)];
      state.counters[listName] = counterValue ? counterValue + 1 : 1;
    });

    setDones(result[storageKeys.dones] ?? []);

    const orderList = result[storageKeys.orders] ? result[storageKeys.orders].split(",") : [];

    const getListNameFromTodoID = (todoKey) => listNames.find((name) => todoKey.startsWith(`todo-${name}-`)) ?? null;

    const orderListsByName = Object.fromEntries(
      listNames.map((listName) => [listName, []])
    );

    orderList.forEach((todoKey) => {
      const listName = getListNameFromTodoID(todoKey);
      if (!listName) return;
      orderListsByName[listName].push(todoKey);
    });

    listNames.forEach((listName) => {
      renderTodoList(orderListsByName[listName], lists[listName].items);
    });
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

});
