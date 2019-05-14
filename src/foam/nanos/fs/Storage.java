package foam.nanos.fs;

import foam.util.SafetyUtil;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.*;

public class Storage {
  private java.io.File root_;

  private boolean isResource_ = false;
  private String resourceDir_;

  public Storage() {
    this(new java.io.File(""));
  }

  public Storage(String root) {
    this(new java.io.File(root));
  }

  public Storage(java.io.File root) {
    root_ = root.getAbsoluteFile();
  }

  public Storage (String root, boolean isResource) {
    isResource_ = isResource;
    resourceDir_ = root;
  }

  protected FileSystem getFS() {
    FileSystem fs = null;

    if ( isResource() ) {
      String resourceJar = System.getenv("RES_JAR_HOME");
      if (!SafetyUtil.isEmpty(resourceJar)) {
        Path resourceJarPath = Paths.get(resourceJar);
        try {
          URI resourceJarURI = new URI("jar", resourceJarPath.toUri().toString(), null);
          try {
            fs = FileSystems.getFileSystem(resourceJarURI);
            return fs;
          } catch (FileSystemNotFoundException e) {
            Map<String, String> env = new HashMap<>();
            env.put("create", "true");
            fs = FileSystems.newFileSystem(resourceJarURI, env);
            return fs;
          }
        } catch (URISyntaxException | IOException e) {
          throw new RuntimeException(e);
        }
      }
    } else {
      fs = FileSystems.getDefault();
    }

    return fs;
  }

  public Path getPath(String name) {
    FileSystem fs = getFS();
    if ( fs == null ) return null;

    Path path;
    if ( isResource() ) {
      if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
        path = fs.getPath("/", resourceDir_, name);
      } else {
        path = fs.getPath("/", name);
      }
    } else {
      if ( ! SafetyUtil.isEmpty(resourceDir_) ) {
        path = fs.getPath(resourceDir_, name);
      } else {
        path = fs.getPath(name);
      }
    }

    return path;
  }

  public boolean isResource() {
    return isResource_;
  }
  
  public java.io.File get(String name) {
    return new java.io.File(root_, name).getAbsoluteFile();
  }

  public Map<String, InputStream> getDirectoryAsStream(String name) {
    Map<String, InputStream> iStreamMap = new HashMap<>();

    Path path = getPath(name);
    if ( path == null ) return null;

    DirectoryStream<Path> contents;

    try {
      contents = java.nio.file.Files.newDirectoryStream(path);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    for ( Path p : contents ) {
      try {
        String pname = getFS().getPath(resourceDir_, name, p.getName(p.getNameCount()-1).toString()).toString();
        iStreamMap.put(pname, Files.newInputStream(p));
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return iStreamMap;
  }

  public OutputStream getResourceOutputStream(String name) {
    if ( isResource() ) return null;

    Path path = getPath(name);
    if ( path == null ) return null;

    try {
      return Files.newOutputStream(path);
    } catch (IOException e) {
      return null;
    }
  }

  public java.io.InputStream getResourceInputStream(String name) {
    Path path = getPath(name);
    if ( path == null ) return null;

    try {
      return Files.newInputStream(path);
    } catch (IOException e) {
      return null;
    }
  }

  @Deprecated
  public java.io.InputStream getResourceAsStream(String name) {
    return getResourceInputStream(name);
  }
}
