var students = (function () {
    var students = [];
    var id = {};

    var isRegistered = function (username) {
        return id[username] !== undefined;
    };

    var push = function (username) {
        students.push({
            username: username,
            score: 0
        });
        id[username] = students.length - 1;
    };

    var getScore = function (username) {
        return students[id[username]].score;
    };

    var addPoints = function (username, points) {
        students[id[username]].score += points;
    };
    
    return {
        getScore: getScore,
        push: push,
        isRegistered: isRegistered,
        array: students,
        addPoints: addPoints
    };
})();

module.exports = students;