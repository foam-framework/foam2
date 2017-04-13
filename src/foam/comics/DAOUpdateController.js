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
      name: 'data',
      hidden: true
    },
    {
      class: 'Class',
      name: 'of',
      hidden: true
    },
    {
      name: 'obj',
      label: '',
      view: function(args, X) {
        var e = foam.u2.DetailView.create({ of: X.data.of }, X).copyFrom(args);
        e.data$ = X.data$.dot(this.name);
        return e;
      }
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
      this.dao.find(this.data).then(function(obj) {
        self.obj = obj.clone();
      }, function(e) {
        // TODO: Handle this better.
        self.status = 'Failed to load record. ' + e.message;
      });
    }
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(obj) { return obj != null; },
      code: function() {
        var self = this;
        this.status = 'Saving...';
        var self = this;
        this.dao.put(this.obj.clone()).then(function() {
          self.status = 'Saved';
          self.stack.back();
        }, function(e) {
          self.status = "Error saving record: " + e.toString();
        });
      }
    },
    {
      name: 'delete',
      isEnabled: function(obj) { return obj != null; },
      code: function() {
        var self = this;
        this.dao.remove(this.obj).then(function() {
          self.stack.back();
        });
      }
    }
  ]
});
