require('./bootFOAMNode.js');


if ( process.argv.length < 4 ) {
  console.log('USAGE: node sendmail.js "Subject" "Body"');
  process.exit();
}

var env = foam.box.Context.create()

var dst = foam.box.SocketBox.create({
  address: 'localhost:7000',
}, env);

var msg = boxmail.Message.create({
  subject: process.argv[2],
  body: process.argv[3]
});

var dao = foam.dao.ClientDAO.create({
  delegate: foam.box.SubBox.create({
    name: 'INBOX',
    delegate: dst
  }, env)
}, env);

dao.put(msg).then(function() {
  console.log("Mail sent.");
  process.exit(0);
});
