/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'DefaultTextFormats',
  imports: [
    'document'
  ],
  actions: [
    {
      name: 'bold',
      label: '',
      help: 'Bold (Ctrl-B)',
      toolTip: 'Bold',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTEyLjE5OSwxMC41YzAsMCwxLjgwMS0wLjUsMS44MDEtMlMxMyw2LDExLjUsNkg2djloNS41YzEuNSwwLDIuNS0xLDIuNS0yLjVTMTIuMTk5LDEwLjUsMTIuMTk5LDEwLjV6IE0xMC41LDE0SDl2LTNoMS41DQoJYzAuNTUzLDAsMC44NSwwLjY3MiwwLjg1LDEuNVMxMS4wNTMsMTQsMTAuNSwxNHogTTEwLjUsMTBIOVY3aDEuNWMwLjU1MywwLDAuODUsMC42NzIsMC44NSwxLjVTMTEuMDUzLDEwLDEwLjUsMTB6Ii8+DQo8cmVjdCBvcGFjaXR5PSIwIiBmaWxsPSIjNDM4N0ZEIiB3aWR0aD0iMjEiIGhlaWdodD0iMjEiLz4NCjwvc3ZnPg0K',
      code: function () {
        this.document.execCommand('bold');
      },
      isAvailable: function(document){
        return document ? ! document.queryCommandState('bold') : false;
      }
    },
    {
      name: 'unbold',
      label: '',
      help: 'UnBold (Ctrl-B)',
      icon: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDkyLjI3NyA5Mi4yNzciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDkyLjI3NyA5Mi4yNzc7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNjQuMjY1LDQzLjYyNmwtMy4zOS0xLjIzN2wzLjI2Ny0xLjUzYzgtMy43NDYsMTIuNDA4LTEwLjIwMiwxMi40MDgtMTguMTc3YzAtNy41MjEtMy45MTYtMTMuOTE3LTEwLjc0NC0xNy41NDggICAgQzU5LjQ2NCwxLjM4Myw1Mi4yMDIsMCwzOC45NTIsMGMtOS45NDEsMC0yMC42ODksMC43NS0yNi4zNDEsMS44MzN2ODkuMTM4YzMuNTYyLDAuNTA4LDEwLjkxNiwxLjMwNywyMi4wMDIsMS4zMDcgICAgYzE3LjA5OCwwLDI4Ljc3OS0yLjY4MiwzNS43MS04LjE5NmM2LjEwOC00Ljk0NCw5LjM0NC0xMS41NTEsOS4zNDQtMTkuMDk1Qzc5LjY2Nyw1NC45ODQsNzQuMDUyLDQ3LjE5OCw2NC4yNjUsNDMuNjI2eiAgICAgTTMyLjM0NiwxNC44ODRsMS4zMTEtMC4xNjZjMi4xNTctMC4yNzMsNC43MzMtMC40MDcsNy44NzQtMC40MDdjOS42OCwwLDE1LjAxMiwzLjg4OCwxNS4wMTIsMTAuOTQ2ICAgIGMwLDcuMjc5LTYuMzcxLDExLjYyNS0xNy4wNDUsMTEuNjI1aC03LjE1VjE0Ljg4NEgzMi4zNDZ6IE00MC43MTYsNzcuNjk1Yy0yLjg3MywwLTUuMTQyLDAtNy0wLjE2bC0xLjM3MS0wLjExOFY1MC45MjJoNy40MiAgICBjMTIuMDQyLDAsMTguOTQ2LDQuODI5LDE4Ljk0NiwxMy4yNUM1OC43MTIsNzIuNzY2LDUyLjE1Miw3Ny42OTUsNDAuNzE2LDc3LjY5NXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K',
      toolTip: 'Undo Bold',
      code: function () {
        this.document.execCommand('bold');
      },
      isAvailable: function(document){
        return document ? document.queryCommandState('bold') : false;
      }
    },
    {
      name: 'italic',
      label: '',
      help: 'Italic (Ctrl-I)',
      toolTip: 'Italics',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBvbHlnb24gZmlsbD0iIzg4OCIgcG9pbnRzPSI5LDYgOSw3IDEwLjksNyA2LjksMTQgNSwxNCA1LDE1IDExLjI1LDE1IDExLjI1LDE0IDkuMSwxNCAxMy4xLDcgMTUsNyAxNSw2ICIvPg0KPHJlY3Qgb3BhY2l0eT0iMCIgZmlsbD0iIzQzODdGRCIgd2lkdGg9IjIxIiBoZWlnaHQ9IjIxIi8+DQo8L3N2Zz4NCg==',
      code: function () {
        this.document.execCommand('italic');
      },
      isAvailable: function(document){
        return document ? ! document.queryCommandState('italic') : false;
      }      
    },
    {
      name: 'unItalic',
      label: '',
      help: 'Italic (Ctrl-I)',
      toolTip: 'Undo Italics',
      icon: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAzMDUgMzA1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMDUgMzA1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCI+Cjxwb2x5Z29uIHBvaW50cz0iMjc1LDMwIDI3NSwwIDEzNSwwIDEzNSwzMCAxODMuMjE2LDMwIDg5LjY3MSwyNzUgMzAsMjc1IDMwLDMwNSAxNzAsMzA1IDE3MCwyNzUgMTIxLjc4NCwyNzUgMjE1LjMyOSwzMCAiIGZpbGw9IiMwMDAwMDAiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==',
      code: function () {
        this.document.execCommand('italic');
      },
      isAvailable: function(document){
        return document ? document.queryCommandState('italic') : false;
      }      
    },    
    {
      name: 'underline',
      label: '',
      help: 'Underline (Ctrl-U)',
      toolTip: 'Underline',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTEwLDE0YzIsMCw0LTEuNSw0LTRWNWgtMS44MDF2NWMwLDEuNS0wLjY5OSwyLjI1LTIuMTk5LDIuMjVTNy44LDExLjUsNy44LDEwVjVINnY1QzYsMTIuNSw4LDE0LDEwLDE0eiBNNSwxNXYxaDEwdi0xSDV6Ig0KCS8+DQo8cmVjdCBvcGFjaXR5PSIwIiBmaWxsPSIjNDM4N0ZEIiB3aWR0aD0iMjEiIGhlaWdodD0iMjEiLz4NCjwvc3ZnPg0K',
      code: function () {
        this.document.execCommand('underline');
      },
      isAvailable: function(document){
        return document ? ! document.queryCommandState('underline') : false;
      }        
    },
    {
      name: 'undoUnderline',
      label: '',
      help: 'Underline (Ctrl-U)',
      toolTip: 'Underline',
      icon: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIzMCAyMzAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIzMCAyMzAiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiPgogIDxnPgogICAgPHBhdGggZD0iTTYxLjYzOCwxNjQuMTY1Qzc1LjIzNiwxNzUuMzksOTMuMjU3LDE4MSwxMTUuNDU4LDE4MWMyMS45NTUsMCwzOS42NzktNS42MSw1My4yMzktMTYuODM1ICAgQzE4Mi4yNTQsMTUyLjk0MiwxODksMTM3LjEzLDE4OSwxMTYuNzMxVjBoLTQydjExNi43MzFjMCwxMS4wNi0yLjUwMSwxOS4yMTItOC4wMywyNC40NTRjLTUuNTI5LDUuMjQ0LTEzLjI4NCw3Ljg2NC0yMy41MjQsNy44NjQgICBjLTEwLjMyMiwwLTE4LjMxMi0yLjY0Mi0yMy45NjUtNy45MjZDODUuODI5LDEzNS44NDEsODMsMTI3LjcxMSw4MywxMTYuNzMxVjBINDF2MTE2LjczMUM0MSwxMzcuMTMsNDguMDM5LDE1Mi45NDIsNjEuNjM4LDE2NC4xNjUgICB6IiBmaWxsPSIjMDAwMDAwIi8+CiAgICA8cmVjdCB3aWR0aD0iMjMwIiB5PSIxOTciIGhlaWdodD0iMzMiIGZpbGw9IiMwMDAwMDAiLz4KICA8L2c+Cjwvc3ZnPgo=',
      code: function () {
        this.document.execCommand('underline');
      },
      isAvailable: function(document){
        return document ? document.queryCommandState('underline') : false;
      }        
    }    
  ]
});