const MIN_CHECKPOINTS = 1;
const MAX_CHECKPOINTS = 100;
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
        const between = [...Array(n - 1)].map(() => rand(1, max)).sort();
        const indices = [0, ...between, max]; // should always mark start and end of operation as a checkpoint
        return new Checkpoints(indices);
    }

    static generate(max: number) {
        if (max <= 0) {
            return new Checkpoints([0]);
        } else if (max <= 1) {
            return new Checkpoints([0, 1]);
        }
        const clamped = clamp(Math.ceil(max * CHECKPOINT_RATE), MIN_CHECKPOINTS, MAX_CHECKPOINTS);
        return this.generateN(clamped, max);
    }

    includes(i: number): boolean {
        return this.indices.includes(i);
    }
}