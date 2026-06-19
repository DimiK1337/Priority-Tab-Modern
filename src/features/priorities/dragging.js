// src/features/priorities/dragging.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.dragging = (() => {
  const createDragging = ({ regenerateList }) => {
    const { listNames } = window.Prioritab.priorities.constants;

    let draggingTodoCard = null;

    const blockedDragTargetTags = [
      'input',
      'textarea',
      'select',
      'label',
      'a',
      'i',
    ];

    const isDragBlockedTarget = (target) => {
      const tagName = target.tagName.toLowerCase();

      return (
        blockedDragTargetTags.includes(tagName) ||
        target.isContentEditable
      );
    };

    const getTodoListElements = () =>
      listNames
        .map((listName) => document.querySelector(`#shown-items-${listName}`))
        .filter(Boolean);

    const getDragAfterElement = (listElement, mouseY) => {
      const todoCards = Array.from(
        listElement.querySelectorAll('li.todo-card:not(.dragging)')
      );

      return todoCards.reduce(
        (closest, todoCard) => {
          const box = todoCard.getBoundingClientRect();
          const offset = mouseY - box.top - box.height / 2;

          if (offset < 0 && offset > closest.offset) {
            return {
              offset,
              element: todoCard,
            };
          }

          return closest;
        },
        {
          offset: Number.NEGATIVE_INFINITY,
          element: null,
        }
      ).element;
    };

    const bindNativeTodoSorting = () => {
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
    };

    return {
      bindNativeTodoSorting,
    };
  };

  return {
    createDragging,
  };
})();
