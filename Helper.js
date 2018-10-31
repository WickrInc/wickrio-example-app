class Helper {

  constructor() {}

  parseMessage(message) {
    message = JSON.parse(message);
    var sender = message.sender;
    var vGroupID = message.vgroupid;
    var userArr = [];
    userArr.push(sender);
    if (message.message) {
      var request = message.message;
      var command = '',
        argument = '';
      var parsedData = request.match(/(\/[a-zA-Z]+)(@[a-zA-Z0-9_-]+)?(\s+)?(.*)$/);
      if (parsedData !== null) {
        command = parsedData[1];
        if (parsedData[4] !== '') {
          argument = parsedData[4];
        }
      }
    }
    var parsedObj = {
      'command': command,
      'argument': argument,
      'vgroupid': vGroupID,
      'sender': userArr
    };
    return parsedObj;
  }

};

module.exports = Helper;
