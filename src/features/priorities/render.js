//src/features/priorities/render.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.render = (() => {
  const { urlRegex } = window.Prioritab.priorities.constants;

  const appendLinkifiedText = (parent, text) => {
    parent.textContent = '';

    let lastIndex = 0;

    for (const match of text.matchAll(urlRegex)) {
      const urlText = match[0];
      const startIndex = match.index;

      parent.append(document.createTextNode(text.slice(lastIndex, startIndex)));

      const link = document.createElement('a');
      link.textContent = urlText;
      link.className = 'main-font-color';
      link.href = urlText.startsWith('www.') ? `https://${urlText}` : urlText;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      ['pointerdown', 'mousedown', 'click'].forEach((eventName) => {
        link.addEventListener(eventName, (event) => {
          event.stopPropagation();
        });
      });

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
      isDone ? 'todo-card-done-state' : '',
    ].filter(Boolean).join(' ');

    todoCard.tabIndex = 0;
    todoCard.draggable = true;

    return todoCard;
  };

  return {
    appendLinkifiedText,
    createTodoCheckbox,
    createTodoText,
    createTodoDeleteButton,
    createTodoCardElement,
  };
})();

