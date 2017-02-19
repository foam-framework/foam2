/**
 *include undefined and ""(empty) as options to group in.
 *has to fix the grouping issue though.
 *
 *fix: undefined & "" are grouped together, indicating that the
 *field is empty. 
 */


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupById',
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
  name: 'GroupByIdSearchView',
  extends: 'foam.u2.View',
  
  requires: [
    'foam.mlang.sink.GroupById',

    'foam.mlang.Constant',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.u2.view.ChoiceView', 
    "foam.u2.ChoiceNone"
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
      name: 'view',
      postSet: function(old, nu){
        console.log("GroupByIdSearchView view updated");
      }
    },
    {
        name: 'of',
        class: 'Class',
    }, 
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec',
      value: { class: 'foam.u2.view.ChoiceView' }
    },
    {
      name: 'dao', //cross reference to get complete list of choices
      postSet: function(old, nu) {
        //old && old.on.unsub(this.onDAOUpdate);
        nu && nu.on.sub(this.onDAOUpdate);
        this.onDAOUpdate(); 
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
      },
      postSet: function(old, nu){
        console.log("predicate updated");
      } 
    },
        {
      class: 'Int',
      name: 'width',
      value: 32, 
    },
    {
      class: 'String',
      name: 'label',
      expression: function(property) {
        return property.label;
      }
    }, 
    {
      name: 'choiceDAO',
      documentation: 'a dao that completes the selection list', 
      transient: true,
      visibility: foam.u2.Visibility.HIDDEN,
      cloneProperty: function() {},
      factory: function(){
        if (!this.showAllChoices) return;
         
        console.log("dao property of sobject");
        var name = this.of.name;
        var daoName = name.charAt(0).toUpperCase() + name.slice(1);
        daoName = daoName + "DAO";
        var d = this.__context__[daoName];
        if (d) return d;
        return;
      }, 
      postSet: function(old, nu) {
        //old && old.on.unsub(this.onChoiceDAOUpdate);
        nu && nu.on.sub(this.onChoiceDAOUpdate);
        this.onChoiceDAOUpdate();
      }
    },
    
    {
      name: 'choiceList', //cross reference [key, label] pair to get complete list.
      factory: function() { return []; }, 
    },
    
    {
      name: 'showAllChoices', //show All results, even if they contain no result. 
      value: false, 
    }
    

  ],
  

  methods: [
    function clear() {
      this.view.data = this.view.NONE?this.view.NONE[0]:null;
    },
    
    function initE() {
      this.cssClass(this.myCls());
      this.view = this.start(this.viewSpec, {
        label$: this.label$,
        alwaysFloatLabel: true
      });
      this.view.end();

      this.dao.on.sub(this.onDAOUpdate);
      
      this.view.data$.sub(this.updatePredicate);
    },
    
    function init(){
        this.onDAOUpdate();
        this.onChoiceDAOUpdate(); 
    }, 
    
    function updatePredicate_(choice) {
        
      if (choice == ""){ 
        var M = foam.mlang.Expressions.create();
        this.predicate = M.NOT(M.HAS(this.property));
      }else if (choice == this.ChoiceNone.NONE[0]){
        this.predicate = this.True.create();
      } else { // covers the case of undefined as well. 
          var p = this.property.clone();
          var pname = this.property.name; 
          p["f"] = function (o) {
              var obj = o[pname];
              return obj?obj[this.groupByProperty]: obj; 
              };
        this.predicate = choice ? this.op$cls.create({
          arg1: p,
          arg2: this.Constant.create({ value: choice })
        }) : this.True.create();
      }
    },
    
    function updateDropDown(){
      
          if (this.showAllChoices){
          }
          var options = [];
          var selected;
          var sortedKeys = [];
          if (this.showAllChoices && this.choiceList && this.choiceList.length){
            sortedKeys = this.choiceList.map(function(a){return a[0]; });
            if (this.groups.sortedKeysByLabel().indexOf("") >-1){
              sortedKeys.push("");
            }
          }else {
            sortedKeys = this.groups.sortedKeysByLabel();
          }
          
          for ( var i = 0; i < sortedKeys.length; i++ ) {
            var key = sortedKeys[i];
            
            //if ( typeof key === 'undefined' ) continue;
            //if ( key === '' ) continue;
            var c = (this.groups.groups && this.groups.groups[key])?this.groups.groups[key].value:0; 

            var keyLabel; 
            if ( typeof key === 'undefined' ) { // this should not happen. 
                keyLabel = "undefined"; 
            }else if ( key === '' ) {
                keyLabel = "Empty"; 
            }else {
                keyLabel = this.groups.groupLabels[key];
                if (!keyLabel && this.showAllChoices) keyLabel = this.choiceList[i][1];  
            }
            

            var entry = foam.UI.formatGroupByEntry(key, keyLabel,c, this.width);
            
            if ( this.view && this.view.data === key ) {
              selected = key;
            }
            options.push(entry); 
          }

          options.splice(0, 0, [ this.ChoiceNone.NONE[0], this.ChoiceNone.NONE[1] ]);
          //options.splice(0, 0, [ '', '--' ]);

          if (!(foam.util.compare(options, this.view.choices)===0) || (this.view.data && (this.view.data != selected))){
            this.view.choices = options;
            if ( typeof selected !== 'undefined' ) {
              var oldData = this.view.data;
              this.view.data = selected;
              if ( typeof oldData === 'undefined' || oldData === '' ) {
                this.updatePredicate_(selected);
              }
            }
          }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true, 
      //isMerged: 100,
      code: function() {
        var self = this;
        var groupBySink = this.GroupById.create({
                arg1: this.property, 
                arg2: this.Count.create(), 
              });
        this.dao.select(groupBySink).then(function(groups) {
          this.groups = groups;
          this.updateDropDown(); 
        }.bind(this));
      }
    },
    {
      name: 'updatePredicate',
      isFramed: true, 
      code: function(_, __, ___, slot) {
        this.updatePredicate_(slot.get());
      }
    },
    
    {
      name: 'onChoiceDAOUpdate', 
      isFramed: true, 
      code: function(_, __, ___, slot) {
        var referenceChoices = [];
        if (! this.showAllChoices || !this.choiceDAO) return;
        this.choiceDAO.select().then(function(result) {
            if (!result || !result.a) return;
            for (var i=0; i<result.a.length; i++){
              var obj = result.a[i];
              var label = obj.label?obj.label:obj.name;
              referenceChoices.push([obj.id, label]); 
            }
            referenceChoices.sort(function(a, b){return b[1] > a[1]; }); 
            this.choiceList = referenceChoices;
            this.updateDropDown(); 
        }.bind(this));
      }
      
    },
    
  ]
});
