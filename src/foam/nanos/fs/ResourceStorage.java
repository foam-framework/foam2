package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;

public class ResourceStorage extends AbstractStorage {

  private String resourceDir_;
  private String resourceJar_;

  public ResourceStorage(String resourceJar) {
    resourceJar_ = resourceJar;
    resourceDir_ = null;
  }

  public ResourceStorage (String resourceJar, String root) {
    resourceJar_ = resourceJar;
    resourceDir_ = root;
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
  public Path getPath(String name) {
    FileSystem fs = getFS();
    if ( fs == null ) return null;

    Path path;
    if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
      path = fs.getPath("/", resourceDir_, name);
    } else {
      path = fs.getPath("/", name);
    }

    return path;
  }

  @Override
  public InputStream getInputStream(String name) {
    throw new UnsupportedOperationException("Can't open input stream to JAR resource");
  }
}
