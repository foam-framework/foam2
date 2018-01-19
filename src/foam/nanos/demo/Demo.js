foam.CLASS({
  package: 'foam.nanos.demo',
  name: 'Demo',
  extends: 'foam.u2.Controller',
  requires: [
    'foam.nanos.demo.DemoObject'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'demoObjectDAO'
  ],
  properties: [
    {
      class: 'Int',
      name: 'counter',
      value: 1
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this.onDetach(this.demoObjectDAO.where(this.EQ(this.DemoObject.VALUE, 10)).listen({
        put: function(obj) {
          self.
            add("Object with value 10 added");
        },
        remove: function(obj) {
          self.add("Object with value 10 removed.", foam.json.stringify(obj));
        },
        reset: function() {
          self.add("reset event.");
        }
      }));

      this.add(this.CREATE_OBJECT, this.CREATE_OTHER_OBJECT, "Listening for objects.");
    }
  ],
  actions: [
    {
      name: 'createObject',
      code: function() {
        this.demoObjectDAO.put(this.DemoObject.create({ value: 10, label: 'Counter: ' + this.counter++ }));
      }
    },
    {
      name: 'createOtherObject',
      code: function() {
        this.demoObjectDAO.put(this.DemoObject.create({ value: 30, label: 'non-10 object. counter: ' + this.counter++}));
      }
    }
  ]
});
