#!/bin/bash

# 检查参数的数量
if [ "$#" -ne 1 ]; then
    npx jest plugin_dev/app-plugin-cian/tests/src/ethereum/vault_steth_wrapper_withdraw.test.js --verbose --runInBand --detectOpenHandles
    exit 1
fi

npx jest $1 --verbose --runInBand --detectOpenHandles