# reshotput

reshotput is a one-button app to restore a server to a snapshot. It was created for the Plushu sandbox reset page at http://reset-sandbox.plushu.org app, to allow the sandbox server to be reset at any time by any user.

## Configuring

reshotput is a [12-Factor App](http://12factor.net), with all configuration performed by setting environment variables.

## API parameters

Right now, DigitalOcean and Packet are the only supported server hosts: support for more hosts is planned via the [pkgcloud](https://github.com/pkgcloud/pkgcloud) library.

### General

- `SNAPSHOT_ID`: The ID of the image to restore.
- `SERVER_ID`: The ID of the server to restore the image to.
- `SERVER_ADDRESS`: The location of the server, for use when referring to the server in messages, and when connecting to run the SSH pre-reset command (see below).

How the `SNAPSHOT_ID` and `SERVER_ID` parameters will be interpreted depends on which of the following parameters are present:

### DigitalOcean

- `DIGITALOCEAN_API_TOKEN`: The API token to use for authentication.

### Packet

- `PACKET_API_KEY`: The API key to use for authentication.

Note that, as Packet does not support any kind of snapshotting for a system's on-board storage, Packet will only trigger a reinstall of the server, ignoring any value of `SNAPSHOT_ID`.

## SSH Pre-reset Commands

reshotput includes functionality to log in and perform a command on the server via SSH before resetting it.

- `SSH_IDENTITY`: The content of the private key to use when logging into the server.
- `SSH_USERNAME`: The name of the user to log in as. Defaults to `root`.
- `PRE_RESET_COMMAND`: The command to execute before performing the reset. Defaults to `echo "The system is going down for reset NOW!" | wall`.
- `PRE_RESET_COMMAND_TIMEOUT`: How long to wait for the pre-reset command to finish executing before performing the reset anyway, in seconds. Defaults to 5 seconds.
