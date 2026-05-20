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
      $form: $('#todo-form-left'),
      $items: $('#shown-items-left')
    },
    mid: {
      $form: $('#todo-form-mid'),
      $items: $('#shown-items-mid')
    },
    right: {
      $form: $('#todo-form-right'),
      $items: $('#shown-items-right')
    }
  };

  const listNames = Object.keys(lists);
  const forms = listNames.map(name => lists[name].$form);
  const itemLists = listNames.map(name => lists[name].$items);

  const $sweepDone = $('.sweep-link');
  const $clearAll = $('.clear-all-link');
  const $newTodo = $('.todo');

  const checkIfCompleted = (toDoID) => state.dones.includes(toDoID);

  const constructToDoCard = function (toDoKey, toDoText) {
    const isDone = checkIfCompleted(toDoKey);

    return `
      <li 
        id="${toDoKey}" 
        class="todo-card main-bg-color main-font-color main-border-color ${isDone ? 'todo-card-done-state' : ''}" 
        tabindex="0"
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

  const renderTodoList = (_orderList, $list) => {
    browser.storage.sync.get(_orderList, (result) => {
      _orderList.forEach(key => {
        $list.append(constructToDoCard(key, result[key]));
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
    input.select();
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
    renderTodoList(orderListLeft, $("#shown-items-left"));
    renderTodoList(orderListMid, $("#shown-items-mid"));
    renderTodoList(orderListRight, $("#shown-items-right"));
  });

  // What happens when you check the checkbox...

  // TODO: Remove $(this)
  $('.shown-items').on('change', 'input[type=checkbox]', function () {
    const $toDoLiItemEl = $(this).closest("li");
    const toDoKey = $toDoLiItemEl.attr('id');
    const isChecked = $(this).is(':checked');

    if (isChecked) {
      $toDoLiItemEl.addClass('todo-card-done-state');

      if (!checkIfCompleted(toDoKey)) {
        state.dones.push(toDoKey);
      }
    }
    else {
      $toDoLiItemEl.removeClass('todo-card-done-state');

      if (checkIfCompleted(toDoKey)) {
        state.dones.splice(state.dones.indexOf(toDoKey), 1);
      }
    }

    browser.storage.sync.set({ [storageKeys.dones]: state.dones });
  });

  // Bind the esc key on the new todo
  // TODO: Remove this 
  $newTodo.on('keydown', function (e) {
    if (e.key !== 'Escape') return;

    e.preventDefault();

    this.value = '';

    const editPanel = this.closest('.edit-priorities');
    if (editPanel) {
      $(editPanel).hide();
      $(editPanel).siblings('.edit-priorities-link').show();
    }
  });

  // Add todo
  forms.forEach($form => {
    $form.submit(function (e) {
      e.preventDefault();
      addTodo();
    })
  })

  // Remove todo
  itemLists.forEach($itemList => {
    $itemList.on('click', 'a', function (e) {
      e.preventDefault();
      // TODO: Might be a problem was original removeTodo($(this))
      removeTodo(e.target);
    })
  });

  // Sort todo
  itemLists.forEach($itemList => {
    $itemList.sortable({
      revert: true,
      connectWith: ['#shown-items-left', '#shown-items-mid', '#shown-items-right'],
      helper: 'clone',
      appendTo: 'body',
      zIndex: 10000,
      stop: function () {
        regenerateList();
      }
    });
  });

  // Edit and save todo
  bindInlineTodoEditing();

  function bindClearAction($elements, clearAll) {
    $elements.click(function (e) {
      e.preventDefault();
      const listToImpact = e.originalEvent.srcElement.getAttribute('data-list');
      clearTodos(listToImpact, clearAll);
    });
  }

  // Sweep done / Clear all
  bindClearAction($sweepDone, false);
  bindClearAction($clearAll, true);

  // Keyboard for cycling the todo items
  // TODO: Remove this
  itemLists.forEach($itemList => {

    $itemList.on('click', 'li.todo-card', function (e) {
      const tagName = e.target.tagName.toLowerCase();
      const isInteractiveTarget =
        tagName === 'input' ||
        tagName === 'label' ||
        tagName === 'a' ||
        tagName === 'i'

      if (isInteractiveTarget) return;
      this.focus();
    });

    $itemList.on('keydown', 'li.todo-card', function (e) {
      const $item = $(this);

      console.log("in keydown meth, this=", this, "e.target = ", e.target)

      // Do not reorder while typing/editing inside child controls
      const tagName = e.target.tagName.toLowerCase();
      const isEditableTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        e.target.isContentEditable;

      if (isEditableTarget) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const $prev = $item.prev('li.todo-card');

        if ($prev.length) {
          $item.insertBefore($prev);
          $item.focus();
          regenerateList();
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const $next = $item.next('li.todo-card');

        if ($next.length) {
          $item.insertAfter($next);
          $item.focus();
          regenerateList();
        }
      }
    });
  });


  // Subscribes
  function incrementListCounter(listName) {
    state.counters[listName]++;
    browser.storage.sync.set({ [storageKeys.counter(listName)]: state.counters[listName] });
  }

  // subscribes 
  function addTodo() {
    const todoToAdd = Array.from($newTodo).find(todoBox => todoBox.value.trim() !== "");
    if (!todoToAdd) return;

    const listName = todoToAdd.getAttribute('data-list');
    const listToImpact = lists[listName].$items;
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
