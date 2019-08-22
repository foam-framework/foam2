package foam.nanos.fs;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;

public interface Storage {

  java.io.File get(String name);

  byte[] getBytes(String name);

  OutputStream getOutputStream(String name);

  InputStream getInputStream(String name);

  Set<String> getAvailableFiles(String name);

  Set<String> getAvailableFiles(String name, String glob);

}
