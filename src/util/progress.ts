const CHECKPOINT_RATE = 1 / 10000;

export enum ProgressType {
    Determinate = 'determinate',
    Indeterminate = 'indeterminate',
}

export interface Determinate {
    type: ProgressType.Determinate;
    value: number;
    max: number;
}

export interface Indeterminate {
    type: ProgressType.Indeterminate;
}

export type Progress = Determinate | Indeterminate;

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}

export class Checkpoints {
    indices: number[];

    private constructor(indices: number[]) {
        this.indices = indices;
    }

    static generateN(n: number, max: number) {
        const indices = [...Array(n)].map(() => rand(0, max)).sort();
        return new Checkpoints(indices);
    }

    static generate(max: number) {
        const min = Math.min(max, 100);
        const n = clamp(max * CHECKPOINT_RATE, min, 100);
        return this.generateN(n, max);
    }

    includes(i: number): boolean {
        return this.indices.includes(i);
    }
}