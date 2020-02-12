/**
  * @license
  * Copyright 2018 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

  package foam.lib.json;

  import foam.lib.parse.*;

  public class UnknownObjectParser
    extends ProxyParser
  {
    public UnknownObjectParser() {
      super(new Parser() {
        private Parser delegate = new Seq1(3, Whitespace.instance(),
        Literal.create("{"),
        Whitespace.instance(),
        new UnknownPropertiesParser(),
        Whitespace.instance(),
        Literal.create("}"));

        public PStream parse(PStream ps, ParserContext x) {
          ps = ps.apply(delegate, x);
          if ( ps == null) return null;
          String res = "{";
          res = res + ps.value().toString();
          res = res + "}";
          return ps.setValue(res);
        }
      });
    }
  }
