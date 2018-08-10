foam.CLASS({
  package: 'foam.json2',
  name: 'PrettyOutputterOutput',
  extends: 'foam.json2.ProxyOutputterOutput',
  properties: [
    {
      class: 'Int',
      name: 'indent',
    },
    {
      class: 'Boolean',
      name: 'needsNewLine',
    },
  ],
  methods: [
    {
      name: 'e',
      code: function() {
        if ( this.needsNewLine ) {
          this.delegate.out('\n')
          this.delegate.out('  '.repeat(this.indent));
          this.needsNewLine = false
        }
      },
      swiftCode: `
        if needsNewLine {
          delegate.out("\\n")
          delegate.out(String(repeating: "  ", count: indent))
          needsNewLine = false
        }
      `,
    },
    {
      name: 'startObj',
      code: function() {
        this.e()
        this.delegate.startObj()
        this.indent += 1
        this.needsNewLine = true
      },
      swiftCode: `
        e()
        delegate.startObj()
        indent += 1
        needsNewLine = true
      `,
    },
    {
      name: 'endObj',
      code: function() {
        this.indent -= 1
        this.needsNewLine = true
        this.e()
        this.delegate.endObj()
      },
      swiftCode: `
        indent -= 1
        needsNewLine = true
        e()
        delegate.endObj()
      `,
    },
    {
      name: 'startArray',
      code: function() {
        this.e()
        this.delegate.startArray()
        this.indent += 1
        this.needsNewLine = true
      },
      swiftCode: `
        e()
        delegate.startArray()
        indent += 1
        needsNewLine = true
      `,
    },
    {
      name: 'endArray',
      code: function() {
        this.indent -= 1
        this.needsNewLine = true
        this.e()
        this.delegate.endArray()
      },
      swiftCode: `
        indent -= 1
        needsNewLine = true
        e()
        delegate.endArray()
      `,
    },
    {
      name: 'keySep',
      code: function() { this.out(": ") },
      swiftCode: `out(": ")`,
    },
    {
      name: 'out',
      code: function() {
        this.e()
        this.delegate.out(s)
      },
      swiftCode: `
        e()
        delegate.out(s)
      `,
    },
    {
      name: 'comma',
      code: function() {
        this.delegate.comma()
        this.needsNewLine = true
      },
      swiftCode: `
        delegate.comma()
        needsNewLine = true
      `,
    },
  ],
})
