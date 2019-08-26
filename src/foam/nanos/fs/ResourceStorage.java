package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;

public class ResourceStorage extends AbstractStorage {

  protected String resourceJar_;

  public ResourceStorage() {
    super();
    resourceJar_ = System.getenv("RES_JAR_HOME");
  }

  public ResourceStorage (String root) {
    super(root);
    resourceJar_ = System.getenv("RES_JAR_HOME");
  }

  @Override
  protected FileSystem getFS() {
    if (!SafetyUtil.isEmpty(resourceJar_)) {
      Path resourceJarPath = Paths.get(resourceJar_);
      try {
        URI resourceJarURI = new URI("jar", resourceJarPath.toUri().toString(), null);
        try {
          return FileSystems.getFileSystem(resourceJarURI);
        } catch (FileSystemNotFoundException e) {
          Map<String, String> env = new HashMap<>();
          env.put("create", "true");
          return FileSystems.newFileSystem(resourceJarURI, env);
        }
      } catch (URISyntaxException | IOException e) {
        throw new RuntimeException(e);
      }
    } else {
      throw new RuntimeException("Couldn't open resource FS, missing jar " + resourceJar_);
    }
  }

  @Override
  protected Path getRootPath() {
    FileSystem fs = getFS();
    if ( fs == null ) return null;
    return SafetyUtil.isEmpty(resourceDir_) ? fs.getPath("/") : fs.getPath("/", resourceDir_);
  }

  @Override
  protected Path getPath(String name) {
    FileSystem fs = getFS();
    if ( fs == null ) return null;
    return SafetyUtil.isEmpty(resourceDir_) ? fs.getPath("/", name) : fs.getPath("/", resourceDir_, name);
  }

  @Override
  public java.io.File get(String name) {
    throw new UnsupportedOperationException("Can't open file to JAR resource");
  }

  @Override
  public OutputStream getOutputStream(String name) {
    throw new UnsupportedOperationException("Can't open input stream to JAR resource");
  }
}
