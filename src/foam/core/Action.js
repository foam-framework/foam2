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
      generateJava: false,
      name: 'name',
      required: true
    },
    {
      class: 'String',
      generateJava: false,
      name: 'documentation'
    },
    {
      class: 'String',
      generateJava: false,
      name: 'buttonStyle'
    },
    {
      class: 'String',
      generateJava: false,
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    {
      class: 'String',
      generateJava: false,
      name: 'ariaLabel',
      expression: function(name) { return this.label || foam.String.labelize(name); }
    },
    {
      documentation: 'displayed on :hover',
      generateJava: false,
      class: 'String',
      name: 'toolTip'
    },
    {
      name: 'icon',
      generateJava: false
    },
    {
      class: 'Function',
      generateJava: false,
      name: 'confirmationRequired',
      documentation: 'If confirmation is required. Recommended for destructive actions.',
      value: null
    },
    {
      class: 'String',
      generateJava: false,
      name: 'iconFontFamily',
      value: 'Material Icons'
    },
    {
      class: 'String',
      generateJava: false,
      name: 'iconFontClass',
      value: 'material-icons'
    },
    {
      class: 'String',
      generateJava: false,
      name: 'iconFontName'
    },
    {
      class: 'Array',
      generateJava: false,
      name: 'keyboardShortcuts'
    },
    {
      class: 'String',
      generateJava: false,
      name: 'help'
    },
    {
      class: 'Boolean',
      generateJava: false,
      name: 'isDefault',
      help: 'Indicates if this is the default action.',
      value: false
    },
    {
      class: 'Function',
      generateJava: false,
      name: 'isAvailable',
      label: 'Available',
      help: 'Function to determine if action is available.',
      value: null
    },
    {
      class: 'Function',
      generateJava: false,
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
      class: 'Function',
      generateJava: false,
      name: 'confirmationView',
      value: null
    },
    {
      class: 'StringArray',
      generateJava: false,
      name: 'availablePermissions',
      documentation: `Permissions required for the action to be available.
If empty then no permissions are required.`
    },
    {
      class: 'StringArray',
      generateJava: false,
      name: 'enabledPermissions',
      documentation: `Permissions required for the action to be enabled.
If empty then no permissions are required.`,
    },
    {
      class: 'StringArray',
      generateJava: false,
      name: 'confirmationRequiredPermissions',
      documentation: `Permissions required for the action to be confirmation required state.
If empty then no permissions are required.`
    },
    {
      name: 'enabledPermissionsSlot_',
      generateJava: false,
      transient: true
    },
    {
      name: 'availablePermissionsSlot_',
      generateJava: false,
      transient: true
    },
    {
      name: 'confirmationRequiredPermissionsSlot_',
      generateJava: false,
      transient: true
    },
    {
      name: 'runningMap',
      generateJava: false,
      factory: function() {
        return new WeakMap();
      },
      cloneProperty: function() {
        return new WeakMap();
      },
      hidden: true,
      transient: true,
      documentation: 'A weak Map to track the running state of action on a per object basis.'
    }
  ],

  methods: [
    function addPermissionsCheck_(x, slot, data, permissionsName) {
      // Decorates an isEnabled/isAvailable slot with a permission
      // check if appropriate.
      var permissions = this[permissionsName + 'Permissions'];

      // If no auth service, or no permissions to check then nothing to do.
      if ( ! x.auth || ! permissions.length )
        return slot;

      var pName = permissionsName + 'PermissionsSlot_';

      if ( ! this[pName] ) {
        this[pName] = foam.core.PromiseSlot.create({
          promise: Promise.all(permissions.map(p => x.auth.check(null, p))).
            then(function(perms) {
              return perms.every(p => p);
            })
        });
      }

      return foam.core.ExpressionSlot.create({
        args: [
          this[pName],
          slot
        ],
        code: function(a, b) {
          return a && b;
        }
      });
    },

    function createSlotFor_(x, data, expression, permissionsName) {
      // Handle old code that might try to pass data as a slot
      if ( foam.core.Slot.isInstance(data) ) {
        console.warn("Action createIsEnabled$ and createIsAvailable$ does not support data as a slot.");
        data = data.get();
      }

      // Helper method for creating isEnabled/isAvailable slots.

      var slot = expression ?
          data.slot(expression) :
          foam.core.ConstantSlot.create({ value: true });

      return this.addPermissionsCheck_(x, slot, data, permissionsName);
    },

    function createIsEnabled$(x, data) {
      var running = this.getRunning$(data);
      var slot    = this.createSlotFor_(x, data, this.isEnabled, 'enabled');
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
      return this.createSlotFor_(x, data, this.isAvailable, 'available');
    },
    
    function createConfirmationRequired$(x, data) {
      return this.createSlotFor_(x, data, this.confirmationRequired, 'confirmationRequired');
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
      generateJava: false,
      adaptArrayElement: function(o, prop) {
        return typeof o === 'function' ?
            foam.core.Action.create({name: o.name, code: o}) :
            this.__context__.lookup(prop.of).create(o) ;
      }
    }
  ]
});
