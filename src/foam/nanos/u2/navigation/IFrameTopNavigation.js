/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy ogit f the License at
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
  package: 'foam.nanos.u2.navigation',
  name: 'IFrameTopNavigation',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar for IFrame view. Use to load custom css',

  css: `
    .login-wrapper {
      margin: 0;
      width : 100%;
      height: 100%;
      padding: 0;
    }

    .foam-comics-DAOControllerView {
      margin: 96 auto;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass());
    }
  ]
});
