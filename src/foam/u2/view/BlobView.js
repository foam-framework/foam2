/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  name: 'BlobView',
  extends: 'foam.u2.Element',
  
  requires: [
    'foam.blob.BlobBlob'
  ],

  imports: [
    'blobService'
  ],

  properties: [
    'data',
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'DateTime',
      name: 'timestamp'
    }
  ],

  methods: [
    function initE() {
      var view = this;
      this.
        setNodeName('span').
        start('input').attrs({ type: 'file' }).on('change', this.onChange).end().
        add(this.slot(function(data) {
          var url = data && view.blobService.urlFor(data);
          return ! url ? this.E('span') :
            this.E('a').attrs({ href: url }).add('Download')
        }, this.data$));
    }
  ],

  listeners: [
    function onChange(e) {
      var file = e.target.files[0];

      this.data = this.BlobBlob.create({
        blob: file
      });
      this.filename = file.name;
      this.timestamp = new Date(file.lastModified);
      this.type = file.type;
    }
  ]
});
