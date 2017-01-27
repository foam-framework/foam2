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
  package: 'foam.graphics',
  name: 'StereoCView',
  extends: 'foam.graphics.CView',

  methods: [
    function paintChildren(x) {
      this.children.sort(function(o1, o2) { return o2.z - o1.z; });

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        c.x += 20;
        c.paint(x);
      }

      x.translate(500, 0);

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var c = this.children[i];
        c.x -= 20;
        c.paint(x);
      }
    }
  ]
});
