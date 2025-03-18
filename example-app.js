const fs = require('fs')
const path = require('path')

const WickrIOAPI = require('wickrio_addon');
const WickrIOBotAPI = require('wickrio-bot-api');
const WickrUser = WickrIOBotAPI.WickrUser;
const bot = new WickrIOBotAPI.WickrIOBot();
const apiService = bot.apiService();

var bot_username
var output_filename

//so the program will not close instantly
process.stdin.resume();

// Used to wait for commands to finish
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

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
    console.log("starting to listen")
    await bot.startListening(listen);

  } catch (err) {
    console.log(err);
  }
}

function outputtestmessage(message) {
    if (output_filename) {
    } else {
        console.log(message)
    }
}

async function testapis(filename) {
    var fd = fs.openSync(filename, 'w')
    fs.writeSync(fd, "Starting to run WickrIO Addon API tests\n")

    var num_success = 0
    var num_failure = 0
    var num_cantrun = 0
    var num_notcoded = 0

    // clientInit
    // This was done when the bot started, not testable

    // closeClient
    // isConnected

    // getClientState
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing getClientState')
    try {
        var result = await WickrIOAPI.getClientState()
        if (result) {
            fs.writeSync(fd, 'getClientState: success: ' + result + '\n')
            num_success++
        } else {
            fs.writeSync(fd, 'getClientState: failed: returned empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'getClientState: failed: ' + err + '\n')
        num_failure++
    }

    // cmdStartAsyncRecvMessages
    num_notcoded++
    // cmdStopAsyncRecvMessages
    num_notcoded++

    // cmdSetMsgCallback
    const msgCallbackURL="https://msgCallback"
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdSetMsgCallback')
    try {
        var result = await WickrIOAPI.cmdSetMsgCallback(msgCallbackURL)
        if (result) {
            fs.writeSync(fd, 'cmdSetMsgCallback: success: ' + result + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdSetMsgCallback: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdSetMsgCallback: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetMsgCallback
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetMsgCallback')
    try {
        var result = await WickrIOAPI.cmdGetMsgCallback()
	    if (result) {
            const response = isJson(result)
	    if (response !== false && response.callback === msgCallbackURL) {
                fs.writeSync(fd, 'cmdGetMsgCallback: success: ' + result + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdGetMsgCallback: failed: returned different value from what was set: ' + result + '\n')
                num_failure++
	    }
	} else {
            fs.writeSync(fd, 'cmdGetMsgCallback: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdGetMsgCallback: failed: ' + err + '\n')
        num_failure++
    }

    // cmdDeleteMsgCallback
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdDeleteMsgCallback')
    try {
        var result = await WickrIOAPI.cmdDeleteMsgCallback()
	if (result) {
            fs.writeSync(fd, 'cmdDeleteMsgCallback: success: ' + result + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdDeleteMsgCallback: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdDeleteMsgCallback: failed: ' + err + '\n')
        num_failure++
    }

    // cmdSetEventCallback
    const eventCallbackURL="https://eventCallback"
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdSetEventCallback')
    try {
        var result = await WickrIOAPI.cmdSetEventCallback(eventCallbackURL)
	if (result) {
            fs.writeSync(fd, 'cmdSetEventCallback: success: ' + result + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdSetEventCallback: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdSetEventCallback: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetEventCallback
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetEventCallback')
    try {
        var result = await WickrIOAPI.cmdGetEventCallback()
	    if (result) {
            const response = isJson(result)
	    if ((response !== false) && (response.callback === eventCallbackURL)) {
                fs.writeSync(fd, 'cmdGetEventCallback: success: ' + result + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdGetEventCallback: failed: returned different value from what was set: ' + result + '\n')
                num_failure++
	    }
	} else {
            fs.writeSync(fd, 'cmdGetEventCallback: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdGetEventCallback: failed: ' + err + '\n')
        num_failure++
    }

    // cmdDeleteEventCallback
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdDeleteEventCallback')
    try {
        var result = await WickrIOAPI.cmdDeleteEventCallback()
	if (result) {
            fs.writeSync(fd, 'cmdDeleteEventCallback: success: ' + result + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdDeleteEventCallback: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdDeleteEventCallback: failed: ' + err + '\n')
        num_failure++
    }

    // cmdPostEvent
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdPostEvent')
    try {
        var result = await WickrIOAPI.cmdPostEvent("This is a test event, please disregard.")
	if (result) {
            fs.writeSync(fd, 'cmdPostEvent: success: ' + result + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdPostEvent: failed: returned empty value\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdPostEvent: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetDirectory
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetDirectory')
    // Global variable that can be used by following tests
    var directoryUsers = undefined
    try {
        const directory = await WickrIOAPI.cmdGetDirectory('0', '100')
    	if (directory) {
            directoryUsers = isJson(directory)
            fs.writeSync(fd, 'cmdGetDirectory: first 10 users:\n')
            fs.writeSync(fd, 'cmdGetDirectory: success: ' + directory + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetDirectory: failed: returned empty list\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetDirectory: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetSecurityGroups
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetSecurityGroups')

    // Global variable that can be used by following tests
    var securityGroups = undefined
    try {
        var security = await WickrIOAPI.cmdGetSecurityGroups()
	    if (security) {
            securityGroups = isJson(security)
            fs.writeSync(fd, 'cmdGetSecurityGroups: success: ' + security + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetSecurityGroups: failed: returned empty list\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetSecurityGroups: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetSecurityGroupDirectory
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetSecurityGroupDirectory')
    if (securityGroups === undefined) {
        fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: securityGroups list is undefined!\n')
        num_cantrun++
    } else if (securityGroups.size === 0) {
        fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: securityGroups list is empty!\n')
        num_cantrun++
    } else {
        try {
            const securityGroup = securityGroups[0].id
            if (securityGroup === undefined) {
                fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: securityGroup is undefined!\n')
                num_failure++
	    } else {
                var securityGroupUsers = await WickrIOAPI.cmdGetSecurityGroupDirectory(securityGroup, '0', '10')
	            if (securityGroupUsers) {
                    users = isJson(securityGroupUsers)
		        if (users.length > 10) {
                        fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: failed: returned list with too many entries!\n')
                        num_failure++
		        } else {
		        fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: first 10 users:\n')
                        fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: success: ' + securityGroupUsers + '\n')
                        num_success++
		        }
	        } else {
                    fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: failed: returned empty list\n')
                    num_failure++
	        }
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdGetSecurityGroupDirectory: failed: ' + err + '\n')
            num_failure++
        }
    }

    // cmdGetStatistics
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetStatistics')
    try {
        var statistics = await WickrIOAPI.cmdGetStatistics()
        var response = isJson(statistics)
        fs.writeSync(fd, 'cmdGetStatistics: success: ' + statistics + '\n')
        num_success++
    } catch (err) {
        fs.writeSync(fd, 'cmdGetStatistics: failed: ' + err + '\n')
        num_failure++
    }

    // cmdClearStatistics
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdClearStatistics')
    try {
        var cleared = await WickrIOAPI.cmdClearStatistics()
        fs.writeSync(fd, "cmdClearStatistics: success: " + cleared + '\n')
        num_success++
    } catch (err) {
        fs.writeSync(fd, 'cmdClearStatistics: failed: ' + err + '\n')
        num_failure++
    }

//     /*
//      * Room APIs
//      */
    // We must have a list of users to proceed with these tests!
    if (!directoryUsers || directoryUsers.length < 2) {
        fs.writeSync(fd, "**********************************************************\n")
        fs.writeSync(fd, 'Not enoughh directory users to run Room tests!\n')
        num_cantrun += 5
    } else {
        // Room value setup
//        var roomMembers = [bot_username, directoryUsers[0].name ]
        //var roomModerators = [bot_username, directoryUsers[0].name ]
        var roomMembers = [bot_username, directoryUsers[0].name ]
        var roomModerators = [bot_username]
    }
        // cmdAddRoom
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdAddRoom')
        var roomVGroupID = undefined
        try {
            const response  = await WickrIOAPI.cmdAddRoom(roomMembers, roomModerators, 'TEST: TestRoom', 'Test Room Description')
	        if (response) {
                const result = isJson(response)
                roomVGroupID = result.vgroupid
                fs.writeSync(fd, "cmdAddRoom: success: " + response + '\n')
                num_success++
	        } else {
                fs.writeSync(fd, 'cmdAddRoom: failed:\n')
                num_failure++
	        }
        } catch (err) {
            fs.writeSync(fd, 'cmdAddRoom: failed: ' + err + '\n')
            num_failure++
        }

        // cmdGetRoom
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdGetRoom')
        if (roomVGroupID) {
            try {
                const response  = await WickrIOAPI.cmdGetRoom(roomVGroupID)
	        if (response) {
                    fs.writeSync(fd, "cmdGetRoom: success: " + response + '\n')
                    num_success++
	        } else {
                    fs.writeSync(fd, 'cmdGetRoom: failed: empty value\n')
                    num_failure++
	        }
            } catch (err) {
                fs.writeSync(fd, 'cmdGetRoom: failed: ' + err + '\n')
                num_failure++
            }
	} else {
            fs.writeSync(fd, 'cmdGetRoom: room was not added or now VGroupID!\n')
            num_cantrun++
	}

        // cmdModifyRoom
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdModifyRoom')
        if (roomVGroupID) {
            // modify the title and the description
            try {
                const newTitle = 'TEST: TestRoomUpdated'
                const newDescr = 'Test Room Description Updated'
                const response  = await WickrIOAPI.cmdModifyRoom(roomVGroupID, roomMembers, roomModerators, newTitle, newDescr)
	            if (response) {
                    const getResponse  = await WickrIOAPI.cmdGetRoom(roomVGroupID)
                    const getResult = isJson(getResponse)
                    if (getResult.title === newTitle && getResult.description === newDescr) {
                        fs.writeSync(fd, "cmdModifyRoom: modify title/description success: " + response + '\n')
                        num_success++
		            } else {
                        fs.writeSync(fd, "cmdModifyRoom: didn't change the title/description failed: " + getResponse + '\n')
                        num_failure++
		            }
	            } else {
                    fs.writeSync(fd, 'cmdModifyRoom: modify title/description failed: empty value\n')
                    num_failure++
	            }
            } catch (err) {
                fs.writeSync(fd, 'cmdModifyRoom: modify title/description failed: ' + err + '\n')
                num_failure++
            }

            const newRoomMembers = [bot_username, directoryUsers[0].name ]
            const newRoomModerators = [bot_username, directoryUsers[0].name ]
            try {
                const response  = await WickrIOAPI.cmdModifyRoom(roomVGroupID, newRoomMembers, newRoomModerators, 'TEST: TestRoomUpdated', 'Test Room Description Updated')
	            if (response) {
                    const getResponse  = await WickrIOAPI.cmdGetRoom(roomVGroupID)
                    const getResult = isJson(getResponse)

                    if (getResult.members.length === newRoomMembers.length && getResult.masters.length === newRoomModerators.length) {
                        fs.writeSync(fd, "cmdModifyRoom: modify members/moderators success: " + response + '\n')
                        num_success++
		            } else {
                        fs.writeSync(fd, "cmdModifyRoom: didn't change the members/moderators failed: " + getResponse + '\n')
                        num_failure++
		            }
	            } else {
                    fs.writeSync(fd, 'cmdModifyRoom: modify members/moderators failed: empty value\n')
                    num_failure++
	            }
            } catch (err) {
                fs.writeSync(fd, 'cmdModifyRoom: modify members/moderators failed: ' + err + '\n')
                num_failure++
            }
        }
	 else {
            fs.writeSync(fd, 'cmdModifyRoom: room was not added or now VGroupID!\n')
            num_cantrun += 2
	}


        // cmdSendRoomMessage
        if (!roomVGroupID) {
            fs.writeSync(fd, "**********************************************************\n")
            fs.writeSync(fd, 'No VGroupID to send message tests!\n')
            num_cantrun += 3
        } else {
            // cmdSendRoomMessage
            fs.writeSync(fd, "**********************************************************\n")
            try {
                const response  = await WickrIOAPI.cmdSendRoomMessage(roomVGroupID, "this is a test message for Room convos")
	        if (response) {
                    fs.writeSync(fd, "cmdSendRoomMessage: success: " + response + '\n')
                    num_success++
	        } else {
                    fs.writeSync(fd, 'cmdSendRoomMessage: failed:\n')
                    num_failure++
	        }
            } catch (err) {
                fs.writeSync(fd, 'cmdSendRoomMessage: failed: ' + err + '\n')
                num_failure++
            }

            // cmdSendRoomAttachment
            fs.writeSync(fd, "**********************************************************\n")
            console.log('testing cmdSendRoomAttachment')
            const attachmentName = path.join(process.cwd(), filename)
            try {
                const response  = await WickrIOAPI.cmdSendRoomAttachment(roomVGroupID, attachmentName, 'testfile.txt')
                if (response) {
                    fs.writeSync(fd, "cmdSendRoomAttachment: success: " + response + '\n')
                    num_success++
                } else {
                    fs.writeSync(fd, 'cmdSendRoomAttachment: failed: empty value\n')
                    num_failure++
                }
            } catch (err) {
                fs.writeSync(fd, 'cmdSendRoomAttachment: failed: ' + err + '\n')
                num_failure++
            }
        }

        // cmdLeaveRoom
        num_notcoded++

    // cmdGetRooms
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetRooms')
    var rooms = undefined
    try {
        const response  = await WickrIOAPI.cmdGetRooms()
        rooms = isJson(response)
        fs.writeSync(fd, "cmdGetRooms: success: " + response + '\n')
        num_success++
    } catch (err) {
        fs.writeSync(fd, 'cmdGetRooms: failed: ' + err + '\n')
        num_failure++
    }

    // cmdDeleteRoom
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdDeleteRoom')
    var roomDeleteFailed=false
    if (rooms && rooms.rooms && rooms.rooms.length > 0) {
        for (let i=0; i<rooms.rooms.length; i++) {
            const element = rooms.rooms[i]
            if (element.title.startsWith('TEST:')) {
	        	fs.writeSync(fd, "cmdDeleteRoom: trying to delete: " + element.vgroupid + '\n')
                try {
                    const response  = await WickrIOAPI.cmdDeleteRoom(element.vgroupid)
                    if (response) {
                        fs.writeSync(fd, 'cmdDeleteRoom: success\n')
                    } else {
                        fs.writeSync(fd, 'cmdDeleteRoom: failed: empty value\n')
                        roomDeleteFailed=true
                    }
                } catch (err) {
                    fs.writeSync(fd, 'cmdDeleteRoom: failed: ' + err + '\n')
                    roomDeleteFailed=true
                }
    	    } else {
	        	fs.writeSync(fd, "cmdDeleteRoom: skipping to delete: " + element.vgroupid + '\n')
	        }
        }
        if (roomDeleteFailed) {
            num_failure++
	} else {
            num_success++
        }
    } else {
        fs.writeSync(fd, 'cmdDeleteRoom: there are no rooms to delete!\n')
        num_cantrun += 2
    }


    // cmdGetGroupConvos
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetGroupConvos')
    var groupConvos = undefined
    try {
        const response  = await WickrIOAPI.cmdGetGroupConvos()
	    if (response) {
            groupConvos = isJson(response)
            fs.writeSync(fd, 'cmdGetGroupConvos: success: ' + response + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetGroupConvos: failed: returned empty list\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetGroupConvos: failed: ' + err + '\n')
        num_failure++
    }

    // cmdDeleteGroupConvo
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdDeleteGroupConvo')
    var groupConvoDeleteFailed=false
    if (groupConvos && groupConvos.groupconvos && groupConvos.groupconvos.length > 0) {
        for (let i=0; i<groupConvos.groupconvos.length; i++) {
            const element = groupConvos.groupconvos[i]
            fs.writeSync(fd, "cmdDeleteGroupConvo: trying to delete: " + element.vgroupid + '\n')
            try {
                const response  = await WickrIOAPI.cmdDeleteGroupConvo(element.vgroupid)
                if (response) {
                    fs.writeSync(fd, 'cmdDeleteGroupConvo: success\n')
                } else {
                    fs.writeSync(fd, 'cmdDeleteGroupConvo: failed: empty value\n')
                    groupConvoDeleteFailed=true
                }
            } catch (err) {
                fs.writeSync(fd, 'cmdDeleteGroupConvo: failed: ' + err + '\n')
                groupConvoDeleteFailed=true
            }
        }
        if (groupConvoDeleteFailed) {
            num_failure++
	} else {
            num_success++
        }
    } else {
        fs.writeSync(fd, 'cmdDeleteGroupConvo: there are no group convos to delete!\n')
        num_cantrun++
    }

    // We must have a list of users to proceed with these tests!
    if (!directoryUsers || directoryUsers.length < 2) {
        fs.writeSync(fd, "**********************************************************\n")
        fs.writeSync(fd, 'Not enough directory users to run Group tests!\n')
        num_cantrun += 3
    } else {
        // Group value setup
        var groupMembers = [bot_username, directoryUsers[0].name]

        // cmdAddGroupConvo
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdAddGroupConvo')
        var groupVGroupID = undefined
        try {
            const response  = await WickrIOAPI.cmdAddGroupConvo(groupMembers)
	        if (response) {
                const result = isJson(response)
                groupVGroupID = result.vgroupid

                fs.writeSync(fd, "cmdAddGroupConvo: success: " + response + '\n')
                num_success++
	        } else {
                fs.writeSync(fd, 'cmdAddGroupConvo: failed:\n')
                num_failure++
	        }
        } catch (err) {
            fs.writeSync(fd, 'cmdAddGroupConvo: failed: ' + err + '\n')
            num_failure++
        }
    }

        // cmdGetGroupConvo
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdGetGroupConvo')
        if (groupVGroupID) {
            try {
                const response  = await WickrIOAPI.cmdGetGroupConvo(groupVGroupID)
	        if (response) {
                    fs.writeSync(fd, "cmdGetGroupConvo: success: " + response + '\n')
                    num_success++
	        } else {
                    fs.writeSync(fd, 'cmdGetGroupConvo: failed: empty value\n')
                    num_failure++
	        }
            } catch (err) {
                fs.writeSync(fd, 'cmdGetGroupConvo: failed: ' + err + '\n')
                num_failure++
            }
	} else {
            fs.writeSync(fd, 'cmdGetGroupConvo: group was not added or now VGroupID!\n')
            num_cantrun++
	}



    // cmdGetReceivedMessage
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetReceivedMessage')
    try {
        const response  = await WickrIOAPI.cmdGetReceivedMessage()
	if (response) {
            fs.writeSync(fd, 'cmdGetReceivedMessage: success: ' + response + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdGetReceivedMessage: success: returned empty list\n')
            num_success++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdGetReceivedMessage: failed: ' + err + '\n')
        num_failure++
    }



    /*
     * Global list of users to send messages/attachments to
     */
    var sendToUsers = []
    if (directoryUsers && directoryUsers.length > 2) {
        directoryUsers.forEach(element => {
            if (element.name !== bot_username && element.is_bot !== true) {
	        sendToUsers.push(element.name)
	    }
        });
    }

    // cmdSend1to1Message
    if (sendToUsers.length === 0) {
        fs.writeSync(fd, "**********************************************************\n")
        fs.writeSync(fd, 'No users to send messages tests!\n')
        num_cantrun += 3
    } else {
        // cmdSend1to1Message
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdSend1to1Message')
        try {
            const response  = await WickrIOAPI.cmdSend1to1Message(sendToUsers, "this is a test message for DM convos")
	    if (response) {
                fs.writeSync(fd, "cmdSend1to1Message: success: " + response + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdSend1to1Message: failed:\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdSend1to1Message: failed: ' + err + '\n')
            num_failure++
        }

        // cmdSend1to1Attachment
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdSend1to1Attachment')
        const attachmentName = path.join(process.cwd(), filename)
        try {
            const response  = await WickrIOAPI.cmdSend1to1Attachment(sendToUsers, attachmentName, 'testfile.txt')
            if (response) {
                fs.writeSync(fd, "cmdSend1to1Attachment: success: " + response + '\n')
                num_success++
            } else {
                fs.writeSync(fd, 'cmdSend1to1Attachment: failed: empty value\n')
                num_failure++
            }
        } catch (err) {
            fs.writeSync(fd, 'cmdSend1to1Attachment: failed: ' + err + '\n')
            num_failure++
        }

        // create a User Name file with the list of users from the sendToUsers array
        const userNameFile = 'userNameFile.txt'
        var unamefd = fs.openSync('userNameFile.txt', 'w')
        sendToUsers.forEach(userName => {
            fs.writeSync(unamefd, userName + "\n")
        })
        fs.closeSync(unamefd)
        const userNameFilePath = path.join(process.cwd(), userNameFile)

        // cmdSendMessageUserNameFile
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdSendMessageUserNameFile')
        try {
            const response  = await WickrIOAPI.cmdSendMessageUserNameFile(userNameFilePath, "this is a test message using a UserName file")
	    if (response) {
                fs.writeSync(fd, "cmdSendMessageUserNameFile: success: " + response + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdSendMessageUserNameFile: failed:\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdSendMessageUserNameFile: failed: ' + err + '\n')
            num_failure++
        }

        // cmdSendMessageUserHashFile
        num_notcoded++

        // cmdSendAttachmentUserNameFile
        fs.writeSync(fd, "**********************************************************\n")
        console.log('testing cmdSendAttachmentUserNameFile')
        try {
            const response  = await WickrIOAPI.cmdSendAttachmentUserNameFile(userNameFilePath, attachmentName, 'testfile.txt')
            if (response) {
                fs.writeSync(fd, "cmdSendAttachmentUserNameFile: success: " + response + '\n')
                num_success++
            } else {
                fs.writeSync(fd, 'cmdSendAttachmentUserNameFile: failed: empty value\n')
                num_failure++
            }
        } catch (err) {
            fs.writeSync(fd, 'cmdSendAttachmentUserNameFile: failed: ' + err + '\n')
            num_failure++
        }

        // cmdSendAttachmentUserHashFile
        num_notcoded++
    }

    // cmdSendVoiceMemoUserNameFile
    num_notcoded++
    // cmdSendVoiceMemoUserHashFile
    num_notcoded++

    // cmdSendNetworkMessage
    num_notcoded++
    // cmdSendSecurityGroupMessage
    num_notcoded++
    // cmdSendNetworkAttachment
    num_notcoded++
    // cmdSendSecurityGroupAttachment
    num_notcoded++
    // cmdSendNetworkVoiceMemo
    num_notcoded++
    // cmdSendSecurityGroupVoiceMemo
    num_notcoded++

    // cmdEncryptString
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdEncryptString')
    const origString='This is a test string 123456 !@#$%'
    var encryptedString = undefined
    var encryptStringSuccess = undefined
    try {
        encryptedString = await WickrIOAPI.cmdEncryptString(origString)
	if (encryptedString) {
            fs.writeSync(fd, 'cmdEncryptString: success: ' + encryptedString + '\n')
            num_success++
            encryptStringSuccess = true
	} else {
            fs.writeSync(fd, 'cmdEncryptString: failed!\n')
            num_failure++
            encryptStringSuccess = false
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdEncryptString: failed: ' + err + '\n')
        num_failure++
    }

    // cmdDecryptString
    fs.writeSync(fd, "**********************************************************\n")
    if (encryptStringSuccess) {
        try {
            console.log("Encrypted string:", encryptedString)
            const response = await WickrIOAPI.cmdDecryptString(encryptedString)
	    if (response) {
                if (response === origString) {
                    fs.writeSync(fd, 'cmdDecryptString: success: ' + response + '\n')
                    num_success++
		} else {
                    fs.writeSync(fd, 'cmdDecryptString: returned string is not equal to original: ' + response + '\n')
                    num_failure++
		}
	    } else {
                fs.writeSync(fd, 'cmdDecryptString: failed!\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdDecryptString: failed: ' + err + '\n')
            num_failure++
        }
    } else {
        fs.writeSync(fd, 'cmdDecryptString: string was not encrypted!\n')
        num_cantrun++
    }


    // cmdAddKeyValue
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdAddKeyValue')
    const keyName='KeyName123'
    const keyValue='KeyValue123'
    var addKeyValueSuccess = undefined
    try {
        const response = await WickrIOAPI.cmdAddKeyValue(keyName, keyValue)
	if (response) {
            fs.writeSync(fd, 'cmdAddKeyValue: success!\n')
            num_success++
            addKeyValueSuccess = true
	} else {
            fs.writeSync(fd, 'cmdAddKeyValue: failed!\n')
            num_failure++
            addKeyValueSuccess = false
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdAddKeyValue: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetKeyValue
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetKeyValue')
    if (addKeyValueSuccess) {
        try {
            const response = await WickrIOAPI.cmdGetKeyValue(keyName)
	    if (response) {
                fs.writeSync(fd, 'cmdGetKeyValue: success: ' + response + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdGetKeyValue: failed!\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdGetKeyValue: failed: ' + err + '\n')
            num_failure++
        }
    } else {
        fs.writeSync(fd, 'cmdGetKeyValue: Key Value was not added!\n')
        num_cantrun++
    }

    // cmdDeleteKeyValue
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdDeleteKeyValue')
    if (addKeyValueSuccess) {
        try {
            const response = await WickrIOAPI.cmdDeleteKeyValue(keyName)
	    if (response) {
                fs.writeSync(fd, 'cmdDeleteKeyValue: success: ' + response + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdDeleteKeyValue: failed!\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdDeleteKeyValue: failed: ' + err + '\n')
            num_failure++
        }
    } else {
        fs.writeSync(fd, 'cmdDeleteKeyValue: Key Value was not added!\n')
        num_cantrun++
    }

    // cmdClearAllKeyValues
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdClearAllKeyValues')
    try {
        const response = await WickrIOAPI.cmdClearAllKeyValues()
	if (response) {
            fs.writeSync(fd, 'cmdClearAllKeyValues: success!\n')
            num_success++
            addKeyValueSuccess = true
	} else {
            fs.writeSync(fd, 'cmdClearAllKeyValues: failed!\n')
            num_failure++
            addKeyValueSuccess = false
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdClearAllKeyValues: failed: ' + err + '\n')
        num_failure++
    }

    // cmdSetControl
    num_notcoded++

    // cmdAddMessageID
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdAddMessageID')
    const messageID='ABC123'
    var addMsgIdSuccess = undefined
    try {
        const response = await WickrIOAPI.cmdAddMessageID(messageID, bot_username, 'target', 'date', 'This is a test message')
	if (response) {
            fs.writeSync(fd, 'cmdAddMessageID: success!\n')
            num_success++
            addMsgIdSuccess = true
	} else {
            fs.writeSync(fd, 'cmdAddMessageID: failed!\n')
            num_failure++
            addMsgIdSuccess = false
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdAddMessageID: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetMessageIDEntry
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetMessageIDEntry')
    if (addMsgIdSuccess) {
        try {
            const response = await WickrIOAPI.cmdGetMessageIDEntry(messageID)
	    if (response) {
                fs.writeSync(fd, 'cmdGetMessageIDEntry: success: ' + response + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdGetMessageIDEntry: failed!\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdGetMessageIDEntry: failed: ' + err + '\n')
            num_failure++
        }
    } else {
        fs.writeSync(fd, 'cmdGetMessageIDEntry: message ID was not added!\n')
        num_cantrun++
    }

    // cmdGetMessageIDTable
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetMessageIDTable')
    try {
        var result = await WickrIOAPI.cmdGetMessageIDTable("0", "10")
        if (result) {
            const response = isJson(result)
            fs.writeSync(fd, 'cmdGetMessageIDTable: success: ' + result + '\n')
            num_success++
        } else {
            fs.writeSync(fd, 'cmdGetMessageIDTable: failed: returned empty list\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetMessageIDTable: failed: ' + err + '\n')
        num_failure++
    }

    // cmdDeleteMessageID
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdDeleteMessageID')
    if (addMsgIdSuccess) {
        try {
            const response = await WickrIOAPI.cmdDeleteMessageID(messageID)
	    if (response) {
                fs.writeSync(fd, 'cmdDeleteMessageID: success!\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdDeleteMessageID: failed!\n')
                num_failure++
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdDeleteMessageID: failed: ' + err + '\n')
            num_failure++
        }
    } else {
        fs.writeSync(fd, 'cmdDeleteMessageIDEntry: message ID was not added!\n')
        num_cantrun++
    }

    // cmdCancelMessageID
    num_notcoded++

    // cmdGetMessageStatus
    num_notcoded++
    // cmdSetMessageStatus
    num_notcoded++

    // cmdSendDeleteMessage
    num_notcoded++
    // cmdSendRecallMessage
    num_notcoded++


    // cmdGetVerificationList
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetVerificationList')
    try {
        var verList = await WickrIOAPI.cmdGetVerificationList()
	    if (verList) {
            const response = isJson(verList)
            fs.writeSync(fd, 'cmdGetVerificationList: success: ' + verList + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetVerificationList: failed: returned empty list\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetVerificationList: failed: ' + err + '\n')
        num_failure++
    }

    // cmdVerifyUsers
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdVerifyUsers')
    if (directoryUsers === undefined) {
        fs.writeSync(fd, 'cmdVerifyUsers: directoryUsers list is undefined!\n')
        num_cantrun++
    } else if (directoryUsers.size === 0) {
        fs.writeSync(fd, 'cmdVerifyUsers: directoryUsers list is empty!\n')
        num_cantrun++
    } else {
        try {
            const user = [ directoryUsers[0].name ]
            if (user === undefined) {
                fs.writeSync(fd, 'cmdVerifyUsers: user name is undefined!\n')
                num_failure++
	        } else {
                const response = await WickrIOAPI.cmdVerifyUsers(user)
	            if (response) {
                    fs.writeSync(fd, 'cmdVerifyUsers: success: ' + response + '\n')
                    num_success++
	            } else {
                    fs.writeSync(fd, 'cmdVerifyUsers: failed: returned empty response\n')
                    num_failure++
	            }
	        }
        } catch (err) {
            fs.writeSync(fd, 'cmdVerifyUsers: failed: ' + err + '\n')
            num_failure++
        }
    }

    // cmdVerifyAll
    fs.writeSync(fd, "**********************************************************\n")
    try {
        var verList = await WickrIOAPI.cmdVerifyAll()
	if (verList) {
            fs.writeSync(fd, 'cmdVerifyAll: success: ' + verList + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdVerifyAll: failed: returned empty list\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdVerifyAll: failed: ' + err + '\n')
        num_failure++
    }


    // cmdSetVerificationMode
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdSetVerificationMode')
    try {
        var verList = await WickrIOAPI.cmdSetVerificationMode("automatic")
	if (verList) {
            fs.writeSync(fd, 'cmdSetVerificationMode: success: ' + verList + '\n')
            num_success++
	} else {
            fs.writeSync(fd, 'cmdSetVerificationMode: failed: returned empty list\n')
            num_failure++
	}
    } catch (err) {
        fs.writeSync(fd, 'cmdSetVerificationMode: failed: ' + err + '\n')
        num_failure++
    }
   


    // cmdGetUserInfo
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetUserInfo')
    if (directoryUsers === undefined) {
        fs.writeSync(fd, 'cmdGetUserInfo: directoryUsers list is undefined!\n')
        num_cantrun++
    } else if (securityGroups.size === 0) {
        fs.writeSync(fd, 'cmdGetUserInfo: directoryUsers list is empty!\n')
        num_cantrun++
    } else {
        try {
            const user = [ directoryUsers[0].name ]
            if (user === undefined) {
                fs.writeSync(fd, 'cmdGetUserInfo: user name is undefined!\n')
                num_failure++
	    } else {
                var userInfo = await WickrIOAPI.cmdGetUserInfo(user)
	        if (userInfo) {
                    fs.writeSync(fd, 'cmdGetUserInfo: success: ' + userInfo + '\n')
                    num_success++
	        } else {
                    fs.writeSync(fd, 'cmdGetUserInfo: failed: returned empty list\n')
                    num_failure++
	        }
	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdGetUserInfo: failed: ' + err + '\n')
            num_failure++
        }
    }

    // cmdGetServerInfo
    var serverInfo = undefined
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetServerInfo')
    try {
        var verList = await WickrIOAPI.cmdGetServerInfo()
	    if (verList) {
            serverInfo = isJson(verList)
            fs.writeSync(fd, 'cmdGetServerInfo: success: ' + verList + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetServerInfo: failed: returned empty list\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetServerInfo: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetClientInfo
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetClientInfo')
    try {
        var verList = await WickrIOAPI.cmdGetClientInfo()
	    if (verList) {
            const response = isJson(verList)
            fs.writeSync(fd, 'cmdGetClientInfo: success: ' + verList + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetClientInfo: failed: returned empty list\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetClientInfo: failed: ' + err + '\n')
        num_failure++
    }

    // cmdGetNetworkRooms
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetNetworkRooms')
    if (serverInfo !== undefined) {
        try {
            const response = await WickrIOAPI.cmdGetNetworkRooms(serverInfo.network_id)
	    if (verList) {
                fs.writeSync(fd, 'cmdGetNetworkRooms: success: ' + response + '\n')
                num_success++
	    } else {
                fs.writeSync(fd, 'cmdGetNetworkRooms: failed: returned empty list\n')
                num_failure++
    	    }
        } catch (err) {
            fs.writeSync(fd, 'cmdGetNetworkRooms: failed: ' + err + '\n')
            num_failure++
        }
    } else {
        fs.writeSync(fd, 'cmdGetNetworkRooms: get server info is empty!\n')
        num_cantrun++
    }

    // cmdGetBotsList
    // Can't implement this without Token Credentials

    // cmdGetTransmitQueueInfo
    fs.writeSync(fd, "**********************************************************\n")
    console.log('testing cmdGetTransmitQueueInfo')
    try {
        var verList = await WickrIOAPI.cmdGetTransmitQueueInfo()
	    if (verList) {
            const response = isJson(verList)
            fs.writeSync(fd, 'cmdGetTransmitQueueInfo: success: ' + verList + '\n')
            num_success++
	    } else {
            fs.writeSync(fd, 'cmdGetTransmitQueueInfo: failed: returned empty value\n')
            num_failure++
	    }
    } catch (err) {
        fs.writeSync(fd, 'cmdGetTransmitQueueInfo: failed: ' + err + '\n')
        num_failure++
    }

    console.log('testing DONE')

    // SUMMARY
    fs.writeSync(fd, "**********************************************************\n")
    fs.writeSync(fd, 'Number of success:' + num_success + '\n')
    fs.writeSync(fd, 'Number of failure:' + num_failure + '\n')
    fs.writeSync(fd, 'Number cannot run:' + num_cantrun + '\n')
    fs.writeSync(fd, 'Number not coded :' + num_notcoded + '\n')
    fs.writeSync(fd, "**********************************************************\n")

    return { 
        'num_success' : num_success,
        'num_failure' : num_failure,
        'num_cantrun' : num_cantrun,
        'num_notcoded' : num_notcoded,
    }

    fs.closeSync(fd)
}

async function fileIsDeleted(attachmentCopyName)
{
  await sleep(1000)
  if (!fs.existsSync(attachmentCopyName))
	return true;
  await sleep(1000)
  if (!fs.existsSync(attachmentCopyName))
	return true;
  await sleep(1000)
  if (!fs.existsSync(attachmentCopyName))
	return true;
  await sleep(1000)
  if (!fs.existsSync(attachmentCopyName))
	return true;
  await sleep(1000)
  if (!fs.existsSync(attachmentCopyName))
	return true;
  return false
}

/**
 * This function will current test the ability to send attachments
 * and have those sent files removed after they have been sent.
 */
async function testsendattachments(filename, userEmail, vGroupID) {
    var fd = fs.openSync(filename, 'w')
    fs.writeSync(fd, "Starting to run WickrIO send attachment API tests\n")

    var num_success = 0
    var num_failure = 0
    var num_cantrun = 0
    var num_notcoded = 0

    const attachmentName = path.join(process.cwd(), filename)
    let attachmentCopyName = '';

    const sendToUsers = [userEmail]

    /******************************************************************************
     * Tests of the wickrio_addon APIs
     *****************************************************************************/

    /*
     * cmdSend1to1Attachment
     */
    fs.writeSync(fd, "**********************************************************\n")

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_1to1_attachment.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response = await WickrIOAPI.cmdSend1to1Attachment(sendToUsers, attachmentCopyName, 'test_send_1to1_attachment.txt', '', '', '', true)
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "cmdSend1to1Attachment: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'cmdSend1to1Attachment: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'cmdSend1to1Attachment: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'cmdSend1to1Attachment: failed: ' + err + '\n')
        num_failure++
    }

    /*
     * cmdSend1to1Attachment with a URL
     */
    fs.writeSync(fd, "**********************************************************\n")

    const urlFileName='https:\/\/images.freeimages.com\/images\/large-previews\/7c0\/bird-1310808.jpg'

    try {
        const response = await WickrIOAPI.cmdSend1to1Attachment(sendToUsers, urlFileName, 'bird-1310808.jpg', '', '', '', true)
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "cmdSend1to1Attachment.URL: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'cmdSend1to1Attachment.URL: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'cmdSend1to1Attachment.URL: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'cmdSend1to1Attachment.URL: failed: ' + err + '\n')
        num_failure++
    }

    /*
     * cmdSendAttachmentUserNameFile
     */
    fs.writeSync(fd, "**********************************************************\n")

    // create a User Name file with the list of users from the sendToUsers array
    const userNameFile = 'userNameFile.txt'
    var unamefd = fs.openSync('userNameFile.txt', 'w')
    sendToUsers.forEach(userName => {
        fs.writeSync(unamefd, userName + "\n")
    })
    fs.closeSync(unamefd)
    const userNameFilePath = path.join(process.cwd(), userNameFile)

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_username_attachment.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response  = await WickrIOAPI.cmdSendAttachmentUserNameFile(userNameFilePath, attachmentCopyName, 'test_send_username_attachment.txt', '', '', '', '', '', true)
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "cmdSendAttachmentUserNameFile: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'cmdSendAttachmentUserNameFile: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'cmdSendAttachmentUserNameFile: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'cmdSendAttachmentUserNameFile: failed: ' + err + '\n')
        num_failure++
    }

    /*
     * cmdSendVoiceMemoUserNameFile
     */
    num_notcoded++

    /*
     * cmdSendAttachmentUserHashFile
     */
    num_notcoded++

    /*
     * cmdSendVoiceMemoUserHashFile
     */
    num_notcoded++

    /*
     * cmdSendNetworkAttachment
     */
    fs.writeSync(fd, "**********************************************************\n")

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_network_attachment.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response = await WickrIOAPI.cmdSendNetworkAttachment(attachmentCopyName, 'test_send_network_attachment.txt', '', '', '', '', '', true);
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "cmdSendNetworkAttachment: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'cmdSendNetworkAttachment: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'cmdSendNetworkAttachment: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'cmdSendNetworkAttachment: failed: ' + err + '\n')
        num_failure++
    }

    /*
     * cmdSendNetworkVoiceMemo
     */
    num_notcoded++

    /*
     * Setup for Security Group attachment messages
     */

    // Global variable that can be used by following tests
    var securityGroups = undefined
    var securityGroupList = []
    try {
        var security = WickrIOAPI.cmdGetSecurityGroups()
        if (security) {
            securityGroups = isJson(security)

            if (securityGroups !== undefined && securityGroups.size !== 0) {
	            for (var i=0; i<securityGroups.size; i++) {
                    securityGroupList.push(securityGroups[i].id);
		        }
	        }
        }
    } catch (err) {
        fs.writeSync(fd, 'Failed to get security groups: ' + err + '\n')
    }


    /*
     * cmdSendSecurityGroupAttachment
     */
    if (securityGroupList.size === 0) {
        num_cantrun++
    } else {
        fs.writeSync(fd, "**********************************************************\n")

        // Copy the attachment file to the copy file, so we don't lose the attachment file
        attachmentCopyName = path.join(process.cwd(), 'test_send_security_group_attachment.txt')
        fs.copyFileSync(attachmentName, attachmentCopyName); 

        try {
            const response = await WickrIOAPI.cmdSendSecurityGroupAttachment(securityGroupList, attachmentCopyName, 'test_send_security_group_attachment.txt', '', '', '', '', '', true);
            if (response) {
	        if (fileIsDeleted(attachmentCopyName)) {
                  fs.writeSync(fd, "cmdSendSecurityGroupAttachment: success: " + response + '\n')
                  num_success++
	        } else {
                  fs.writeSync(fd, 'cmdSendSecurityGroupAttachment: failed to remove the file with 5 seconds\n')
                  num_failure++
	        }
            } else {
                fs.writeSync(fd, 'cmdSendSecurityGroupAttachment: failed: empty value\n')
                num_failure++
            }
        } catch (err) {
            fs.writeSync(fd, 'cmdSendSecurityGroupAttachment: failed: ' + err + '\n')
            num_failure++
        }
    }

    /*
     * cmdSendSecurityGroupVoiceMemo
     */
    num_notcoded++

    /*
     * cmdSendRoomAttachment
     */
    fs.writeSync(fd, "**********************************************************\n")

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_room_attachment.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response = await WickrIOAPI.cmdSendRoomAttachment(vGroupID, attachmentCopyName, 'test_send_room_attachment.txt', '', '', '', true)
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "cmdSendRoomAttachment: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'cmdSendRoomAttachment: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'cmdSendRoomAttachment: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'cmdSendRoomAttachment: failed: ' + err + '\n')
        num_failure++
    }

    /******************************************************************************
     * Tests of the wickrio-bot-api APIs
     *****************************************************************************/

    /*
     * sendAttachmentUserNameFile
     */
    fs.writeSync(fd, "**********************************************************\n")

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_username_attachment_bot-api.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response  = await apiService.sendAttachmentUserNameFile(userNameFilePath, attachmentCopyName, 'test_send_username_attachment_bot-api.txt', '', '', '', '', '', true)
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "bot-api.sendAttachmentUserNameFile: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'bot-api.sendAttachmentUserNameFile: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'bot-api.sendAttachmentUserNameFile: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'bot-api.sendAttachmentUserNameFile: failed: ' + err + '\n')
        num_failure++
    }

    /*
     * sendVoiceMemoUserNameFile
     */
    num_notcoded++

    /*
     * sendAttachmentUserHashFile
     */
    num_notcoded++

    /*
     * sendVoiceMemoUserHashFile
     */
    num_notcoded++

    /*
     * sendNetworkAttachment
     */
    fs.writeSync(fd, "**********************************************************\n")

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_network_attachment_bot-api.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response = await apiService.sendNetworkAttachment(attachmentCopyName, 'test_send_network_attachment_bot-api.txt', '', '', '', '', '', true);
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "bot-api.sendNetworkAttachment: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'bot-api.sendNetworkAttachment: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'bot-api.sendNetworkAttachment: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'bot-api.sendNetworkAttachment: failed: ' + err + '\n')
        num_failure++
    }

    /*
     * sendNetworkVoiceMemo
     */
    num_notcoded++

    /*
     * sendSecurityGroupAttachment
     */
    if (securityGroupList.size === 0) {
        num_cantrun++
    } else {
        fs.writeSync(fd, "**********************************************************\n")

        // Copy the attachment file to the copy file, so we don't lose the attachment file
        attachmentCopyName = path.join(process.cwd(), 'test_send_security_group_attachment_bot-api.txt')
        fs.copyFileSync(attachmentName, attachmentCopyName); 

        try {
            const response = await apiService.sendSecurityGroupAttachment(securityGroupList, attachmentCopyName, 'test_send_security_group_attachment_bot-api.txt', '', '', '', '', '', true);
            if (response) {
	        if (fileIsDeleted(attachmentCopyName)) {
                  fs.writeSync(fd, "bot-api.sendSecurityGroupAttachment: success: " + response + '\n')
                  num_success++
	        } else {
                  fs.writeSync(fd, 'bot-api.sendSecurityGroupAttachment: failed to remove the file with 5 seconds\n')
                  num_failure++
	        }
            } else {
                fs.writeSync(fd, 'bot-api.sendSecurityGroupAttachment: failed: empty value\n')
                num_failure++
            }
        } catch (err) {
            fs.writeSync(fd, 'bot-api.sendSecurityGroupAttachment: failed: ' + err + '\n')
            num_failure++
        }
    }

    /*
     * sendSecurityGroupVoiceMemo
     */
    num_notcoded++

    /*
     * sendRoomAttachment
     */
    fs.writeSync(fd, "**********************************************************\n")

    // Copy the attachment file to the copy file, so we don't lose the attachment file
    attachmentCopyName = path.join(process.cwd(), 'test_send_room_attachment_bot-api.txt')
    fs.copyFileSync(attachmentName, attachmentCopyName); 

    try {
        const response = await apiService.sendRoomAttachment(vGroupID, attachmentCopyName, 'test_send_room_attachment_bot-api.txt', '', '', '', true)
        if (response) {
	    if (fileIsDeleted(attachmentCopyName)) {
              fs.writeSync(fd, "bot-api.sendRoomAttachment: success: " + response + '\n')
              num_success++
	    } else {
              fs.writeSync(fd, 'bot-api.sendRoomAttachment: failed to remove the file with 5 seconds\n')
              num_failure++
	    }
        } else {
            fs.writeSync(fd, 'bot-api.sendRoomAttachment: failed: empty value\n')
            num_failure++
        }
    } catch (err) {
        fs.writeSync(fd, 'bot-api.sendRoomAttachment: failed: ' + err + '\n')
        num_failure++
    }

    // SUMMARY
    fs.writeSync(fd, "**********************************************************\n")
    fs.writeSync(fd, 'Number of success:' + num_success + '\n')
    fs.writeSync(fd, 'Number of failure:' + num_failure + '\n')
    fs.writeSync(fd, 'Number cannot run:' + num_cantrun + '\n')
    fs.writeSync(fd, 'Number not coded :' + num_notcoded + '\n')
    fs.writeSync(fd, "**********************************************************\n")

    return { 
        'num_success' : num_success,
        'num_failure' : num_failure,
        'num_cantrun' : num_cantrun,
        'num_notcoded' : num_notcoded,
    }

    fs.closeSync(fd)
}

async function listen(message) {
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
      var reply = "Here are the commands supported:"
      reply += "\n/list : sends you a list"
      reply += "\n/dm : tests out the DM button, gives you a list of users to DM"
      reply += "\n/button : sends you a message with buttons"
      reply += "\n/test : tests the addon and sends you results"
      reply += "\n/sendtest : tests the attachment send tests"
      reply += "\n/urlbutton |<url>| : sends you a URL button, client may not support"
      reply += "\n/rooms : responds with the list of rooms the bot is in"
      reply += "\n/sendrooms : sends test message to rooms"
      reply += "\n/help : displays this message"
      reply += "\nWhat can I help you with?";

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
    /*
     * Process the '/urlbutton' command
     *
     * Responds with several buttons, of the different button types.
     */
    else if (command === '/urlbutton') {
      if (argument === undefined || argument === '') {
        var url2use='https://amazon.com'
      } else {
        var url2use=argument
      }

      const reply = 'this is a /urlbutton response'
      const messagemeta = {
        buttons: [
          {
            type: 'message',
            text: 'Help',
            message: '/help',
            preferred: 'true',
          },
          {
            type: 'url',
            text: 'URL Button',
            value: url2use,
          },
        ],
      }
      const messagemetastring = JSON.stringify(messagemeta)
      console.log('messageMetaString=', messagemetastring)

      //Respond back to the user or room with a message(using vGroupID)
      var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], messagemetastring);
    }
    /*
     * The /test command will run the Addon API tests
     */
    else if (command == '/test') {
        const reply = 'Starting the Addon API tests'
        var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], "");
        const response = await testapis('test_output.txt')
        if (response) {
            const responsestring = JSON.stringify(response, null, 4)
            var sMessage =  await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");

            const filename = path.join(process.cwd(), 'test_output.txt')
            var sFileMessage = await WickrIOAPI.cmdSendRoomAttachment(vGroupID, filename, 'test_output.txt', "", "", []);
        } else {
            const responsestring = 'Received invalid response from the test function!'
            var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");
        }
    }
    else if (command == '/sendtest') {
        const reply = 'Starting the send attachment tests'
        var sMessage = WickrIOAPI.cmdSendRoomMessage(vGroupID, reply, "", "", "", [], "");

        const response = await testsendattachments('test_send_attachment_output.txt', userEmail, vGroupID);
        if (response) {
            const responsestring = JSON.stringify(response, null, 4)
            var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");

            const filename = path.join(process.cwd(), 'test_send_attachment_output.txt')
            var sFileMessage = await WickrIOAPI.cmdSendRoomAttachment(vGroupID, filename, 'test_send_attachment_output.txt', "", "", '', true);
        } else {
            const responsestring = 'Received invalid response from the testsendattachments function!'
            var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");
        }
    }
    else if (command == '/rooms') {
        const rooms = await WickrIOAPI.cmdGetRooms();
        const obj = JSON.parse(rooms);

        const responsestring = JSON.stringify(rooms, null, 4)
        var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");
    }
    else if (command == '/sendrooms') {
        const rooms = await WickrIOAPI.cmdGetRooms();
        const obj = JSON.parse(rooms);

        console.log('obj=', obj);
        const arrayLength = obj.rooms.length;
        console.log('rooms length=', arrayLength);
        var sMessage2 = await WickrIOAPI.cmdSendRoomMessage(vGroupID, "In send2rooms", "", "", "", [], "");
        for (var i = 0; i < arrayLength; i++) {
            console.log(obj.rooms[i].vgroupid);
            const responsestring= 'Send message to room with VgroupID ' + obj.rooms[i].vgroupid;
            var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");

            var sMessage = await WickrIOAPI.cmdSendRoomMessage(obj.rooms[i].vgroupid, argument, "", "", "", [], "");
        }
    }
    else if (command == '/demo') {
        const rooms = WickrIOAPI.cmdGetRooms();
        const obj = JSON.parse(rooms);

        const democontent = 'This is the demo content:\nHi there!\n\nTest';

        //console.log('obj=', obj);
        const arrayLength = obj.rooms.length;
        //console.log('rooms length=', arrayLength);
        var sMessage2 = await WickrIOAPI.cmdSendRoomMessage(vGroupID, "In send2rooms", "", "", "", [], "");
        for (var i = 0; i < arrayLength; i++) {
            //console.log(obj.rooms[i].vgroupid);
            const responsestring= 'Send demo conten to room with VgroupID ' + obj.rooms[i].vgroupid;
            var sMessage = await WickrIOAPI.cmdSendRoomMessage(vGroupID, responsestring, "", "", "", [], "");

            var sMessage = await WickrIOAPI.cmdSendRoomMessage(obj.rooms[i].vgroupid, democontent, "", "", "", [], "");
        }
    }
  } catch (err) {
    console.log(err);
  }
}

function isJson(str) {
    try {
        const jsonstr = JSON.parse(str)
        return jsonstr
    } catch (e) {
        return false
    }
}

main();
