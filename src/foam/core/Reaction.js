/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Reaction',

  properties: [
    {
      name: 'name',
      expression: function(target, topic, listener) {
        return 'reaction_' + target +  '$$' + topic + '$$' + listener;
      }
    },
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
      var listener = obj[this.listener];
      var topic = this.topic;

      if ( this.target === '' ) {
        obj.onDetach(obj.sub.apply(obj, this.topic.concat(listener)));
        return;
      }

      var path = this.target.split('.');

      var slot = obj;

      for ( var i = 0 ; i < path.length ; i++ ) {
        slot = slot.dot(path[i]);
      }

      if ( topic.length ) {
        var l = listener;
        var prevSub;
        var args = topic.concat(l);

        listener = function() {
          prevSub && prevSub.detach();
          var target = slot.get();
          if ( target && foam.core.FObject.isInstance(target) ) {
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
  package: 'foam.core',
  name: 'ModelReactionsRefinement',
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'AxiomArray',
      name: 'reactions',
      of: 'foam.core.Reaction',
      adaptArrayElement: function(e, prop) {
        return foam.Array.isInstance(e) ?
          foam.core.Reaction.create({target: e[0], topic: e[1] ? e[1].split('.') : [], listener: e[2] }) :
          e.class ? this.__context__.lookup(e.class).create(e, this) :
          this.__context__.lookup(prop.of).create(e, this);
      }
    }
  ]
});
