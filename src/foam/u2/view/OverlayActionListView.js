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
      // value: 'images/Icon_More_Active.svg'
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAh0lEQVRIS2NkoDFgpLH5DCPIAp2Iyw6MDP/mg4L0PwNT4pUVugeICV6ig0gn8uIDRgZGebCh//8/uLxCX5GqFuhGXPzAwMjID/HB/4dXlusrUNUCUBAxMP5bAPEBUwLVg4gY12JTQ3Qc0NyC0VREMIhHUxFRQTRaFuENptFURDAVkauA5qUpAH6TVBkCb7ScAAAAAElFTkSuQmCC'
    },
    {
      class: 'URL',
      name: 'restingImageURL',
      // value: 'images/Icon_More_Resting.svg'
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAhUlEQVRIS2NkoDFgpLH5DCPIgv7+fof/jIzzQUHK+P9/YmFh4QFigpfoIOrt73/AyMgoDzX0QVFBgSK1LfjAyMjIDzL0////D4sLCxWoagEoiP4xMCwAGcrEwJBA9SAixrXY1BAdBzS3YDQVEQzi0VREVBCNlkV4g2k0FRFMReQqoHlpCgDoa1EZV5fY0wAAAABJRU5ErkJggg=='
    },
    {
      class: 'URL',
      name: 'hoverImageURL',
      // value: 'images/Icon_More_Hover.svg'
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAzklEQVRIS2O8f/++wL9///oZGBgCGBgYBBioBxYwMTEVMt65c2cDIyOjP/XMRZj0////hYx37979TwvDoWZ+oLUFDERb8ObNG4bzFy+CHWaor88gIiJClMeJtmDXnj0M379/BxvKxcXF4OrsTF0Ltm7fzvDnzx+woZycnAxuLi7UtQAUROcuXAAbamRgQP0gIsq5WBQRHQc0t2A0FREM4tFURFQQjZZFeINpxKaij7Sv9EHNlr9//y5gZGR0YGBg4CeYXolUAGpRMDMzFwAAKa+ydPFw0XUAAAAASUVORK5CYII=',
    },
    {
      class: 'URL',
      name: 'disabledImageURL',
      // value: 'images/Icon_More_Disabled.svg'
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAhUlEQVRIS2NkoDFgpLH5DCPIgv7+fof/jIzzQUHK+P9/YmFh4QFigpfoIOrt73/AyMgoDzX0QVFBgSK1LfjAyMjIDzL0////D4sLCxWoagEoiP4xMCwAGcrEwJBA9SAixrXY1BAdBzS3YDQVEQzi0VREVBCNlkV4g2k0FRFMReQqoHlpCgDoa1EZV5fY0wAAAABJRU5ErkJggg=='
    },
    {
      class: 'URL',
      name: 'imageURL_',
      expression: function(restingImageURL, hoverImageURL, disabledImageURL, activeImageURL, hovered_, disabled_, active_) {
        if ( disabled_ ) return `url(${disabledImageURL})`;
        if ( active_   ) return `url(${activeImageURL})`;
        if ( hovered_  ) return `url(${hoverImageURL})`;
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
    },
    'dao'
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
      right: 20;
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

    ^disabled-button-container>button {
      background-color: white!important;
      color: grey;
      border-color: white!important;
      box-shadow: none!important;
    }

    ^button-container>button {
      background-color: white!important;
      color: /*%BLACK%*/ #1e1f21;
      border-color: white!important;
      box-shadow: none!important;
    }

    ^button-container>button:hover {
      border-color: white!important;
    }

    ^disabled-button-container>button:hover {
      border-color: white!important;
    }
  `,

  methods: [
    async function initE() {
      var self = this;
      this.onDetach(this.active_$.follow(this.overlay_.opened$));

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

    async function initializeOverlay() {
      var self = this;

      if ( this.obj ) {
        this.obj = await this.dao.inX(this.__context__).find(this.obj.id);
      }

      this.onDetach(this.disabled_$.follow(this.ExpressionSlot.create({
        args: this.data.map((action) => action.createIsAvailable$(this.__context__, this.obj)),
        code: (...rest) => ! rest.reduce((l, r) => l || r, false)
      })));


      self.obj.sub(function() {
        self.overlay_.close();
      });

      this.overlay_.startContext({ data: self.obj })
      .forEach(self.data, function(action) {
        this
            .start()
              .addClass(action.createIsEnabled$(self.__context__, self.obj).map( e => e ? self.myClass('button-container') : self.myClass('disabled-button-container')))
              .add(action)
              .attrs({
                disabled: action.createIsEnabled$(self.__context__, self.obj).map(function(e) {
                  return ! e;
                })
              })
            .end();
        })
        .endContext();

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
