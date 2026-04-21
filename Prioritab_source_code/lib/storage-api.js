//Prioritab_source_code/lib/storage-api.js

// Pick the available extension API namespace.
// Chrome exposes `chrome`.
// Firefox may expose `browser`.
// We keep one shared reference so the rest of the code does not care.
const ext = typeof chrome !== 'undefined' ? chrome : browser;

/**
 * Create a small wrapper around one browser extension storage area.
 *
 * Example:
 *   const syncStorage = createExtensionStorageApi('sync');
 *   const localExtStorage = createExtensionStorageApi('local');
 *
 * Each returned object exposes:
 *   - get(keys, onSuccess, onError)
 *   - set(items, onSuccess, onError)
 *   - remove(keys, onSuccess, onError)
 *
 * This wrapper:
 *   - centralizes error handling
 *   - checks runtime.lastError
 *   - normalizes missing read results to {}
 *   - avoids repeating the same boilerplate everywhere
 */
function createExtensionStorageApi(area) {
  // Validate the requested storage area once when the wrapper is created.
  if (!ext || !ext.storage || !ext.storage[area]) {
    throw new Error(`Invalid extension storage area: ${area}`);
  }

  return {
    /**
     * Read one or more keys from the selected extension storage area.
     *
     * @param {string|string[]|Object|null} keys 
     * Same shape accepted by chrome.storage.<area>.get(...)
     * @param {Function} onSuccess
     *   Called with the retrieved object. Defaults to {} if result is missing.
     * @param {Function} [onError]
     *   Called with the error object if the read fails.
     */
    get(keys, onSuccess, onError) {
      ext.storage[area].get(keys, (result) => {
        const err = ext.runtime && ext.runtime.lastError;

        if (err) {
          console.error(`[storage.${area}.get] ${err.message}`, { keys });
          if (onError) onError(err);
          return;
        }

        if (onSuccess) onSuccess(result || {});
      });
    },

    /**
     * Save one or more key/value pairs to the selected extension storage area.
     *
     * @param {Object} items
     *   Object containing the values to store.
     * @param {Function} [onSuccess]
     *   Called after a successful write.
     * @param {Function} [onError]
     *   Called with the error object if the write fails.
     */
    set(items, onSuccess, onError) {
      ext.storage[area].set(items, () => {
        const err = ext.runtime && ext.runtime.lastError;

        if (err) {
          console.error(`[storage.${area}.set] ${err.message}`, { items });
          if (onError) onError(err);
          return;
        }

        if (onSuccess) onSuccess();
      });
    },

    /**
     * Remove one or more keys from the selected extension storage area.
     *
     * @param {string|string[]} keys
     *   Key or list of keys to remove.
     * @param {Function} [onSuccess]
     *   Called after successful removal.
     * @param {Function} [onError]
     *   Called with the error object if the removal fails.
     */
    remove(keys, onSuccess, onError) {
      ext.storage[area].remove(keys, () => {
        const err = ext.runtime && ext.runtime.lastError;

        if (err) {
          console.error(`[storage.${area}.remove] ${err.message}`, { keys });
          if (onError) onError(err);
          return;
        }

        if (onSuccess) onSuccess();
      });
    }
  };
}

// Create ready-to-use wrappers for extension storage.
const syncStorage = createExtensionStorageApi('sync');
const localExtStorage = createExtensionStorageApi('local');


// Create ready-to-use localStorage wrapper
function createPageLocalStorageApi(storageObject = window.localStorage) {
  return {
    get(key, fallback = null) {
      try {
        const raw = storageObject.getItem(key);
        if (raw === null) return fallback;

        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      } catch (err) {
        console.error(`[pageLocalStorage.get] ${err.message}`, { key });
        return fallback;
      }
    },

    set(key, value) {
      try {
        const toStore = typeof value === 'string' ? value : JSON.stringify(value);
        storageObject.setItem(key, toStore);
        return true;
      } catch (err) {
        console.error(`[pageLocalStorage.set] ${err.message}`, { key, value });
        return false;
      }
    },

    remove(key) {
      try {
        storageObject.removeItem(key);
        return true;
      } catch (err) {
        console.error(`[pageLocalStorage.remove] ${err.message}`, { key });
        return false;
      }
    }
  };
}

const pageLocalStorage = createPageLocalStorageApi();