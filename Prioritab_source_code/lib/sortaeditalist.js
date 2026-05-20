// An editable, sortable list
// http://web.koesbong.com/2011/01/24/sortable-and-editable-to-do-list-using-html5s-localstorage/

$(function () {
  const browser = (window.browser) ?? window.chrome;

  const { fadeIn, fadeOut } = window.PrioritabDom;

  const listCounters = ['todo-counter-left', 'todo-counter-mid', 'todo-counter-right', 'todo-dones'];

  const storageKeys = {
    orders: 'todo-orders',
    dones: 'todo-dones',
    counter(listName) {
      return `todo-counter-${listName}`;
    },
    todo(listName, id) {
      return `todo-${listName}-${id}`;
    }
  };

  const state = {
    counters: {
      left: 1,
      mid: 1,
      right: 1
    },
    dones: [],
    order: []
  };

  const lists = {
    left: {
      form: document.querySelector('#todo-form-left'),
      items: document.querySelector('#shown-items-left')
    },
    mid: {
      form: document.querySelector('#todo-form-mid'),
      items: document.querySelector('#shown-items-mid')
    },
    right: {
      form: document.querySelector('#todo-form-right'),
      items: document.querySelector('#shown-items-right')
    }
  };

  const listNames = Object.keys(lists);
  const forms = listNames.map(name => lists[name].form).filter(Boolean);
  const itemLists = listNames.map(name => lists[name].items).filter(Boolean);

  const sweepDoneButtons = document.querySelectorAll('.sweep-link');
  const clearAllButtons = document.querySelectorAll('.clear-all-link');
  const newTodoInputs = document.querySelectorAll('.todo');

  const getListNameFromTodoID = (todoID) => {
    if (todoID.includes('left')) return 'left';
    if (todoID.includes('mid')) return 'mid';
    if (todoID.includes('right')) return 'right';
    return null;
  }

  const checkIfCompleted = (toDoID) => state.dones.includes(toDoID);

  const constructToDoCard = function (toDoKey, toDoText) {
    const isDone = checkIfCompleted(toDoKey);

    return `
      <li 
        id="${toDoKey}" 
        class="todo-card main-bg-color main-font-color main-border-color ${isDone ? 'todo-card-done-state' : ''}" 
        tabindex="0"
        draggable="true"
      >
        <div class="squaredThree">
          <input id="${toDoKey}-check" type="checkbox" name="check" ${isDone ? 'checked' : ''} />
          <label for="${toDoKey}-check"></label>
        </div>
        <div class="todo-text">${toDoText}</div>
        <div class="pull-right todo-card-right">
          <a href="#" class="main-font-color">
            <i class="fa fa-trash-o" title="Delete"></i>
          </a>
        </div>
      </li>
    `;
  };

  const renderTodoList = (orderList, listElement) => {
    browser.storage.sync.get(orderList, (result) => {
      orderList.forEach((key) => {
        const todoText = result[key];
        if (todoText === undefined) return; // Ignore zombie todos
        listElement.insertAdjacentHTML('beforeend', constructToDoCard(key, todoText));
      });
    });
  };

  // Old Jquery edit inline
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
    input.className = 'todo-inline-edit-input main-bgcolor main-font-color';

    todoTextEl.textContent = '';
    todoTextEl.append(input);

    function finishEdit(nextValue, shouldSave) {
      if (didCommit) return;
      didCommit = true;

      const finalValue = shouldSave ? nextValue.trim() : originalValue;

      todoTextEl.textContent = finalValue || originalValue;
      todoTextEl.classList.remove('edit-in-progress');

      if (shouldSave && finalValue !== originalValue) {
        browser.storage.sync.set({ [todoID]: finalValue });
      }
    }

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        finishEdit(input.value, true);
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        finishEdit(originalValue, false);
      }
    });

    // Matches your old inlineEdit behavior:
    // cancelOnBlur: true
    input.addEventListener('blur', () => {
      finishEdit(originalValue, false);
    });

    input.focus();
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

  browser.storage.sync.get([...listCounters, storageKeys.orders], function (result) {
    listNames.forEach(listName => {
      const counterValue = result[storageKeys.counter(listName)];
      state.counters[listName] = counterValue ? counterValue + 1 : 1;
    });

    state.dones = result[storageKeys.dones] ?? [];

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

  // Native dragging/sorting code to replace JQ UI
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
        if (afterElement) {
          listElement.insertBefore(draggingTodoCard, afterElement);
        } else {
          listElement.appendChild(draggingTodoCard);
        }
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

        if (!checkIfCompleted(toDoKey)) {
          state.dones.push(toDoKey);
        }
      }
      else {
        todoCard.classList.remove('todo-card-done-state');

        if (checkIfCompleted(toDoKey)) {
          state.dones.splice(state.dones.indexOf(toDoKey), 1);
        }
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
      const clickedLink = event.target.closest('a');
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
      const handleArrowLeft = (event) => {
        event.preventDefault();
        moveTodoHorizontally(todoCard, "left")
      };
      const handleArrowRight = (event) => {
        event.preventDefault();
        moveTodoHorizontally(todoCard, "right")
      };

      if (event.key === 'ArrowUp') handleArrowUp(event);
      if (event.key === 'ArrowDown') handleArrowDown(event);
      if (event.key === 'ArrowLeft') handleArrowLeft(event)
      if (event.key === 'ArrowRight') handleArrowRight(event)
    });
  });


  // Subscribes
  function incrementListCounter(listName) {
    state.counters[listName]++;
    browser.storage.sync.set({ [storageKeys.counter(listName)]: state.counters[listName] });
  }

  // subscribes 
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

    listToImpact.insertAdjacentHTML('beforeend', constructToDoCard(newTodoID, newTodoText));
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
      state.dones.splice(state.dones.indexOf(parentId), 1);
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

      state.dones.splice(state.dones.indexOf(oldID), 1);
      state.dones.push(newID);

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
    state.order.length = 0;
    listNames.forEach((list) =>
      document.querySelectorAll(`#shown-items-${list} li.todo-card`).forEach(todoCard => state.order.push(todoCard.id))
    );
    browser.storage.sync.set({ [storageKeys.orders]: state.order.join(',') });
  }

  function clearTodos(listToImpactName, clearAll) {
    const deleteLinks = document.querySelectorAll(`#shown-items-${listToImpactName} li.todo-card a`);

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
