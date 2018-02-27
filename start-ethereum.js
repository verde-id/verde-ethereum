var cleanExit = function(error) {
  if(error) console.error(error); 
  ganache.kill('SIGTERM');
  process.exit(); 
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill
process.on('uncaughtException', cleanExit);

const { spawn,exec } = require('child_process');
const fs = require('fs');

var targetDir;

if(process.env.TARGET_DIR) {
  targetDir = process.env.TARGET_DIR;
}
else {
  targetDir = __dirname;
  console.log('You can pass target directory for output config file,',
  'This time it will be',targetDir);
} 

var tmpFile = '/tmp/verde-ethereum.log';

console.log('Log file for ganache is located at',tmpFile);
console.log('Starting ganache and deploy contracts ...');

let ganacheReady = false;
let ganacheOutput = '';
let partyAddress,contractAddress = {};

const ganache = spawn('ganache-cli', ['--unlock','0,1,2,3,4,5,6,7,8,9']);

ganache.stdout.on('data',function(data) {
  if(ganacheReady) return;
  ganacheOutput += data.toString();
  //console.log(data.toString());
  if(data.indexOf('Listening on') !== -1) {
    ganacheReady = true;
    partyAddress = ganacheOutput.split('\n').splice(4,10);
    for(let i in partyAddress) {
      partyAddress[i] = partyAddress[i].split(' ')[1];
    }
    //console.log(partyAddress);
  }
});

waitGanache = setInterval(function() {
  if(!ganacheReady) return;
  clearInterval(waitGanache);

  exec('rm ./build/contracts/*.json',{ cwd: __dirname },function() {
    //console.log('deleted');
    const truffle = spawn('truffle',['migrate'],{ cwd: __dirname });

    let truffleOutput = '';

    truffle.stdout.on('data',function(data) {
      truffleOutput += data.toString();
      //console.log(data.toString());
    });

    truffle.stdout.on('end',function() {
      //grep contract address and write config file
      truffleOutput = truffleOutput.split('\n');
      truffleOutput.forEach(function(line) {
        if(line.indexOf('Requests:') !== -1) contractAddress.request = line.split(' ')[3];
        if(line.indexOf('UserDirectory:') !== -1) contractAddress.directory = line.split(' ')[3];
      });
      fs.writeFileSync(targetDir + '/verde-config.json',JSON.stringify({
        partyAddress,contractAddress
      }));
      console.log('Ethereum ready, config file write at',targetDir + '/verde-config.json');
    });

  });

},500);

/*function(err,stdout,stderr) {
  if(err) throw err;
  if(stderr) throw stderr;

  console.log(stdout)

  fs.writeFileSync(targetDir + '/verde-config.json', JSON.stringify(config));
  console.log('Ethereum ready, config file is at',targetDir + '/verde-config.json');
}*/
