var timer = foam.util.Timer.create();
timer.start();

var E = foam.__context__.E.bind(foam.__context__);

/*

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true
}).write();

foam.u2.DetailView.create({
  data: foam.util.Timer.create(),
  showActions: true,
  properties: [ foam.util.Timer.INTERVAL, foam.util.Timer.I ],
  actions: [ foam.util.Timer.STOP, foam.util.Timer.START ]
}).write();

*/
foam.CLASS({
  name: 'TimerView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.util.Timer'
  ],

  methods: [
    function initE() {
      var self = this;
      this.startContext({data: this.data}).add(self.Timer.I, self.Timer.INTERVAL, self.Timer.STOP, self.Timer.START);
    }
  ]
});

E('br').write();
E('hr').write();
E('br').write();

TimerView.create({data: timer}).write();
E('hr').write();
foam.u2.DetailView.create({data: timer, showActions: true}).write();

E('br').write();
E('hr').write();
E('br').write();
