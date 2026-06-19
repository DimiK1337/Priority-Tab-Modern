// src/features/priorities/actions.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.actions = (() => {
  const createActions = ({
    browser,
    lists,
    newTodoInputs,
    fadeIn,
    fadeOut,
  }) => {
    const { listNames, storageKeys } = window.Prioritab.priorities.constants;

    const {
      state,
      checkIfCompleted,
      addDone,
      removeDone,
      resetOrder,
      addToOrder,
    } = window.Prioritab.priorities.state;

    const {
      createTodoCheckbox,
      createTodoText,
      createTodoDeleteButton,
      createTodoCardElement,
    } = window.Prioritab.priorities.render;

    const {
      saveTodoText,
      removeTodoText,
      copyTodoText,
      saveCounter,
      saveDones,
      saveOrder,
    } = window.Prioritab.priorities.storage;

    const getListNameFromTodoID = (todoID) =>
      listNames.find((listName) => todoID.startsWith(`todo-${listName}-`)) ?? null;

    const constructToDoCard = (toDoKey, toDoText) => {
      const isDone = checkIfCompleted(toDoKey);
      const todoCard = createTodoCardElement(toDoKey, isDone);

      todoCard.append(
        createTodoCheckbox(toDoKey, isDone),
        createTodoText(toDoText),
        createTodoDeleteButton()
      );

      return todoCard;
    };

    const incrementListCounter = (listName) => {
      state.counters[listName]++;
      saveCounter(browser, listName, state.counters[listName]);
    };

    const reassignToList = ({ target, items }) => {
      items.forEach((item) => {
        if (item.id.includes(target)) return;

        const oldID = item.id;
        const newID = storageKeys.todo(target, state.counters[target]);

        item.id = newID;
        incrementListCounter(target);
        copyTodoText(browser, oldID, newID);

        if (!checkIfCompleted(oldID)) return;

        removeDone(oldID);
        addDone(newID);
        saveDones(browser, state.dones);
      });
    };

    const regenerateList = () => {
      listNames.forEach((list) => {
        reassignToList({
          target: list,
          items: document.querySelectorAll(`#shown-items-${list} li.todo-card`),
        });
      });

      resetOrder();

      listNames.forEach((list) => {
        document.querySelectorAll(`#shown-items-${list} li.todo-card`).forEach((todoCard) => addToOrder(todoCard.id));
      });

      saveOrder(browser, state.order);
    };

    const addTodo = () => {
      const todoToAdd = Array.from(newTodoInputs).find((todoBox) => todoBox.value.trim() !== '');

      if (!todoToAdd) return;

      const listName = todoToAdd.getAttribute('data-list');
      const listToImpact = lists[listName].items;
      const listCounter = state.counters[listName];

      const newTodoID = storageKeys.todo(listName, listCounter);
      const newTodoText = todoToAdd.value.trim();

      saveTodoText(browser, newTodoID, newTodoText);
      saveCounter(browser, listName, listCounter);

      listToImpact.append(constructToDoCard(newTodoID, newTodoText));
      regenerateList();

      fadeIn(document.getElementById(newTodoID), 200, 'flex');
      todoToAdd.value = '';

      incrementListCounter(listName);
    };

    const removeTodo = (clickedElement) => {
      const todoCard = clickedElement.closest('li.todo-card');
      if (!todoCard) return;

      const parentId = todoCard.id;
      if (!parentId) return;

      removeTodoText(browser, parentId);

      if (checkIfCompleted(parentId)) {
        removeDone(parentId);
        saveDones(browser, state.dones);
      }

      fadeOut(todoCard, 200, () => {
        todoCard.remove();
        regenerateList();
      });
    };

    const clearTodos = (listToImpactName, clearAll) => {
      const deleteLinks = document.querySelectorAll(`#shown-items-${listToImpactName} li.todo-card .todo-delete-link`);

      deleteLinks.forEach((deleteLink) => {
        const todoCard = deleteLink.closest('li.todo-card');
        if (!todoCard) return;

        const parentId = todoCard.id;

        if (clearAll || (!clearAll && checkIfCompleted(parentId))) {
          removeTodo(deleteLink);
        }
      });
    };

    const getAdjacentListName = (currentListName, direction) => {
      const currentIndex = listNames.indexOf(currentListName);

      if (currentIndex < 0) return null;
      if (direction === 'right') return listNames[(currentIndex + 1) % listNames.length];
      if (direction === 'left') return listNames[(currentIndex - 1 + listNames.length) % listNames.length];

      return null;
    };

    const moveTodoHorizontally = (todoCard, direction) => {
      const currentListName = getListNameFromTodoID(todoCard.id);
      if (!currentListName) return;

      const targetListName = getAdjacentListName(currentListName, direction);
      if (!targetListName) return;

      const targetList = lists[targetListName].items;
      if (!targetList) return;

      targetList.appendChild(todoCard);
      regenerateList();

      todoCard.focus();
    };

    return {
      constructToDoCard,
      regenerateList,
      addTodo,
      removeTodo,
      clearTodos,
      moveTodoHorizontally,
    };
  };

  return {
    createActions,
  };
})();
