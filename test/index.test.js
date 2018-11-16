'use strict';

const { expect } = require('chai');
const createEmitter = require('../src');

describe('Create a Emitter', function () {
  it('Should create a emitter', function () {
    const emitter = createEmitter();

    expect(emitter.on).to.be.a('function');
    expect(emitter.once).to.be.a('function');
    expect(emitter.off).to.be.a('function');
    expect(emitter.emit).to.be.a('function');
    expect(emitter.prependListener).to.be.a('function');
    expect(emitter.prependOnceListener).to.be.a('function');
    expect(emitter.eventNames).to.be.a('function');
    expect(emitter.listeners).to.be.a('function');
    expect(emitter.dispose).to.be.a('function');
  });
});

describe('Listen for events', function () {
  it('should always listen to a event', function (done) {
    const emitter = createEmitter();
    let count = 0;

    emitter.on('someEvent', (param) => {
      count += 1;
      expect(param).to.be.equal(`running${count}`);

      if (count === 3) {
        done();
      }
    });

    emitter.emit('someEvent', 'running1');
    emitter.emit('someEvent', 'running2');
    emitter.emit('someEvent', 'running3');
  });

  it('should return a emitter with dispose method', function (done) {
    const emitter = createEmitter();
    let count = 0;

    expect(emitter.dispose).to.be.a('function');

    const someEvent = emitter.on('someEvent', (param) => {
      count += 1;
      expect(param).to.be.equal('running');
    });

    function emit(next) {
      emitter.emit('someEvent', 'running');
      setTimeout(next, 10);
    }

    emit(() => {
      someEvent.dispose();
      emit(() => {
        emit(() => {
          expect(count).to.be.equal(1);
          done();
        });
      });
    });
  });

  it('should listen to a event only once', function (done) {
    const emitter = createEmitter();
    let count = 0;

    emitter.once('someEvent', (param) => {
      count += 1;
      expect(param).to.be.equal('running');
    });

    function emit(next) {
      emitter.emit('someEvent', 'running');
      setImmediate(next);
    }

    emit(() => {
      emit(() => {
        emit(() => {
          expect(count).to.be.equal(1);
          done();
        });
      });
    });
  });

  it('should prepend a event listener', function () {
    const emitter = createEmitter();
    let executed = false;

    emitter.on('someEvent', () => {
      expect(executed).to.be.equal(true);
    });

    emitter.prependListener('someEvent', () => {
      executed = true;
    });

    emitter.emit('someEvent');
  });

  it('should prepend a once listener', function () {
    const emitter = createEmitter();
    let count = 0;
    let executed = false;

    emitter.on('someEvent', () => {
      expect(executed).to.be.equal(true);
    });

    emitter.prependOnceListener('someEvent', () => {
      executed = true;
      count += 1;
    });

    emitter.emit('someEvent');
    emitter.emit('someEvent');

    expect(count).to.be.equal(1);
  });

  it('should remove a event listener', function (done) {
    const emitter = createEmitter();
    let count = 0;

    const listener = (param) => {
      count += 1;
      expect(param).to.be.equal('running');
    };

    emitter.on('someEvent', listener);

    function emit(next) {
      emitter.emit('someEvent', 'running');
      setTimeout(next, 10);
    }

    emit(() => {
      emitter.off('someEvent', listener);
      emit(() => {
        emit(() => {
          expect(count).to.be.equal(1);
          done();
        });
      });
    });
  });

  it('should remove all event listeners', function (done) {
    const emitter = createEmitter();
    let count = 0;

    const listener1 = (param) => {
      count += 1;
      expect(param).to.be.equal('running');
    };

    const listener2 = (param) => {
      count += 1;
      expect(param).to.be.equal('running');
    };

    emitter.on('someEvent', listener1);
    emitter.on('someEvent', listener2);

    function emit(next) {
      emitter.emit('someEvent', 'running');
      setImmediate(next);
    }

    emit(() => {
      emitter.off('someEvent');
      emit(() => {
        emit(() => {
          expect(count).to.be.equal(2);
          done();
        });
      });
    });
  });

  it('should get all event names', function () {
    const noop = () => {};
    const eventsNames = ['someEvent1', 'someEvent2', 'someEvent3'];
    const emitter = createEmitter();

    eventsNames.forEach(evt => emitter.on(evt, noop));

    expect(emitter.eventNames()).to.have.members(eventsNames);
  });

  it('should return all listeners from a given event', function () {
    const listeners = [() => {}, () => {}, () => {}];
    const emitter = createEmitter();

    listeners.forEach(listener => emitter.on('someEvent', listener));

    expect(emitter.listeners('someEvent')).to.have.members(listeners);
  });

  it('should add the same listener only once', function () {
    const listener = () => {};
    const emitter = createEmitter();

    emitter.on('someEvent', listener);
    emitter.on('someEvent', listener);
    emitter.on('someEvent', listener);

    expect(emitter.listeners('someEvent').length).to.be.equal(1);
    expect(emitter.listeners('someEvent')[0]).to.be.equal(listener);
  });

  it('should ignore unknow listener', function () {
    const listener = () => {};
    const unknowListener = () => {};
    const emitter = createEmitter();

    emitter.on('someEvent', listener);
    emitter.off('someEvent', unknowListener);

    expect(emitter.listeners('someEvent').length).to.be.equal(1);
    expect(emitter.listeners('someEvent')[0]).to.be.equal(listener);
  });
});
