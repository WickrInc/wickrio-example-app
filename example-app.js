const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');
const WickrUser = WickrIOBotAPI.WickrUser;
const bot = new WickrIOBotAPI.WickrIOBot();

//so the program will not close instantly
process.stdin.resume();

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

    // The following call passes a callback function to the bot API. 
    // The listen function will be called for each message received.
    await bot.startListening(listen);

  } catch (err) {
    console.log(err);
  }
}


function listen(message) {
  try {
    // The parseMessage() function will parse the incoming message and
    // returns and object with command, argument, vGroupID and Sender fields
    var parsedMessage = bot.parseMessage(message);
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

    // Look up user by their wickr username
    var found = bot.getUser(userEmail);
    //Check if a user exists in the database
    if (found === undefined) {
      wickrUser = new WickrUser(userEmail, {
        index: 0,
        personal_vGroupID: personal_vGroupID,
        command: "",
        argument: ""
      });
      //Add a new user to the database
      var user = bot.addUser(wickrUser);
      console.log('Added user:', user);
      user.token = "example_token_A1234";
      //Print the changed user object
      console.log(bot.getUser(userEmail));
    }


    // WickrIO bot commands are proceeded by the '/' (slash) character

    /*
     * Process the 'help' command
     *
     * Send a sample help message back to the user, using the vGroupID that
     * the help command was received on.  This vGroupID could be for a DM or
     * it could be a Room convo.
     */
    if (command === '/help') {
      var reply = "What can I help you with?";

      // if you want to reply back to the user privately uncomment the following 2 lines
      // var users = [userEmail];
      // var sMessage = WickrIOAPI.cmdSend1to1Message(users, reply);

      //Respond back to the user or room with a message(using vGroupID)
      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply);

      console.log(sMessage);
    }
    /*
     * Process the 'list' command
     *
     * A response will be sent with that contains a list of choices
     */
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
    /*
     * Process the '/dm' command (aka Direct Message)
     *
     * This command will retrieve the list of Wickr users in your network,
     * generate a list of those users.  This list will be sent as a response.
     * When you select one of those users it will respond back to you with a
     * 'dm' button.  When you click on that button the client will open a DM
     * convo with that user.
     */
    else if (command === '/dm') {
      /*
       * If there are no arguments then respond with the list of users in this network
       */
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
      }
      /*
       * Else the command has an argument that should be a wickr user.
       * Send a response that contains a DM button 
       */
      else {
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
    /*
     * Process the '/button' command
     *
     * Responds with several buttons, of the different button types.
     */
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

      //Respond back to the user or room with a message(using vGroupID)
      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], messagemetastring);
    }
  } catch (err) {
    console.log(err);
  }
}

main();
