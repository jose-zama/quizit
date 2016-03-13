(function () {
    var app = angular.module('quizEditorApp', ['qaServices', 'ui.sortable']);

    app.controller('quizController', function (Quiz,$routeParams) {
        quiz = this;
        quiz.questions = Quiz.get({id:$routeParams.quiz});
        this.save = function () {
            Quiz.save({id:$routeParams.quiz}, quiz.questions);
        };

        this.addQuestion = function () {
            var q = {
                title: "",
                answer: 1,
                options: ["", "", "", ""]
            };
            quiz.questions.push(q);
        };

        this.removeQuestion = function (questionIndex) {
            quiz.questions.splice(questionIndex, 1);
        };
    });
})();