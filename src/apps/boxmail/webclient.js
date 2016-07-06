var env = foam.box.Context.create();

var dao = foam.dao.ClientDAO.create({
  delegate: foam.box.SubBox.create({
    name: 'INBOX',
    delegate: foam.box.WebSocketBox.create({
      uri: 'ws://localhost:4000'
    }, env)
  }, env)
}, env);

foam.u2.TableView.create({
  of: 'boxmail.Message',
  properties: [
    'subject',
    'body'
  ],
  data: dao
}).write();

// dao.select().then(function(m) {
//   var out = "";
//   out += '<div>Read ' + m.a.length + ' mails.';
//   out += '<table><thead><td>Subject</td><td>Body</td></thead><tbody>';

//   for ( var i = 0 ; i < m.a.length ; i++ ) {
//     var mail = m.a[i];
//     out += '<tr><td>' + mail.subject + '</td><td>' + mail.body + '</td></tr>';
//   }
//   out += '</tbody></table>';

//   document.body.insertAdjacentHTML('beforeend', out);
// });
