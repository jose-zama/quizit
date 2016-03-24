'use strict';
var students = function () {
    this.students = [];
    this.id = {};

    /*return {
     getScore: getScore,
     push: push,
     isRegistered: isRegistered,
     array: students,
     addPoints: addPoints
     };*/
};

students.prototype.isRegistered = function (username) {
    return this.id[username] !== undefined;
};

students.prototype.push = function (username) {
    this.students.push({
        username: username,
        score: 0
    });
    this.id[username] = this.students.length - 1;
};

students.prototype.getScore = function (username) {
    return this.students[this.id[username]].score;
};

students.prototype.addPoints = function (username, points) {
    this.students[this.id[username]].score += points;
};

module.exports = students;