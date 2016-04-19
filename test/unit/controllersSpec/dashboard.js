/* global expect */

'use strict';

describe('Dashboard Controllers', function () {
    beforeEach(module('dashboardApp'));
    //beforeEach(module('qaServices'));
    //beforeEach(module('socketApp'));

    describe('dashboardController', function () {
        var scope, ctrl;

        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            ctrl = $controller('dashboardController', {$scope: scope});
        }));

        it('should init modal correctly', function () {
            expect(scope.qlModal).to.be.false;
        });

        it('should change modal value to true', function () {
            scope.showQl();
            expect(scope.qlModal).to.be.true;
        });

    });

    describe('dashboardHomeController', function () {
    });

    describe('runningQuizController', function () {
        var scope, ctrl, $httpBackend, createCtrl, post;

        beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            post = $httpBackend.expectPOST('presenter/mock').
                    respond({status: 'created'});
            scope = $rootScope.$new();
            createCtrl = function () {
                ctrl = $controller('runningQuizController', {$scope: scope, $routeParams: {quiz: 'mock'}});
                $httpBackend.flush();
            };

        }));
        it('should start a quiz and show a success alert', function () {
            createCtrl();
            expect(scope.quiz).to.equal('mock');
            expect(scope.serverLink).to.equal('./presenter/mock');
            expect(scope.clientLink).to.equal(location.protocol + '//' + location.host + '/answer/mock');
            expect(scope.running).to.equal('running');
            expect(scope.response).to.exist;
            expect(scope.responseStyle).to.equal('alert-success');

        });
        it('should have a running quiz and warning alert if the quiz is already running in backend', function () {
            //expect backend is already running the quiz
            post.respond({status: 'running'});
            createCtrl();
            expect(scope.quiz).to.equal('mock');
            expect(scope.serverLink).to.equal('./presenter/mock');
            expect(scope.clientLink).to.equal(location.protocol + '//' + location.host + '/answer/mock');
            expect(scope.running).to.equal('running');
            expect(scope.response).to.exist;
            expect(scope.responseStyle).to.equal('alert-warning');
        });
        it('should show an danger alert if another response is received', function () {
            //expect backend is already running the quiz
            post.respond({status: 'error'});
            createCtrl();
            expect(scope.quiz).to.equal('mock');
            expect(scope.serverLink).to.be.undefined;
            expect(scope.clientLink).to.be.undefined;
            expect(scope.running).to.be.undefined;
            expect(scope.responseStyle).to.equal('alert-danger');
        });

        describe('stop a quiz', function () {
            var stop;

            beforeEach(function () {
                //expect backend is already running the quiz
                post.respond({status: 'running'});
                createCtrl();
                //expect backend stop quiz and respond ok
                stop = $httpBackend.expectDELETE('presenter/mock').
                        respond({status: 'ok'});

            });
            it('should stop the running quiz', function () {
                scope.stopQuiz();
                $httpBackend.flush();
                expect(scope.quiz).to.equal('mock');
                expect(scope.running).to.equal('');
                expect(scope.response).to.exist;
                expect(scope.responseStyle).to.equal('alert-info');
            });
            it('should warn if there is an attempt to stop a quiz not running', function () {
                //expect server to respond with missing 
                stop.respond({status: 'missing'});
                scope.stopQuiz();
                $httpBackend.flush();
                expect(scope.quiz).to.equal('mock');
                expect(scope.running).to.equal('');
                expect(scope.response).to.exist;
                expect(scope.responseStyle).to.equal('alert-warning');
            });

            it('should show an danger alert if another response is received', function () {
                stop.respond({status: 'error'});
                scope.stopQuiz();
                $httpBackend.flush();
                expect(scope.quiz).to.equal('mock');
                expect(scope.responseStyle).to.equal('alert-danger');
            });

            it('should restart a quiz', function () {
                scope.stopQuiz();
                $httpBackend.flush();
                expect(scope.quiz).to.equal('mock');
                expect(scope.running).to.equal('');
                expect(scope.response).to.exist;
                expect(scope.responseStyle).to.equal('alert-info');
                $httpBackend.expectPOST('presenter/mock').
                        respond({status: 'created'});
                scope.startQuiz();
                $httpBackend.flush();
                expect(scope.quiz).to.equal('mock');
                expect(scope.serverLink).to.equal('./presenter/mock');
                expect(scope.clientLink).to.equal(location.protocol + '//' + location.host + '/answer/mock');
                expect(scope.running).to.equal('running');
                expect(scope.response).to.exist;
                expect(scope.responseStyle).to.equal('alert-success');
            });

        });
    });

    describe('deleteQuizController', function () {
        var scope, ctrl, $httpBackend, createCtrl, remove;

        beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            remove = $httpBackend.expectDELETE('quiz/mock').
                    respond({status: 'ok'});
            scope = $rootScope.$new();
            createCtrl = function () {
                ctrl = $controller('deleteQuizController', {$scope: scope, $routeParams: {quiz: 'mock'}});
                scope.deleteQuiz();
                $httpBackend.flush();
            };

        }));

        it('should send a delete quiz request and show a success alert', function () {
            createCtrl();
            expect(scope.quiz).to.equal('mock');
            expect(scope.response).to.exist;
            expect(scope.responseStyle).to.equal('alert-success');
        });

        it('should send a delete quiz request and show an info alert if the quiz does not exist', function () {
            //expect missing from server response
            remove.respond({status: 'missing'});
            createCtrl();
            expect(scope.quiz).to.equal('mock');
            expect(scope.response).to.exist;
            expect(scope.responseStyle).to.equal('alert-info');
        });

        it('should send a delete quiz request and show an danger alert if another response is received', function () {
            //expect missing from server response
            remove.respond({status: 'error'});
            createCtrl();
            expect(scope.quiz).to.equal('mock');
            expect(scope.response).to.exist;
            expect(scope.responseStyle).to.equal('alert-danger');
        });
    });

    describe('Quiz list modal', function () {
        var $compile,
                $timeout,
                scope,
                htmlFragment = function () {
                    return "<div><ql-modal visible=\"qlModal\" class=\"modal\" tabindex=\"-1\" role=\"dialog\"></ql-modal></div>";
                };

        //load template url modals/quizList.html
        beforeEach(module('modal'));

        beforeEach(inject(function (_$compile_, $rootScope, _$timeout_) {
            $compile = _$compile_;
            scope = $rootScope.$new();
            $timeout = _$timeout_;
        }));
        //<div><ql-modal visible="qlModal"  class="modal fade" tabindex="-1" role="dialog"></ql-modal></div>


        describe('two quizes at server', function () {
            var $httpBackend;
            beforeEach(inject(function (_$httpBackend_) {
                $httpBackend = _$httpBackend_;
                $httpBackend.whenGET('quiz').
                        respond(["QuizOne", "QuizTwo"]);
            }));

            it('should open a modal', function (done) {
                // Compile a piece of HTML containing the directive
                var element = $compile(htmlFragment())(scope);

                //check that html is updated through bootstrap event
                element.on('shown.bs.modal', function () {
                    try {
                        expect(element.find('ql-modal').attr('style')).to.have.string('display: inline;');
                    } catch (err) {
                        done(err);
                    }
                    done();
                });
                //show popup
                scope.qlModal = true;
                scope.$digest();
                $httpBackend.flush();
            });

            it('should have the list of quizes with the expected links', function () {
                // Compile a piece of HTML containing the directive
                var element = $compile(htmlFragment(true))(scope);
                scope.qlTitle = "Show quizes";
                scope.qlMethod = "show";

                scope.$digest();
                $httpBackend.flush();
                //var contents = element.contents();
                var title = element.find("ql-modal div div div h4").text();
                expect(title).to.equal('Show quizes');

                var quizes = element.find("ql-modal div div div div a");
                expect(quizes.length).to.equal(2);
                expect(quizes.eq(0).text()).to.equal('QuizOne');
                expect(quizes.eq(0).attr('href')).to.equal('show/QuizOne/');
                expect(quizes.eq(0).attr('ng-click')).to.equal('closeModal()');

                expect(quizes.eq(1).text()).to.equal('QuizTwo');
                expect(quizes.eq(1).attr('href')).to.equal('show/QuizTwo/');
                expect(quizes.eq(1).attr('ng-click')).to.equal('closeModal()');
            });

            it('should close an open modal by changing visible attr', function (done) {
                // Compile a piece of HTML containing the directive
                var element = $compile(htmlFragment())(scope);

                //show popup
                scope.qlModal = true;
                scope.$digest();
                $httpBackend.flush();

                //check that html is updated through bootstrap event
                element.on('hidden.bs.modal', function () {
                    try {
                        expect(element.find('ql-modal').attr('style')).to.have.string('display: none;');
                    } catch (err) {
                        done(err);
                    }
                    done();
                });

                scope.qlModal = false;
                scope.$digest();
            });

            it('should close an open modal by clicking a item of the list', function (done) {
                // Compile a piece of HTML containing the directive
                var element = $compile(htmlFragment())(scope);

                //show popup
                scope.qlModal = true;
                scope.$digest();
                $httpBackend.flush();

                //check that html is updated through bootstrap event
                element.on('hidden.bs.modal', function () {
                    try {
                        expect(element.find('ql-modal').attr('style')).to.have.string('display: none;');
                    } catch (err) {
                        done(err);
                    }
                    done();
                });

                var quizes = element.find("ql-modal div div div div a");
                expect(quizes.eq(0).attr('ng-click')).to.equal('closeModal()');
                //expect(element.html()).to.equal('closeModal()');
                quizes.eq(0).trigger('click');
                scope.$digest();
                $timeout.flush();
                expect(scope.qlModal).to.be.false;
            });
            
            it('should close an open modal by clicking close button', function (done) {
                // Compile a piece of HTML containing the directive
                var element = $compile(htmlFragment())(scope);

                //show popup
                scope.qlModal = true;
                scope.$digest();
                $httpBackend.flush();

                //check that html is updated through bootstrap event
                element.on('hidden.bs.modal', function () {
                    try {
                        expect(element.find('ql-modal').attr('style')).to.have.string('display: none;');
                    } catch (err) {
                        done(err);
                    }
                    done();
                });

                var quizes = element.find("ql-modal div div div button");
                //expect(element.html()).to.equal('closeModal()');
                quizes.eq(0).trigger('click');
                scope.$digest();
                $timeout.flush();
                expect(scope.qlModal).to.be.false;
            });

        });


    });
});