// An editable, sortable list
// http://web.koesbong.com/2011/01/24/sortable-and-editable-to-do-list-using-html5s-localstorage/

$(function () {
  const browser = (window.browser) ?? window.chrome;

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

  // Holds the HTML for a todo card (HTML might appear elsewhere as well)
  const constructToDoCard = function (toDoKey, toDoText) {
    const done = checkIfCompleted(toDoKey) ? 'checked' : '';
    const fontColorToUse = done === 'checked' ? 'shadow-color' : 'main-font-color';
    const borderColorToUse = done === 'checked' ? 'shadow-border-color' : 'main-border-color';
    return `
      <li id="${toDoKey}" class="todo-card main-bg-color ${fontColorToUse} ${borderColorToUse}" tabindex='0'>
        <div class="squaredThree">
          <input id="${toDoKey}-check" type="checkbox" name="check" ${done} />
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
        if (checkIfCompleted(key)) {
          $(`#${key}`).find('.todo-text').addClass('todo-card-done');
        }
      });
      //$("li a").fadeOut();
    });
  };

  browser.storage.sync.get(listCounters, function (result) {
    listNames.forEach(listName => {
      const counterValue = result[storageKeys.counter(listName)]
      state.counters[listName] = counterValue ? counterValue + 1 : 1;
    })
    state.dones = result[storageKeys.dones] ?? []

  });

  // Load todo list keys
  browser.storage.sync.get(storageKeys.orders, function (retrieved) {
    const orderList = retrieved[storageKeys.orders] ? retrieved[storageKeys.orders].split(",") : [];

    // Sort todo list keys into their component lists
    const orderListLeft = [];
    const orderListMid = [];
    const orderListRight = []
    for (const todoKey of orderList) {
      if (todoKey.indexOf('left') >= 0) {
        orderListLeft.push(todoKey);
      }
      else if (todoKey.indexOf('mid') >= 0) {
        orderListMid.push(todoKey);
      }
      else if (todoKey.indexOf('right') >= 0) {
        orderListRight.push(todoKey);
      }
    }
    // Render existing todo items into the three separate lists
    renderTodoList(orderListLeft, $("#shown-items-left"));
    renderTodoList(orderListMid, $("#shown-items-mid"));
    renderTodoList(orderListRight, $("#shown-items-right"));
  });

  // What happens when you check the checkbox...
  $('.shown-items').on('change', 'input[type=checkbox]', function () {
    const $toDoLiItemEl = $(this).closest("li");
    const $toDoTextDiv = $toDoLiItemEl.find('.todo-text');
    const toDoKey = $toDoLiItemEl.attr('id');

    const shadowClassPair = ["shadow-color", "shadow-border-color"];
    const fontBorderClassPair = ["main-font-color", "main-border-color"]

    function updateClasses($el, classPairToAdd, classPairToRemove) {
      $el.addClass(classPairToAdd[0]).addClass(classPairToAdd[1])
        .removeClass(classPairToRemove[0]).removeClass(classPairToRemove[1]);
    }

    if ($(this).is(':checked') === true) {
      updateClasses($toDoLiItemEl, shadowClassPair, fontBorderClassPair);
      $toDoTextDiv.addClass('todo-card-done');
      if (!checkIfCompleted(toDoKey)) {
        state.dones.push(toDoKey);
      }
    }
    else {
      updateClasses($toDoLiItemEl, fontBorderClassPair, shadowClassPair);
      $toDoTextDiv.removeClass('todo-card-done');
      if (checkIfCompleted(toDoKey)) {
        state.dones.splice(state.dones.indexOf(toDoKey), 1);
      }
    }
    browser.storage.sync.set({ [storageKeys.dones]: state.dones });
  });

  // Add todo
  forms.forEach($form => {
    $form.submit(function (e) {
      e.preventDefault();
      $.publish("/add/", [])
    })
  })

  // Remove todo
  itemLists.forEach($itemList => {
    $itemList.on('click', 'a', function (e) {
      const $this = $(this);
      e.preventDefault();
      $.publish('/remove/', [$this]);
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
        $.publish('/regenerate-list/', []);
      }
    });
  });

  // Edit and save todo
  $(".todo-text").inlineEdit({
    buttons: '',
    cancelOnBlur: true,
    save: function (e, data) {
      const newTodoID = $(this).parent().attr('id');
      browser.storage.sync.set({ [newTodoID]: data.value });
    }
  });

  function bindClearAction($elements, clearAll) {
    $elements.click(function (e) {
      e.preventDefault();
      const listToImpact = e.originalEvent.srcElement.getAttribute('data-list');
      $.publish('/clear-all/', [listToImpact, clearAll]);
    });
  }

  // Sweep done / Clear all
  bindClearAction($sweepDone, false);
  bindClearAction($clearAll, true);

  // Keyboard for cycling the todo items
  itemLists.forEach($itemList => {
    $itemList.on('keydown', 'li.todo-card', function (e) {
      const $item = $(this);

      console.log("$item", $item, "e", e)

      // Do not reorder while typing/editing inside child controls
      const tagName = e.target.tagName.toLowerCase();
      const isEditableTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        e.target.isContentEditable;

      if (isEditableTarget) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();

        const $prev = $item.prev('li.todo-card');

        if ($prev.length) {
          $item.insertBefore($prev);
          $item.focus();
          $.publish('/regenerate-list/', []);
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();

        const $next = $item.next('li.todo-card');

        if ($next.length) {
          $item.insertAfter($next);
          $item.focus();
          $.publish('/regenerate-list/', []);
        }
      }
    });
  });


  // Subscribes
  function incrementListCounter(listName) {
    state.counters[listName]++;
    browser.storage.sync.set({ [storageKeys.counter(listName)]: state.counters[listName] });
  }


  // See if this can be moved to another file
  $.subscribe('/add/', function () {
    let todoToAdd = null;
    for (ind = 0; ind < $newTodo.length; ind++) {
      const todoBox = $newTodo[ind];
      if (todoBox.value !== "") {
        todoToAdd = $newTodo[ind];
      }
    }
    if (todoToAdd) {
      // Figure out which list it's in
      const listName = todoToAdd.getAttribute('data-list');
      const listToImpact = lists[listName].$items;
      const listCounter = state.counters[listName]

      // Take the value of the input field and save it to localStorage
      const newTodoID = storageKeys.todo(listName, listCounter);
      browser.storage.sync.set({ [newTodoID]: todoToAdd.value });

      // Set the to-do max counter so on page refresh it keeps going up instead of reset
      const counterKey = `todo-counter-${listName}`;
      browser.storage.sync.set({ [storageKeys.counter(listName)]: listCounter });

      // Append a new list item with the value of the new todo list
      browser.storage.sync.get(newTodoID, function (result) {
        listToImpact.append(constructToDoCard(newTodoID, result[newTodoID]));
        //$('li a:visible').fadeOut();
        $.publish('/regenerate-list/', []);
      });

      // Hide the new list, then fade it in for effects
      $(`#${newTodoID}`).css('display', 'none').fadeIn();

      // Empty the input field
      todoToAdd.value = "";

      incrementListCounter(listName);
      // ScrollMessage();
    }
  });

  $.subscribe('/remove/', function ($this) {
    const parentId = $this.parent().parent().attr('id');

    // Remove todo list from localStorage based on the id of the clicked parent element
    browser.storage.sync.remove(parentId);

    // Remove todo from the dones list, in case it was there
    if (checkIfCompleted(parentId)) {
      state.dones.splice(state.dones.indexOf(parentId), 1);
      browser.storage.sync.set({ [storageKeys.dones]: state.dones });
    }

    // Fade out the list item then remove from DOM
    $this.parent().fadeOut(function () {
      $this.parent().parent().remove();
      $.publish('/regenerate-list/', []);
    });

    // ScrollMessage();
  });

  const reassignToList = (inputDict) => {
    const target = inputDict['target'];
    const items = inputDict['items'];
    const listCounter = state.counters[target]
    items.each(function () {
      if (this.id.indexOf(target) < 0) {
        // Reassign ID
        const oldID = this.id;
        const newID = storageKeys.todo(target, listCounter);
        this.id = newID;
        incrementListCounter(target);

        // Store todo item under new key
        browser.storage.sync.get(oldID, function (retrieved) {
          browser.storage.sync.set({ [newID]: retrieved[oldID] });
        });

        if (checkIfCompleted(oldID)) { // If the todo was already done
          state.dones.splice(state.dones.indexOf(oldID), 1); // Remove the old todo ID from the dones list
          state.dones.push(newID); // and push in the new one
          browser.storage.sync.set({ [storageKeys.dones]: state.dones });
        }
      }
    });
    // ScrollMessage();
  };

  $.subscribe('/regenerate-list/', function () {
    // Make sure all items in the respective lists have the right 'tag' (in event of cross-list movement)
    listNames.forEach(list => reassignToList({ 'target': list, 'items': $(`#shown-items-${list} li`) }));

    // Empty the order array
    state.order.length = 0;

    // Go through the list item, grab the ID then push into the array
    listNames.forEach(list => {
      $(`#shown-items-${list} li`).each(function () {
        const id = $(this).attr('id');
        state.order.push(id);
      });
    })

    // Convert the array into string and save to localStorage
    browser.storage.sync.set({ [storageKeys.orders]: state.order.join(',') });
  });

  $.subscribe('/clear-all/', function (listToImpactName, clearAll) {
    const itemsToImpact = $(`#shown-items-${listToImpactName} li a`);
    itemsToImpact.each(function (index) {
      const parentId = $(this).closest('li').attr('id');
      if (clearAll || (!clearAll && checkIfCompleted(parentId))) {
        $.publish('/remove/', [$(this)]);
      }
    });
  });
});
