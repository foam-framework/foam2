/**
 * Copyright 2017 Adam Van Ymeren, All Rights Reserved
 */

foam.CLASS({
  package: 'foam.comics',
  name: 'DAOUpdateController',
  imports: [
    'stack'
  ],

  properties: [
    {
      name: 'key',
      hidden: true
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data',
      view: 'foam.u2.DetailView'
    },
    {
      name: 'dao',
      hidden: true,
      factory: function() {
        return this.__context__[foam.String.daoize(this.of.name)];
      }
    },
    {
      class: 'String',
      name: 'status'
    }
  ],

  methods: [
    function init() {
      var self = this;
      this.dao.find(this.key).then(function(obj) {
        self.data = obj.clone();
      }, function(e) {
        debugger;
      });
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(data) { return data != null; },
      code: function() {
        var self = this;
        this.status = 'Saving...';
        var self = this;
        this.dao.put(this.data.clone()).then(function() {
          self.status = 'Saved';
          self.stack.back();
        }, function(e) {
          self.error = "Error saving record: " + e.toString();
        });
      }
    }
  ]
});
