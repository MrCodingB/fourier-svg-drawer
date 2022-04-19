export {};

declare global {
    interface Math {
        /**
         * `PI_2` is `Math.PI * 2`, which corresponds to 360°
         */
        readonly PI_2: number;
    }
}
