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
  package: 'foam.u2.view',
  name: 'ColorPicker',
  extends: 'foam.u2.tag.Input',

  constants: {
    NAME_TO_COLOR: {
      black: "#000000",
      navy: "#000080",
      darkblue: "#00008b",
      mediumblue: "#0000cd",
      blue: "#0000ff",
      darkgreen: "#006400",
      green: "#008000",
      teal: "#008080",
      darkcyan: "#008b8b",
      deepskyblue: "#00bfff",
      darkturquoise: "#00ced1",
      mediumspringgreen: "#00fa9a",
      lime: "#00ff00",
      springgreen: "#00ff7f",
      aqua: "#00ffff",
      cyan: "#00ffff",
      midnightblue: "#191970",
      dodgerblue: "#1e90ff",
      lightseagreen: "#20b2aa",
      forestgreen: "#228b22",
      seagreen: "#2e8b57",
      darkslategray: "#2f4f4f",
      darkslategrey: "#2f4f4f",
      limegreen: "#32cd32",
      mediumseagreen: "#3cb371",
      turquoise: "#40e0d0",
      royalblue: "#4169e1",
      steelblue: "#4682b4",
      darkslateblue: "#483d8b",
      mediumturquoise: "#48d1cc",
      indigo: "#4b0082",
      darkolivegreen: "#556b2f",
      cadetblue: "#5f9ea0",
      cornflowerblue: "#6495ed",
      rebeccapurple: "#663399",
      mediumaquamarine: "#66cdaa",
      dimgray: "#696969",
      dimgrey: "#696969",
      slateblue: "#6a5acd",
      olivedrab: "#6b8e23",
      slategray: "#708090",
      slategrey: "#708090",
      lightslategray: "#778899",
      lightslategrey: "#778899",
      mediumslateblue: "#7b68ee",
      lawngreen: "#7cfc00",
      chartreuse: "#7fff00",
      aquamarine: "#7fffd4",
      maroon: "#800000",
      purple: "#800080",
      olive: "#808000",
      gray: "#808080",
      grey: "#808080",
      skyblue: "#87ceeb",
      lightskyblue: "#87cefa",
      blueviolet: "#8a2be2",
      darkred: "#8b0000",
      darkmagenta: "#8b008b",
      saddlebrown: "#8b4513",
      darkseagreen: "#8fbc8f",
      lightgreen: "#90ee90",
      mediumpurple: "#9370db",
      darkviolet: "#9400d3",
      palegreen: "#98fb98",
      darkorchid: "#9932cc",
      yellowgreen: "#9acd32",
      sienna: "#a0522d",
      brown: "#a52a2a",
      darkgray: "#a9a9a9",
      darkgrey: "#a9a9a9",
      lightblue: "#add8e6",
      greenyellow: "#adff2f",
      paleturquoise: "#afeeee",
      lightsteelblue: "#b0c4de",
      powderblue: "#b0e0e6",
      firebrick: "#b22222",
      darkgoldenrod: "#b8860b",
      mediumorchid: "#ba55d3",
      rosybrown: "#bc8f8f",
      darkkhaki: "#bdb76b",
      silver: "#c0c0c0",
      mediumvioletred: "#c71585",
      indianred: "#cd5c5c",
      peru: "#cd853f",
      chocolate: "#d2691e",
      tan: "#d2b48c",
      lightgray: "#d3d3d3",
      lightgrey: "#d3d3d3",
      thistle: "#d8bfd8",
      orchid: "#da70d6",
      goldenrod: "#daa520",
      palevioletred: "#db7093",
      crimson: "#dc143c",
      gainsboro: "#dcdcdc",
      plum: "#dda0dd",
      burlywood: "#deb887",
      lightcyan: "#e0ffff",
      lavender: "#e6e6fa",
      darksalmon: "#e9967a",
      violet: "#ee82ee",
      palegoldenrod: "#eee8aa",
      lightcoral: "#f08080",
      khaki: "#f0e68c",
      aliceblue: "#f0f8ff",
      honeydew: "#f0fff0",
      azure: "#f0ffff",
      sandybrown: "#f4a460",
      wheat: "#f5deb3",
      beige: "#f5f5dc",
      whitesmoke: "#f5f5f5",
      mintcream: "#f5fffa",
      ghostwhite: "#f8f8ff",
      salmon: "#fa8072",
      antiquewhite: "#faebd7",
      linen: "#faf0e6",
      lightgoldenrodyellow: "#fafad2",
      oldlace: "#fdf5e6",
      red: "#ff0000",
      fuchsia: "#ff00ff",
      magenta: "#ff00ff",
      deeppink: "#ff1493",
      orangered: "#ff4500",
      tomato: "#ff6347",
      hotpink: "#ff69b4",
      coral: "#ff7f50",
      darkorange: "#ff8c00",
      lightsalmon: "#ffa07a",
      orange: "#ffa500",
      lightpink: "#ffb6c1",
      pink: "#ffc0cb",
      gold: "#ffd700",
      peachpuff: "#ffdab9",
      navajowhite: "#ffdead",
      moccasin: "#ffe4b5",
      bisque: "#ffe4c4",
      mistyrose: "#ffe4e1",
      blanchedalmond: "#ffebcd",
      papayawhip: "#ffefd5",
      lavenderblush: "#fff0f5",
      seashell: "#fff5ee",
      cornsilk: "#fff8dc",
      lemonchiffon: "#fffacd",
      floralwhite: "#fffaf0",
      snow: "#fffafa",
      yellow: "#ffff00",
      lightyellow: "#ffffe0",
      ivory: "#fffff0",
      white: "#ffffff"
    },
    COLOR_TO_NAME: { '#000000': 'black',
      '#000080': 'navy',
      '#00008b': 'darkblue',
      '#0000cd': 'mediumblue',
      '#0000ff': 'blue',
      '#006400': 'darkgreen',
      '#008000': 'green',
      '#008080': 'teal',
      '#008b8b': 'darkcyan',
      '#00bfff': 'deepskyblue',
      '#00ced1': 'darkturquoise',
      '#00fa9a': 'mediumspringgreen',
      '#00ff00': 'lime',
      '#00ff7f': 'springgreen',
      '#00ffff': 'cyan',
      '#191970': 'midnightblue',
      '#1e90ff': 'dodgerblue',
      '#20b2aa': 'lightseagreen',
      '#228b22': 'forestgreen',
      '#2e8b57': 'seagreen',
      '#2f4f4f': 'darkslategrey',
      '#32cd32': 'limegreen',
      '#3cb371': 'mediumseagreen',
      '#40e0d0': 'turquoise',
      '#4169e1': 'royalblue',
      '#4682b4': 'steelblue',
      '#483d8b': 'darkslateblue',
      '#48d1cc': 'mediumturquoise',
      '#4b0082': 'indigo',
      '#556b2f': 'darkolivegreen',
      '#5f9ea0': 'cadetblue',
      '#6495ed': 'cornflowerblue',
      '#663399': 'rebeccapurple',
      '#66cdaa': 'mediumaquamarine',
      '#696969': 'dimgrey',
      '#6a5acd': 'slateblue',
      '#6b8e23': 'olivedrab',
      '#708090': 'slategrey',
      '#778899': 'lightslategrey',
      '#7b68ee': 'mediumslateblue',
      '#7cfc00': 'lawngreen',
      '#7fff00': 'chartreuse',
      '#7fffd4': 'aquamarine',
      '#800000': 'maroon',
      '#800080': 'purple',
      '#808000': 'olive',
      '#808080': 'grey',
      '#87ceeb': 'skyblue',
      '#87cefa': 'lightskyblue',
      '#8a2be2': 'blueviolet',
      '#8b0000': 'darkred',
      '#8b008b': 'darkmagenta',
      '#8b4513': 'saddlebrown',
      '#8fbc8f': 'darkseagreen',
      '#90ee90': 'lightgreen',
      '#9370db': 'mediumpurple',
      '#9400d3': 'darkviolet',
      '#98fb98': 'palegreen',
      '#9932cc': 'darkorchid',
      '#9acd32': 'yellowgreen',
      '#a0522d': 'sienna',
      '#a52a2a': 'brown',
      '#a9a9a9': 'darkgrey',
      '#add8e6': 'lightblue',
      '#adff2f': 'greenyellow',
      '#afeeee': 'paleturquoise',
      '#b0c4de': 'lightsteelblue',
      '#b0e0e6': 'powderblue',
      '#b22222': 'firebrick',
      '#b8860b': 'darkgoldenrod',
      '#ba55d3': 'mediumorchid',
      '#bc8f8f': 'rosybrown',
      '#bdb76b': 'darkkhaki',
      '#c0c0c0': 'silver',
      '#c71585': 'mediumvioletred',
      '#cd5c5c': 'indianred',
      '#cd853f': 'peru',
      '#d2691e': 'chocolate',
      '#d2b48c': 'tan',
      '#d3d3d3': 'lightgrey',
      '#d8bfd8': 'thistle',
      '#da70d6': 'orchid',
      '#daa520': 'goldenrod',
      '#db7093': 'palevioletred',
      '#dc143c': 'crimson',
      '#dcdcdc': 'gainsboro',
      '#dda0dd': 'plum',
      '#deb887': 'burlywood',
      '#e0ffff': 'lightcyan',
      '#e6e6fa': 'lavender',
      '#e9967a': 'darksalmon',
      '#ee82ee': 'violet',
      '#eee8aa': 'palegoldenrod',
      '#f08080': 'lightcoral',
      '#f0e68c': 'khaki',
      '#f0f8ff': 'aliceblue',
      '#f0fff0': 'honeydew',
      '#f0ffff': 'azure',
      '#f4a460': 'sandybrown',
      '#f5deb3': 'wheat',
      '#f5f5dc': 'beige',
      '#f5f5f5': 'whitesmoke',
      '#f5fffa': 'mintcream',
      '#f8f8ff': 'ghostwhite',
      '#fa8072': 'salmon',
      '#faebd7': 'antiquewhite',
      '#faf0e6': 'linen',
      '#fafad2': 'lightgoldenrodyellow',
      '#fdf5e6': 'oldlace',
      '#ff0000': 'red',
      '#ff00ff': 'magenta',
      '#ff1493': 'deeppink',
      '#ff4500': 'orangered',
      '#ff6347': 'tomato',
      '#ff69b4': 'hotpink',
      '#ff7f50': 'coral',
      '#ff8c00': 'darkorange',
      '#ffa07a': 'lightsalmon',
      '#ffa500': 'orange',
      '#ffb6c1': 'lightpink',
      '#ffc0cb': 'pink',
      '#ffd700': 'gold',
      '#ffdab9': 'peachpuff',
      '#ffdead': 'navajowhite',
      '#ffe4b5': 'moccasin',
      '#ffe4c4': 'bisque',
      '#ffe4e1': 'mistyrose',
      '#ffebcd': 'blanchedalmond',
      '#ffefd5': 'papayawhip',
      '#fff0f5': 'lavenderblush',
      '#fff5ee': 'seashell',
      '#fff8dc': 'cornsilk',
      '#fffacd': 'lemonchiffon',
      '#fffaf0': 'floralwhite',
      '#fffafa': 'snow',
      '#ffff00': 'yellow',
      '#ffffe0': 'lightyellow',
      '#fffff0': 'ivory',
      '#ffffff': 'white'
    }
  },

  properties: [
    {
      name: 'type',
      value: 'color'
    }
  ],

  methods: [
    function link() {
      var self = this;
      this.attrSlot(null, this.onKey ? 'input' : null).relateTo(this.data$,
        function(value) {
          if ( typeof value !== 'string' ) return value;

          var v = value.toLowerCase();
          if ( self.COLOR_TO_NAME[v] ) return self.COLOR_TO_NAME[v];
          return value;
        },
        function (value) {
          if ( typeof value !== 'string' ) return value;

          var v = value.toLowerCase();
          if ( self.NAME_TO_COLOR[v] ) return self.NAME_TO_COLOR[v];
          return value;
        });
    }
  ]
});
