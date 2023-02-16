import { Client, IrcClientOpts } from "./irc"
import { SocksClient, SocksClientOptions } from "socks";
import { ConnectionOptions, TLSSocket } from "tls";
import { Socket } from "net";

interface SOCKSOptions {
    proxy: SocksClientOptions["proxy"],
}

/**
 * Implementation of the `Client` but with support for the SOCKS protocol.
 *
 * To avoid clahses with `SocksClient`, this has been named `SocksIRCClient`.
 */
export class SocksIRCClient extends Client {
    constructor(server: string, requestednick: string, opts: IrcClientOpts, private readonly sockOpts: SOCKSOptions) {
        super(server, requestednick, opts);
    }

    protected async createSecureConnection(opts: ConnectionOptions): Promise<TLSSocket> {
        if (!opts.host) {
            throw Error('opts.host must be set');
        }
        if (!opts.port) {
            throw Error('opts.port must be set');
        }

        const socksClient = await SocksClient.createConnection({
            ...this.sockOpts,
            command: "connect",
            destination: {
                host: opts.host,
                port: opts.port,
            }
        });
        return new TLSSocket(socksClient.socket, opts);
    }

    protected async createConnection(opts: ConnectionOptions): Promise<Socket> {
        if (!opts.host) {
            throw Error('opts.host must be set');
        }
        if (!opts.port) {
            throw Error('opts.port must be set');
        }

        const socksClient = await SocksClient.createConnection({
            ...this.sockOpts,
            command: "connect",
            destination: {
                host: opts.host,
                port: opts.port,
            }
        });
        return socksClient.socket;
    }
}