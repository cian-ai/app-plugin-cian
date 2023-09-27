# How to run(Succeeded in Oracle Linux(rhel)):

## 1.Enter in container

```shell
sudo docker pull ghcr.io/ledgerhq/ledger-app-builder/ledger-app-builder:latest
./build.sh
```

## 2.Choose a device sdk

You can choose which device to compile and load for by setting the `BOLOS_SDK` environment variable to the following values :

```shell
BOLOS_SDK=$NANOS_SDK
BOLOS_SDK=$NANOX_SDK
BOLOS_SDK=$NANOSP_SDK
BOLOS_SDK=$STAX_SDK
```

By default this variable is set to build/load for Nano S.

## 3.Compilation

```shell
make DEBUG=1  # compile optionally with PRINTF
```

## 4.Loading on a physical device

```shell
# Run these commands on your host, from the app's source folder.
sudo cp 20-ledger.ledgerblue.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules
sudo udevadm trigger

# Run this command from the app-builder container terminal.
make load    # load the app on a Nano S by default
```
