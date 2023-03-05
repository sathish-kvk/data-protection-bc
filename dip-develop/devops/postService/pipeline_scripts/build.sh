#!/bin/bash -e
# WARNING: FOR PIPELINE USE UNLESS YOU WANT TO INSTALL GO
echo "For pipeline use!"

export PATH=$PATH:$PWD/goinstall/go/bin
export GOPATH=$PWD/goinstall/workspace
export PATH=$PATH:$GOPATH/bin

PLUGINDIR=$GOPATH/src/loadService
mkdir -p $PLUGINDIR

cp -r devops/postService/loadService/* $PLUGINDIR/

pushd $PLUGINDIR
go get github.com/sendgrid/sendgrid-go
go install

popd
