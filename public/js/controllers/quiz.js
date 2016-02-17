(function () {
    var app = angular.module('quizApp', ['qaServices','ui.sortable']);

    app.controller('quizController', function (Question) {
        quiz = this;
        //var questions = [];
        quiz.questions = Question.query();
        //console.log(questions);
        //this.question = questions[0].title;

        this.save = function () {
            //quiz.questions[0].$save();
            Question.saveAll({}, quiz.questions);
        };

        this.addQuestion = function () {
            var q = {
                title: "",
                answer: 1,
                options: ["", "", "", ""]
            };
            quiz.questions.push(q);
        };
        
        this.removeQuestion = function(questionIndex){            
            quiz.questions.splice(questionIndex,1);
        };

    });

})();