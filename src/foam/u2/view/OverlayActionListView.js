/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'OverlayActionListView',
  extends: 'foam.u2.View',

  documentation: 'An overlay that presents a list of actions a user can take.',

  requires: [
    'foam.core.ConstantSlot',
    'foam.core.ExpressionSlot',
    'foam.u2.md.OverlayDropdown'
  ],

  imports: [
    'ctrl'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'data'
    },
    {
      name: 'obj'
    },
    {
      class: 'URL',
      name: 'activeImageURL',
      value: 'images/Icon_More_Active.svg'
    },
    {
      class: 'URL',
      name: 'restingImageURL',
      value: 'images/Icon_More_Resting.svg'
    },
    {
      class: 'URL',
      name: 'hoverImageURL',
      value: 'images/Icon_More_Hover.svg'
    },
    {
      class: 'URL',
      name: 'disabledImageURL',
      value: 'images/Icon_More_Disabled.svg'
    },
    {
      class: 'URL',
      name: 'imageURL_',
      expression: function(restingImageURL, hoverImageURL, disabledImageURL, activeImageURL, hovered_, disabled_, active_) {
        if ( disabled_ ) return `url(${disabledImageURL})`;
        if ( active_ ) return `url(${activeImageURL})`;
        if ( hovered_ ) return `url(${hoverImageURL})`;
        return `url(${restingImageURL})`;
      }
    },
    {
      class: 'Boolean',
      name: 'hovered_'
    },
    {
      class: 'Boolean',
      name: 'disabled_'
    },
    {
      class: 'Boolean',
      name: 'active_'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.Element',
      name: 'overlay_',
      factory: function() {
        return this.OverlayDropdown.create();
      }
    },
    {
      class: 'Boolean',
      name: 'overlayInitialized_'
    }
  ],

  css: `
    ^action {
      padding: 10px;
    }

    ^action[disabled] {
      color: #aaa;
    }

    ^action:hover:not([disabled]) {
      cursor: pointer;
      background-color: /*%PRIMARY5%*/ #e5f1fc;
    }

    ^icon {
      background-size: 24px;
      width: 24px;
      height: 24px;
    }

    ^icon:hover {
      cursor: pointer;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this.onDetach(this.active_$.follow(this.overlay_.opened$));
      this.onDetach(this.disabled_$.follow(this.ExpressionSlot.create({
        args: this.data.map((action) => action.createIsAvailable$(this.__context__, this.obj)),
        code: (...rest) => ! rest.reduce((l, r) => l || r, false)
      })));

      this.
        addClass(this.myClass()).
        start('span').
          addClass(this.myClass('noselect')).
          start().
            addClass(this.myClass('icon')).
            style({ 'background-image': this.imageURL_$ }).
            callIf(this.data.length > 0, function() {
              this.
                on('mouseover', self.onMouseOver).
                on('mouseout', self.onMouseOut).
                on('click', function(evt) {
                  if ( self.disabled_ ) return;
                  if ( ! self.overlayInitialized_ ) self.initializeOverlay();
                  self.overlay_.open(evt.clientX, evt.clientY);
                });
            }).
          end().
        end();
    },

    function initializeOverlay() {
      var self = this;
      this.overlay_.forEach(this.data, function(action) {
        this.
          start().
            show(action.createIsAvailable$(self.__context__, self.obj)).
            addClass(self.myClass('action')).
            add(action.label).
            on('click', function(evt) {
              self.overlay_.close();
              action.maybeCall(self.__subContext__, self.obj);
            }).
            attrs({
              disabled: action.createIsEnabled$(self.__context__, self.obj).map(function(e) {
                return e ? false : 'disabled';
              })
            }).
          end();
      });

      // Add the overlay to the controller so if the table is inside a container
      // with `overflow: hidden` then this overlay won't be cut off.
      this.ctrl.add(this.overlay_);
      this.overlayInitialized_ = true;
    }
  ],

  listeners: [
    function onMouseOver() {
      this.hovered_ = true;
    },

    function onMouseOut() {
      this.hovered_ = false;
    }
  ]
});
