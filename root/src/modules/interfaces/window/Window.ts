import ITreeSolve from "./ITreeSolve";

export {};

declare global {

    interface Window {

        // eslint-disable-next-line @typescript-eslint/naming-convention
        TreeSolve: ITreeSolve;
    }
}