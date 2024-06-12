# run from parent directory of foam3

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../../foam3/build/
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt;

cd ../..
java -cp `cat foam3/build/cp.txt`:foam3/build/target/foam-1.0-SNAPSHOT.jar -Dfoam.main=main foam.nanos.boot.Boot
