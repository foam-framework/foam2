foam.CLASS({
  package: 'foam.parse',
  name: 'QueryParserUserTest',
  extends: 'foam.nanos.test.Test',
  
  javaImports: [
  'foam.lib.parse.PStream',
  'foam.lib.parse.ParserContext',
  'foam.lib.parse.ParserContextImpl',
  'foam.lib.parse.StringPStream',
  'foam.nanos.auth.User',
  'foam.mlang.predicate.Nary'
  ],

  methods: [
    {
      name: 'runTest',
      javaReturns: 'void',
      //INFO it will just parse the query to get the predicate without evaluation.
      javaCode: `
      test( isValid("id=6", " ( ( id =  ?  ) ) ") , "The id equal to the value");
      test( isValid("-id=6"," ( ( NOT ( id =  ?  ) ) ) ") , "The id is Not equal to the value");
      test( isValid("Not id=6"," ( ( NOT ( id =  ?  ) ) ) ") , "The id is Not equal to the value '- Symbol' ");
      test( isValid("id>20"," ( ( id >  ?  ) ) ") , "The id is greater than the value");
      test( isValid("id<20"," ( ( id <  ?  ) ) ") , "The id is less than the value");
      test( isValid("id>=20"," ( ( id >=  ?  ) ) ") , "The id is greater than or equal to the value");
      test( isValid("id<=20"," ( ( id <=  ?  ) ) ") , "The id is less than the value");
      test( isValid("id-after:20"," ( ( id >=  ?  ) ) ") , "The id is greater than value 'after'");
      test( isValid("id-before:20"," ( ( id <=  ?  ) ) ") , "The id is less than value 'before'");
      test( isValid("firstName=Simon"," ( ( firstname =  ?  ) ) ") , "The firstname is equal to value");
      test( isValid("firstName:Sim"," ( ( 'firstname' like '% ? %' ) ) ") , "The firstname that contains the value");
      
      test( isValid("birthday=2020/09/10"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) ") , "The birthday equal to value yyyy/mm/dd");
      test( isValid("birthday=2020-09-10"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) ") , "The birthday equal to value yyyy-mm-dd");
      test( isValid("birthday<2020-09-10"," ( ( birthday <  ?  ) ) ") , "The birthday less than the value");
      test( isValid("birthday<=2020-09-10"," ( ( birthday <=  ?  ) ) ") , "The birthday less than or equal to the value");
      test( isValid("birthday>2020-09-10"," ( ( birthday >  ?  ) ) ") , "The birthday greater than the value");
      test( isValid("birthday=2011"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) ") , "The birthday year is equal to the value");
      test( isValid("birthday=2020"," ( ( ( birthday >=  ?  )  AND  ( birthday <=  ?  ) ) ) ") , "The birthday year is equal to the value");
      test( isValid("lastLogin=today"," ( ( ( lastlogin >=  ?  )  AND  ( lastlogin <=  ?  ) ) ) ") , "The lastLogin equal to today");
      test( isValid("lastLogin=today-2"," ( ( ( lastlogin >=  ?  )  AND  ( lastlogin <=  ?  ) ) ) ") , "The lastLogin equal to two day ago");
      test( isValid("lastLogin=2010-9-10..2020-9-10"," ( ( ( lastlogin >=  ?  )  AND  ( lastlogin <=  ?  ) ) ) ") , "The lastLogin between two date");
      
      test( isValid("id=6 or firstName=Simon"," ( ( id =  ?  ) )  OR  ( ( firstname =  ?  ) ) ") , "The id is equal to value1 OR the firstName is equal to value2");
      test( isValid("-id=6 | firstName=Simon"," ( ( NOT ( id =  ?  ) ) )  OR  ( ( firstname =  ?  ) ) ") , "The id is not equal to value1 OR the firstName is equal to value2");
      test( isValid("firstName=abc or id=20 "," ( ( firstname =  ?  ) )  OR  ( ( id =  ?  ) ) ") , "The firstName is equal to value1 OR the id is equal to value2");
      test( isValid("firstName=abc and id=20"," ( ( firstname =  ?  )  AND  ( id =  ?  ) ) ") , "The firstName is equal to value1 AND the id is equal to value2");
      test( isValid("id=20 and firstName=adam11 OR id<5 and firstName=john"," ( ( id =  ?  )  AND  ( firstname =  ?  ) )  OR  ( ( id <  ?  )  AND  ( firstname =  ?  ) ) ") , "(The id is equal to value1 AND the firstName is equal to value2) OR (the id is less than the value3 AND the firstName is equal to value4)");
      test( isValid("id=20 firstName=adam11 OR id<5 firstName=john"," ( ( id =  ?  )  AND  ( firstname =  ?  ) )  OR  ( ( id <  ?  )  AND  ( firstname =  ?  ) ) ") , "(The id is equal to value1 AND 'whitespace' the firstName is equal to value2) OR (the id is less than the value3 AND 'whitespace' the firstName is equal to value4)");
      test( isValid("firstName=abc or id=20 "," ( ( firstname =  ?  ) )  OR  ( ( id =  ?  ) ) ") , "The firstName is equal to value1 OR the id is equal to value2");
      
      test( isValid("((id<30) or (id>20))"," ( ( id <  ?  ) )  OR  ( ( id >  ?  ) ) ") , "((The id is less than the value1) OR (the id is greater than the value2))");
      test( isValid("(id<30 or id>20)"," ( ( id <  ?  ) )  OR  ( ( id >  ?  ) ) ") , "(The id is less than the value1 OR the id is greater than the value2)");
      //          {"(((id<30) or (id>20)) and ((firstName=john) or (id>20)))"," ( ( ( ( ( ( ( ( id <  ?  ) ) ) )  OR  ( ( ( ( id >  ?  ) ) ) ) )  AND  ( ( ( firstname =  ?  ) ) ) ) ) ) "},//Not supported
      test( isValid("(id=20)"," ( ( id =  ?  ) ) ") , "(The id is equal to the value)");
      test( isValid("(firstName=adam)"," ( ( firstname =  ?  ) ) ") , "(The firstName is equal to value)");
      test( isValid("((firstName=abc and id=20) or (firstName=abc and id=20))"," ( ( firstname =  ?  )  AND  ( id =  ?  ) )  OR  ( ( firstname =  ?  )  AND  ( id =  ?  ) ) ") , "((The firstName is equal to value1 AND the id is equal to value2) OR (the firstName is equal to value3 AND the id is equal to value4))");
      test( isValid("(firstName=adam)"," ( ( firstname =  ?  ) ) ") , "(The firstName is equal to value)");
      test( isValid("firstName=adam11 and id=20 or firstName=john id=5"," ( ( firstname =  ?  )  AND  ( id =  ?  ) )  OR  ( ( firstname =  ?  )  AND  ( id =  ?  ) ) ") , "(the firstName is equal to value1 AND the id is equal to value2) OR (the firstName is equal to value3 AND the id is equal to value4)");
      
      test( isValid("has:businessName"," ( ( (businessname <> '') is not true ) ) ") , "The businessName exist");
      test( isValid("is:emailVerified"," ( ( emailverified =  ?  ) ) ") , "The emailVerified is equal to true");
      //          {"id=me"," ( ( id =  ?  ) ) "},
      
      test( isValid("firstName=Simon,Wassim"," ( ( ( firstname =  ?  )  OR  ( firstname =  ?  ) ) ) ") , "The firstName is equal to value1 OR to value2");
      //          {"id=(6|7)"," ( ( ( id =  ?  )  OR  ( id =  ?  ) ) ) "},
      //          {"id=(6|7)"," ( ( ( id =  ?  )  OR  ( id =  ?  ) ) ) "},//TODO add alises
      `
    },
    {
      name: 'isValid',
      javaReturns: 'boolean',
      args : [
        { name: 'query',javaType: 'String' },
        { name: 'statement',javaType: 'String' }
      ],
      javaCode: `
        QueryParser parser = new QueryParser(User.getOwnClassInfo());

    StringPStream sps = new StringPStream();
    sps.setString(query);
    PStream ps = sps;
    ParserContext x = new ParserContextImpl();
    ps = parser.parse(ps, x);
    if (ps == null)
      return false;

    Nary result = (foam.mlang.predicate.Nary) ps.value();

    return statement.equalsIgnoreCase(result.createStatement()) ? true : false;
        `
    },
  ]
});
