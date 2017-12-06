# run from parent directory of foam2

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../../foam2/build/
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

cd ../..
java -cp `cat foam2/build/cp.txt`:foam2/build/target/foam-1.0-SNAPSHOT.jar -Dfoam.main=main foam.nanos.boot.Boot
