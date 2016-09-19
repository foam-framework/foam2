require('./bootFOAMNode.js');


var env = foam.box.Context.create();

var dst = foam.box.SocketBox.create({
  address: 'localhost:7000',
}, env);

var dao = foam.dao.ClientDAO.create({
  delegate: foam.box.SubBox.create({
    name: 'INBOX',
    delegate: dst
  }, env)
}, env);

dao.select().then(function(m) {
  console.log("Read", m.a.length, 'mails');
  for ( var i = 0 ; i < m.a.length ; i++ ) {
    var mail = m.a[i];
    console.log('');
    console.log('');
    console.log('MSGID:', mail.id);
    console.log('Subject:', mail.subject);
    console.log(mail.body);
  }
  process.exit(0);
});
