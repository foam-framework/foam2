foam.CLASS({
  package: 'foam.util.regex',
  name: 'SafePattern',

  documentation: `
 A java.util.regex.Pattern replacement that is thread safe.
 java.util.regex.Pattern is still used but a unique compiled pattern
 is stored per thread in a thread local map. (map of patterns this
 thread is using)
 Example:
- String result = NPattern.matcher("\\?", inputText).replaceAll( ".?+");
- FPattern pattern = new NPattern("\\?"); pattern.matcher(...).matches();

`,

  javaImports: [
    'java.util.regex.Pattern',
    'java.util.regex.Matcher',
    'java.util.regex.PatternSyntaxException',
    'java.util.Map',
    'java.util.HashMap'
  ],

  properties: [
    {
      name: 'pattern',
      class: 'String',
      displayWidth: 30,
      javaPreSet: `
  try {
    Pattern.compile(val);
  } catch (IllegalArgumentException e) {

    throw new RuntimeException(e.getMessage());
  }
      `
    },
    {
      name: 'flags',
      class: 'Int',
      min: 0
    }
  ],

  methods: [
  //   {
  //     name: 'hashCode',
  //     javaReturns: 'int',
  //     javaCode: `
  //   // ignores flags
  //   return getPattern().hashCode();
  // `
  //   }
  ],

  axioms: [
    {
      buildJavaClass: function (cls) {
        cls.extras.push(`
  /**
   * direct replacement for regex.Pattern
   */
  public static Pattern compile(String pattern)
    throws PatternSyntaxException {
    return (Pattern) SafePattern.create(pattern, 0);
  }

  /**
   * direct replacement for regex.Pattern
   */
  public static Pattern compile(String pattern, int flags)
    throws PatternSyntaxException, IllegalArgumentException {
    return (Pattern) SafePattern.create(pattern, flags);
  }

  public Matcher matcher(CharSequence input) {
    if (input == null) {
      throw new NullPointerException("matcher(null)");
    }

    Matcher matcher = null;
    try {
      matcher = SafePattern.matcher(getPattern(), getFlags(), input);
    } catch(PatternSyntaxException e) {
      // NOP: already tested during construction.
    }

    return matcher;
  }

  protected final static ThreadLocal threadLocalMap_ = new ThreadLocal() {
      public Object initialValue() {
        return new HashMap();
      }
    };

  public static Matcher matcher(String pattern, CharSequence input)
    throws PatternSyntaxException {
    return matcher(pattern, 0, input);
  }

  public static Matcher matcher(String pattern, int flags, CharSequence input)
    throws PatternSyntaxException, IllegalArgumentException {
    return ((Pattern) create(pattern, flags)).matcher(input);
  }

  protected static Object create(String pattern, int flags)
    throws PatternSyntaxException, IllegalArgumentException {
    Map map = (Map) threadLocalMap_.get();
    if (! map.containsKey(pattern)) {
      map.put(pattern, Pattern.compile(pattern, flags));
    }

    return map.get(pattern);
  }

  public String[] split(CharSequence input) {
    return ((Pattern) SafePattern.create(getPattern(), getFlags())).split(input);
  }

  public String[] split(CharSequence input, int limit) {
    return ((Pattern) SafePattern.create(getPattern(), getFlags())).split(input, limit);
  }
        `);
      }
    }
  ],
})
