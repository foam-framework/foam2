/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TextAlignment',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'menu',
    },
    {
      name: 'document',
    },
    {
      name: 'window',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .startContext({ data: this })
          .start('div', null, this.menu$).addClass('dropdown-content').hide()
            .start('div').start(this.LEFT_JUSTIFY).addClass('richtext-button').end().end()
            .start('div').start(this.CENTER_JUSTIFY).addClass('richtext-button').end().end()
            .start('div').start(this.RIGHT_JUSTIFY).addClass('richtext-button').end().end()
          .end()
        .end();
    },
  ],

  actions: [
    {
      name: 'leftJustify',
      help: 'Align Left (Ctrl-Shift-W)',
      label: '',
      toolTip: 'Left Justify',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTMsMTZoMTB2LTFIM1YxNnogTTEzLDExSDN2MWgxMFYxMXogTTEzLDdIM3YxaDEwVjd6IE0zLDE0aDE0di0xSDNWMTR6IE0zLDEwaDE0VjlIM1YxMHogTTMsNXYxaDE0VjVIM3oiLz4NCjxyZWN0IG9wYWNpdHk9IjAiIGZpbGw9IiM0Mzg3RkQiIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIvPg0KPC9zdmc+DQo=',
      // Ctrl-Shift-L
      code: function() {
        this.window.focus();
        this.document.execCommand('justifyLeft');
        this.menu.hide();
      }
    },
    {
      name: 'centerJustify',
      help: 'Align Center (Ctrl-Shift-E)',
      label: '',
      toolTip: 'Center Justify',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTUsMTF2MWgxMHYtMUg1eiBNMywxNGgxNHYtMUgzVjE0eiBNNSwxNmgxMHYtMUg1VjE2eiBNMywxMGgxNFY5SDNWMTB6IE01LDd2MWgxMFY3SDV6IE0zLDV2MWgxNFY1SDN6Ii8+DQo8cmVjdCBvcGFjaXR5PSIwIiBmaWxsPSIjNDM4N0ZEIiB3aWR0aD0iMjEiIGhlaWdodD0iMjEiLz4NCjwvc3ZnPg0K',
      // Ctrl-Shift-E
      code: function() {
        this.window.focus();
        this.document.execCommand('justifyCenter');
        this.menu.hide();
      }
    },
    {
      name: 'rightJustify',
      help: 'Align Right (Ctrl-Shift-R)',
      label: '',
      toolTip: 'Right Justify',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTUsMTF2MWgxMHYtMUg1eiBNMywxNGgxNHYtMUgzVjE0eiBNNSwxNmgxMHYtMUg1VjE2eiBNMywxMGgxNFY5SDNWMTB6IE01LDd2MWgxMFY3SDV6IE0zLDV2MWgxNFY1SDN6Ii8+DQo8cmVjdCBvcGFjaXR5PSIwIiBmaWxsPSIjNDM4N0ZEIiB3aWR0aD0iMjEiIGhlaWdodD0iMjEiLz4NCjwvc3ZnPg0K',
      // Ctrl-Shift-R
      code: function() {
        this.window.focus();
        this.document.execCommand('justifyRight');
        this.menu.hide();
      }
    }
  ]
});