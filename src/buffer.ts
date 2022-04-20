export class Buffer implements Iterable<Point> {
    private readonly items: Point[] = [];

    private i = -1;

    private length = 0;

    public get count(): number { return this.length; }

    public get capacity(): number { return this.items.length; }

    public get isEmpty(): boolean { return this.length < 1; }

    constructor(capacity: number) {
        this.clearResize(capacity);
    }

    public get(i: number): Point | undefined {
        if (i >= this.length) {
            return undefined;
        }

        let index = this.i + i;
        if (index >= this.capacity) {
            index -= this.capacity;
        }

        return this.items[index];
    }

    public first(): Point | undefined {
        return this.length < 1 ? undefined : this.items[this.i];
    }

    public push(x: number, y: number): void {
        this.i--;
        if (this.i < 0) {
            this.i = this.capacity - 1;
        }

        this.items[this.i].x = x;
        this.items[this.i].y = y;

        if (this.length < this.capacity) {
            this.length++;
        }
    }

    public clearResize(capacity: number): void {
        this.clear();

        if (capacity > this.capacity) {
            for (let i = this.capacity; i < capacity; i++) {
                this.items.push({ x: 0, y: 0 });
            }
        } else if (capacity < this.capacity) {
            const itemsToRemove = this.capacity - capacity;
            this.items.splice(capacity, itemsToRemove);
        }
    }

    public clear(): void {
        this.i = -1;
        this.length = 0;
    }

    public *[Symbol.iterator](): Iterator<Point, any, undefined> {
        if (this.length < 1 || this.i < 0) {
            return;
        }

        let i = this.i;

        do {
            yield this.items[i];

            i++;
            if (i >= this.capacity) {
                i = 0;
            }
        } while (i !== this.i && (this.length === this.capacity || i > this.i));
    }
}
