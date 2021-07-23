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
    bot.processesJsonToProcessEnv()
    var tokens = JSON.parse(process.env.tokens);
    var status;
    if (process.argv[2] === undefined) {
      if (tokens.BOT_USERNAME !== undefined) {
        bot_username = tokens.BOT_USERNAME.value;
      } else if (tokens.WICKRIO_BOT_NAME !== undefined) {
        bot_username = tokens.WICKRIO_BOT_NAME.value
      } else {
        exitHandler(null, {
          exit: true,
          reason: 'Client username not found!'
        });
      }
      status = await bot.start(bot_username)
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


function listen(message) {
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
    if (found === undefined) { //Check if a user exists in the database
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        personal_vGroupID: personal_vGroupID,
        command: "",
        argument: ""
      });
      var user = bot.addUser(wickrUser); //Add a new user to the database
      console.log('Added user:', user);
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
    else if (command === '/list') {
      let reply = ''
      const header = 'List of commands'
      reply = header + '\n/help\n/list\n/dm\n'
      let messagemeta = {
        table: {
          name: header,
          firstcolname: 'Command',
          actioncolname: 'Select',
          rows: [
            {
              firstcolvalue: '/help to get help',
              response: '/help',
            },
            {
              firstcolvalue: '/list to get a list',
              response: '/list',
            },
            {
              firstcolvalue: '/dm to do a Direct Message',
              response: '/dm',
            },
            {
              firstcolvalue: '/button to do a Button Message',
              response: '/button',
            },
          ],
        },
        textcut: [
          {
            startindex: header.length,
            endindex: reply.length,
          },
        ],
      }

      const messagemetastring = JSON.stringify(messagemeta)
      console.log('messageMetaString=', messagemetastring)

      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], messagemetastring);
    }
    else if (command === '/dm') {
      if (argument === undefined || argument === '') {
        const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, 'Getting list of users in your network, may take some time.');

        const secGroupUsers = WickrIOAPI.cmdGetDirectory('0', '200');
        console.log('directory=', secGroupUsers)

        const secGroupUsersArray = JSON.parse(secGroupUsers)
        if (secGroupUsersArray.length === 0) {
          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, 'Please include a user to dm');
        } else {
          const header = 'Select user to /dm with'
          const reply = header
          let messagemeta = {
            table: {
              name: header,
              firstcolname: 'User',
              actioncolname: 'Select',
              rows: [],
            },
            textcut: []
          }

          secGroupUsersArray.forEach(entry => {
            if (entry.is_bot !== true) {
              // Create entry in table
              const row = {
                firstcolvalue: entry.name,
                response: '/dm ' + entry.name,
              }
              messagemeta.table.rows.push(row)
            }
          })
          const messagemetastring = JSON.stringify(messagemeta)
          console.log('messageMetaString=', messagemetastring)

          const sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], messagemetastring);
        }
      } else {
        const reply = 'this is a /dm response to ' + argument
        const btntext = 'DM ' + argument
        const messagemeta = {
          buttons: [
            {
              type: 'dm',
              text: btntext,
              messagetosend: '/ack',
              messagetodm: 'Hello there',
              userid: argument,
            },
          ],
        }
        const messagemetastring = JSON.stringify(messagemeta)
        console.log('messageMetaString=', messagemetastring)

        var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], messagemetastring);
      }
    }
    else if (command === '/button') {
      const reply = 'this is a /button response'
      const messagemeta = {
        buttons: [
          {
            type: 'message',
            text: 'Help',
            message: '/help',
            preferred: 'true',
          },
          {
            type: 'getlocation',
            text: 'Location',
          },
          {
            type: 'message',
            text: 'Buttons',
            message: '/button',
          },
          {
            type: 'message',
            text: 'DM',
            message: '/dm',
          },
        ],
      }
      const messagemetastring = JSON.stringify(messagemeta)
      console.log('messageMetaString=', messagemetastring)

      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], messagemetastring); //Respond back to the user or room with a message(using vGroupID)
    }
  } catch (err) {
    console.log(err);
  }
}

main();
