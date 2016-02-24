#!/usr/bin/env bash

rm -rf dbTemplates/rdb
rm -rf dbTemplates/sdb
rm -rf dbTemplates/tdb


cp -r server/falcor/db/rdb dbTemplates/rdb
cp -r server/falcor/db/sdb dbTemplates/sdb
cp -r server/falcor/db/tdb dbTemplates/tdb
