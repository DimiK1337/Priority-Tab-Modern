// src/features/priorities/loader.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.loader = (() => {
  const groupTodoIDsByList = (todoIDs) => {
    const { listNames } = window.Prioritab.priorities.constants;

    const getListNameFromTodoID = (todoKey) => listNames.find((name) => todoKey.startsWith(`todo-${name}-`)) ?? null;

    const todoIDsByListName = Object.fromEntries( listNames.map((listName) => [listName, []]) );

    todoIDs.forEach((todoID) => {
      const listName = getListNameFromTodoID(todoID);
      if (!listName) return;
      todoIDsByListName[listName].push(todoID);
    });
    return todoIDsByListName;
  };

  const renderTodoList = ({
    browser,
    orderList,
    listElement,
    constructToDoCard,
  }) => {
    const { getTodoTexts } = window.Prioritab.priorities.storage;

    getTodoTexts(browser, orderList, (result) => {
      orderList.forEach((todoID) => {
        const todoText = result[todoID];

        // Ignore zombie todos: IDs that exist in order but not storage.
        if (todoText === undefined) return;

        listElement.append(constructToDoCard(todoID, todoText));
      });
    });
  };

  const loadInitialPriorities = ({
    browser,
    lists,
    constructToDoCard,
  }) => {
    const { listNames, storageKeys } = window.Prioritab.priorities.constants;
    const { state, setDones } = window.Prioritab.priorities.state;
    const { getInitialTodoData } = window.Prioritab.priorities.storage;

    getInitialTodoData(browser, (result) => {
      listNames.forEach((listName) => {
        const counterValue = result[storageKeys.counter(listName)];
        state.counters[listName] = counterValue ? counterValue + 1 : 1;
      });

      setDones(result[storageKeys.dones] ?? []);

      const orderList = result[storageKeys.orders] ? result[storageKeys.orders].split(',') : [];

      const todoIDsByListName = groupTodoIDsByList(orderList);

      listNames.forEach((listName) => {
        renderTodoList({
          browser,
          orderList: todoIDsByListName[listName],
          listElement: lists[listName].items,
          constructToDoCard,
        });
      });
    });
  };

  return {
    groupTodoIDsByList,
    loadInitialPriorities,
  };
})();
