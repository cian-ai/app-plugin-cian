#!/bin/bash
sudo docker run --rm -ti -v "$(pwd)/..:/plugin_dev" --privileged -v "/dev/bus/usb:/dev/bus/usb" --user $(id -u $USER):$(id -g $USER) ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder:latest /bin/bash -c "cd /plugin_dev/app-plugin-cian/tests/ && /bin/bash"
