var program = require('commander'),
    stringrouter = require('stringrouter');

var router = stringrouter.getInstance();

var credentials = {
    username: 'anon',
    password: null
};

router.bindPattern('help', function(packet, callback) {
    console.log('You asked for help!');
    callback.call(undefined, undefined, packet);
});

router.bindPattern('echo {text:.*}', function(packet, callback) {
    console.log('You said: %s', packet.params.text);
    callback.call(undefined, undefined, packet);
});

router.bindPattern('logout', function(packet, callback) {
    credentials.username = 'anon';
    credentials.password = null;
    console.log('You are now logged out.');
    callback.call(undefined, undefined, packet);
});

router.bindPattern('open the pod bay door{door:[s]?} {hal:[Hh]al}', function(packet, callback) {
    console.log("I'm afraid I can't do that Dave.");
    callback.call(undefined, undefined, packet);
});

router.bindPattern('login', function(packet, callback) {
    program.prompt('username: ', function(username) {
        program.password('password: ', function(password) {
            if (username === 'username' && password === 'password') {
                credentials.username = username;
                credentials.password = password;
                console.log('Success!');
            } else {
                console.log('Invalid credentials');
            }
            callback.call(undefined, undefined, packet);
        });
    });
});

console.log('Welcome, this is a Nodejs StringRouter-based CLI');
console.log('You can use commands like login, logout, help, echo and exit.');

// read - eval - print loop
var repl = function() {
    program.prompt('<'+ credentials.username + '>: ', function(input) {
        if (input === 'exit') {
            console.log('goodbye');
            process.stdin.destroy();
        } else {
            router.dispatch(input, function(err, packet, data) {
                if (err) {
                    console.log('Unknown command: %s', input);
                }
                repl();
            });
        }
    });
};

repl();
