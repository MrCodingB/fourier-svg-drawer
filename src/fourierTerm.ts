/**
 * A Fourier term has the general expression of: c * e^(f * 2pi * i * t)
 * Where f is the frequency and c is the constant scaling factor
 */
export class FourierTerm {
    private readonly k = this.frequency * Math.PI_2; // konstant part of the exponent

    readonly vectorRadius = Math.sqrt(this.scaleX * this.scaleX + this.scaleY * this.scaleY);

    constructor(
        readonly scaleX: number,
        readonly scaleY: number,
        private readonly frequency: number
    ) {
    }

    public getAngle(t: number): number {
        return this.k * t;
    }
}
