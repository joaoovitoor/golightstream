const fs = require('fs');

// take the commit from gitCommits.txt that retrieve all commits in json
const commits = JSON.parse(fs.readFileSync('gitCommits.txt'));

// will open and for throught the commits to handle individual commits
commits.forEach(commit => {
    if(commit.message){
        // if the message exists, show console.log with message of the git
        console.log('message: ', commit.message);
    }
});
