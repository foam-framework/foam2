/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'ToolBar',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.texteditor.DefaultTextFormats',
    'foam.u2.texteditor.FontFace',
    'foam.u2.texteditor.FontSize',
    'foam.u2.texteditor.TextAlignment',
    'foam.u2.texteditor.TextFormats',
    'foam.u2.texteditor.ListStyle',
    'foam.u2.texteditor.Popup',
    'foam.u2.DetailView',
    'foam.u2.texteditor.ToolBarItemView',
    'foam.u2.tag.Image'
  ],

  exports: [
    'doc_ as document'
  ],

  css: `
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

    .richtext-actions button{
      width: auto;
      height: 40px;
      text-align: center;
      font-size: 14px;
      background: none !important;
      color: #373a3c !important;
      border: none;
      font-weight: normal;
      border-radius: 0px;
  
      -webkit-box-shadow: inset 0 0 0 0 #ffffff;
    }
  
    .richtext-actions button:focus {
      outline: none;
      background: #ddd !important;
    }

   .toolbar-item {
     width: auto;
     height: auto;
     text-align: center;
     font-size: 14px;
     background: none !important;
     color: #373a3c !important;
     padding: 4px 12px;
   }  

   .toolbar-menu {
    position: absolute;
    background-color: #f0f0f0;
    min-width: 50px;
    min-height: 50px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }

  .toolbar-menu  button{
    display: block !important;
    width: 100px !important;
    height: 40px;
    text-align: left !important;
    padding: 16px;
    border-radius: 0px;
  }

 `,

  properties: [
    {
      name: 'doc_'
    }
  ],

  listeners: [
    {
      name: 'refresh',
      mergeDelay: 300,
      isMerged: true,
      code: function() {
        this.doc_ = null;
        this.doc_ = this.document;
        this.refresh();
      }
    }
  ],

  methods: [
    function initE() {
      this.refresh();

      this.SUPER();
      this.addClass('richtext-actions');
      this
        .start(this.DetailView, { data: this.DefaultTextFormats.create(), showActions: true, title: ''})
          .addClass('toolbar-item')
        .end()
        .start(this.Popup, {
          button: this.Image.create({ data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAANpJREFUOMvtkyFuw0AQRd+sCiwrICC8zilKAnqIHKAjXyA3aHKDEtN1YY5Q6CP4CAtSKSDAYQXRTohBW7WODYycz3b/7pv/V1qYtKTLLMtyHmPc9IU5595VNTzcODcXkdcBISsguDHqdyYNIRyyLFt+3zOzPfAEfIrI6teV4w9oURSzNE0XHTMaVW2891/t+qKqoTNpkiRrMyv/I5rZDtj2qT/umzrn6hjjDkBEXoBH4Gxmb61fDYaqag3UAN775xba5Hneq/Lo9ScO/fNHmdmHiATgNMS7azxdAX9WQ9Rz12fXAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTAzLTEzVDAzOjE0OjAzKzAwOjAwnW3t/gAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wMy0xM1QwMzoxNDowMyswMDowMOwwVUIAAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2stN2xlZW1xSTPhtKVNAAAAAElFTkSuQmCC'}),
          view: this.DetailView.create({ data: this.FontSize.create(), showActions: true, title: ''})
        })
          .addClass('toolbar-item')
        .end()
        .start(this.Popup, {
          button: this.Image.create({ data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfjBBoEDiA0xHctAAAA3klEQVQoz3XRPUtCARjF8Z9es5vk0BvRIApBLdHg0JJb36GguS9Tn6YpGqKtLUhKKBqCXtQIjJTCIHsZIr1Xb2d8zp/nOYeHuMZtO/Phxb5QgracurdnwaTUqJ2z692B8sBMx4CCgrQ7l77/Rpm+Oa1k3aKu0JqOK10I+sCqig0rPrWEMi58xTfUnSjLqTl07llv+MSDljdZN45cD2JFQ86bE3jSjOaOAiWz2h69/g/MaGoMKiYDsQNRIKtoSkMjGUhZUhS4VY8DvzXz8nYsq6lqj75ozLGOnqpNE8PmDwHONdPHeKDPAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA0LTI2VDAyOjE0OjMyKzAyOjAwoff9fgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNC0yNlQwMjoxNDozMiswMjowMNCqRcIAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC'}),
          view: this.DetailView.create({ data: this.FontFace.create(), showActions: true, title: ''})
        })
          .addClass('toolbar-item')
        .end()        
        .start(this.Popup, {
          button: this.Image.create({ data: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTMsMTZoMTB2LTFIM1YxNnogTTEzLDExSDN2MWgxMFYxMXogTTEzLDdIM3YxaDEwVjd6IE0zLDE0aDE0di0xSDNWMTR6IE0zLDEwaDE0VjlIM1YxMHogTTMsNXYxaDE0VjVIM3oiLz4NCjxyZWN0IG9wYWNpdHk9IjAiIGZpbGw9IiM0Mzg3RkQiIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIvPg0KPC9zdmc+DQo='}),
          view: this.DetailView.create({ data: this.TextAlignment.create(), showActions: true, title: ''})
        })
          .addClass('toolbar-item')
        .end()
        .start(this.DetailView, { data: this.ListStyle.create(), showActions: true, title: ''})
          .addClass('toolbar-item')
        .end()
        .start(this.Popup, {
          button: this.Image.create({ data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAE5JREFUOMtjYBgFo2DwA0Y8ciYMDAwCeOQ/MDAwnCHVQgMGBoY3DAwM/7Hg9wwMDKbk+gSbwRQZiM1gqhiIbPAdahoIAyzUNnAUjAIiAQDT0RL+029yOwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wMy0xM1QwMzo0NzozOSswMDowMC3yohIAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDMtMTNUMDM6NDc6MzkrMDA6MDBcrxquAAAAKHRFWHRzdmc6YmFzZS11cmkAZmlsZTovLy90bXAvbWFnaWNrLUhTRzNjcjJw9l8U4QAAAABJRU5ErkJggg=='}),
          view: this.DetailView.create({ data: this.TextFormats.create(), showActions: true, title: ''})
        })
          .addClass('toolbar-item')
        .end();
    },
  ]
});
