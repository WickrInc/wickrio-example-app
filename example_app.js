var addon = require('wickrio_addon');
var fs = require('fs');
var Helper = require('./Helper.js');

process.title = "exampleApp";
module.exports = addon;
process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
  if (err) {
    console.log("Exit Error:", err.stack);
    addon.cmdStopAsyncRecvMessages();
    console.log(addon.closeClient());
    process.exit();
  }
  if (options.exit) {
    addon.cmdStopAsyncRecvMessages();
    console.log(addon.closeClient());
    process.exit();
  } else if (options.pid) {
    addon.cmdStopAsyncRecvMessages();
    console.log(addon.closeClient());
    process.kill(process.pid);
  }
}

//catches ctrl+c and stop.sh events
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {
  pid: true
}));
process.on('SIGUSR2', exitHandler.bind(null, {
  pid: true
}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));

//Initiate Wickr client bot from argument or config file
return new Promise(async (resolve, reject) => {
  try {
    //Checks if a client bot username was passed as an argument or not
    //and initiates the client accordingly
    if (process.argv[2] === undefined) {
      var client = await fs.readFileSync('client_bot_username.txt', 'utf-8');
      client = client.trim();
      var response = await addon.clientInit(client);
      resolve(response);
    } else {
      var response = await addon.clientInit(process.argv[2]);
      resolve(response);
    }
  } catch (err) {
    console.log(err);
    process.exit();
  }
}).then(result => {
  console.log(result);
  ///////////////////////
  //Start coding below
  ///////////////////////

  var tools = new Helper(); //Helper class provides functions to make it easier to write bots
  try {
    addon.cmdStartAsyncRecvMessages(listen); //Passes a callback function that will receive incoming messages into the bot client
  } catch (err) {
    console.log(err);
    process.exit();
  }

  function listen(message) {
    console.log(message);
    var parsedMessage = tools.parseMessage(message); //Parses an incoming message and returns and object with command, argument, vGroupID and Sender fields
    console.log('parsedMessage:', parsedMessage);
    var command = parsedMessage.command;
    var argument = parsedMessage.argument;
    var vGroupID = parsedMessage.vgroupid;
    var message = "Hi, what can I help you with?";

    if (command === '/help') {
      try {
        var sMessage = addon.cmdSendRoomMessage(vGroupID, message); //Respond back to the user with a message
        console.log(sMessage);
      } catch (err) {
        console.log(err);
      }
    }
  }
}).catch(error => {
  console.log(error);
});
