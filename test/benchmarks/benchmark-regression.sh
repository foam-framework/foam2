#!/bin/sh
#
# Checks out reference revision for regression benchmarks, 
# runs for reference and current revision, compares the 
# output.

npm run benchmark-regression > bench-regression-current.log

# reference revision
git checkout e8e8ebd79ba1f04f356dcef2dfe441b2682a4b0a

npm run benchmark-regression > bench-regression-reference.log

diff bench-regression-reference.log bench-regression-current.log
