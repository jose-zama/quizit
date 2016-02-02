var fs = require('fs');

var Session = function () {
    this.questions = JSON.parse(fs.readFileSync('./models/data.json'));
    this.currentQuestionIndex = -1;
    this.currentQuestion;
    this.correctAnswer;

    this.score = 0;
//this.answer = -1;

    this.nextQuestion = function () {
        this.currentQuestionIndex += 1;
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        if (this.currentQuestion) {
            this.correctAnswer = this.currentQuestion.answer - 1;//-1 is because answerAnswer is not 0-based index
            console.log(this.currentQuestion);
        }
    };

    this.nextQuestion();
/*
    return {
        questions: questions,
        nextQuestion: nextQuestion,
        currentQuestion: currentQuestion
    };*/
};

module.exports = Session;