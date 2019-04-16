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
    'foam.u2.md.OverlayDropdown'
  ],

  imports: [
    'ctrl'
  ],

  properties: [
    {
      type: 'Action[]',
      name: 'data'
    },
    {
      type: 'FObject',
      name: 'obj'
    },
    {
      type: 'URL',
      name: 'activeImageURL',
      value: 'images/Icon_More_Active.svg'
    },
    {
      type: 'URL',
      name: 'restingImageURL',
      value: 'images/Icon_More_Resting.svg'
    },
    {
      type: 'URL',
      name: 'hoverImageURL',
      value: 'images/Icon_More_Hover.svg'
    },
    {
      type: 'URL',
      name: 'disabledImageURL',
      value: 'images/Icon_More_Disabled.svg'
    },
    {
      type: 'URL',
      name: 'imageURL_',
      expression: function(restingImageURL, hoverImageURL, disabledImageURL, activeImageURL, hovered_, disabled_, active_) {
        if ( disabled_ ) {
          return `url(${disabledImageURL})`;
        } else if ( active_ ) {
          return `url(${activeImageURL})`;
        } else if ( hovered_ ) {
          return `url(${hoverImageURL})`;
        }
        return `url(${restingImageURL})`;
      }
    },
    {
      type: 'Boolean',
      name: 'hovered_'
    },
    {
      type: 'Boolean',
      name: 'disabled_'
    },
    {
      type: 'Boolean',
      name: 'active_'
    }
  ],

  css: `
    ^action {
      padding: 10px;
    }

    ^action.disabled {
      color: #aaa;
    }

    ^action:hover:not(.disabled) {
      cursor: pointer;
      background-color: %ACCENTCOLOR%;
    }

    ^icon {
      background-size: 24px;
      width: 24px;
      height: 24px;
    }

    ^icon:hover {
      cursor: pointer;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      var overlay = this.OverlayDropdown.create();
      this.active_$.follow(overlay.opened$);
      this.disabled_$.follow(foam.core.ExpressionSlot.create({
        args: this.data.map((a) => a.createIsAvailable$(this.obj$)),
        code: (...rest) => ! rest.reduce((l, r) => l || r, false)
      }));

      this.
        callIf(this.data.length > 0, function() {
          overlay.forEach(this.data, function(action) {
            this.
              start().
                show(action.createIsAvailable$(self.ConstantSlot.create({
                  value: self.obj
                }))).
                addClass(self.myClass('action')).
                add(action.label).
                call(async function() {
                  if ( await action.isEnabledFor(self.obj) ) {
                    this.on('click', function(evt) {
                      overlay.close();
                      action.maybeCall(self.obj.__subContext__, self.obj);
                    });
                  } else {
                    this.addClass('disabled');
                  }
                }).
              end();
          });

          // Add the overlay to the controller so if the table is inside a
          // container with `overflow: hidden` then this overlay won't be cut
          // off.
          this.ctrl.add(overlay);
        }).

        start('span').
          addClass('noselect').
          start().
            addClass(this.myClass('icon')).
            style({ 'background-image': this.imageURL_$ }).
            on('mouseover', this.onMouseOver).
            on('mouseout', this.onMouseOut).
            callIf(this.data.length > 0, function() {
              this.on('click', function(evt) {
                if ( self.disabled_ ) return;
                overlay.open(evt.clientX, evt.clientY);
              });
            }).
          end().
        end();
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
