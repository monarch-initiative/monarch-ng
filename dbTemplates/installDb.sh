#!/usr/bin/env bash

rm -rf server/falcor/db/rdb
rm -rf server/falcor/db/sdb
rm -rf server/falcor/db/tdb

cp -r dbTemplates/rdb server/falcor/db/rdb
cp -r dbTemplates/sdb server/falcor/db/sdb
cp -r dbTemplates/tdb server/falcor/db/tdb

