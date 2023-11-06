# How to run(Succeeded in Oracle Linux(rhel)):

## 1.Build for speculos

```shell
sudo docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder:latest
./build_speculos.sh
```

## 2.Build for device

```shell
sudo docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
./build_device.sh # By default this variable is set to build/load for Nano S.
```

You can also choose which device to compile and load for by setting the `BOLOS_SDK` environment variable to the following values :

```shell
sudo docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest
sudo docker run --rm -ti --user "$(id -u):$(id -g)" \
 --privileged -v "/dev/bus/usb:/dev/bus/usb" \
 -v "$(realpath .):/app" ghcr.io/ledgerhq/ledger-app-builder/ledger-app-dev-tools:latest 

BOLOS_SDK=$NANOS_SDK
BOLOS_SDK=$NANOX_SDK
BOLOS_SDK=$NANOSP_SDK
BOLOS_SDK=$STAX_SDK
make DEBUG=1  # compile optionally with PRINTF
make load    # load the app on a Nano S by default
```
