import fetch from "node-fetch";

var url = 'https://dev.azure.com/golightstream/Joao/_apis/build/builds?project=Devops%204&$top=1&status=completed&result=succeeded&queryOrder=finishTimeDescending';
var token = '6dmi6oxftmo5g362l75tupd7yea6rbn3apg5kshhvmonbpsbvsja';

async function getData(url, token){
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic' + Buffer.from(`joao@golightstream.com:${token}`).toString('base64'),
        'Content-Type': 'application/json'
      },
    });
    
    let data = await response.json();
    return data;
}

var dataBuild = await getData(url, token);
var commitHash = dataBuild.value[0].triggerInfo['ci.sourceSha'];

process.stdout.write(commitHash);