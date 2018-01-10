package foam.util;

public class StringUtil {
  /**
   * A string splitting mechanism which doesn't not split if the
   * separator has been escaped.
   */

  private static ThreadLocal<java.util.List<String>> storage =
    new ThreadLocal<java.util.List<String>>() {
      @Override
      protected java.util.List<String> initialValue() {
        return new java.util.ArrayList<String>(30);
      }
    };

  public static String[] split(String s, char separator) {
    java.util.List<String> list = storage.get();

    // TODO: Check if this retains the capacity of the list.
    // otherwise we might want to manage the inner array ourselves for
    // performance.
    list.clear();

    StringBuilder sb = new StringBuilder();
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
}
