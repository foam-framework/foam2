/*
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

foam.LIB({
  name: 'foam.date',

  methods: [
    function relativeDateString(date) {
      // TODO i18n: make this translatable
      var seconds = Math.floor((Date.now() - date.getTime())/1000);

      if ( seconds < 60 ) return 'moments ago';
      if ( seconds > 60 ) return 'in moments';

      var minutes = Math.floor((seconds)/60);

      if ( minutes == 1 ) return '1 minute ago';
      if ( minutes == -1 ) return 'in 1 minute';

      if ( minutes < 60 ) return minutes + ' minutes ago';
      if ( minutes > 60 ) return 'in ' + minutes + ' minutes';

      var hours = Math.floor(minutes/60);
      if ( hours == 1 ) return '1 hour ago';
      if ( hours == -1 ) return 'in 1 hour';

      if ( hours < 24 ) return hours + ' hours ago';
      if ( hours < -24 ) return 'in ' + hours + ' hours';

      var days = Math.floor(hours / 24);
      if ( days == 1 ) return '1 day ago';
      if ( days == -1 ) return 'in 1 day';

      if ( days < 7 ) return days + ' days ago';
      if ( days < -7 ) return 'in ' + days + ' days';

      if ( days < 365 ) {
        var year = 1900+date.getYear();
        var noyear = date.toDateString().replace(' ' + year, '');
        return noyear.substring(4);
      }

      return date.toDateString().substring(4);
    }
  ]
});
