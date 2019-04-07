const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');
const WickrUser = WickrIOBotAPI.WickrUser;
const bot = new WickrIOBotAPI.WickrIOBot();

process.stdin.resume(); //so the program will not close instantly

async function exitHandler(options, err) {
  try {
    var closed = await bot.close();
    if (err || options.exit) {
      console.log("Exit reason:", err);
      process.exit();
    } else if (options.pid) {
      process.kill(process.pid);
    }
  } catch (err) {
    console.log(err);
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

async function main() {
  try {
    var tokens = JSON.parse(process.env.tokens);
    var status;
    if (process.argv[2] === undefined) {
      status = await bot.start(tokens.BOT_USERNAME.value)
    } else {
      status = await bot.start(process.argv[2])
    }
    if (!status) {
      exitHandler(null, {
        exit: true,
        reason: 'Client not able to start'
      });
    }
    await bot.startListening(listen); //Passes a callback function that will receive incoming messages into the bot client
    ///////////////////////
    //Start coding below and modify the listen function to your needs
    ///////////////////////

  } catch (err) {
    console.log(err);
  }
}


async function listen(message) {
  try {
    var parsedMessage = bot.parseMessage(message); //Parses an incoming message and returns and object with command, argument, vGroupID and Sender fields
    if (!parsedMessage) {
      return;
    }
    console.log('New incoming Message:', parsedMessage);
    var wickrUser;
    var command = parsedMessage.command;
    var message = parsedMessage.message;
    var argument = parsedMessage.argument;
    var userEmail = parsedMessage.userEmail;
    var vGroupID = parsedMessage.vgroupid;
    var convoType = parsedMessage.convoType;
    var personal_vGroupID = "";

    if (convoType === 'personal')
      personal_vGroupID = vGroupID;

    var found = bot.getUser(userEmail); //Look up user by their wickr email
    if (!found) { //Check if a user exists in the database
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        personal_vGroupID: personal_vGroupID,
        command: "",
        argument: ""
      });
      var added = bot.addUser(wickrUser); //Add a new user to the database
      var user = bot.getUser(userEmail);
      console.log('getUser():', user);
      user.token = "example_token_A1234";
      console.log(bot.getUser(userEmail)); //Print the changed user object
    }

    //how to determine the command a user sent and handling it
    if (command === '/help') {
      var reply = "What can I help you with?";

      /////to reply back to the user privately uncomment the following 2 lines
      // var users = [userEmail];
      // var sMessage = WickrIOAPI.cmdSend1to1Message(users, reply); //Respond back to the user(using user wickrEmail)

      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply); //Respond back to the user or room with a message(using vGroupID)
      console.log(sMessage);
    }
  } catch (err) {
    console.log(err);
  }
}

main();
