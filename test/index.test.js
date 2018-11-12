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

  it('should always listen to a event', function (done) {
    const emitter = createEmitter();
    let count = 0;

    emitter.once('someEvent', (param) => {
      count += 1;
      expect(param).to.be.equal('running');
    });

    function emit(next) {
      emitter.emit('someEvent', 'running');
      setTimeout(next, 10);
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

  it('should remove all event listener', function (done) {
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
      setTimeout(next, 20);
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
});
