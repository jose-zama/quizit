/* global sinon, expect */

'use strict';

describe('Quiz session tests', function () {
    beforeEach(module('quizSessionApp'));

    beforeEach(module(function ($provide) {
        $provide.value('$window', {location: {href: ''}});
    }));

    describe('questionController', function () {
        var scope, ctrl, $location, createCtrl, $window, stub, SocketMock,
                questions = [{title: "What is the best Nintendo's game?", answer: 1,
                        options: ["Super Mario Bros 3", "Zelda Ocarina of Time", "Super Smash Bros", "Yoshi's Island"]},
                    {title: "What's the best Sony Play Station's game?", answer: 2,
                        options: ["God of War", "Crash Bandicoot", "Uncharted", "Last of Us"]}];

        beforeEach(inject(function (_$rootScope_, $controller, _$location_, _$window_) {
            scope = _$rootScope_.$new();
            $location = _$location_;
            $window = _$window_;

            var SocketMock_ = function () {};
            SocketMock_.prototype.on = function (eventName, callback) {};
            SocketMock_.prototype.emit = function (eventName, data, callback) {};
            SocketMock_.prototype.removeAllListeners = function () {};
            stub = sinon.stub(SocketMock_.prototype);
            SocketMock = SocketMock_;

            createCtrl = function () {
                ctrl = $controller('questionController', {$scope: scope, socket: SocketMock_});
            };
        }));

        it('should redirect to results if no question received from socket', function () {
            $location.url('presenter/quiz');
            //expect to receive no question from socket
            SocketMock.prototype.emit.callsArgWith(2, undefined);
            ctrl = createCtrl();
            expect($window.location.href).to.equal('./presenter/quiz/results');
        });

        describe('two questions in quiz', function () {
            beforeEach(function () {
                //set the mock responses from socket
                SocketMock.prototype.emit.withArgs('question:pullCurrent').onCall(0).callsArgWith(2, questions[0]);
                SocketMock.prototype.emit.withArgs('questions:next').onCall(0).callsArgWith(2, questions[1]);
                SocketMock.prototype.emit.withArgs('questions:next').onCall(1).callsArgWith(2, undefined);
                $location.url('presenter/quiz');
                ctrl = createCtrl();
            });
            it('should display the first question', function () {
                expect(scope.question).to.equal(questions[0]);
                expect(scope.title).to.equal(questions[0].title);
                var options = [{text: "Super Mario Bros 3", style: ''},
                    {text: "Zelda Ocarina of Time", style: ''},
                    {text: "Super Smash Bros", style: ''},
                    {text: "Yoshi's Island", style: ''}];
                expect(scope.options).to.eql(options);
                expect(scope.isAnswerShown).to.be.false;
            });

            it('should show the correct answer and broadcast the answer', function () {
                scope.showCorrectAnswer();
                expect(scope.isAnswerShown).to.be.true;
                expect(scope.options[questions[0].answer - 1].style).to.equal('list-group-item-success');
                for (var i = 0; i < questions.length; i++) {
                    if (i !== questions[0].answer - 1) {
                        expect(scope.options[i].style).to.equal('');
                    }
                }
                expect(SocketMock.prototype.emit.withArgs('presenter:showAnswer', questions[0].answer).calledOnce).to.be.true;
            });

            it('should get and display the next question', function () {
                scope.next();
                expect(scope.question).to.equal(questions[1]);
                expect(scope.title).to.equal(questions[1].title);
                var options = [{text: "God of War", style: ''},
                    {text: "Crash Bandicoot", style: ''},
                    {text: "Uncharted", style: ''},
                    {text: "Last of Us", style: ''}];
                expect(scope.options).to.eql(options);
                expect(scope.isAnswerShown).to.be.false;
            });

            it('should redirect to results because there is no more questions', function () {
                scope.next();//retrieve second question
                scope.next();//retrieve undefined
                expect($window.location.href).to.equal('./presenter/quiz/results');
            });

            it('should call socket.removeAllListeners()', function () {
                scope.$destroy();
                expect(SocketMock.prototype.removeAllListeners.calledOnce).to.be.true;
            });
        });

    });
});