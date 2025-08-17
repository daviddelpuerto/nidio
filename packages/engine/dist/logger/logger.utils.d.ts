export declare const ANSI: {
    readonly reset: "\u001B[0m";
    readonly dim: "\u001B[2m";
    readonly red: "\u001B[31m";
    readonly yellow: "\u001B[33m";
    readonly green: "\u001B[32m";
    readonly magenta: "\u001B[35m";
    readonly white: "\u001B[37m";
};
export declare function buildTimestamp(now: Date): string;
export declare const writers: {
    asyncOut: (s: string) => void;
    asyncErr: (s: string) => void;
    syncOut: (s: string) => void;
    syncErr: (s: string) => void;
};
//# sourceMappingURL=logger.utils.d.ts.map