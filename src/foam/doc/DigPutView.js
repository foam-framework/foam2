foam.CLASS({
  package: 'foam.doc',
  name: 'DigPutView',
  extends: 'foam.u2.View',
  implements: [
    'foam.mlang.Expressions',
  ],
  imports: [
    'appConfig',
    'user',
  ],
  requires: [
    'foam.doc.CodeTabs',
    'foam.u2.Tab',
    'foam.doc.dao.AxiomDAO',
    'foam.doc.PropertyAxiom',
    'foam.doc.CodeTab',
    'foam.flow.PromiseSlot',
    'foam.u2.DetailView',
    'foam.nanos.dig.DIG',
  ],
  properties: [
    {
      class: 'StringArray',
      name: 'digProperties',
      factory: function() {
        return [
          'daoKey',
          'format',
          'q',
        ];
      },
    },
    {
      name: 'url',
      expression: function(appConfig) {
        if ( appConfig ) return appConfig.url;
      }
    },
    {
      name: 'samplepayload'
    },
  ],
  methods: [
    function initE() {
      var self = this;
      this.
      add(this.slot(function(data, url, samplepayload, user, digProperties) {
        var dig = self.DIG.create({
          daoKey: data,
          cmd: 'PUT',
        }, self);
        return this.E().
          callIf(this.__context__[data], function() {
            this.
              start(self.CodeTabs).
                start(self.Tab, { label: 'CURL' }).
                  start('code').
                    add(dig.slot(function(digURL) {
                      return `
curl -X PUT \\
  '${url.replace(/\/$/,'') + digURL}' \\
  -u '${user.email}' \\
  -H 'accept: application/json' \\
  -H 'cache-control: no-cache' \\
  -H 'content-type: application/json' \\
  -d '${samplepayload.split("'").join("\"")}'
                    `.trim();
                    })).
                  end().
                end().
                start(self.Tab, { label: 'Node' }).
                  start('code').
                    add(dig.slot(function(digURL) {
                      var u = new URL(url);
                      var protocol = u.protocol.slice(0, -1)
                      return `
var password = 'REPLACE_WITH_PASSWORD';

const ${protocol} = require('${protocol}');
var req = ${protocol}.request({
  hostname: '${u.hostname}',
  port: ${u.port},
  path: '${digURL}',
  method: 'PUT',
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'cache-control': 'no-cache',
    'authorization': "Basic " + new Buffer("${user.email}:" + password).toString("base64"),
  }
}, (resp) => {
  let data = ''
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    // Complete!
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

req.write('${samplepayload}');
req.end();
                      `.trim();
                    })).
                  end().
                end().
              end()
          })
      }))
    },
  ],
});
