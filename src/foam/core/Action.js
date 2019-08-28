/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  Actions are high-level executable behaviours that are typically
  triggered by users and represented as buttons or menus.

  Actions are installed as methods on the class, but contain more
  meta-information than regular methods. Meta-information includes
  information needed to surface to action in a meaningful way to
  users, and includes things like the label to appear in the button
  or menu, a speech-label for i18n, help text, dynamic functions to
  enable or disable and hide or unhide the UI associated with this Action.

  Actions implement the Action Design Pattern.
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Action',

  requires: [
    'foam.core.ConstantSlot',
    'foam.core.ExpressionSlot',
    'foam.core.PromiseSlot'
  ],

  documentation: 'An Action is a method with extra GUI support.',

  properties: [
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'documentation'
    },
    {
      class: 'String',
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    {
      class: 'String',
      name: 'speechLabel',
      expression: function(label) { return label; }
    },
    {
      documentation: 'displayed on :hover',
      class: 'String',
      name: 'toolTip'
    },
    {
      name: 'icon'
    },
    {
      class: 'Boolean',
      name: 'confirmationRequired',
      documentation: 'If confirmation is required. Recommended for destructive actions.'
    },
    {
      class: 'String',
      name: 'iconFontFamily',
      value: 'Material Icons'
    },
    {
      class: 'String',
      name: 'iconFontClass',
      value: 'material-icons'
    },
    {
      class: 'String',
      name: 'iconFontName'
    },
    {
      class: 'Array',
      name: 'keyboardShortcuts'
    },
    {
      class: 'String',
      name: 'help'
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      help: 'Indicates if this is the default action.',
      value: false
    },
    {
      class: 'Function',
      name: 'isAvailable',
      label: 'Available',
      help: 'Function to determine if action is available.',
      value: null
    },
    {
      class: 'Function',
      name: 'isEnabled',
      label: 'Enabled',
      help: 'Function to determine if action is enabled.',
      value: null
    },
    {
      class: 'Function',
      name: 'code',
      required: true,
      value: null
    },
    {
      class: 'StringArray',
      name: 'availablePermissions',
      documentation: `Permissions required for the action to be available.
If empty than no permissions are required.`
    },
    {
      class: 'StringArray',
      name: 'enabledPermissions',
      documentation: `Permissions required for the action to be enabled.
If empty than no permissions are required.`,
    },
    {
      name: 'runningMap',
      factory: function() {
        return new WeakMap();
      },
      hidden: true,
      transient: true,
      documentation: 'A weak Map to track the running state of action on a per object basis.'
    }
  ],

  methods: [
    function addPermissionsCheck_(x, slot, data, permissions) {
      // Decorates an isEnabled/isAvailable slot with a permission
      // check if appropriate.

      // If no auth service, or no permissions to check then nothing to do.
      if ( ! x.auth || ! permissions.length )
        return slot;

      return foam.core.ExpressionSlot.create({
        args: [
          foam.core.PromiseSlot.create({
            promise: Promise.all(permissions.map(p => x.auth.check(null, p))).
              then(function(perms) {
                return perms.every(p => p);
              })
          }),
          slot
        ],
        code: function(a, b) {
          return a && b;
        }
      });
    },

    function createSlotFor_(x, data, expression, permissions) {
      // Handle old code that might try to pass data as a slot
      if ( foam.core.Slot.isInstance(data) ) {
        console.warn("Action createIsEnabled$ and createIsAvailable$ does not support data as a slot.");
        data = data.get();
      }

      // Helper method for creating isEnabled/isAvailable slots.

      var slot = expression ?
          data.slot(expression) :
          foam.core.ConstantSlot.create({ value: true });

      return this.addPermissionsCheck_(x, slot, data, permissions);
    },

    function createIsEnabled$(x, data) {
      var running = this.getRunning$(data);
      var slot = this.createSlotFor_(x, data, this.isEnabled, this.enabledPermissions);
      return foam.core.ExpressionSlot.create({
        args: [
          running,
          slot
        ],
        code: function(a, b) {
          return (! a) && b;
        }
      });
    },

    function createIsAvailable$(x, data) {
      return this.createSlotFor_(x, data, this.isAvailable, this.availablePermissions);
    },

    function getRunning$(data) {
      var running = this.runningMap.get(data);
      if ( ! running ) {
        running = foam.core.SimpleSlot.create({ value: false });
        if ( data ) this.runningMap.set(data, running);
      }
      return running;
    },

    function maybeCall(x, data) {
      var self = this;
      function call() {
        var running = self.getRunning$(data);
        // If action is in progress do not call again. Problem with this is that if action returns a
        // promise that never resolves then the action is stuck in a running state. Not returning does not solves
        // this problem either since there is no guarantee that such promise would resolve on a second run.
        if ( running.get() ) {
          x.warn("Attempted to call action that is in progress.");
          return;
        }
        var ret = self.code.call(data, x, self);
        if ( ret && ret.then ) {
          running.set(true);
          ret.then(function() { running.set(false); }, function() { running.set(false);});
        }
        // primitive types won't have a pub method
        // Why are we publishing this event anyway? KGR
        data && data.pub && data.pub('action', self.name, self);
        return ret;
      }

      if ( ( this.isAvailable && ! foam.Function.withArgs(this.isAvailable, data) ) ||
           ( this.isEnabled   && ! foam.Function.withArgs(this.isEnabled, data) ) )
        return;


      // No permission check if no auth service or no permissions to check.
      if ( ! x.auth ||
           ! ( this.availablePermissions.length || this.enabledPermissions.length ) ) {
        call();
        return;
      }

      var permissions = this.availablePermissions.concat(this.enabledPermissions);

      permissions = foam.Array.unique(permissions);
      Promise.all(permissions.map(p => x.auth.check(null, p))).
        then(function(args) {
          if ( args.every(b => b) ) call();
        });
    },

    function installInClass(c) {
      c.installConstant(this.name, this);
    },

    function installInProto(proto) {
      var action = this;
      proto[this.name] = function() {
        action.maybeCall(this.__context__, this);
      };
    }
  ]
});


/** Add Action support to Model. */
foam.CLASS({
  refines: 'foam.core.Model',
  package: 'foam.core',
  name: 'ModelActionRefine',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Action',
      name: 'actions',
      adaptArrayElement: function(o, prop) {
        return typeof o === 'function' ?
            foam.core.Action.create({name: o.name, code: o}) :
            this.__context__.lookup(prop.of).create(o) ;
      }
    }
  ]
});
