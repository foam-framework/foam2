foam.CLASS({
  package: 'foam.core',
  name: 'Reaction',
  properties: [
    {
      class: 'String',
      name: 'target'
    },
    {
      class: 'StringArray',
      name: 'topic'
    },
    {
      name: 'listener'
    },
  ],
  methods: [
    function initObject(obj) {
      var path = this.target.split('.');

      var slot = obj;

      for ( var i = 0 ; i < path.length ; i++ ) {
        slot = slot.dot(path[i]);
      }

      var listener = obj[this.listener];
      var topic = this.topic;

      if ( topic.length ) {
        var l = listener;
        var prevSub;
        var args = topic.concat(l);

        listener = function() {
          prevSub && prevSub.detach();
          var target = slot.get();
          if ( target ) {
            obj.onDetach(prevSub = target.sub.apply(target, args));
          }
        };

        listener();
      }

      obj.onDetach(slot.sub(listener));
    }
  ]
});

foam.CLASS({
  refines: 'foam.core.FObject',
  properties: [
    {
      class: 'AxiomArray',
      name: 'reactions',
      of: 'foam.core.Reaction',
      adaptArrayElement: function(e, prop) {
        return foam.Array.isInstance(e) ?
          foam.core.Reaction.create({target: e[0], topic: e[1].split(','), listener: e[2] }) :
          e.class ? this.lookup(e.class).create(e, this) :
          foam.lookup(prop.of).create(e, this);
      }
    }
  ]
});
