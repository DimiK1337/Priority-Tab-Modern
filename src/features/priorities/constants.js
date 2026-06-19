//src/features/priorities/constants.js

window.Prioritab = window.Prioritab || {};
window.Prioritab.priorities = window.Prioritab.priorities || {};

window.Prioritab.priorities.constants = {
  listNames: ['left', 'mid', 'right'],

  listCounters: [
    'todo-counter-left',
    'todo-counter-mid',
    'todo-counter-right',
    'todo-dones',
  ],

  storageKeys: {
    orders: 'todo-orders',
    dones: 'todo-dones',

    counter(listName) {
      return `todo-counter-${listName}`;
    },

    todo(listName, id) {
      return `todo-${listName}-${id}`;
    },
  },

  urlRegex: /\b((?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,!?;:)])/gi,
};
