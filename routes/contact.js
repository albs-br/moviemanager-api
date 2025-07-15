var express = require('express');
var nodemailer = require('nodemailer');

var router = express.Router();


router.post('/contact', function (req, res) {
//   console.log("POST api/contact");
  
  var name = req.body.name;
  var email = req.body.email;
  var subject = req.body.subject;
  var message = req.body.message;
  
  // create reusable transporter object using the default SMTP transport
  //var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');
  var smtp = process.env.SMTP;
  var user = process.env.SMTP_USER;
  var password = process.env.SMTP_PASS;
  var port = process.env.SMTP_PORT;
  //var transporter = nodemailer.createTransport('smtps://' + user + ':' + password + '@' + smtp + ':' + port); // secure ports (465, 587) should be used with smtps instead of smtp
  var transporter = nodemailer.createTransport({
      service: 'Yahoo', // no need to set host or port etc.
      auth: {
          user: user,
          pass: password
      }
  });
  
  let messageHTML = '<b>Name:</b> ' + name + '<br />';
  messageHTML +=    '<b>Email:</b> ' + email + '<br />';
  messageHTML +=    '<b>Subject:</b> ' + subject + '<br />';
  messageHTML +=    '<b>Message:</b> ' + message + '<br />';
  
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"Movie Manager Contact" <albs_br@yahoo.com.br>', // sender address
    to: 'albs_br@yahoo.com.br', // list of receivers
    subject: 'Movie Manager Contact Form', // Subject line
    //text: 'Hello world ?' + new Date().toString(), // plaintext body
    html: messageHTML // html body
  };
  
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      console.error(error);
      throw error;
      //return console.log(error);
    }
    console.log('Message sent: ' + info.response);
      
    res.sendStatus(200);
  });

});


module.exports = router;
