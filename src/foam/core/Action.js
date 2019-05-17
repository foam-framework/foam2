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
      name: 'toolTip',
      expression: function(label) { return label; }
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
      class: 'Boolean',
      name: 'permissionRequired',
      documentation: 'When set to true, a permission is needed to execute this action.'
    },
    {
      class: 'StringArray',
      name: 'availablePermissions',
      documentation: `Permissions required for the action to be available.
If null then we will compute the expected permission name at runtime.
If set to an empty array, then no permission is required even if permissionRequired is set to true.`,
      factory: function() {
        return null;
      }
    },
    {
      class: 'StringArray',
      name: 'enabledPermissions',
      documentation: `Permissions required for the action to be enabled.
If null then we will compute the expected permission name at runtime.
If set to an empty array, then no permission is required even if permissionRequired is set to true.`,
      factory: function() {
        return null;
      }
    }
  ],

  methods: [
    function addPermissionsCheck_(x, slot, data, permissions) {
      // Decorates an isEnabled/isAvailable slot with a permission
      // check if appropriate.

      // If no auth service exists in the context, then fail open.
      // Assume we have permission and let the server reject it.  this
      // way client context bugs won't prevent users from completing
      // actions.
      if ( ! this.permissionRequired || ! x.auth )
        return slot;

      if ( foam.Null.isInstance(permissions) && data && data.cls_ )
        permissions = [ data.cls_.id + '.permission.' + this.name ];

      // If permissions is empty array then no permission check is needed.
      return permissions.length ?
        foam.core.ExpressionSlot.create({
          args: [
            foam.core.PromiseSlot.create({
              promise: Promise.all(permissions.map(p => x.auth.check(null, p))).
                then(function(...args) { return args.every(p => p); })
            }),
            slot
          ],
          code: function(a, b) { return a && b; }
        }) :
        slot;
    },

    function createSlotFor_(x, data, expression, permissions) {
      // Handle old code that might try to pass data as a slot
      if ( foam.core.Slot.isInstance(data) ) {
        console.warn("Action createIsEnabled$ and createIsAvailable$ does not support data as a slot.");
        data = data.get();
      }

      // Helper method for creating isEnabled/isAvailable slots.

      var slot = expression ?
          foam.core.ExpressionSlot.create({
            obj: data,
            code: expression
          }) :
          foam.core.ConstantSlot.create({ value: true });

      return this.addPermissionsCheck_(x, slot, data, permissions);
    },

    function createIsEnabled$(x, data) {
      return this.createSlotFor_(x, data, this.isEnabled, this.enabledPermissions);
    },

    function createIsAvailable$(x, data) {
      return this.createSlotFor_(x, data, this.isAvailable, this.availablePermissions);
    },

    function maybeCall(x, data) {
      var self = this;
      function call() {
        self.code.call(data, x, self);
        // primitive types won't have a pub method
        // Why are we publishing this event anyway? KGR
        data && data.pub && data.pub('action', self.name, self);
      }

      if ( ( this.isAvailable && ! foam.Function.withArgs(this.isAvailable, data) ) ||
           ( this.isEnabled   && ! foam.Function.withArgs(this.isEnabled, data) ) )
        return;

      if ( this.permissionsRequired && x.auth ) {
        var permissions = [].concat(
          foam.Null.isInstance(this.availablePermissions) ?
            [ data.cls_.id + '.permission.' + this.name ] :
            this.availablePermissions,
          foam.Null.isInstance(this.enabledPermissions) ?
            [ data.cls_.id + '.permission.' + this.name ] :
            this.enabledPermissions);

        permissions = foam.Array.unique(permissions);

        if ( permissions.length ) {
          Promise.all(permissions.map(p => x.auth.check(null, p))).
          then(function(...args) {
            if ( args.every(b => b) ) call();
          });
          return;
        }
      }

      call();
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
