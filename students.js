'use strict';
var students = function () {
    this.students = {};
};

students.prototype.isTaken = function (username) {
    return this.students[username] !== undefined;
};

students.prototype.push = function (username) {
    this.students[username] = {
        score: 0
    };
};

students.prototype.getScore = function (username) {
    return this.students[username].score;
};

students.prototype.addPoints = function (username, points) {
    this.students[username].score += points;
};

students.prototype.toArray = function () {
    var array = [];
    for (var item in this.students) {
        if (this.students.hasOwnProperty(item)) {
            array.push({
                username: item,
                score: this.students[item].score
            });
        }
    }
    return array;
};

module.exports = students;