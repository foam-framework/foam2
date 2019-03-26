/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'TextFormats',
  imports: [
    'document'
  ],
  actions: [
    {
      name: 'removeFormatting',
      help: 'Removes formatting from the current selection.',
      label: '',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAYpJREFUOMvtkzFrVEEUhb87WE1lCKtiYQj5AWlTJoIiggYrm2AjKESEhTfz1kLY/jEji5XYWmknsTMLshYqBPtUIVUKmxS7+7o7ad4Lsu5u1k3AxlPdexm+OfcMA/910ZK68N7fVtX9GOOh9/4hcHNWSErpUwhhp+4vATSbzcvAe2PMcZZl69baneFw+GRWsDHmCDiFGoBOp3OsqptAwxjTGwwGV62194DuudYHyPP8VkrpI/ArpbQeQjgAcM49FZE31aprIYQfU53/3hRF8VlENoGGiHSzLFsCEJG16sjeWcA/oCPga8aYnnNu2Vr7DOiKyOuZMh43HHXc7/cb1tr7ZVl++OtMR+Wc2xKRd8CBqm7EGA/ndnp6o8hqVS7XUZwL2m63LfC4avfqKFqt1o25oWVZPgIWKsfPVfUOcEVVv57leCI0pbRdlT+LovgeY+yp6l1gUUS+TAOPheZ5fh34BrwVkRf1PMbYE5EHVRS7k6KY+vqTVP+8lNLLEMKreRhj5b1fuTDYP9MJc7eT0plHO40AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDMtMTNUMDM6MjA6NDQrMDA6MDBMiRvxAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTAzLTEzVDAzOjIwOjQ0KzAwOjAwPdSjTQAAACh0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vdG1wL21hZ2ljay1nYXo0Y1NTWn3jp+QAAAAASUVORK5CYII=',
      code: function () {
        this.document.execCommand('removeFormat');
      }
    },
    {
      name: 'decreaseIndentation',
      help: 'Indent Less (Ctrl-[)',
      label: '',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTMsMTZoMTR2LTFIM1YxNnogTTgsOGg5VjdIOFY4eiBNOCwxMGg5VjlIOFYxMHogTTgsMTJoOXYtMUg4VjEyeiBNOCwxNGg5di0xSDhWMTR6IE0zLDV2MWgxNFY1SDN6Ii8+DQo8cG9seWdvbiBvcGFjaXR5PSIwLjg1IiBwb2ludHM9IjYsOCA2LDEzIDMsMTAuNSAiLz4NCjxyZWN0IG9wYWNpdHk9IjAiIGZpbGw9IiM0Mzg3RkQiIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIvPg0KPC9zdmc+DQo=',
      code: function () {
        this.document.execCommand('outdent');
      }
    },
    {
      name: 'increaseIndentation',
      help: 'Indent More (Ctrl-])',
      label: '',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAO9JREFUOMvtlD0KwkAUhGfzPIB4CLG2tBJEsbIRrLWyD7y0IW2WjbVXEGysLK1sBA+QQwQP4G5sjMQQMH8gglPtDo+P2cewwK9IJAfbtrtENKwK0lqfgiAIAaCVmEQ0ALCtCiWiFYB3qNb6TETrGknPDW0vX6LIEDPPAfgfxhwp5R4ArJfjODNm7jealJmXADbGmIlS6lIH2src25ZlHZl5LKW8JmaRuuVWKqUOgJ3ruj3P8+5AsbrlViqlCMAiAT5TfKxbulJZ6M0YM1VKXdPm81lh6Z0KIaI4jkdZIFC+Ui+o7/uHokm+ov8v9SN6AGSpbA0Vrk6yAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTAzLTEzVDAzOjM2OjQxKzAwOjAw0iGb0QAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wMy0xM1QwMzozNjo0MSswMDowMKN8I20AAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2stVlF1RnMyOEn1GFUVAAAAAElFTkSuQmCC',
      code: function () {
        this.document.execCommand('indent');
      }
    },
    {
      name: 'blockQuote',
      help: 'Quote (Ctrl-Shift-9)',
      label: '',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAKFJREFUOMvtkCEOwkAURGdI8wUnoBfgHJymklR00ehF1FaiOEdPgkNhkCRNOghoQkqzXYEh7DP7My+Z/L9A4n/hVFiWZW5mraSMZOO9P8S4gWyq1Mx2ktYA7l3XnWLdwGIcOOdWkgoAINnUdX2JccFSSVsASwDo+/7mnCuqqtrMueD5JPO3ef96jwDakAtu+g1+p/TjTyVdSZ7H2ZxLJJ48ADTVW4CqVRbqAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTAzLTEzVDAzOjM3OjEzKzAwOjAw4pzvogAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wMy0xM1QwMzozNzoxMyswMDowMJPBVx4AAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2stWmdHcDJlMFWYVOqYAAAAAElFTkSuQmCC',
      code: function () {
        this.document.execCommand('formatBlock', false, '<blockquote>');
      }
    },
  ]
});