#!/bin/sh
#
# Checks out reference revision for regression benchmarks,
# runs for reference and current revision, compares the
# output.

rm -rf tmp/regressionBenchmark
mkdir tmp
mkdir tmp/regressionBenchmark
cd tmp/regressionBenchmark

# reference revision (TODO: make reference a branch, checkout --depth 1)
git clone https://github.com/foam-framework/foam2-experimental.git . --no-checkout
git checkout e5b90571a5237afc2a741bd0837b5488ec9fc07a
ln -s ../../node_modules

npm run benchmark-regression > ../../bench-regression-reference.log

rm node_modules
cd ../..

npm run benchmark-regression > bench-regression-current.log

npm run benchmark-reg-check