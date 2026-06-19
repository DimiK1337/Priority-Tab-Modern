// src/features/priorities/editing.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.editing = (() => {
  const createEditing = ({ browser }) => {
    const { createTodoText } = window.Prioritab.priorities.render;
    const { saveTodoText } = window.Prioritab.priorities.storage;

    const startInlineTodoEdit = (todoTextEl) => {
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

      const finishEdit = (nextValue, shouldSave) => {
        if (didCommit) return;
        didCommit = true;

        const finalValue = shouldSave ? nextValue.trim() : originalValue;
        const displayValue = finalValue || originalValue;

        const freshTodoTextEl = createTodoText(displayValue);
        todoTextEl.replaceWith(freshTodoTextEl);

        const shouldPersistEdit = shouldSave && finalValue && finalValue !== originalValue;
        if (!shouldPersistEdit) return;

        saveTodoText(browser, todoID, finalValue);
      };

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

      input.addEventListener('blur', () => {
        finishEdit(originalValue, false);
      });

      input.focus();

      const cursorPosition = input.value.length;
      input.setSelectionRange(cursorPosition, cursorPosition);
    };

    const bindInlineTodoEditing = () => {
      document.addEventListener('dblclick', (event) => {
        const todoTextEl = event.target.closest('.todo-text');
        if (!todoTextEl) return;

        startInlineTodoEdit(todoTextEl);
      });
    };

    return {
      startInlineTodoEdit,
      bindInlineTodoEditing,
    };
  };

  return {
    createEditing,
  };
})();
