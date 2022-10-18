import fetch from "node-fetch";
import fs from "fs";
import request from "request";

// take the commit from gitCommits.txt that retrieve all commits in json
const commits = JSON.parse(fs.readFileSync('gitCommits.txt'));
const shortCurUrl = 'https://api.app.shortcut.com/api/v3/stories/';
const shortCutToken = '634daf64-6577-49f8-b2fe-0b76c8c4433c';


async function getData(storieId){
    let response = await fetch(shortCurUrl + storieId, {
      method: 'GET',
      headers: {
        'Shortcut-Token': shortCutToken,
        'Content-Type': 'application/json'
      },
    });
    
    let data = await response.json();
    return data;
}

// create arr of blocks and the limit of slack to send in a simple post
let blocks = [];

// create arr of stories linking the shortCut with the tag sc-
let stories = commits.filter(commit => commit.message.includes('SC-'));

// will open and for throught the commits to create blocks layout
commits.forEach(commit => {
    // verify if this commit has a message to includes it in blocks
    if(commit.message){ 
        // including the new objects into the blocks
        // if you need to change any layout thing, please visit: https://app.slack.com/block-kit-builder/T03KZ5E4075#%7B%22blocks%22:%5B%5D%7D
        blocks.push(
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": commit.message.trim()
                }
            }, 
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": commit.commit
                    }, 
                    {
                        "type": "plain_text",
                        "text": commit.date
                    },
                    {
                        "type": "plain_text",
                        "text": commit.author.name
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Github link to the <https://github.com/golightstream/test-joao/commit/${commit.commit}|Commit>`
                }
            },
            {
                "type": "divider"
            }
        )
    }
});

// today the slack limit is 50 per block, if you need to see please visit: https://api.slack.com/reference/block-kit/blocks
let limitSlack = 50; 

// create a chunk function divided to limitSlack var (limit of slack) and returns result with new array splited if there is more blocks that than defined in limitSlack var
// example, with limitSlack = 50 and blocks.length = 70, will create a new array with an index [1] = { first 50 objects}, [2] = {next 20 objects}
const blocksChunks = blocks.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index/limitSlack)
  
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []
    }
  
    resultArray[chunkIndex].push(item)
  
    return resultArray 
}, []);

// After create a blocks Chucked array, I'm sending a post that sends every 50 blocks at a time, which at this point is the limit set by slack.
blocksChunks.forEach(block => {

    /* make a request to send post to slack, respecting the limit of blocks defined in the limitSlack */
    request.post(
        process.env.SLACKENDPOINT,
        {
            json: {
                blocks: block
            }
        }
    );
});

// Send link to the Azure Devops Job
request.post(
    process.env.SLACKENDPOINT,
    {
        json: {
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Azure Devops <https://dev.azure.com/golightstream/Joao/_build/results?buildId=${process.env.TAG}&view=results|JOB>`
                    }
                },
                {
                    "type": "divider"
                }
            ]
        }
    }
);

let storiesToSend = await stories.map(async commit => {
    let storieId = commit.message.split(' ').filter(el => el.includes('SC-')).join().replace('SC-', '');
    let storie;

    var dataBuild = await getData(storieId);

    storie = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ` <https://app.shortcut.com/lightstream/story/${storieId}|SC-${storieId}:${dataBuild.name}>`
            }
        },
        {
            "type": "divider"
        } 
    ]


    return storie;
});

request.post(
    process.env.SLACKENDPOINT,
    {
        json: {
            blocks: storiesToSend
        }
    }
);