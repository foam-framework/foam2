package foam.util;

/**
 * A string splitting mechanism which doesn't not split if the
 * separator has been escaped.
 */
public class StringUtil {

  protected static ThreadLocal<StringBuilder> builder__ = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }
    @Override
    public StringBuilder get() {
      StringBuilder sb = super.get();
      sb.setLength(0);
      return sb;
    }
  };

  private static ThreadLocal<java.util.List<String>> storage__ =
    new ThreadLocal<java.util.List<String>>() {
      @Override
      protected java.util.List<String> initialValue() {
        return new java.util.ArrayList<String>(30);
      }

      @Override
      public java.util.List<String> get() {
        java.util.List<String> a = super.get();
        a.clear();
        return a;
      }
    };

  public static String daoize(String s) {
    return (s.length() > 0 ? s.substring(0,1).toLowerCase() : "")
      + (s.length() > 1 ? s.substring(1) : "")
      + "DAO";
  }

  public static String[] split(String s, char separator) {
    java.util.List<String> list = storage__.get();

    StringBuilder sb = builder__.get();
    boolean escaping = false;
    char escape = '\\';
    char prev;
    char[] cs = s.toCharArray();

    for ( int i = 0 ; i < cs.length ; i++ ) {
      char c = cs[i];

      if ( escaping ) {
        sb.append(c);
        escaping = false;
      } else if ( c == escape ) {
        escaping = true;
      } else if ( c == separator ) {
        list.add(sb.toString());
        sb.setLength(0);
      } else {
        sb.append(c);
      }
    }

    list.add(sb.toString());

    String[] result = new String[list.size()];

    return list.toArray(result);
  }

  public static String capitalize(String s) {
    if ( SafetyUtil.isEmpty(s) ) return s;
    char[] chars = s.toCharArray();
    chars[0] = Character.toUpperCase(chars[0]);
    return chars.toString();
  }
}
