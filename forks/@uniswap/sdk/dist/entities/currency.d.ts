import { ChainId } from '../constants';
/**
 * A currency is any fungible financial instrument on Ethereum, including Ether and all ERC20 tokens.
 *
 * The only instance of the base class `Currency` is Ether.
 */
export declare class Currency {
    readonly decimals: number;
    readonly symbol?: string;
    readonly name?: string;

    static readonly ETHER: Currency;

    static readonly MATIC: Currency;
    static readonly OKT: Currency;
    static readonly NATIVE: {
        137: Currency;
        66: Currency;
    };

    /**
     * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.ETHER`.
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    protected constructor(decimals: number, symbol?: string, name?: string);
    static getNativeCurrency(chainId?: ChainId): Currency;
    static getNativeCurrencySymbol(chainId?: ChainId): string | undefined;
    static getNativeCurrencyName(chainId?: ChainId): string | undefined;
    getSymbol(chainId?: ChainId): string | undefined;
    getName(chainId?: ChainId): string | undefined;
}
declare const NATIVE: Currency;
export { NATIVE };
