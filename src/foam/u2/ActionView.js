/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ActionView',
  extends: 'foam.u2.Element',

  documentation: function() {`
    A button View for triggering Actions.

    Icon Fonts
    If using icon-fonts a css stylesheet link to the fonts is required in index.html.
    The default of foam.core.Action.js is 'Material Icons' supported by the following
    link: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
  `},

  axioms: [
    foam.u2.CSS.create({code: function() {/*
      ^ button {
        -webkit-box-shadow: inset 0 1px 0 0 #ffffff;
        box-shadow: inset 0 1px 0 0 #ffffff;
        background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf) );
        background: -moz-linear-gradient( center top, #ededed 5%, #dfdfdf 100% );
        background-color: #ededed;
        -moz-border-radius: 3px;
        -webkit-border-radius: 3px;
        border-radius: 3px;
        border: 1px solid #dcdcdc;
        display: inline-block;
        color: #777777;
        font-family: Arial;
        font-size: 12px;
        font-weight: bold;
        margin: 2px;
        padding: 4px 16px;
        text-decoration: none;
      }

      ^unavailable {
        visibility: hidden;
      }

      ^:hover {
        background: -webkit-gradient( linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed) );
        background: -moz-linear-gradient( center top, #dfdfdf 5%, #ededed 100% );
        background-color: #dfdfdf;
      }

      ^ img {
        vertical-align: middle;
      }

      ^.material-icons {
        cursor: pointer;
      }

      ^:disabled { color: #bbb; -webkit-filter: grayscale(0.8); }
    */}})
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showLabel',
      value: true
    },
    {
      class: 'URL',
      name: 'icon',
      factory: function(action) { return this.action.icon; }
    },
    {
      class: 'String',
      name: 'iconFontFamily',
      factory: function(action) { return this.action.iconFontFamily; }
    },
    {
      class: 'String',
      name: 'iconFontClass',
      factory: function(action) { return this.action.iconFontClass; }
    },
    {
      class: 'String',
      name: 'iconFontName',
      factory: function(action) { return this.action.iconFontName; }
    },
    'data',
    'action',
    [ 'nodeName', 'button' ],
    {
      name: 'label',
      factory: function(action) { return this.action.label; }
    }
  ],

  methods: [
    function initE() {
      this.initCls();

      this.
        on('click', this.click);

      if ( this.icon ) {
        // this.nodeName = 'a';
        this.start('img').attr('src', this.icon).end();
      } else if (this.iconFontName) {
        this.nodeName = 'i';
        this.cssClass(this.action.name);
        this.cssClass(this.iconFontClass); // required by font package
        this.style({'font-family': this.iconFontFamily});
        this.add(this.iconFontName);
        this.setAttribute('title', this.action.toolTip); // hover text
      } else if ( this.showLabel ) {
        this.add(this.label$);
      }

      if ( this.action ) {
        if ( this.action.isAvailable ) {
          this.enableClass(this.myClass('unavailable'), this.action.createIsAvailable$(this.data$), true);
        }

        if ( this.action.isEnabled ) {
          this.attrs({disabled: this.action.createIsEnabled$(this.data$).map(function(e) { return e ? false : 'disabled'; })});
        }
      }
    },

    function initCls() {
      this.addClass(this.myClass());
    }
  ],

  listeners: [
    function click(e) {
      this.action && this.action.maybeCall(this.__subContext__, this.data);
      e.stopPropagation();
    }
  ]
});
