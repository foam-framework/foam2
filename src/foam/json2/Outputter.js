/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.json2',
  name: 'Outputter',
  requires: [
    'foam.json2.SimpleOutputterOutput',
  ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.json2.OutputterOutput',
      required: true,
      name: 'out',
      factory: function() { return this.SimpleOutputterOutput.create() },
      swiftFactory: `return SimpleOutputterOutput_create()`,
    },
    {
      name: 'state',
      swiftType: '[State]',
      swiftFactory: 'return [State_create()]',
      factory: function() { return [this.State.create() ] },
    }
  ],
  classes: [
    {
      name: 'State',
      properties: [
        {
          class: 'Boolean',
          name: 'endArray',
        },
        {
          class: 'Boolean',
          name: 'endObj',
        },
        {
          class: 'Boolean',
          name: 'comma',
        },
        {
          class: 'Boolean',
          name: 'array',
        }
      ]
    }
  ],
  methods: [
    {
      name: 'obj',
      type: 'foam.json2.Outputter',
      code: function() {
        this.e();
        this.out.startObj()
        this.state.push(this.State.create({
          endObj: true,
          comma: false
        }));
        return this;
      },
      swiftCode: `
        e();
        out.startObj()
        state.append(State_create([
          "endObj": true,
          "comma": false
        ]))
        return self
      `,
    },
    {
      name: 'array',
      type: 'foam.json2.Outputter',
      code: function() {
        this.e();
        this.out.startArray();
        this.state.push(this.State.create({
          endArray: true,
          array: true,
          comma: false
        }));
        return this;
      },
      swiftCode: `
        e()
        out.startArray()
        state.append(State_create([
          "endArray": true,
          "array": true,
          "comma": false
        ]))
        return self
      `,
    },
    {
      name: 'top',
      swiftType: 'State',
      code: function() {
        return this.state[this.state.length - 1];
      },
      swiftCode: `return state.last!`,
    },
    {
      name: 'key',
      args: [{ name: 's', type: 'String' }],
      type: 'foam.json2.Outputter',
      code: function(s) {
        if ( this.top().comma ) this.out.comma();
        else this.top().comma = true;

        this.out.out(this.string(s));
        this.out.keySep()

        return this;
      },
      swiftCode: `
        if top().comma { out.comma() }
        else { top().comma = true }

        out.out(self.string(s))
        out.keySep()

        return self
      `,
    },
    {
      name: 'e',
      code: function() {
        if ( this.top().array ) {
          if ( this.top().comma ) this.out.comma();
          this.top().comma = true;
        }
      },
      swiftCode: `
        if top().array {
          if top().comma { out.comma() }
          top().comma = true
        }
      `,
    },
    {
      name: 'string',
      args: [{ name: 's', type: 'String' }],
      type: 'String',
      code: function(s) {
        return '"' + s.
          replace(/\\/g, '\\\\').
          replace(/"/g, '\\"').
          replace(/[\x00-\x1f]/g, function(c) {
            return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
                              '0' + c.charCodeAt(0).toString(16) :
                              c.charCodeAt(0).toString(16));
          }) + '"';
      },
      swiftCode: `
        // TODO handle more stuff
        let s = s!
        return "\\"" + s.replacingOccurrences(of: "\\"", with: "\\\\\\"") + "\\""
      `,
    },
    {
      name: 's',
      args: [{ name: 's', type: 'String' }],
      type: 'foam.json2.Outputter',
      code: function(s) {
        this.e();
        this.out.out(this.string(s));
        return this;
      },
      swiftCode: `
        e()
        out.out(string(s))
        return self
      `,
    },
    {
      name: 'n',
      args: [{ name: 'n', swiftType: 'NSNumber' }],
      type: 'foam.json2.Outputter',
      code: function(n) {
        this.e();
        this.out.out(n);
        return this;
      },
      swiftCode: `
        e()
        out.out(n.stringValue)
        return self
      `,
    },
    {
      name: 'b',
      args: [{ name: 'b', type: 'Boolean' }],
      type: 'foam.json2.Outputter',
      code: function(b) {
        this.e();
        this.out.out(b);
        return this;
      },
      swiftCode: `
        e()
        out.out(b ? "true" : "false")
        return self
      `,
    },
    {
      name: 'nul',
      type: 'foam.json2.Outputter',
      code: function() {
        this.e();
        this.out.out('null');
        return this;
      },
      swiftCode: `
        e()
        out.out("null")
        return self
      `,
    },
    {
      name: 'end',
      type: 'foam.json2.Outputter',
      code: function() {
        var s = this.state.pop();
        if ( s.endObj ) this.out.endObj();
        if ( s.endArray ) this.out.endArray();
        return this;
      },
      swiftCode: `
        let s = state.popLast()!
        if s.endObj { out.endObj() }
        if s.endArray { out.endArray() }
        return self
      `
    },
    {
      name: 'getString',
      type: 'String',
      code: function() { return this.out.str; }
    }
  ]
});
