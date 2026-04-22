// An editable, sortable list
// http://web.koesbong.com/2011/01/24/sortable-and-editable-to-do-list-using-html5s-localstorage/

$(function () {

  const browser = (window.browser) ?? window.chrome;

  let il = 1;
  let im = 1;
  let ir = 1;
  let dones = [];

  const listCounters = ['todo-counter-left', 'todo-counter-mid', 'todo-counter-right', 'todo-dones'];

  let j = 0;
  let k;

  const forms = [$('#todo-form-left'), $('#todo-form-mid'), $('#todo-form-right')]
  const itemLists = [$('#shown-items-left'), $('#shown-items-mid'), $('#shown-items-right')]

  const $removeLink = $('#shown-items-left li a');

  const $itemListLeft = $('#shown-items-left');
  const $itemListMid = $('#shown-items-mid');
  const $itemListRight = $('#shown-items-right');

  const $editable = $('.editable');
  const $sweepDone = $('.sweep-link');
  const $clearAll = $('.clear-all-link');
  const $newTodo = $('.todo');

  const order = [];
  let orderList;

  const checkIfCompleted = (toDoKey) => dones.indexOf(toDoKey) > -1;

  // Holds the HTML for a todo card (HTML might appear elsewhere as well)
  const constructToDoCard = function (toDoKey, toDoText) {
    const done = checkIfCompleted(toDoKey) ? 'checked' : '';
    const fontColorToUse = done === 'checked' ? 'shadow-color' : 'main-font-color';
    const borderColorToUse = done === 'checked' ? 'shadow-border-color' : 'main-border-color';
    return `
      <li id="${toDoKey}" class="todo-card main-bg-color ${fontColorToUse} ${borderColorToUse}">
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
      $("li a").fadeOut();
    });
  };

  browser.storage.sync.get(listCounters, function (result) {
    il = (result['todo-counter-left']) ? result['todo-counter-left'] + 1 : 1;
    im = (result['todo-counter-mid']) ? result['todo-counter-mid'] + 1 : 1;
    ir = (result['todo-counter-right']) ? result['todo-counter-right'] + 1 : 1;
    dones = (result['todo-dones']) ? result['todo-dones'] : [];
  });

  // Load todo list keys
  browser.storage.sync.get('todo-orders', function (retrieved) {
    orderList = retrieved['todo-orders'];
    orderList = orderList ? orderList.split(',') : [];

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
        dones.push(toDoKey);
      }
    }
    else {
      updateClasses($toDoLiItemEl, fontBorderClassPair, shadowClassPair);
      $toDoTextDiv.removeClass('todo-card-done');
      if (checkIfCompleted(toDoKey)) {
        dones.splice(dones.indexOf(toDoKey), 1);
      }
    }
    browser.storage.sync.set({
      'todo-dones': dones
    });
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
      connectWith: ['#shown-items-left, #shown-items-mid, #shown-items-right'],
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

  // Fade In and Fade Out the Remove link on hover
  itemLists.forEach($itemList => {
    $itemList.on('mouseover mouseout', 'li', function (event) {
      const $this = $(this).find('a').stop(true, true);
      if (event.type === 'mouseover') {
        $this.fadeIn();
      } else {
        $this.fadeOut();
      }
    });
  });

  // Subscribes

  function incrementListCounter(listID) {
    switch (listID) {
      case 'left':
        il++;
        browser.storage.sync.set({ 'todo-counter-left': il });
        break;
      case 'mid':
        im++;
        browser.storage.sync.set({ 'todo-counter-mid': im });
        break;
      case 'right':
        ir++;
        browser.storage.sync.set({ 'todo-counter-right': ir });
        break;
    }
  }


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
      const listID = todoToAdd.getAttribute('data-list');
      let listToImpact;
      let listCounter;

      switch (listID) {
        case 'left':
          listToImpact = $itemListLeft;
          listCounter = il;
          break;
        case 'mid':
          listToImpact = $itemListMid;
          listCounter = im;
          break;
        case 'right':
          listToImpact = $itemListRight;
          listCounter = ir;
          break;
      }

      // Take the value of the input field and save it to localStorage
      const newTodoID = `todo-${listID}-${listCounter}`;
      browser.storage.sync.set({ [newTodoID]: todoToAdd.value });

      // Set the to-do max counter so on page refresh it keeps going up instead of reset
      const counterKey = `todo-counter-${listID}`;
      browser.storage.sync.set({ [counterKey]: listCounter });

      // Append a new list item with the value of the new todo list
      browser.storage.sync.get(newTodoID, function (result) {
        listToImpact.append(constructToDoCard(newTodoID, result[newTodoID]));
        $('li a:visible').fadeOut();
        $.publish('/regenerate-list/', []);
      });

      // Hide the new list, then fade it in for effects
      $(`#${newTodoID}`).css('display', 'none').fadeIn();

      // Empty the input field
      todoToAdd.value = "";

      incrementListCounter(listID);
      // ScrollMessage();
    }
  });

  $.subscribe('/remove/', function ($this) {
    const parentId = $this.parent().parent().attr('id');

    // Remove todo list from localStorage based on the id of the clicked parent element
    browser.storage.sync.remove(parentId);

    // Remove todo from the dones list, in case it was there
    if (checkIfCompleted(parentId)) {
      dones.splice(dones.indexOf(parentId), 1);
      browser.storage.sync.set({
        'todo-dones': dones
      });
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

    switch (target) {
      case 'left':
        listCounter = il;
        break;
      case 'mid':
        listCounter = im;
        break;
      case 'right':
        listCounter = ir;
        break;
    }

    items.each(function () {
      if (this.id.indexOf(target) < 0) {
        // Reassign ID
        let oldValue;
        const oldID = this.id;
        const newID = `todo-${target}-${listCounter}`;
        this.id = newID;

        incrementListCounter(target);

        // Store todo item under new key
        browser.storage.sync.get(oldID, function (retrieved) {
          oldValue = retrieved[oldID];
          browser.storage.sync.set({ [newID]: oldValue });
        });

        if (checkIfCompleted(oldID)) { // If the todo was already done
          dones.splice(dones.indexOf(oldID), 1); // Remove the old todo ID from the dones list
          dones.push(newID); // and push in the new one
          browser.storage.sync.set({ 'todo-dones': dones });
        }
      }
    });
    // ScrollMessage();
  };

  $.subscribe('/regenerate-list/', function () {
    const todoItemsListPositions = ['left', 'mid', 'right']

    // Make sure all items in the respective lists have the right 'tag' (in event of cross-list movement)
    todoItemsListPositions.forEach(list => {
      reassignToList({
        'target': list,
        'items': $(`#shown-items-${list} li`)
      });
    })

    // Empty the order array
    order.length = 0;

    // Go through the list item, grab the ID then push into the array
    todoItemsListPositions.forEach(list => {
      $(`#shown-items-${list} li`).each(function () {
        const id = $(this).attr('id');
        order.push(id);
      });
    })

    // Convert the array into string and save to localStorage
    browser.storage.sync.set({ 'todo-orders': order.join(',') });
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
