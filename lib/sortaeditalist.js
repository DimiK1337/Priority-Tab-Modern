// An editable, sortable list
// http://web.koesbong.com/2011/01/24/sortable-and-editable-to-do-list-using-html5s-localstorage/

document.addEventListener('DOMContentLoaded', () => {
  const browser = (window.browser) ?? window.chrome;
  const { fadeIn, fadeOut } = window.PrioritabDom; // TODO: Refactor this to use window.Prioritab.dom or something

  const {
    listNames,
    storageKeys,
  } = window.Prioritab.priorities.constants;

  const {
    state,
    checkIfCompleted,
    setDones,
    addDone,
    removeDone,
    resetOrder,
    addToOrder,
  } = window.Prioritab.priorities.state;

  const {
    createTodoCheckbox,
    createTodoText,
    createTodoDeleteButton,
    createTodoCardElement
  } = window.Prioritab.priorities.render;

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
    saveTodoText,
    removeTodoText,
    copyTodoText,
    saveCounter,
    saveDones,
    saveOrder,
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
    // TODO: Import fadeIn and fadeOut in actions module
    fadeIn,
    fadeOut,
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

    // state.dones = result[storageKeys.dones] ?? [];
    setDones(result[storageKeys.dones] ?? []);

    const orderList = result[storageKeys.orders] ? result[storageKeys.orders].split(",") : [];

    // Sort todo list keys into their component lists
    const orderListLeft = [];
    const orderListMid = [];
    const orderListRight = [];

    for (const todoKey of orderList) {
      if (todoKey.includes('left')) {
        orderListLeft.push(todoKey);
      } else if (todoKey.includes('mid')) {
        orderListMid.push(todoKey);
      } else if (todoKey.includes('right')) {
        orderListRight.push(todoKey);
      }
    }

    // Render existing todo items into the three separate lists
    renderTodoList(orderListLeft, lists.left.items);
    renderTodoList(orderListMid, lists.mid.items);
    renderTodoList(orderListRight, lists.right.items);

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
