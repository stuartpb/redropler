# reshotput

reshotput is a one-button app to restore a server to a snapshot. It was created for the Plushu sandbox reset page at http://reset-sandbox.plushu.org app, to allow the sandbox server to be reset at any time by any user.

## Configuring

reshotput is a [12-Factor App](http://12factor.net), with all configuration performed by setting environment variables.

## API parameters

Right now, DigitalOcean is the only supported server host: support for more hosts is planned via the [pkgcloud](https://github.com/pkgcloud/pkgcloud) library.

### DigitalOcean

- `DIGITALOCEAN_API_TOKEN`: The API token to use for authentication.
- `RESTORE_IMAGE_ID`: The ID of the image to restore.
- `DROPLET_ID`: The ID of the droplet to restore the image to.

`RESTORE_IMAGE_ID` and `DROPLET_ID` will probably be general-purpose renamed to `SNAPSHOT_ID` and `SERVER_ID` in the future.

## SSH Pre-reset Commands

reshotput includes functionality to log in and perform a command on the server via SSH before resetting it.

- `DROPLET_DOMAIN`: The location of the server to connect to. *(This will be renamed soon, probably to something like `SERVER_ADDRESS`.)*
- `SSH_IDENTITY`: The content of the private key to use when logging into the server.
- `SSH_USERNAME`: The name of the user to log in as. Defaults to `root`.
- `PRE_RESET_COMMAND`: The command to execute before performing the reset. Defaults to `echo "The system is going down for reset NOW!" | wall`.
- `PRE_RESET_COMMAND_TIMEOUT`: How long to wait for the pre-reset command to finish executing before performing the reset anyway, in seconds. Defaults to 5 seconds.
