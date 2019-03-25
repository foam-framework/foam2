/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichTextArea',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.texteditor.FontFace as FontFace2',
    'foam.u2.texteditor.FontSize as FontSize2',
    'foam.u2.texteditor.Popup',
    'foam.u2.DetailView',

    'foam.u2.view.FontSize',
    'foam.u2.view.FontFace',
    'foam.u2.view.TextAlignment',
    'foam.u2.view.TextFormat'
  ],

  exports: [
   'document'
  ],

  css: `
   ^ .foam-flow-Document {
     width: 600px;
     margin: 0px;
     background-color: #ffffff;
     border-radius: 4px;
     box-shadow: inset 0 0 1px 0 rgba(0, 0, 0, 0.5);
   }

   .richtext-actions {
      -webkit-align-items: center;
      align-items: center;
      border: none;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      -webkit-box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2);
      box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.2);
      display: -webkit-inline-box;
      display: -webkit-inline-flex;
      display: -ms-inline-flexbox;
      display: inline-flex;
      margin: 16px;
      padding: 8px 2px;
      white-space: nowrap;

      /* Firefox */
      display: -moz-box;
      -moz-box-pack: center;
      -moz-box-align: center;

      /* Safari and Chrome */
      display: -webkit-box;
      -webkit-box-pack: center;
      -webkit-box-align: center;

      /* W3C */
      display: box;
      box-pack: center;
      box-align: center;
    }

    .iframeContainer {
      background: white;
      width: 100%;
      border: none;
      margin: 0;
    }

    .richtext-button {
      width: auto;
      height: 40px;
      border-radius: 4px;
      text-align: center;
      display: inline-block;
      font-size: 14px;
      background: none !important;
      color: #373a3c !important;
      padding: 16px;
    }
    
    .richtext-button:hover {
      background: #f0f0f0 !important;
    }

    .dropdown-content {
      position: absolute;
      background-color: #f0f0f0;
      min-width: 50px;
      min-height: 50px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      z-index: 1;
    }

    /* Links inside the dropdown */
    .dropdown-content a {
      color: black;
      padding: 12px 16px;
      text-decoration: none;
      display: block;
    }

    /* Change color of dropdown links on hover */
    .dropdown-content a:hover {background-color: #ddd}    
  `,

  properties: [
    {
      name: 'document'
    },
    {
      class: 'Boolean',
      name: 'onKey',
      attribute: true
    },
    {
      type: 'String',
      name: 'height',
      value: '400'
    },
    {
      type: 'String',
      name: 'width',
      value: '100%'
    },
    {
      name: 'richActions',
    },
    {
      name: 'fontSizeMenu',
      postSet: function (_, n) {
        var self = this;
        n.onload.sub(function () {
          n.document = self.frame.el().contentDocument;
          n.window = self.frame.el().contentWindow;
        });
      }
    },
    {
      name: 'justifyMenu',
      postSet: function (_, n) {
        var self = this;
        n.onload.sub(function () {
          n.document = self.frame.el().contentDocument;
          n.window = self.frame.el().contentWindow;
        });
      }
    },
    {
      name: 'fontFaceMenu',
      postSet: function (_, n) {
        var self = this;
        n.onload.sub(function () {
          n.document = self.frame.el().contentDocument;
          n.window = self.frame.el().contentWindow;
        });
      }
    },
    {
      name: 'otherActionsMenu',
      postSet: function (_, n) {
        var self = this;
        n.onload.sub(function () {
          n.document = self.frame.el().contentDocument;
          n.window = self.frame.el().contentWindow;
        });
      }

    },
    {
      name: 'frame',
      postSet: function (_, n) {
        var self = this;
        n.onload.sub(function () {
          self.document = n.el().contentDocument;

          n.el().contentDocument.body.style.whiteSpace = 'pre-wrap';
          n.el().contentDocument.head.insertAdjacentHTML(
            'afterbegin',
            '<style>blockquote{border-left-color:#fff;border-left-style:none;padding-left:1ex;}</style>');
          n.el().contentDocument.body.style.overflow = 'auto';
          n.el().contentDocument.body.style.margin = '5px';
          n.el().contentDocument.body.contentEditable = true;
          n.el().contentDocument.body.insertAdjacentHTML('beforeend', self.data);
          n.el().contentDocument.body.addEventListener('input', function () {
            self.data = n.el().contentDocument.body.innerHTML;
          }, false);

        });
      }
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .start('div').addClass('foam-flow-Document')
          .start('iframe', null, this.frame$).addClass('iframeContainer')
            .attrs({
              id: 'frame',
              name: 'frame',
              frameBorder: 0,
              sandbox: 'allow-same-origin'
            })
          .end()
          .startContext({ data: this })
            .start('div', null, this.richActions$).addClass('richtext-actions')
              .start(this.BOLD).addClass('richtext-button').end()
              .start(this.ITALIC).addClass('richtext-button').end()
              .start(this.UNDERLINE).addClass('richtext-button').end()
              .start('div').addClass('dropdown')
                .start(this.FONT_SIZE).addClass('richtext-button').end()
                .start(this.FontSize.create({}), null, this.fontSizeMenu$).end()
              .end()
              .start('div').addClass('dropdown')
                .start(this.FONT_FACE).addClass('richtext-button').end()
                .start(this.FontFace.create({}), null, this.fontFaceMenu$).end()
              .end()
              .start('div').addClass('dropdown')
                .start(this.JUSTIFICATION).addClass('richtext-button').end()
                .start(this.TextAlignment.create({}), null, this.justifyMenu$).end()
              .end()
              .start('div').addClass('dropdown')
                .start(this.OTHERS).addClass('richtext-button').end()
                .start(this.TextFormat.create({}), null, this.otherActionsMenu$).end()
              .end()
            .end()
          .endContext()

          .start(this.DetailView, {data: this.FontFace2.create(), showActions: true}).end()
          .tag(this.Popup, {
            button: 'CLICK',
            view: this.DetailView.create({data: this.FontSize2.create(), showActions: true})
          })
        .end();
    },

    function closeOpenMenu(n) {
      var actions = this.richActions.children;
      for (i = 0; i < actions.length; i++) {
        if ( actions[i].nodeName === 'DIV' ) {
          if ( actions[i].children[1].menu.id === n.id ) {
            if ( n.shown == true ) {
              n.hide();
            } else { n.show(); }
          } else {
            actions[i].children[1].menu.hide();
          }
        }
      }
    }
  ],

  actions: [
    {
      name: 'bold',
      label: '',
      help: 'Bold (Ctrl-B)',
      toolTip: 'Bold',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTEyLjE5OSwxMC41YzAsMCwxLjgwMS0wLjUsMS44MDEtMlMxMyw2LDExLjUsNkg2djloNS41YzEuNSwwLDIuNS0xLDIuNS0yLjVTMTIuMTk5LDEwLjUsMTIuMTk5LDEwLjV6IE0xMC41LDE0SDl2LTNoMS41DQoJYzAuNTUzLDAsMC44NSwwLjY3MiwwLjg1LDEuNVMxMS4wNTMsMTQsMTAuNSwxNHogTTEwLjUsMTBIOVY3aDEuNWMwLjU1MywwLDAuODUsMC42NzIsMC44NSwxLjVTMTEuMDUzLDEwLDEwLjUsMTB6Ii8+DQo8cmVjdCBvcGFjaXR5PSIwIiBmaWxsPSIjNDM4N0ZEIiB3aWR0aD0iMjEiIGhlaWdodD0iMjEiLz4NCjwvc3ZnPg0K',
      code: function() {
        this.frame.el().contentWindow.focus();
        this.frame.el().contentDocument.execCommand('bold');
      }
    },
    {
      name: 'italic',
      label: '',
      help: 'Italic (Ctrl-I)',
      toolTip: 'Italics',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBvbHlnb24gZmlsbD0iIzg4OCIgcG9pbnRzPSI5LDYgOSw3IDEwLjksNyA2LjksMTQgNSwxNCA1LDE1IDExLjI1LDE1IDExLjI1LDE0IDkuMSwxNCAxMy4xLDcgMTUsNyAxNSw2ICIvPg0KPHJlY3Qgb3BhY2l0eT0iMCIgZmlsbD0iIzQzODdGRCIgd2lkdGg9IjIxIiBoZWlnaHQ9IjIxIi8+DQo8L3N2Zz4NCg==',
      code: function() {
        this.frame.el().contentWindow.focus();
        this.frame.el().contentDocument.execCommand('italic');
      }
    },
    {
      name: 'underline',
      label: '',
      help: 'Underline (Ctrl-U)',
      toolTip: 'Underline',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTEwLDE0YzIsMCw0LTEuNSw0LTRWNWgtMS44MDF2NWMwLDEuNS0wLjY5OSwyLjI1LTIuMTk5LDIuMjVTNy44LDExLjUsNy44LDEwVjVINnY1QzYsMTIuNSw4LDE0LDEwLDE0eiBNNSwxNXYxaDEwdi0xSDV6Ig0KCS8+DQo8cmVjdCBvcGFjaXR5PSIwIiBmaWxsPSIjNDM4N0ZEIiB3aWR0aD0iMjEiIGhlaWdodD0iMjEiLz4NCjwvc3ZnPg0K',
      code: function() {
        this.frame.el().contentWindow.focus();
        this.frame.el().contentDocument.execCommand('underline');
      }
    },
    {
      name: 'fontSize',
      label: '',
      help: 'Change the font size.',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAANpJREFUOMvtkyFuw0AQRd+sCiwrICC8zilKAnqIHKAjXyA3aHKDEtN1YY5Q6CP4CAtSKSDAYQXRTohBW7WODYycz3b/7pv/V1qYtKTLLMtyHmPc9IU5595VNTzcODcXkdcBISsguDHqdyYNIRyyLFt+3zOzPfAEfIrI6teV4w9oURSzNE0XHTMaVW2891/t+qKqoTNpkiRrMyv/I5rZDtj2qT/umzrn6hjjDkBEXoBH4Gxmb61fDYaqag3UAN775xba5Hneq/Lo9ScO/fNHmdmHiATgNMS7azxdAX9WQ9Rz12fXAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTAzLTEzVDAzOjE0OjAzKzAwOjAwnW3t/gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wMy0xM1QwMzoxNDowMyswMDowMOwwVUIAAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2stN2xlZW1xSTPhtKVNAAAAAElFTkSuQmCC',
      code: function() {
        this.closeOpenMenu(this.fontSizeMenu.menu);
      }
    },
    {
      name: 'fontFace',
      help: 'Set\'s the font face.',
      label: 'Sans Serif',
      code: function() {
        this.closeOpenMenu(this.fontFaceMenu.menu);
      }
    },
    {
      name: 'justification',
      label: '',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTMsMTZoMTB2LTFIM1YxNnogTTEzLDExSDN2MWgxMFYxMXogTTEzLDdIM3YxaDEwVjd6IE0zLDE0aDE0di0xSDNWMTR6IE0zLDEwaDE0VjlIM1YxMHogTTMsNXYxaDE0VjVIM3oiLz4NCjxyZWN0IG9wYWNpdHk9IjAiIGZpbGw9IiM0Mzg3RkQiIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIvPg0KPC9zdmc+DQo=',
      code: function() {
        this.closeOpenMenu(this.justifyMenu.menu);
      }
    },
    {
      name: 'others',
      label: '',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAE5JREFUOMtjYBgFo2DwA0Y8ciYMDAwCeOQ/MDAwnCHVQgMGBoY3DAwM/7Hg9wwMDKbk+gSbwRQZiM1gqhiIbPAdahoIAyzUNnAUjAIiAQDT0RL+029yOwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wMy0xM1QwMzo0NzozOSswMDowMC3yohIAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDMtMTNUMDM6NDc6MzkrMDA6MDBcrxquAAAAKHRFWHRzdmc6YmFzZS11cmkAZmlsZTovLy90bXAvbWFnaWNrLUhTRzNjcjJw9l8U4QAAAABJRU5ErkJggg==',
      code: function() {
        this.closeOpenMenu(this.otherActionsMenu.menu);
      }
    },
  ],
});
