/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'AbstractLogger',
  implements: [ 'foam.nanos.logger.Logger' ],

  abstract: true,

  javaImports: [
    'java.io.PrintWriter',
    'java.io.StringWriter',
    'java.io.Writer',
    'java.text.SimpleDateFormat'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
`protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
  @Override
  protected SimpleDateFormat initialValue() {
    return new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss");
  }
};

protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
  @Override
  protected StringBuilder initialValue() {
    return new StringBuilder();
  }

  @Override
  public StringBuilder get() {
    StringBuilder b = super.get();
    b.setLength(0);
    return b;
  }
};`
        }))
      }
    }
  ],

  methods: [
    {
      name: 'formatArg',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        }
      ],
      javaReturns: 'String',
      javaCode:
`if ( obj instanceof Throwable ) {
  Throwable   t  = (Throwable) obj;
  Writer      w  = new StringWriter();
  PrintWriter pw = new PrintWriter(w);

  t.printStackTrace(pw);

  return w.toString();
}

return String.valueOf(obj);`
    },
    {
      name: 'combine',
      args: [
        {
          name: 'args',
          javaType: 'Object[]'
        }
      ],
      javaReturns: 'String',
      javaCode:
      `StringBuilder str = sb.get();
for ( Object n : args ) {
  str.append(',');
  str.append(formatArg(n));
}
return str.toString();`
    }
  ]
});
