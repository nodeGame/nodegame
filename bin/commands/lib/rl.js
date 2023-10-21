const readline = require("readline");


// Readline (init later).
let rl;

let stdoutConf = {
    willBeMuted: false,
    muted: false,
    lastPrompt: "",
    origPrompt: "",
};


function muteNext() {
    if (stdoutConf.muted) unmute();
    stdoutConf.willBeMuted = true;
}

function unmute() {
    stdoutConf.willBeMuted = false;
    stdoutConf.muted = false;
    stdoutConf.lastPrompt = "";
    stdoutConf.origPrompt = "";
}

function mute() {
    stdoutConf.willBeMuted = false;
    stdoutConf.muted = true;
}

function create() {
        
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    rl.on("SIGINT", function () {
        rl.close();
        console.log();
        console.log();
        console.log("canceled");
    });
    unmute();
    

    rl._writeToOutput = function _writeToOutput(str) {
        // console.log('INPUT ', str, str.length);
        if (stdoutConf.muted) {
            if (str.length > 2) {
                // console.log('LEN : ', str.length);
                // console.log('1');
                let len = stdoutConf.lastPrompt.length;
                let lenOrig = stdoutConf.origPrompt.length;
                str = stdoutConf.lastPrompt.substr(
                    0,
                    Math.max(lenOrig, len - 1)
                );
                stdoutConf.lastPrompt = str;
                rl.output.write(str);
            }
            else if (str.length === 2) {
                rl.output.write(str);
            }
            else {
                // console.log('2');
                rl.output.write("*");
                stdoutConf.lastPrompt += "*";
            }
        }
        else {
            // console.log('3');
            rl.output.write(str);
        }
        if (stdoutConf.willBeMuted) {
            stdoutConf.lastPrompt = stdoutConf.origPrompt = str;
            mute();
        }
    };

    return rl;
}

 /**
     * Prompt for confirmation on STDOUT/STDIN
     */
 function confirm(msg, cb) {
    rl.question(msg, function (input) {
        cb(/^y|yes|ok|true$/i.test(input));
    });
}

function questionNoBlank(msg, cb) {
    rl.question(msg, function (answer) {
        // console.log('ANSWER WAS: ' + answer);
        if ("undefined" === typeof answer || answer.trim() === "") {
            questionNoBlank(msg, cb);
            // Needed return otherwise it continues.
            return;
        }
        cb(answer);
    });
}



module.exports = { create, confirm, questionNoBlank };