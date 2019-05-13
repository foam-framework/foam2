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
    'foam.core.PromiseSlot',
    'foam.nanos.auth.ActionPermissionConfiguration'
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
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.ActionPermissionConfiguration',
      name: 'permissionConfig',
      factory: function() {
        if ( this.permissionRequired ) {
          var defaultPermission = this.sourceCls_.id + '.permission.' + this.name;
          return this.ActionPermissionConfiguration.create({
            available: [defaultPermission],
            enabled: [defaultPermission]
          });
        }
      }
    }
  ],

  methods: [
    function andSlots(a, b) {
      return this.ExpressionSlot.create({
        args: [ a, b ],
        code: function(a, b) {
          return a && b;
        }
      });
    },

    function andSlotAndPromise(slot, promise) {
      return this.andSlots(slot, this.PromiseSlot.create({
        promise: promise
      }));
    },

    function checkPermission(x, permission) {
      if ( ! this.permissionConfig || ! x.auth ) return Promise.resolve(true);
      return x.auth.check(null, permission);
    },

    function isEnabledFor(data) {
      return this.isEnabled
        ? foam.Function.withArgs(this.isEnabled, data)
        : true;
    },

    function createIsEnabled$(data$) {
      return this.createSlot_(this.isEnabled, 'enabled', data$);
    },

    function isAvailableFor(data) {
      return this.isAvailable
        ? foam.Function.withArgs(this.isAvailable, data)
        : true;
    },

    function createIsAvailable$(data$) {
      return this.createSlot_(this.isAvailable, 'available', data$);
    },

    async function maybeCall(ctx, data) {
      var data$ = this.ConstantSlot.create({ value: data });
      if (
        this.isEnabledFor(data) &&
        this.isAvailableFor(data) &&
        await this.hasPermissions_('enabled', data$) &&
        await this.hasPermissions_('available', data$)
      ) {
        this.code.call(data, ctx, this);
        // primitive types won't have a pub method
        // Why are we publishing this event anyway? KGR
        data && data.pub && data.pub('action', this.name, this);
      }
    },

    function installInClass(c) {
      c.installConstant(this.name, this);
    },

    function installInProto(proto) {
      var action = this;
      proto[this.name] = function() {
        action.maybeCall(this.__context__, this);
      };
    },

    function createSlot_(fn, configKey, data$) {
      if ( fn == null ) {
        if ( this.permissionConfig == null ) {
          return this.ConstantSlot.create({ value: true });
        }
        return this.PromiseSlot.create({ promise: this.hasPermissions_(configKey, data$) });
      }

      var slot = this.ExpressionSlot.create({
        obj$: data$,
        code: fn
      });

      return this.permissionConfig
        ? this.andSlotAndPromise(slot, this.hasPermissions_(configKey, data$))
        : slot;
    },

    function hasPermissions_(configKey, data$) {
      if ( this.permissionConfig == null ) return Promise.resolve(true);
      return Promise.all(this.permissionConfig[configKey].map((p) => this.checkPermission(data$.get().__subContext__, p))).then((values) => values.reduce((l, r) => l && r, true));
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
