/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if ( navigator.serviceWorker ) {
  navigator.serviceWorker.register('sw.js');

  var sw = foam.apps.chat.ServiceWorker.create({
    registration: navigator.serviceWorker.ready
  });


  navigator.serviceWorker.onmessage = function(e) {
    if ( e.data === 'NEWDATA' ) {
      client.sharedWorker.sync();
    }
  };

  // navigator.serviceWorker.getRegistration().then(function(r) {
  //   r && r.unregister();
  // });
}

var env    = foam.apps.chat.Context.create();
var client = foam.apps.chat.Client.create(null, env);
var ME     = 'Anonymous';

document.location.search.substring(1).split('&').forEach(function(s) {
  s = s.split('=');
  if ( s[0] === 'me' ) ME = s[1];
});

var messages = document.getElementById('messages');
var pending  = document.getElementById('pending');
var input    = document.getElementById('input');
var send     = document.getElementById('send');

var statusbar = document.getElementById('connected-status');

function updateStatus(v) {
//  statusbar.textContent = v ? 'Connected' : 'Disconnected';
//  statusbar.className = v ? 'connected' : 'disconnected';
}

client.connected$.sub(function(s, o, p, v) {
  updateStatus(v.get());
});
updateStatus(client.connected);

client.sharedWorker.sub('journalUpdate', function() {
  navigator.serviceWorker.ready.then(function(s) {
    s.sync.register({
      id: 'messages'
    });
  }, function() {
    // Handle no service worker case.
  });
});

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
        };

        view.row.className = 'message-row';
      } else {
        view = this.rows[m.id];
        view.row.remove();
        delete this.rows[m.id];
      }

      view.row.textContent = (m.syncNo < 0 ? 'pending' : formatTime(new Date(m.syncNo))) + ': ' +
        m.from + '> ' + m.message;


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


foam.CLASS({
  package: 'foam.apps.chat',
  name: 'Highlight',

  imports: [
    'document',
    'setInterval',
    'clearInterval'
  ],

  properties: [
    {
      class: 'String',
      name: 'oldTitle'
    },
    {
      class: 'Boolean',
      name: 'active',
      value: false
    },
    {
      class: 'Boolean',
      name: 'state',
      value: false
    },
    {
      class: 'Int',
      name: 'interval'
    }
  ],

  methods: [
    function init() {
      this.document.addEventListener('focusin', this.clear);
    },

    function highlight(obj) {
      if ( this.document.hasFocus() || this.interval ) return;

      this.oldTitle = this.document.title;
      this.newTitle = obj.from + '> ' + obj.message;
      this.state = true;
      this.interval = this.setInterval(this.update, 2000);
      this.update();
    }
  ],

  listeners: [
    function clear() {
      this.document.title = this.oldTitle;
      this.clearInterval(this.interval);
      this.interval = 0;
    },

    function update() {
      this.state = ! this.state;
      this.document.title = this.state ? this.oldTitle : this.newTitle;
    }
  ]
});

var highlight = foam.apps.chat.Highlight.create();

function formatTime(m) {
  var hours = m.getHours().toString();
  if ( hours.length == 1 ) hours = "0" + hours;
  var minutes = m.getMinutes().toString();
  if ( minutes.length == 1 ) minutes = "0" + minutes;
  return hours + ':' + minutes;
}

function onMessage(m) {
  if ( m.syncNo !== -1 ) {
    highlight.highlight(m);
  }

  pendingMsgs.onMessage(m);
  confirmedMsgs.onMessage(m);
  document.body.scrollTop = document.body.scrollHeight - document.body.clientHeight;
  input.scrollIntoView();
}


client.messageDAO.select().then(function(a) {
  a.a.map(onMessage);
});

client.messageDAO.on.put.sub(function(s, _, __, m) {
  onMessage(m);
});

client.messageDAO.on.remove.sub(function(s, _, __, m) {
  confirmedMsgs.onRemove(m);
});

client.messageDAO.on.reset.sub(function() {
  confirmedMsgs.onReset();
});
