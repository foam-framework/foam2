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
    'foam.core.ExpressionSlot'
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
      documentation: 'When set to true, package.model.permission.action is needed to execute this action.'
    }
  ],

  methods: [
    function andSlots(a, b) {
      return foam.core.ExpressionSlot.create({
        args: [ a, b ],
        code: function(a, b) {
          return a && b;
        }
      });
    },

    function andSlotAndPromise(slot, promise) {
      return this.andSlots(slot, foam.core.PromiseSlot.create({promise: promise}));
    },

    function checkPermission(x) {
      if ( ! this.permissionRequired || ! x.auth ) return Promise.resolve(true);
      var permission = this.sourceCls_.id + ".permission." + this.name;
      return x.auth.check(null, permission)
    },

    function isEnabledFor(data) {
      return this.isEnabled ?
        data.slot(this.isEnabled).get() :
        true ;
    },

    function createIsEnabled$(data$) {
      var slot = foam.core.ExpressionSlot.create({
         obj$: data$,
         code: this.isEnabled
       });

      return this.permissionRequired ?
        this.andSlotAndPromise(slot, this.checkPermission(data$.get().__subContext__)) :
        slot ;
    },

    async function isAvailableFor(ctx, data) {
      var available = this.isAvailable ?
        foam.Function.withArgs(this.isAvailable, data) :
        true;
      return available && await this.checkPermission(ctx);
    },

    function createIsAvailable$(data$) {
      var slot = foam.core.ExpressionSlot.create({
         obj$: data$,
         code: this.isAvailable
       });

      return this.permissionRequired ?
        this.andSlotAndPromise(slot, this.checkPermission(data$.get().__subContext__)) :
        slot ;
    },

    async function maybeCall(ctx, data) {
      if (
        this.isEnabledFor(data) &&
        await this.isAvailableFor(ctx, data)
      ) {
        this.code.call(data, ctx, this);
        // primitive types won't have a pub method
        // Why are we publishing this event anyway? KGR
        data && data.pub && data.pub('action', this.name, this);
        return true;
      }

      return false;
    },

    function installInClass(c) {
      c.installConstant(this.name, this);
    },

    function installInProto(proto) {
      var action = this;
      proto[this.name] = function() {
        return action.maybeCall(this.__context__, this);
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
