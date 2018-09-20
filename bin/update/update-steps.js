const readline = require('readline');
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

var steps = [
    'Update version in package.json in nodegame',
    'Update CHANGELOG file in nodegame',
    'Update version in nodegame-installer',
    'Git push nodegame to master',
    'Check tests on Travis',
    'Upload nodegame-installer to website',
    'Update version in index.htm and upload it to website',
    'Update changelog.htm and upload it to website',
    'Commit and push changes to nodegame-website',
    'Update nodegame-heroku package.json version',
    'Tweet about new version :)'
];

var counter = 0;
function step(str) {
    return new Promise((resolve) => {
        rl.question('  ' + (counter + 1) + '. ' + steps[counter++], () => {
            resolve();
            if (counter >= steps.length) {
                console.log();
                console.log('  Done!');
                rl.close();
            }
        });
    });
};

console.log();

step()
    .then(() => { return step(); })
    .then(() => { return step(); })
    .then(() => { return step(); })
    .then(() => { return step(); })
    .then(() => { return step(); })
    .then(() => { return step(); })
    .then(() => { return step(); })
    .then(() => { return step(); });
