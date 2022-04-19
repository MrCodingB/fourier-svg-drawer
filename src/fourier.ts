import { Buffer } from './buffer';
import { FourierTerm } from './fourierTerm';

const dt = 0.005;

const vectorColor = '#fff';
const vectorCircleColor = '#0f97d1';

export class Fourier {
    constructor(
        private readonly x0: number,
        private readonly y0: number,
        private readonly terms: FourierTerm[],
        private readonly path: SVGPathElement
    ) { }

    public static fromPath(path: SVGPathElement, maxTermIndex: number): Fourier {
        console.log('Getting fourier from path');

        const length = path.getTotalLength();
        const dl = length * dt;
        console.log(`n = ${maxTermIndex * 2 + 1}, dt = ${dt}, dl = ${dl}, l = ${length}`);

        const scalesX: number[] = [];
        const scalesY: number[] = [];

        let t = 0;
        let l = 0;

        while (t <= 1) {
            const pRotation = t * Math.PI_2;
            const point = path.getPointAtLength(l);

            for (let i = 0, f = -maxTermIndex; i <= maxTermIndex * 2; i++, f++) {
                if (t === 0) {
                    scalesX[i] = 0;
                    scalesY[i] = 0;
                }

                const angle = -f * pRotation;
                const x = Math.cos(angle);
                const y = Math.sin(angle);

                const productX = x * point.x - y * point.y;
                const productY = x * point.y + point.x * y;

                scalesX[i] += productX;
                scalesY[i] += productY;
            }

            t += dt;
            l += dl;
        }

        const terms: FourierTerm[] = [];

        for (let i = 0; i <= maxTermIndex * 2; i++) {
            scalesX[i] *= dt;
            scalesY[i] *= dt;

            if (i === maxTermIndex) {
                continue; // f = 0, non-rotating vector
            }

            terms.push(new FourierTerm(scalesX[i], scalesY[i], i - maxTermIndex));
        }

        console.log('Calculated fourier');

        return new Fourier(scalesX[maxTermIndex], scalesY[maxTermIndex], terms, path);
    }

    public changeMaxVectorIndex(i: number): Fourier {
        return Fourier.fromPath(this.path, i);
    }

    public drawValue(t: number, context: CanvasRenderingContext2D, buffer: Buffer): void {
        let x = this.x0;
        let y = this.y0;

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(x, y);
        context.strokeStyle = vectorColor;
        context.stroke();

        for (const term of this.terms) {
            const sx = term.scaleX;
            const sy = term.scaleY;

            const angle = term.getAngle(t);

            const unitX = Math.cos(angle);
            const unitY = Math.sin(angle);

            const dx = unitX * sx - unitY * sy;
            const dy = unitX * sy + sx * unitY;

            context.beginPath();
            context.arc(x, y, term.vectorRadius, 0, Math.PI_2);
            context.strokeStyle = vectorCircleColor;
            context.stroke();

            this.drawVector(context, x, y, dx, dy, term.vectorRadius);

            x += dx;
            y += dy;
        }

        buffer.push(x, y);
    }

    private drawVector(context: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, length: number): void {
        const headlen = length * 0.2;

        const x2 = x + dx;
        const y2 = y + dy;

        const angle = Math.atan2(dy, dx);
        const headAngle = Math.PI / 12;

        const smallAngle = angle - headAngle;
        const largeAngle = angle + headAngle;

        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x2, y2);
        context.strokeStyle = vectorColor;
        context.stroke();

        context.beginPath();
        context.moveTo(x2, y2);
        context.lineTo(x2 - headlen * Math.cos(smallAngle), y2 - headlen * Math.sin(smallAngle));
        context.lineTo(x2 - headlen * Math.cos(largeAngle), y2 - headlen * Math.sin(largeAngle));
        context.closePath();
        context.fillStyle = vectorColor;
        context.fill();
    }
}
