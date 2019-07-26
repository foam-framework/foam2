package foam.nanos.fs;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.Path;

public interface Storage {

  OutputStream getOutputStream(String name);

  InputStream getInputStream(String name);

  DirectoryStream<Path> getDirectoryStream(String name);

  DirectoryStream<Path> getDirectoryStream(String name, String glob);

}
