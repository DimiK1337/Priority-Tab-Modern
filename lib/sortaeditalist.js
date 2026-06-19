// An editable, sortable list
// http://web.koesbong.com/2011/01/24/sortable-and-editable-to-do-list-using-html5s-localstorage/

document.addEventListener('DOMContentLoaded', () => {
  const browser = (window.browser) ?? window.chrome;
  const { fadeIn, fadeOut } = window.PrioritabDom;

  // const state = {
  //   counters: {
  //     left: 1,
  //     mid: 1,
  //     right: 1
  //   },
  //   dones: [],
  //   order: []
  // };

  // const listNames = ["left", "mid", "right"];
  // const listCounters = ['todo-counter-left', 'todo-counter-mid', 'todo-counter-right', 'todo-dones'];

  // const storageKeys = {
  //   orders: 'todo-orders',
  //   dones: 'todo-dones',
  //   counter(listName) {
  //     return `todo-counter-${listName}`;
  //   },
  //   todo(listName, id) {
  //     return `todo-${listName}-${id}`;
  //   }
  // };

  const {
    listNames,
    listCounters,
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


  const _listReducer = (acc, curr) => {
    acc[curr] = {
      form: document.querySelector(`#todo-form-${curr}`),
      items: document.querySelector(`#shown-items-${curr}`)
    }
    return acc
  };
  // const lists = listNames.reduce(_listReducer, {});
  // const forms = listNames.map(name => lists[name].form).filter(Boolean);
  // const itemLists = listNames.map(name => lists[name].items).filter(Boolean);

  // const sweepDoneButtons = document.querySelectorAll('.sweep-link');
  // const clearAllButtons = document.querySelectorAll('.clear-all-link');
  // const newTodoInputs = document.querySelectorAll('.todo');

  const getListNameFromTodoID = (todoID) => {
    if (todoID.includes('left')) return 'left';
    if (todoID.includes('mid')) return 'mid';
    if (todoID.includes('right')) return 'right';
    return null;
  }

  // const checkIfCompleted = (toDoID) => state.dones.includes(toDoID);

  /* 
    const appendLinkifiedText = (parent, text) => {
      parent.textContent = '';
      let lastIndex = 0;
      const URL_REGEX = /\b((?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,!?;:)])/gi;
      for (const match of text.matchAll(URL_REGEX)) {
        const urlText = match[0];
        const startIndex = match.index;
        parent.append(document.createTextNode(text.slice(lastIndex, startIndex)));
        const link = document.createElement('a');
        link.textContent = urlText;
        link.className = 'main-font-color';
        link.href = urlText.startsWith('www.') ? `https://${urlText}` : urlText;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        parent.append(link);
        lastIndex = startIndex + urlText.length;
      }
      parent.append(document.createTextNode(text.slice(lastIndex)));
    };
  
    const createTodoCheckbox = (toDoKey, isDone) => {
      const checkboxWrapper = document.createElement('div');
      checkboxWrapper.className = 'squaredThree';
  
      const checkbox = document.createElement('input');
      checkbox.id = `${toDoKey}-check`;
      checkbox.type = 'checkbox';
      checkbox.name = 'check';
      checkbox.checked = isDone;
  
      const checkboxLabel = document.createElement('label');
      checkboxLabel.setAttribute('for', `${toDoKey}-check`);
  
      checkboxWrapper.append(checkbox, checkboxLabel);
  
      return checkboxWrapper;
    };
  
    const createTodoText = (textContent) => {
      const todoTextDiv = document.createElement('div');
      todoTextDiv.className = 'todo-text';
      appendLinkifiedText(todoTextDiv, textContent);
      return todoTextDiv;
    };
  
    const createTodoDeleteButton = () => {
      const rightSide = document.createElement('div');
      rightSide.className = 'pull-right todo-card-right';
  
      const deleteLink = document.createElement('a');
      deleteLink.href = '#';
      deleteLink.className = 'main-font-color todo-delete-link';
      deleteLink.setAttribute('aria-label', 'Delete todo');
  
      const trashIcon = document.createElement('i');
      trashIcon.className = 'fa fa-trash-o';
      trashIcon.title = 'Delete';
  
      deleteLink.append(trashIcon);
      rightSide.append(deleteLink);
  
      return rightSide;
    };
  
    const createTodoCardElement = (toDoKey, isDone) => {
      const todoCard = document.createElement('li');
  
      todoCard.id = toDoKey;
      todoCard.className = [
        'todo-card',
        'main-bg-color',
        'main-font-color',
        'main-border-color',
        isDone ? 'todo-card-done-state' : ''
      ].filter(Boolean).join(' ');
  
      todoCard.tabIndex = 0;
      todoCard.draggable = true;
  
      return todoCard;
    };
   */

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

  const renderTodoList = (orderList, listElement) => {
    browser.storage.sync.get(orderList, (result) => {
      orderList.forEach((key) => {
        const todoText = result[key];
        if (todoText === undefined) return; // Ignore zombie todos
        //listElement.insertAdjacentHTML('beforeend', constructToDoCard(key, todoText));
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

      if (shouldSave && finalValue && finalValue !== originalValue) {
        browser.storage.sync.set({ [todoID]: finalValue });
      }
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

  browser.storage.sync.get([...listCounters, storageKeys.orders], (result) => {
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
  let draggingTodoCard = null; // Might want to add to state obj

  function isDragBlockedTarget(target) {
    const tagName = target.tagName.toLowerCase();

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

  function getTodoListElements() {
    return listNames.map((listName) => document.querySelector(`#shown-items-${listName}`)).filter(Boolean);
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

  // What happens when you check the checkbox...
  itemLists.forEach((itemList) => {
    itemList.addEventListener('change', (event) => {
      const checkbox = event.target.closest('input[type="checkbox"]');
      if (!checkbox || !itemList.contains(checkbox)) return;

      const todoCard = checkbox.closest('li.todo-card');
      if (!todoCard) return;

      const toDoKey = todoCard.id;
      const isChecked = checkbox.checked;
      if (isChecked) {
        todoCard.classList.add('todo-card-done-state');
        //if (!checkIfCompleted(toDoKey)) state.dones.push(toDoKey);
        addDone(toDoKey);
      }
      else {
        todoCard.classList.remove('todo-card-done-state');
        //if (checkIfCompleted(toDoKey)) state.dones.splice(state.dones.indexOf(toDoKey), 1);
        removeDone(toDoKey);
      }
      browser.storage.sync.set({ [storageKeys.dones]: state.dones });
    });
  });

  // Bind the esc key on the new todo
  newTodoInputs.forEach((todoInput) => {
    todoInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();

      todoInput.value = '';
      const editPanel = todoInput.closest('.edit-priorities');
      if (!editPanel) return;
      editPanel.style.display = 'none';

      const optionsLink = editPanel.parentElement?.querySelector('.edit-priorities-link');
      if (optionsLink) {
        optionsLink.style.display = '';
      }
    });
  });

  // Add todo
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      addTodo();
    });
  });

  // Remove todo
  itemLists.forEach((itemList) => {
    itemList.addEventListener('click', (event) => {
      const clickedLink = event.target.closest('.todo-delete-link');
      if (!clickedLink || !itemList.contains(clickedLink)) return;
      event.preventDefault();
      removeTodo(clickedLink);
    });
  });

  function bindClearAction(elements, clearAll) {
    elements.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        const listToImpact = event.target.getAttribute('data-list');
        if (!listToImpact) return;
        clearTodos(listToImpact, clearAll);
      });
    });
  }

  // Sort todo
  bindNativeTodoSorting();

  // Edit and save todo
  bindInlineTodoEditing();

  // Clear done & all buttons
  bindClearAction(sweepDoneButtons, false);
  bindClearAction(clearAllButtons, true);

  const getAdjacentListName = (currentListName, direction) => {
    const currentIndex = listNames.indexOf(currentListName);
    if (currentIndex < 0) return null;
    if (direction === 'right') return listNames[(currentIndex + 1) % listNames.length];
    if (direction === 'left') return listNames[(currentIndex - 1 + listNames.length) % listNames.length];
    return null;
  }

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
  }

  // Keyboard for cycling the todo items
  itemLists.forEach((itemList) => {
    itemList.addEventListener('click', (event) => {
      const todoCard = event.target.closest('li.todo-card');
      if (!todoCard || !itemList.contains(todoCard)) return;

      const tagName = event.target.tagName.toLowerCase();
      const isInteractiveTarget =
        tagName === 'input' ||
        tagName === 'label' ||
        tagName === 'a' ||
        tagName === 'i';
      if (isInteractiveTarget) return;
      todoCard.focus();
    });

    itemList.addEventListener('keydown', (event) => {
      const todoCard = event.target.closest('li.todo-card');
      if (!todoCard || !itemList.contains(todoCard)) return;

      const tagName = event.target.tagName.toLowerCase();
      const isEditableTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        event.target.isContentEditable;
      if (isEditableTarget) return;

      const handleArrowUp = (event) => {
        event.preventDefault();
        const previousTodoCard = todoCard.previousElementSibling;
        if (previousTodoCard?.matches('li.todo-card')) itemList.insertBefore(todoCard, previousTodoCard);
        else itemList.appendChild(todoCard);
        todoCard.focus();
        regenerateList();
      };
      const handleArrowDown = (event) => {
        event.preventDefault();
        const nextTodoCard = todoCard.nextElementSibling;
        if (nextTodoCard?.matches('li.todo-card')) itemList.insertBefore(nextTodoCard, todoCard);
        else {
          const firstTodoCard = itemList.querySelector('li.todo-card');
          if (firstTodoCard) itemList.insertBefore(todoCard, firstTodoCard);
        }
        todoCard.focus();
        regenerateList();
      };
      const HandleHorizontalArrow = (event, dir) => {
        event.preventDefault();
        moveTodoHorizontally(todoCard, dir)
      };

      if (event.key === 'ArrowUp') handleArrowUp(event);
      if (event.key === 'ArrowDown') handleArrowDown(event);
      if (event.key === 'ArrowLeft') HandleHorizontalArrow(event, "left")
      if (event.key === 'ArrowRight') HandleHorizontalArrow(event, "right")
    });
  });

  // storage helpers for todos
  function incrementListCounter(listName) {
    state.counters[listName]++;
    browser.storage.sync.set({ [storageKeys.counter(listName)]: state.counters[listName] });
  }

  function addTodo() {
    const todoToAdd = Array.from(newTodoInputs).find(todoBox => todoBox.value.trim() !== "");
    if (!todoToAdd) return;

    const listName = todoToAdd.getAttribute('data-list');
    const listToImpact = lists[listName].items;
    const listCounter = state.counters[listName];

    const newTodoID = storageKeys.todo(listName, listCounter);
    const newTodoText = todoToAdd.value.trim();

    browser.storage.sync.set({ [newTodoID]: newTodoText });
    browser.storage.sync.set({ [storageKeys.counter(listName)]: listCounter });

    listToImpact.append(constructToDoCard(newTodoID, newTodoText));
    regenerateList();

    fadeIn(document.getElementById(newTodoID), 200, "flex");
    todoToAdd.value = "";
    incrementListCounter(listName);
  }

  function removeTodo(clickedElement) {
    const todoCard = clickedElement.closest('li.todo-card');
    if (!todoCard) return;

    const parentId = todoCard.id;
    if (!parentId) return;
    browser.storage.sync.remove(parentId);

    if (checkIfCompleted(parentId)) {
      // state.dones.splice(state.dones.indexOf(parentId), 1);
      removeDone(parentId);
      browser.storage.sync.set({ [storageKeys.dones]: state.dones });
    }

    fadeOut(todoCard, 200, () => {
      todoCard.remove();
      regenerateList();
    });
  }

  const reassignToList = ({ target, items }) => {
    items.forEach((item) => {
      if (item.id.includes(target)) return;

      const oldID = item.id;
      const newID = storageKeys.todo(target, state.counters[target]);

      item.id = newID;
      incrementListCounter(target);

      browser.storage.sync.get(oldID, (retrieved) => {
        browser.storage.sync.set({ [newID]: retrieved[oldID] });
      });

      if (!checkIfCompleted(oldID)) return;

      //state.dones.splice(state.dones.indexOf(oldID), 1);
      removeDone(oldID);
      //state.dones.push(newID);
      addDone(newID);

      browser.storage.sync.set({ [storageKeys.dones]: state.dones });
    });
  };

  function regenerateList() {
    listNames.forEach((list) => {
      reassignToList({
        target: list,
        items: document.querySelectorAll(`#shown-items-${list} li.todo-card`)
      });
    });
    //state.order.length = 0;
    resetOrder();
    listNames.forEach((list) =>
      //document.querySelectorAll(`#shown-items-${list} li.todo-card`).forEach(todoCard => state.order.push(todoCard.id))
      document.querySelectorAll(`#shown-items-${list} li.todo-card`).forEach(todoCard => addToOrder(todoCard.id))
    );
    browser.storage.sync.set({ [storageKeys.orders]: state.order.join(',') });
  }

  function clearTodos(listToImpactName, clearAll) {
    const deleteLinks = document.querySelectorAll(`#shown-items-${listToImpactName} li.todo-card .todo-delete-link`);
    deleteLinks.forEach((deleteLink) => {
      const todoCard = deleteLink.closest('li.todo-card');
      if (!todoCard) return;
      const parentId = todoCard.id;
      if (clearAll || (!clearAll && checkIfCompleted(parentId))) {
        removeTodo(deleteLink);
      }
    });
  }
});
