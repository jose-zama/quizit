(function () {
    var app = angular.module('questionApp', ['socketApp']);

    app.controller('questionController', ['$window', 'socket', function ($window, socket) {
            questionView = this;
            questionView.title = '';
            questionView.options = [];
            questionView.isAnswerShown = false;

            questionView.buttonLabel = 'Show answer';
            questionView.question = {};

            questionView.showQuestion = function (question) {
                questionView.question = question;
                questionView.title = question.title;
                questionView.options = [];
                for (var i = 0; i < question.options.length; i++) {
                    questionView.options.push({text: question.options[i], style: ''});
                }
                questionView.isAnswerShown = false;
                //socket.emit('questions:change', question);
            };

            //listeners
            //set current question
            socket.emit('question:pullCurrent', '', function (question) {
                if (question) {
                    questionView.showQuestion(question);
                    //socket.emit('user:send','presenter');
                } else {
                    $window.location.href = './results';
                }
            });

            /*socket.on('questions:init', function (question) {
             if (question) {
             questionView.showQuestion(question);
             //socket.emit('user:send','presenter');
             } else {
             $window.location.href = './results';
             }
             });*/

            questionView.showCorrectAnswer = function () {
                questionView.options[questionView.question.answer - 1].style = 'list-group-item-success';
                questionView.isAnswerShown = true;
                socket.emit('presenter:showAnswer', questionView.question.answer);
            };

            questionView.next = function () {
                socket.emit('questions:next', null, function (question) {
                    if (question) {
                        questionView.showQuestion(question);
                    } else {
                        $window.location.href = './results';
                    }

                });
            };

        }]);

})();