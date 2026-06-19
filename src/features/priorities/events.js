// src/features/priorities/events.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.events = (() => {
  const isInteractiveTarget = (target) => {
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
  };

  const bindCheckboxCompletion = ({
    browser,
    itemLists,
    state,
    addDone,
    removeDone,
    saveDones,
  }) => {
    itemLists.forEach((itemList) => {
      itemList.addEventListener('change', (event) => {
        const checkbox = event.target.closest('input[type="checkbox"]');
        if (!checkbox || !itemList.contains(checkbox)) return;

        const todoCard = checkbox.closest('li.todo-card');
        if (!todoCard) return;

        const todoID = todoCard.id;

        if (checkbox.checked) {
          todoCard.classList.add('todo-card-done-state');
          addDone(todoID);
        } else {
          todoCard.classList.remove('todo-card-done-state');
          removeDone(todoID);
        }

        saveDones(browser, state.dones);
      });
    });
  };

  const bindNewTodoEscape = ({ newTodoInputs }) => {
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
  };

  const bindAddTodoForms = ({ forms, addTodo }) => {
    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        addTodo();
      });
    });
  };

  const bindRemoveTodo = ({ itemLists, removeTodo }) => {
    itemLists.forEach((itemList) => {
      itemList.addEventListener('click', (event) => {
        const deleteLink = event.target.closest('.todo-delete-link');
        if (!deleteLink || !itemList.contains(deleteLink)) return;

        event.preventDefault();
        event.stopPropagation();

        removeTodo(deleteLink);
      });
    });
  };

  const bindClearAction = ({ elements, clearAll, clearTodos }) => {
    elements.forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();

        const listToImpact = event.target.getAttribute('data-list');
        if (!listToImpact) return;

        clearTodos(listToImpact, clearAll);
      });
    });
  };

  const bindTodoFocus = ({ itemLists }) => {
    itemLists.forEach((itemList) => {
      itemList.addEventListener('click', (event) => {
        const todoCard = event.target.closest('li.todo-card');
        if (!todoCard || !itemList.contains(todoCard)) return;
        if (isInteractiveTarget(event.target)) return;

        todoCard.focus();
      });
    });
  };

  const bindKeyboardMovement = ({
    itemLists,
    regenerateList,
    moveTodoHorizontally,
  }) => {
    itemLists.forEach((itemList) => {
      itemList.addEventListener('keydown', (event) => {
        const todoCard = event.target.closest('li.todo-card');
        if (!todoCard || !itemList.contains(todoCard)) return;
        if (isInteractiveTarget(event.target)) return;

        const handleArrowUp = () => {
          event.preventDefault();

          const previousTodoCard = todoCard.previousElementSibling;

          if (previousTodoCard?.matches('li.todo-card')) {
            itemList.insertBefore(todoCard, previousTodoCard);
          } else {
            itemList.appendChild(todoCard);
          }

          todoCard.focus();
          regenerateList();
        };

        const handleArrowDown = () => {
          event.preventDefault();

          const nextTodoCard = todoCard.nextElementSibling;

          if (nextTodoCard?.matches('li.todo-card')) {
            itemList.insertBefore(nextTodoCard, todoCard);
          } else {
            const firstTodoCard = itemList.querySelector('li.todo-card');
            if (firstTodoCard) itemList.insertBefore(todoCard, firstTodoCard);
          }

          todoCard.focus();
          regenerateList();
        };

        const handleHorizontalArrow = (direction) => {
          event.preventDefault();
          moveTodoHorizontally(todoCard, direction);
        };

        if (event.key === 'ArrowUp') handleArrowUp();
        if (event.key === 'ArrowDown') handleArrowDown();
        if (event.key === 'ArrowLeft') handleHorizontalArrow('left');
        if (event.key === 'ArrowRight') handleHorizontalArrow('right');
      });
    });
  };

  // God damn, there must be a better way...
  const bindPriorityEvents = ({
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
  }) => {
    bindCheckboxCompletion({
      browser,
      itemLists,
      state,
      addDone,
      removeDone,
      saveDones,
    });

    bindNewTodoEscape({ newTodoInputs });
    bindAddTodoForms({ forms, addTodo });
    bindRemoveTodo({ itemLists, removeTodo });

    bindClearAction({
      elements: sweepDoneButtons,
      clearAll: false,
      clearTodos,
    });

    bindClearAction({
      elements: clearAllButtons,
      clearAll: true,
      clearTodos,
    });

    bindTodoFocus({ itemLists });

    bindKeyboardMovement({
      itemLists,
      regenerateList,
      moveTodoHorizontally,
    });

    bindNativeTodoSorting();
    bindInlineTodoEditing();
  };

  return {
    bindPriorityEvents,
  };
})();
