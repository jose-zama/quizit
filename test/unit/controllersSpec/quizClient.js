/* global sinon, expect */

'use strict';

describe('Quiz client tests', function () {
    beforeEach(module('quizClientApp'));
    beforeEach(module('ngCookies'));

    var stub, SocketMock;
    beforeEach(function () {
        var s = function (namespace) {
            this.namespace = namespace;
        };
        s.prototype.on = function (eventName, callback) {
            if (eventName === 'showAnswer')
                SocketMock.showAnswer = callback;
            if (eventName === 'questions:change')
                SocketMock.changeQuestion = callback;
        };
        s.prototype.emit = function (eventName, data, callback) {};
        s.prototype.removeAllListeners = function () {};
        stub = sinon.stub(s.prototype);
        SocketMock = s;
        SocketMock.prototype.on.restore();
    });

    describe('logonCtrl', function () {
        var scope, ctrl, $cookies, $location, createCtrl;

        beforeEach(inject(function (_$rootScope_, $controller, _$location_, _$cookies_) {
            scope = _$rootScope_.$new();
            $location = _$location_;
            $cookies = _$cookies_;

            createCtrl = function () {
                var routeParams = {quizID: 'quiz'};
                ctrl = $controller('logonCtrl', {$scope: scope, socketObj: new SocketMock(), $routeParams: routeParams});
            };
        }));

        it('should let a user log on and a cookie should be written', function () {
            SocketMock.prototype.emit.withArgs('user:login').callsArgWith(2, false);
            createCtrl();
            scope.setUser('amy');
            expect($location.path()).to.equal('/quiz');
            expect($cookies.get('username')).to.equal('amy');
            expect(scope.alert).to.not.exist;
        });

        it('should show a message that the username is already taken', function () {
            //server respond with username taken = true
            SocketMock.prototype.emit.withArgs('user:login').callsArgWith(2, true);
            createCtrl();
            scope.setUser('amy');
            //cookie should not be set
            expect($cookies.get('username')).to.be.undefined;
            expect(scope.alert).to.exist;
        });

        it('should call socket.removeAllListeners()', function () {
            createCtrl();
            scope.$destroy();
            expect(SocketMock.prototype.removeAllListeners.calledOnce).to.be.true;
        });

        afterEach(function () {
            $cookies.remove('username');
        });
    });

    describe('answersPanelController', function () {
        var scope, ctrl, $cookies, $location, createCtrl, $timeout, $rootScope, userDetails,
                questions = [{title: "What is the best Nintendo's game?", answer: 1,
                        options: ["Super Mario Bros 3", "Zelda Ocarina of Time", "Super Smash Bros", "Yoshi's Island"]},
                    {title: "What's the best Sony Play Station's game?", answer: 2,
                        options: ["God of War", "Crash Bandicoot", "Uncharted", "Last of Us"]}];

        beforeEach(inject(function (_$rootScope_, $controller, _$location_, _$cookies_, _$timeout_, _userDetails_) {
            scope = _$rootScope_.$new();
            $location = _$location_;
            $cookies = _$cookies_;
            $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            userDetails = _userDetails_;

            $cookies.put('username', 'amy');

            createCtrl = function () {
                var routeParams = {quizID: 'quiz'};
                ctrl = $controller('answersPanelController', {$scope: scope, socketObj: new SocketMock(), $routeParams: routeParams});
            };
        }));

        it('should redirect to client login if a cookie username does not exist', function () {
            $cookies.remove('username');
            createCtrl();
            $timeout.flush();
            expect($location.path()).to.equal('/quiz/user');
        });

        it('should redirect to client login if a cookie username does exist but the user is not registered at server', function () {
            SocketMock.prototype.emit.withArgs('user:isRegistered').callsArgWith(2, false);
            var spy = sinon.spy($cookies, 'remove');
            var methodSpied = spy.withArgs('username', {path: window.location.pathname});
            createCtrl();
            $timeout.flush();
            expect(methodSpied.calledOnce).to.be.true;
            expect($location.path()).to.equal('/quiz/user');
            $cookies.remove.restore;
        });

        describe('once a user logged', function () {
            var cookieRemoveMethodSpy;
            beforeEach(function () {
                SocketMock.prototype.emit.withArgs('user:isRegistered').callsArgWith(2, true);
                SocketMock.prototype.emit.withArgs('question:pullCurrent').callsArgWith(2, questions[0]);
                SocketMock.prototype.emit.withArgs('student:getScore').callsArgWith(2, 1, 2);

                var spy = sinon.spy($cookies, 'remove');
                cookieRemoveMethodSpy = spy.withArgs('username', {path: window.location.pathname});

                createCtrl();
                $timeout.flush();
            });

            it('should show the current question of the quiz session', function () {
                expect(userDetails.username).to.equal('amy');
                expect(scope.selectedAnswer).to.be.null;
                expect(scope.question).to.equal("What is the best Nintendo's game?");
                var options = [{text: "Super Mario Bros 3", style: 'btn-primary'},
                    {text: "Zelda Ocarina of Time", style: 'btn-primary'},
                    {text: "Super Smash Bros", style: 'btn-primary'},
                    {text: "Yoshi's Island", style: 'btn-primary'}];
                expect(scope.options).to.eql(options);
            });

            it('should let the user select an answer', function () {
                scope.selectAnswer(0);//choose the first answer
                expect(scope.selectedAnswer).to.equal(0);
            });

            it('should highlight the correct answer and request the server to score the student', function () {
                scope.selectAnswer(0);//choose the first answer
                expect(scope.selectedAnswer).to.equal(0);
                expect(scope.isActive(0)).to.be.true;
                SocketMock.showAnswer(1);
                expect(scope.options[0].style).to.equal('btn-success');
                expect(scope.options[1].style).to.equal('btn-primary');
                expect(scope.options[2].style).to.equal('btn-primary');
                expect(scope.options[3].style).to.equal('btn-primary');
                expect(SocketMock.prototype.emit.withArgs('student:score', 0).calledOnce).to.be.true;

            });

            it('should highlight the correct answer and the wrong answer chosen by the user', function () {
                scope.selectAnswer(1);//choose the first answer
                expect(scope.selectedAnswer).to.equal(1);
                expect(scope.isActive(1)).to.be.true;
                SocketMock.showAnswer(1);
                expect(scope.options[0].style).to.equal('btn-success');
                expect(scope.options[1].style).to.equal('btn-danger');
                expect(scope.options[2].style).to.equal('btn-primary');
                expect(scope.options[3].style).to.equal('btn-primary');
                expect(SocketMock.prototype.emit.withArgs('student:score', 1).calledOnce).to.be.true;
            });

            it('should show the next question when triggeredby the socket', function () {
                SocketMock.changeQuestion(questions[1]);
                expect(scope.selectedAnswer).to.be.null;
                expect(scope.question).to.equal("What's the best Sony Play Station's game?");
                var options = [{text: "God of War", style: 'btn-primary'},
                    {text: "Crash Bandicoot", style: 'btn-primary'},
                    {text: "Uncharted", style: 'btn-primary'},
                    {text: "Last of Us", style: 'btn-primary'}];
                expect(scope.options).to.eql(options);
            });

            it('should show results if no more questions from server and remove cookie', function () {
                SocketMock.changeQuestion(questions[2]);
                expect(userDetails.score).to.equal(1);
                expect(userDetails.totalQuestions).to.equal(2);
                expect(cookieRemoveMethodSpy.calledOnce).to.be.true;
                expect($location.path()).to.equal('/result');
            });

            afterEach(function () {
                $cookies.remove.restore;
            });
        });

        it('should call socket.removeAllListeners()', function () {
            createCtrl();
            scope.$destroy();
            expect(SocketMock.prototype.removeAllListeners.calledOnce).to.be.true;
        });

        afterEach(function () {
            $cookies.remove('username');
        });
    });

    describe('resultCtrl', function () {
        var scope, ctrl, $location, createCtrl, userDetails;

        beforeEach(inject(function (_$rootScope_, $controller, _$location_, _userDetails_) {
            scope = _$rootScope_.$new();
            $location = _$location_;
            userDetails = _userDetails_;

            userDetails.username = undefined;
            userDetails.score = undefined;
            userDetails.totalQuestions = undefined;

            createCtrl = function () {
                var routeParams = {quizID: 'quiz'};
                ctrl = $controller('resultCtrl', {$scope: scope, socketObj: new SocketMock(), $routeParams: routeParams});
            };

        }));

        it('should retrieve the user results', function () {
            userDetails.username = 'pepe';
            userDetails.score = 5;
            userDetails.totalQuestions = 8;
            createCtrl();
            expect(scope.username).to.equal('pepe');
            expect(scope.score).to.equal(5);
            expect(scope.totalQuestions).to.equal(8);
        });

        it('should redirect to error page if score undefined', function () {
            createCtrl();
            expect(scope.username).to.be.undefined;
            expect(scope.score).to.be.undefined;
            expect(scope.totalQuestions).to.be.undefined;
            expect($location.path()).to.equal('/error');
        });

        it('should call socket.removeAllListeners()', function () {
            createCtrl();
            scope.$destroy();
            expect(SocketMock.prototype.removeAllListeners.calledOnce).to.be.true;
        });
    });

    describe('socket factory', function () {
        beforeEach(module(function ($provide) {
            $provide.value('socket', SocketMock);
        }));
        
        beforeEach(inject(function ($routeParams) {
            $routeParams.quizID = 'quiz';
        }));

        it('should create a new socket', inject(function (socketObj) {
            expect(socketObj.namespace).to.equal('/quiz');
        }));
    });
});