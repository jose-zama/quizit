var students = (function () {
    var num = 1;
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

    var getUsername = function () {
        return 'User' + num++;
    };

    var addPoints = function (username, points) {
        console.log('username to add points ' + username);
        console.log(id);
        console.log(students);
        students[id[username]].score += points;
    };
    
    return {
        getUsername: getUsername,
        push: push,
        isRegistered: isRegistered,
        array: students,
        addPoints: addPoints
    };
})();

module.exports = students;