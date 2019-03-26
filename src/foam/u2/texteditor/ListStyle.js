/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.texteditor',
  name: 'ListStyle',
  imports: [
    'document'
  ],
  actions: [
    {
      name: 'numberedList',
      help: 'Numbered List (Ctrl-Shift-7)',
      label: '',
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAgLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsNCgk8IUVOVElUWSBuc19mbG93cyAiaHR0cDovL25zLmFkb2JlLmNvbS9GbG93cy8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6YT0iaHR0cDovL25zLmFkb2JlLmNvbS9BZG9iZVNWR1ZpZXdlckV4dGVuc2lvbnMvMy4wLyINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyMXB4IiBoZWlnaHQ9IjIxcHgiIHZpZXdCb3g9IjAgMCAyMSAyMSIgb3ZlcmZsb3c9InZpc2libGUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIxIDIxIg0KCSB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxkZWZzPg0KPC9kZWZzPg0KPHBhdGggZmlsbD0iIzg4OCIgZD0iTTYsMTVjMC0wLjU1My0wLjQ0Ny0xLTEtMUgzdjFoMi4yNWwtMSwxbDEsMUgzdjFoMmMwLjU1MywwLDEtMC40NDcsMS0xYzAtMC4yNzYtMC4xMTEtMC41MjYtMC4yOTMtMC43MDdMNS40MTQsMTYNCglsMC4yOTMtMC4yOTNDNS44ODksMTUuNTI2LDYsMTUuMjc2LDYsMTV6IE01LjcwNywxMC43MDdDNS44ODksMTAuNTI2LDYsMTAuMjc2LDYsMTBjMC0wLjU1My0wLjQ0Ny0xLTEtMUgzdjFoMi4yNUwzLDEyLjI1VjEzaDN2LTENCglINC40MTRDNC40MTQsMTIsNS41MjUsMTAuODg5LDUuNzA3LDEwLjcwN3ogTTgsNXYxaDlWNUg4eiBNNCw4aDFWNEgzdjFoMVY4eiBNOCwxMWg5di0xSDhWMTF6IE04LDE2aDl2LTFIOFYxNnoiLz4NCjxyZWN0IG9wYWNpdHk9IjAiIGZpbGw9IiM0Mzg3RkQiIHdpZHRoPSIyMSIgaGVpZ2h0PSIyMSIvPg0KPC9zdmc+DQo=',
      code: function () {
        this.document.execCommand('insertOrderedList');
      },
      isAvailable: function(document){
        return document ? ! document.queryCommandState('insertOrderedList') : false;
      }
    },
    {
      name: 'undoNumberedList',
      help: 'Numbered List (Ctrl-Shift-7)',
      code: function () {
        this.document.execCommand('insertOrderedList');
      },
      isAvailable: function(document){
        return document ? document.queryCommandState('insertOrderedList') : false;
      }
    },
    {
      name: 'bulletList',
      help: 'Bulleted List (Ctrl-Shift-7)',
      label: '',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAARVJREFUOMvtlL1KA0EUhb87E0sre7HzHcQfFB/ANqRKs4Vt9gcsoiCk2AxbWqcIWOcN1sY8g3kFS9udOzabkIjFLixp9DR37gx8XM6ZGfjXWlEUHXTBkfUijuNHEXkKIYydc89xHE9E5KgpKIQwc84tAXobushFXS/r2gdOGk8nsgR2od77e2vtAJgDGGOuRKTXFKqqn11Yt19tgkrT9E5VR4Bzzi2SJOkDh01B3vuyKIoVbHmqqiMROQcCsAAmtAjKWjsEdqHGmKmqAkzrrYeWk77vz+CutB3UKTCoqmpeFMUqy7Ljtvc0z/Mv2PI0hPAC3Fhrz4BbVX2jRVDAEJj9hJYicg2Udf/a8u1//HrQ1S/1x/UNiq9i21WhDBgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDMtMTNUMDM6MzU6MzIrMDA6MDACOzNWAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTAzLTEzVDAzOjM1OjMyKzAwOjAwc2aL6gAAACh0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vdG1wL21hZ2ljay1tYndWUWRCR8l+GrQAAAAASUVORK5CYII=',
      code: function () {
        this.document.execCommand('insertUnorderedList');
      },
      isAvailable: function(document){
        return document ? ! document.queryCommandState('insertUnorderedList') : false;
      }
    },
    {
      name: 'undoBulletList',
      help: 'Bulleted List (Ctrl-Shift-7)',
      code: function () {
        this.document.execCommand('insertUnorderedList');
      },
      isAvailable: function(document){
        return document ? document.queryCommandState('insertUnorderedList') : false;
      }
    },
  ]
});