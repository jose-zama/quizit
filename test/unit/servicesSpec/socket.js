/* global expect, sinon */

'use strict';

describe('socket wrapper service', function () {
    beforeEach(module('socketApp'));

    var $rootScope;
    var stub, SocketMock;

    beforeEach(function () {
        var socket = io('http://localhost');
        var Prot = Object.getPrototypeOf(socket);
        sinon.stub(Prot, 'on');
        sinon.stub(Prot, 'emit');
        sinon.stub(Prot, 'removeAllListeners');
        SocketMock = Prot;
    });

    beforeEach(inject(function (_$rootScope_) {
        $rootScope = _$rootScope_;
    }));

    it('should call on method', inject(function (socket) {
        var obj = new socket('/namespace');
        var callBackCalled = false;
        SocketMock.on.callsArg(1);
        obj.on('event', function () {
            callBackCalled = true;
        });
        //While creating the socket, on is called once, plus the method under test
        expect(SocketMock.on.calledTwice).to.be.true;
        expect(callBackCalled).to.be.true;
    }));

    it('should call emit method', inject(function (socket) {
        var obj = new socket('/namespace');
        var callBackCalled = false;
        SocketMock.emit.callsArg(2);
        obj.emit('event', 'message', function () {
            callBackCalled = true;
        });
        expect(SocketMock.emit.calledOnce).to.be.true;
        expect(callBackCalled).to.be.true;
    }));

    it('should call remove listeners', inject(function (socket) {
        var obj = new socket('/namespace');
        obj.removeAllListeners();
        expect(SocketMock.removeAllListeners.calledOnce).to.be.true;
    }));

    afterEach(function () {
        SocketMock.on.restore();
        SocketMock.emit.restore();
        SocketMock.removeAllListeners.restore();
    });
});