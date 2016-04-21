navigator.serviceWorker.register('sw.js');

var env = foam.apps.chat.BoxEnvironment.create();
var client = foam.apps.chat.Client.create(null, env);

var ME = 'Anonymous';

document.location.search.substring(1).split('&').forEach(function(s) {
  s = s.split('=');
  if ( s[0] === 'me' ) ME = s[1];
});

var messages = document.getElementById('messages');
var pending = document.getElementById('pending');
var input = document.getElementById('input');
var send = document.getElementById('send');

function sendMessage() {
  if ( input.value ) {
    client.messageDAO.put(
      foam.apps.chat.Message.create({
        from: ME,
        message: input.value
      }));
  }
  input.value = '';
}

input.addEventListener('keyup', function(e) {
  if ( e.keyIdentifier === 'Enter' ) {
    sendMessage();
  }
});

send.addEventListener('click', sendMessage);

foam.CLASS({
  package: 'foam.apps.chat',
  name: 'MessageTable',
  properties: [
    {
      name: 'table',
    },
    {
      class: 'Map',
      name: 'rows'
    },
    {
      class: 'Boolean',
      name: 'pending',
      value: false
    }
  ],
  listeners: [
    function onRemove(m) {
      if ( this.rows[m.id] ) {
        this.rows[m.id].row.remove();
        delete this.rows[m.id];
      }
    },
    function onReset() {
      this.table.children = [];
    },
    function onMessage(m) {
      if ( m.syncNo < 0 !== this.pending ) {
        if ( this.rows[m.id] ) {
          this.rows[m.id].row.remove();
          this.rows[m.id] = undefined;
        }
        return;
      }

      if ( ! this.rows[m.id] ) {
        var view = {
          obj: m,
          row: document.createElement('div'),
          from: document.createElement('div'),
          message: document.createElement('div'),
          timestamp: document.createElement('div')
        };

        view.row.className = 'message-row';
        view.from.className = 'message-from';
        view.message.className = 'message-message';
        view.timestamp.className = 'message-timestamp';

        view.row.appendChild(view.timestamp);
        view.row.appendChild(view.from);
        view.row.appendChild(view.message);
      } else {
        view = this.rows[m.id];
        view.row.remove();
        delete this.rows[m.id];
      }

      view.from.textContent = m.from;
      view.message.textContent = m.message;
      view.timestamp.textContent = m.syncNo < 0 ? 'pending...' : formatTime(new Date(m.syncNo));


      if ( m.syncNo < 0 ) {
        this.table.appendChild(view.row);
      } else {
        var max;
        var limit = m.syncNo;
        for ( var key in this.rows ) {
          if ( foam.util.compare(this.rows[key].obj.syncNo, limit) < 0 ) continue;

          if ( ! max ) {
            max = this.rows[key];
          } else if ( foam.util.compare(this.rows[key].obj.syncNo, max.obj.syncNo) < 0 ) {
            max = this.rows[key];
          }
        }

        this.table.insertBefore(view.row, max ? max.row : null);
      }

      this.rows[m.id] = view;
    }
  ]
});


var confirmedMsgs = foam.apps.chat.MessageTable.create({
  table: messages,
});

var pendingMsgs = foam.apps.chat.MessageTable.create({
  table: pending,
  pending: true
});

function formatTime(m) {
  var hours = m.getHours().toString();
  if ( hours.length == 1 ) hours = "0" + hours;
  var minutes = m.getMinutes().toString();
  if ( minutes.length == 1 ) minutes = "0" + minutes;
  return hours + ':' + minutes;
}

function onMessage(m) {
  pendingMsgs.onMessage(m);
  confirmedMsgs.onMessage(m);
  document.body.scrollTop = document.body.scrollHeight - document.body.clientHeight;
}

// client.messageDAO.select().then(function(a) {
//   a.a.map(onMessage);
// });

client.messageDAO.on.put.sub(function(s, _, _, m) {
  onMessage(m);
});

client.messageDAO.on.remove.sub(function(s, _, _, m) {
  confirmedMsgs.onRemove(m);
});

client.messageDAO.on.reset.sub(function() {
  confirmedMsgs.onReset();
});
