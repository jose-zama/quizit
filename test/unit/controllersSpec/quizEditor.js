/* global expect */

'use strict';

describe('Quiz editor controllers', function () {
    beforeEach(module('quizEditorApp'));
    //beforeEach(module('qaServices'));

    describe('Quiz edition', function () {
        var scope, $httpBackend, $controller, $location,
                mock = function () {
                    return [{title: "What is the best Nintendo's game?", answer: 1,
                            options: ["Super Mario Bros 3", "Zelda Ocarina of Time", "Super Smash Bros", "Yoshi's Island"]},
                        {title: "What's the best Sony Play Station's game?", answer: 2,
                            options: ["God of War", "Crash Bandicoot", "Uncharted", "Last of Us"]}];
                };

        beforeEach(inject(function (_$httpBackend_, _$controller_, $rootScope, _$location_) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            $controller = _$controller_;
            $location = _$location_;
        }));

        describe('test edition', function () {
            beforeEach(function () {
                $httpBackend.expectGET('quiz/mock').
                        respond(mock());
                var ctrl = $controller('quizController', {$scope: scope, $routeParams: {quiz: 'mock'}});
            });

            it('should fetch a quiz', function () {
                expect(scope.questions).to.shallowDeepEqual([]);
                expect(scope.title).to.equal('mock');
                $httpBackend.flush();
                expect(scope.questions).to.shallowDeepEqual(mock);
            });

            it('should add a new question', function () {
                expect(scope.questions).to.have.lengthOf(0);
                scope.addQuestion();
                expect(scope.questions).to.have.lengthOf(1);
                $httpBackend.flush();
                expect(scope.questions).to.have.lengthOf(2);
                scope.addQuestion();
                expect(scope.questions).to.have.lengthOf(3);
            });

            it('should delete the first question', function () {
                $httpBackend.flush();
                expect(scope.questions).to.have.lengthOf(2);
                scope.removeQuestion(0);
                expect(scope.questions).to.have.lengthOf(1);
                expect(scope.questions[0]).to.shallowDeepEqual(mock()[1]);
            });

        });



        describe('test creation', function () {
            beforeEach(function () {
                //quiz undefined so it creates a new test
                var ctrl = $controller('quizController', {$scope: scope, $routeParams: {}});
            });

            it('should create a quiz and save it', function () {
                expect(scope.title).to.equal('');
                expect(scope.questions).to.shallowDeepEqual([]);
                scope.title = 'MockTitle';
                scope.questions = {title: "Test question 1?", answer: 1,
                    options: ["answer 1", "answer 2", "answer 3", "answer 4"]};

                $httpBackend.expectPOST('quiz/MockTitle', {questions: scope.questions, oldTitle: undefined}).respond('ok');
                scope.save();
                $httpBackend.flush();
                expect($location.path()).to.equal('/edit/MockTitle');
            });


        });


    });
});