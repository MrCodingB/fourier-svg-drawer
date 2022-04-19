import { Fourier } from './fourier';
import { Buffer } from './buffer';

export class Program {
    private readonly dl = 2;

    private readonly renderDelay = 4;

    private currentFourier?: Fourier;

    private points = new Buffer(0);

    private t = 0;

    private dt = 0;

    private showTrace = true;

    private maxTermIndex = 50;

    private constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly context: CanvasRenderingContext2D,
        private readonly showTraceInput: HTMLInputElement,
        private readonly maxVectorIndexInput: HTMLInputElement
    ) {
        document.ondragover = (e) => e.preventDefault(); // Prevent browser from opening the files
        document.ondrop = (e) => this.onDrop(e);

        this.showTraceInput.oninput = (ev) => {
            if (ev.target instanceof HTMLInputElement) {
                this.showTrace = ev.target.checked;
            }
        };

        this.maxVectorIndexInput.oninput = (ev) => {
            if (!(ev.target instanceof HTMLInputElement)) {
                return;
            }

            const value = parseInt(ev.target.value);
            this.maxTermIndex = isNaN(value) ? 50 : value;
            this.currentFourier = this.currentFourier?.changeMaxVectorIndex(this.maxTermIndex);
            this.points.clear();

            const parent = ev.target.parentElement;
            if (parent instanceof HTMLLabelElement) {
                const span = parent.querySelector('span');
                if (span !== null) {
                    span.innerText = `Vector count: ${this.maxTermIndex * 2 + 1}`;
                }
            }
        };

        this.renderLoop();
    }

    public static start(showTraceInput: HTMLInputElement, maxVectorIndexInput: HTMLInputElement): void {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);

        document.body.onresize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const context = canvas.getContext('2d');
        if (context === null) {
            throw new Error('Could not create canvas rendering context');
        }

        new Program(canvas, context, showTraceInput, maxVectorIndexInput);
    }

    private async onDrop(event: DragEvent): Promise<void> {
        event.preventDefault();

        const files = event.dataTransfer?.files;
        if (files === undefined || files.length < 1) {
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file === null || file.type !== 'image/svg+xml') {
                continue;
            }

            const text = await file.text();

            const parser = new DOMParser();
            const svg = parser.parseFromString(text, 'image/svg+xml');

            const path = svg.querySelector('path');
            if (path === null) {
                continue;
            }

            await this.processNewPath(path);

            break;
        }
    }

    private async processNewPath(path: SVGPathElement): Promise<void> {
        this.currentFourier = Fourier.fromPath(path, this.maxTermIndex);

        const pathLength = path.getTotalLength();
        this.dt = this.dl / pathLength;
        this.t = 0;

        this.points.clearResize(pathLength / this.dl);
        this.clearCanvas();
    }

    private render(): void {
        this.clearCanvas();

        if (this.currentFourier === undefined) {
            return;
        }

        this.currentFourier.drawValue(this.t, this.context, this.points);

        if (this.showTrace) {
            let n = this.points.count;

            for (const point of this.points) {
                this.drawPoint(point[0], point[1], `rgba(255, 247, 0, ${n / this.points.count + 0.2})`);
                n--;
            }
        } else {
            const point = this.points.first();
            if (point !== undefined) {
                this.drawPoint(point[0], point[1], '#fff700');
            }
        }

        this.t += this.dt;
    }

    private renderLoop(): void {
        this.render();

        setTimeout(() => this.renderLoop(), this.renderDelay);
    }

    private clearCanvas(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private drawPoint(x: number, y: number, color: string): void {
        this.context.beginPath();
        this.context.arc(x, y, 3, 0, Math.PI_2);
        this.context.fillStyle = color;
        this.context.fill();
    }
}
