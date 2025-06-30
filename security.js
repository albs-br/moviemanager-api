var winston = require('winston');

var security = {
  checkPermission: function(req, res) {
    
    //console.info(res);
    
    var user = req.auth.email;

    winston.info('Checking permission of user ' + user);

    //TODO: get list of allowed users from DB
    var allowedUsers = [ 'albs_br@yahoo.com.br', 'otheruser@gmail.com' ];

    if(!allowedUsers.includes(user)) { 
      winston.info('Permission denied');

      res.sendStatus(403); 

      return false;
    }

    winston.info('Permission allowed');

    return true;
  }
};

/*
function checkPermission(req, res) {
  var user = req.user.email;
  
  var allowedUsers = [ 'albs_br@yahoo.com.br', 'otheruser@gmail.com' ];
  
  if(!allowedUsers.includes(user)) { 
    winston.info('Permission denied');
    
    res.sendStatus(403); 
    
    return false;
  }
  
  return true;
}
*/

module.exports = security;