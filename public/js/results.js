(function () {
    var app = angular.module('resultsApp', []);

    app.controller('questionController', ['$window','socket' , function ($window, socket) {
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
            socket.on('questions:init', function (question) {
                if(question){
                    questionView.showQuestion(question);
                }else{
                    $window.location.href = './results';
                }
            });
            //questionView.showQuestion(questionView.question);

            //TODO: ad data to project
            /*$http.get('/data/data.json').success(function (data) {
             questionView.products = data;
             });*/

            /*for (var i = 0; i < question1.options.length; i++) {
             questionView.options.push({text: question1.options[i], style: ''});
             }*/

            questionView.showCorrectAnswer = function () {
                questionView.options[questionView.question.answer - 1].style = 'list-group-item-success';
                questionView.isAnswerShown = true;
                socket.emit('score', questionView.question.answer);
            };

            questionView.next = function () {
                socket.emit('questions:next', null, function (question) {
                    if (question) {
                        questionView.showQuestion(question);
                    }else{
                        $window.location.href = './results';
                    }
                    
                });
            };

        }]);

})();