/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DigSnippetView',
  extends: 'foam.u2.View',
  documentation: 'View used to show snippets of select API calls.',
  imports: [
    'appConfig',
    'user'
  ],
  requires: [
    'foam.doc.CodeTabs',
    'foam.u2.Tab',
  ],

  css: `
    .foam-doc-CodeTabs {
      background: gray;
      display: block;
      padding: 10px 4px;
      width: 820;
    }
    .foam-doc-CodeTabs-content pre {
      display: block;
      font-family: monospace;
      white-space: pre;
      margin: 1em 0px;
      background: black;
      color: white;
      overflow-x: auto;
      overflow-y:auto;
    }
    .foam-doc-CodeTabs-content pre a {
      color: rgb(0, 153, 229);
      text-decoration-line: none;
    }
    .foam-doc-CodeTabs-content .code {
      background-color: black;
      color: white;
      padding: 20px;
    }
   `,

  properties: [
    {
      name: 'url',
      expression: function(appConfig) {
        if ( appConfig ) return appConfig.url;
      }
    },
    {
      name: 'urlParam',
      expression: function(data) {
        if ( data ) return new URLSearchParams(data);
      }
    },
    {
      name: 'dao',
      expression: function(data) {
        if ( data ) return new URLSearchParams(data).get("dao");
      }
    },
    {
      name: 'cmd',
      expression: function(data) {
        if ( data ) return new URLSearchParams(data).get("cmd");
      }
    },
    {
      name: 'format',
      expression: function(data) {
        if ( data ) return new URLSearchParams(data).get("format");
      }
    },
    {
      name: 'key',
      expression: function(data) {
        if ( data ) return new URLSearchParams(data).get("id");
      }
    },
    {
      name: 'inputData',
      expression: function(data) {
        if ( data ) return new URLSearchParams(data).get("data");
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.
      add(
      this.slot(function(data, url, user, urlParam, dao, cmd, format, key, inputData) {
          return this.E().

           callIf(this.__subContext__, function() {
            this.
              start(self.CodeTabs).

                start(self.Tab, {label: 'URL'}).
                 add(self.slot(function(data) {
                    var u = url.replace(/\/$/,'') + data;
                    return this.E().
                      start('pre').
                        addClass('code').
                        start('a').
                          add(u).
                            attrs({
                              href: u,
                              target: '_blank',
                            }).
                        end().
                      end()
                 })).
                end().

                start(self.Tab, { label: 'CURL' }).
                  start('pre').
                    addClass('code').
                      add(self.slot(function(data) {
                        return cmd != "put" ?

                        ( `
                          curl -X GET \\
  '${url.replace(/\/$/,'') + data}' \\
  -u '${user.email}' \\
  -H 'accept: application/json1' \\
  -H 'cache-control: no-cache' \\
  -H 'content-type: application/json' \\
                      `.trim()) : ( `
                          curl -X POST \\
  '${url.replace(/\/$/,'') + '/service/dig?dao=' + dao}' \\
  -u '${user.email}' \\
  -H 'accept: application/json1' \\
  -H 'cache-control: no-cache' \\
  -H 'content-type: application/json' \\
  -d '${inputData}'
                      `.trim());
                      })).
                  end().
                end().

              start(self.Tab, { label: 'Node' }).
                                start('pre').
                                  addClass('code').
                                  add(self.slot(function(data) {
                                    var u = new URL(url);
                                    var protocol = u.protocol.slice(0, -1)
                                    return `
              var password = 'REPLACE_WITH_PASSWORD';

  const ${protocol} = require('${protocol}');
  var req = ${protocol}.request({
    hostname: '${u.hostname}',
    port: ${u.port},
    path: '${data.split("&data=")[0]}',
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'cache-control': 'no-cache',
      'authorization': "Basic " + new Buffer("${user.email}:" + PASSWORD).toString("base64"),
    }
      }, (resp) => {
        let inputData = ''
        resp.on('inputData', ("${inputData}") => {
          inputData += "${inputData}";
        });
        resp.on('end', () => {
          // Complete!
          console.log(inputData);
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });

      req.write('');
      req.end();
                            `.trim();
                          })).
                        end().
                      end().

            end()
          })
      })
      )
    }
  ],
});
