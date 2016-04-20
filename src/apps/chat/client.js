// unregister old service worker for now.
if ( navigator.serviceWorker ) {
  navigator.serviceWorker.getRegistration().then(function(r) { r && r.unregister(); });
}

var env = foam.apps.chat.BoxEnvironment.create();
var client = foam.apps.chat.Client.create(null, env);

document.body.insertAdjacentHTML(
  'beforeend',
  '<table id="messages">' +
    '</table>' +
    '<div><input type="text" id="message"/></div>');

var messages = document.getElementById('messages');
var input = document.getElementById('message');
var ME = 'Anonymous';

document.location.search.substring(1).split('&').forEach(function(s) {
  s = s.split('=');
  if ( s[0] === 'me' ) ME = s[1];
});

input.addEventListener('change', function() {
  if ( input.value ) {
    client.messageDAO.put(
      foam.apps.chat.Message.create({
        from: ME,
        message: input.value
      }));
  }
  input.value = '';
});

var msgs = {};

function formatTime(m) {
  var hours = m.getHours().toString();
  if ( hours.length == 1 ) hours = "0" + hours;
  var minutes = m.getMinutes().toString();
  if ( minutes.length == 1 ) minutes = "0" + minutes;
  return hours + ':' + minutes;
}

function onMessage(m) {
  if ( ! msgs[m.id] ) {
    var view = msgs[m.id] = {
      row: document.createElement('tr'),
      from: document.createElement('td'),
      message: document.createElement('td'),
      timestamp: document.createElement('td')
    };
    view.row.appendChild(view.from);
    view.row.appendChild(view.message);
    view.row.appendChild(view.timestamp);
    messages.appendChild(view.row);
  } else {
    view = msgs[m.id];
  }

  view.from.textContent = m.from;
  view.message.textContent = m.message;
  view.row.style.color = m.syncNo < 0 ? 'grey' : 'black';
  view.timestamp.textContent = m.syncNo < 0 ? 'pending...' : '';

  document.body.scrollTop = document.body.scrollHeight - document.body.clientHeight;
}

client.messageDAO.select().then(function(a) {
  a.a.map(onMessage);
});

client.messageDAO.on.put.sub(function(s, _, _, m) {
  onMessage(m);
});
