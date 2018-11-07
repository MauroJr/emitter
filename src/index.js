"use strict";

module.exports = createEmitter;

/**
 * @typedef {object} Emitter
 * @property {function} on
 * @property {function} once
 * @property {function} off
 * @property {function} emit
 * @property {function} prependListener
 * @property {function} prependOnceListener
 * @property {function} eventNames
 * @property {function} listeners
 */

/** @typedef {(...args) => void} Listener */
/** @typedef {Listener[]} Listeners*/

/**
 * Emitter Factory
 * @returns Emitter
 */
function createEmitter() {
  /** @type {Object.<string, Listeners>} */
  const events = {};

  /**
   * @public
   * @type {Emitter}
   */
  const emitter = Object.freeze({
    on,
    once,
    off,
    emit,
    prependListener,
    prependOnceListener,
    eventNames,
    listeners: getListeners
  });

  return emitter;

  /**
   * @public
   * @param {string} eventName
   * @param {Listener} listener
   * @returns {Emitter}
   */
  function on(eventName, listener) {
    const listeners = getListeners(eventName);

    addListener(listeners, listener);
    return emitter;
  }

  /**
   * @public
   * @param {string} eventName
   * @param {Listener} [listener]
   * @returns {Emitter}
   */
  function off(eventName, listener) {
    const listeners = getListeners(eventName);

    if (listener === undefined) {
      listeners.length = 0;
      return emitter;
    }

    removeListener(listeners, listener);
    return emitter;
  }

  /**
   * @public
   * @param {String} eventName
   * @param {Listener} listener
   */
  function once(eventName, listener) {
    const listeners = getListeners(eventName);
    const wrapper = onceWrapper(listeners, listener);

    addListener(listeners, wrapper);
    return emitter;
  }

  /**
   * @public
   * @param {string} eventName
   * @param {...any} args
   * @returns {Emitter}
   */
  function emit(eventName, ...args) {
    const listeners = getListeners(eventName);

    let index = listeners.length - 1;
    while (index > -1) {
      listeners[index](...args);
      index -= 1;
    }

    return emitter;
  }

  /**
   * @public
   * @param {string} eventName
   * @param {Listener} listener
   * @returns {Emitter}
   */
  function prependListener(eventName, listener) {
    const listeners = getListeners(eventName);

    addListener(listeners, listener, "prepend");
    return emitter;
  }

  /**
   * @public
   * @param {string} eventName
   * @param {Listener} listener
   * @returns {Emitter}
   */
  function prependOnceListener(eventName, listener) {
    const listeners = getListeners(eventName);
    const wrapper = onceWrapper(listeners, listener);

    addListener(listeners, wrapper, "prepend");
    return emitter;
  }

  /**
   * @returns {string[]}
   */
  function eventNames() {
    return Object.keys(events);
  }

  /**
   * @public
   * @param {string} eventName
   * @returns {Listeners}
   */
  function getListeners(eventName) {
    let listeners = events[eventName];

    if (listeners === undefined) {
      listeners = [];
    }

    return listeners;
  }

  /**
   * @private
   * @param {Listeners} listeners
   * @param {Listener} listener
   * @param {'prepend'} [prepend]
   * @returns {boolean}
   */
  function addListener(listeners, listener, prepend) {
    if (listeners.indexOf(listener) > -1) {
      return false;
    }

    if (prepend === "prepend") {
      listeners.push(listener);
    } else {
      listeners.unshift(listener);
    }

    return true;
  }

  /**
   * @private
   * @param {Listeners} listeners
   * @param {Listener} listener
   */
  function removeListener(listeners, listener) {
    const index = listeners.indexOf(listener);

    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * @private
   * @param {Listeners} listeners
   * @param {Listener} listener
   * @returns {Listener}
   */
  function onceWrapper(listeners, listener) {
    function wrapper(...args) {
      listener(...args);
      removeListener(listeners, wrapper);
    }

    return wrapper;
  }
}
