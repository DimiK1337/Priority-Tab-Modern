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
    incrementListCounter,
    reassignToList,
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

  // Inline todo editing
  function startInlineTodoEdit(todoTextEl) {
    if (todoTextEl.querySelector('input')) return;

    const todoCard = todoTextEl.closest('li.todo-card');
    if (!todoCard) return;

    const todoID = todoCard.id;
    const originalValue = todoTextEl.textContent;
    let didCommit = false;

    todoTextEl.classList.add('edit-in-progress');

    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalValue;
    input.className = 'todo-inline-edit-input main-bg-color main-font-color';

    todoTextEl.textContent = '';
    todoTextEl.append(input);

    function finishEdit(nextValue, shouldSave) {
      if (didCommit) return;
      didCommit = true;

      const finalValue = shouldSave ? nextValue.trim() : originalValue;
      const displayValue = finalValue || originalValue;

      const freshTodoTextEl = createTodoText(displayValue);
      todoTextEl.replaceWith(freshTodoTextEl);

      const shouldPersistEdit = shouldSave && finalValue && finalValue !== originalValue;
      if (!shouldPersistEdit) return;
      saveTodoText(browser, todoID, finalValue);
    }

    input.addEventListener('keydown', (event) => {
      const handleEnter = (event) => {
        event.preventDefault();
        finishEdit(input.value, true);
      };
      const handleEscape = (event) => {
        event.preventDefault();
        finishEdit(originalValue, false);
      };
      if (event.key === 'Enter') handleEnter(event);
      if (event.key === 'Escape') handleEscape(event);
    });

    // Matches your old inlineEdit behavior:
    // cancelOnBlur: true
    input.addEventListener('blur', () => {
      finishEdit(originalValue, false);
    });

    input.focus();
    const cursorPosition = input.value.length;
    input.setSelectionRange(cursorPosition, cursorPosition);
  }

  function bindInlineTodoEditing() {
    document.addEventListener('dblclick', (event) => {
      const todoTextEl = event.target.closest('.todo-text');
      if (!todoTextEl) return;
      startInlineTodoEdit(todoTextEl);
    });
  }

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

  // Native dragging/drop sorting
  let draggingTodoCard = null; // TODO: Use state obj 

  function isDragBlockedTarget(target) {
    const tagName = target.tagName.toLowerCase();

    // TODO: Use a list and contains
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      tagName === 'label' ||
      tagName === 'a' ||
      tagName === 'i' ||
      target.isContentEditable
    );
  }

  function getDragAfterElement(listElement, mouseY) {
    const todoCards = Array.from(listElement.querySelectorAll('li.todo-card:not(.dragging)'));

    return todoCards.reduce(
      (closest, todoCard) => {
        const box = todoCard.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return {
            offset,
            element: todoCard
          };
        }

        return closest;
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: null
      }
    ).element;
  }

  const getTodoListElements = () =>
    listNames.map((listName) => document.querySelector(`#shown-items-${listName}`)).filter(Boolean);

  function bindNativeTodoSorting() {
    document.addEventListener('dragstart', (event) => {
      const todoCard = event.target.closest('li.todo-card');

      if (!todoCard || isDragBlockedTarget(event.target)) {
        event.preventDefault();
        return;
      }

      draggingTodoCard = todoCard;
      todoCard.classList.add('dragging');

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', todoCard.id);
    });

    document.addEventListener('dragend', () => {
      if (!draggingTodoCard) return;
      draggingTodoCard.classList.remove('dragging');
      draggingTodoCard.focus();
      draggingTodoCard = null;
      regenerateList();
    });

    getTodoListElements().forEach((listElement) => {
      listElement.addEventListener('dragover', (event) => {
        if (!draggingTodoCard) return;
        event.preventDefault();
        const afterElement = getDragAfterElement(listElement, event.clientY);
        if (afterElement) listElement.insertBefore(draggingTodoCard, afterElement);
        else listElement.appendChild(draggingTodoCard);
      });

      listElement.addEventListener('drop', (event) => {
        event.preventDefault();
      });
    });
  }
  
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
