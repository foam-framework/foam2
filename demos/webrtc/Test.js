foam.CLASS({
  name: 'Test',
  requires: [
    'foam.net.web.RTCPeerConnection',
  ],
  properties: [
    {
      class: 'String',
      name: 'message',
      value: 'yo',
    },
    {
      name: 'connection',
      hidden: true,
      factory: function() {
        return this.RTCPeerConnection.create();
      },
    },
    {
      class: 'String',
      name: 'offer',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'String',
      name: 'answer',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'String',
      name: 'localIceCandidates',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
    {
      class: 'String',
      name: 'remoteIceCandidates',
      view: { class: 'foam.u2.tag.TextArea', rows: 16 },
    },
  ],
  actions: [
    {
      name: 'createOffer',
      isEnabled: function(connection, offer) {
        return !!connection && !offer
      },
      code: function() {
        var self = this;
        this.connection$.dot('localDescription').sub(function(s) {
          if ( o = self.connection.localDescription ) {
            s.detach();
            self.offer = foam.json.stringify(o.toJSON());
          }
        });
        this.connection.createChannel();
        this.connection.createOffer();
      },
    },
    {
      name: 'readOffer',
      isEnabled: function(connection, offer) {
        return !!connection && !!offer
      },
      code: function() {
        var self = this;
        this.connection.remoteDescription =
            new RTCSessionDescription(foam.json.parseString(this.offer));
        this.connection$.dot('localDescription').sub(function(s) {
          if ( o = self.connection.localDescription ) {
            s.detach();
            self.answer = foam.json.stringify(o.toJSON());
          }
        });
        this.connection.createAnswer();
      },
    },
    {
      name: 'readAnswer',
      isEnabled: function(connection, answer) {
        return !!connection && !!answer
      },
      code: function() {
        var self = this;
        this.connection.remoteDescription =
            new RTCSessionDescription(foam.json.parseString(this.answer));
      },
    },
    {
      name: 'readIceCandidates',
      isEnabled: function(connection, remoteIceCandidates) {
        return !!connection && !!remoteIceCandidates
      },
      code: function() {
        var self = this;
        Promise.all(foam.json.parseString(this.remoteIceCandidates).map(function(o) {
          return self.connection.addIceCandidate(
            new RTCIceCandidate(foam.json.parseString(o)));
        }));
      },
    },
    {
      name: 'send',
      isEnabled: function(message) {
        return !!message
      },
      code: function() {
        this.connection.send(this.message);
      },
    },
  ],
  methods: [
    function init() {
      var self = this;

      this.onDetach(this.connection.data.sub(function(_, _, data) {
        alert(data);
      }));

      this.onDetach(this.connection$.dot('iceCandidates').sub(function() {
        self.localIceCandidates = foam.json.stringify(self.connection.iceCandidates.map(function(o) {
          return foam.json.stringify(o.toJSON())
        }));
      }));
    },
  ],
});
