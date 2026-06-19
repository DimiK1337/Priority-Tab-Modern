// src/features/priorities/storage.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.storage = (() => {
  const { listCounters, storageKeys } = window.Prioritab.priorities.constants;

  const getInitialTodoData = (browser, callback) => 
    browser.storage.sync.get([...listCounters, storageKeys.orders], callback);

  const getTodoTexts = (browser, todoIDs, callback) => browser.storage.sync.get(todoIDs, callback);
  const saveTodoText = (browser, todoID, text) => browser.storage.sync.set({ [todoID]: text });
  const removeTodoText = (browser, todoID) => browser.storage.sync.remove(todoID);
  const copyTodoText = (browser, oldID, newID) => {
    browser.storage.sync.get(oldID, (retrieved) => {
      browser.storage.sync.set({ [newID]: retrieved[oldID] });
    });
  };

  const saveCounter = (browser, listName, value) => browser.storage.sync.set({ [storageKeys.counter(listName)]: value });
  const saveDones = (browser, dones) => browser.storage.sync.set({ [storageKeys.dones]: dones });
  const saveOrder = (browser, order) => browser.storage.sync.set({ [storageKeys.orders]: order.join(',') });

  return {
    getInitialTodoData,
    getTodoTexts,
    saveTodoText,
    removeTodoText,
    copyTodoText,
    saveCounter,
    saveDones,
    saveOrder,
  };
})();
