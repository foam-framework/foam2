foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupByReference',
  extends: 'foam.mlang.sink.GroupBy',
  
  requires: [
    "foam.u2.ChoiceNone", 
  ], 

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    },
    {
      name: 'groups',
    },
    {
      class: 'StringArray',
      name: 'groupKeys',
      factory: function() { return []; }, 
    }, 
    {
      class: 'StringArray',
      name: 'groupLabels',
      value: {}, 
    },
    {
      name: 'referenceDAO', 
    }

  ],

  methods: [
    function init(){
        this.groups = {};
        this.groupKeys = [];
        this.gorupLabels = {}; 
        
    },
    
    function sortedKeys(opt_comparator) { 
      this.groupKeys.sort(opt_comparator || this.arg1.comparePropertyValues);
      return this.groupKeys;
    },
    
    
    function sortedKeysByLabel() {
        var arr = Object.keys(this.groupLabels).map(function(k){return [this.groupLabels[k], k]; }.bind(this));
        arr.sort(function(a, b){
            if (a[1] == "") return -1;
            if (b[1] == "") return 1; 
            return a[0].localeCompare(b[0]);});
        var keyArr =  arr.map(function(c){return c[1]; });
        if (this.groupKeys.includes("")) keyArr.push(""); 
        return keyArr; 
    },
    
    
    function putInGroup_(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },
    
    function put(obj) {
      var keyObj = this.arg1.f(obj);
      var keyId, keyLabel; 
      if (keyObj){
        keyId = keyObj[this.arg1.groupByProperty];
        if ( typeof keyId === 'undefined') keyId = ""; 
        keyLabel = keyObj[this.arg1.groupByLabel];
        this.groupLabels[keyId] = keyLabel; 
      } else {
        keyId = ""; 
      }
      
      this.putInGroup_(keyId, keyObj);
      
    },
    function eof() {
    },
    function clone() {
      // Don't use the default clone because we don't want to copy 'groups'.
      return this.cls_.create({ arg1: this.arg1, arg2: this.arg2 });
    },
    function toString() {
      return this.groups.toString();
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'GroupByReferenceSearchView',
  extends: 'foam.u2.search.GroupBySearchView',

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.u2.view.ChoiceView'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ select {
          width: 100%;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'view'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.view.ChoiceView' }
    },
    {
      name: 'dao',
      required: true,
      postSet: function() {
        this.updateDAO();
      }
    },
    {
      name: 'property',
      required: true
    },
    {
      name: 'name',
      expression: function(property) {
        return property.name;
      }
    },
    {
      class: 'Class',
      name: 'op',
      value: 'foam.mlang.predicate.Eq'
    },
    {
      name: 'predicate',
      factory: function() {
        return this.True.create();
      }
    },
    {
      class: 'Int',
      name: 'width',
      value: 17
    },
    {
      class: 'String',
      name: 'label',
      expression: function(property) {
        return property.label;
      }
    }
  ],

  methods: [
    function clear() {
      this.view.data = '';
    },
    function initE() {
      this.cssClass(this.myCls());
      this.view = this.start(this.viewSpec, {
        label$: this.label$,
        alwaysFloatLabel: true
      });
      this.view.end();

      this.dao.on.sub(this.updateDAO);
      this.view.data$.sub(this.updatePredicate);
    },
    function updatePredicate_(choice) {
      var exists = typeof choice !== 'undefined' && choice !== '';
      this.predicate = exists ? this.op.create({
        arg1: this.property,
        arg2: this.Constant.create({ value: choice })
      }) : this.True.create();
    }
  ],

  listeners: [
    {
      name: 'updateDAO',
      isMerged: true,
      mergeDelay: 100,
      code: function() {
        var self = this;
        this.dao.select(this.GroupBy.create({
          arg1: this.property,
          arg2: this.Count.create()
        })).then(function(groups) {
          var options = [];
          var selected;
          var sortedKeys = groups.sortedKeys();
          for ( var i = 0; i < sortedKeys.length; i++ ) {
            var key = sortedKeys[i];
            if ( typeof key === 'undefined' ) continue;
            if ( key === '' ) continue;
            var count = foam.String.intern(
                '(' + groups.groups[key].value + ')');
            var subKey = ('' + key)
                .substring(0, self.width - count.length - 3);
            var cleanKey = foam.core.Enum.isInstance(self.property) ?
                self.property.of[key].label :
                subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');

            if ( self.view && self.view.data === key ) {
              selected = key;
            }

            options.push([
              key,
              cleanKey + foam.String.intern(
                  Array(self.width - subKey.length - count.length).join(' ')) +
                  count
            ]);
          }

          options.splice(0, 0, [ '', '--' ]);

          self.view.choices = options;
          if ( typeof selected !== 'undefined' ) {
            var oldData = self.view.data;
            self.view.data = selected;
            if ( typeof oldData === 'undefined' || oldData === '' ) {
              self.updatePredicate_(selected);
            }
          }
        });
      }
    },
    {
      name: 'updatePredicate',
      code: function(_, __, ___, slot) {
        this.updatePredicate_(slot.get());
      }
    }
  ]
});
