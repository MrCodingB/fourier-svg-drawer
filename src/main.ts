import { Program } from './program';

window.onload = () => {
    const showTraceInput = document.querySelector('input#showTraceCheckbox');
    const maxVectorIndexInput = document.querySelector('input#maxVectorIndexRange');

    if (!(showTraceInput instanceof HTMLInputElement) || !(maxVectorIndexInput instanceof HTMLInputElement)) {
        throw new Error('Could not load essential elements');
    }

    Program.start(showTraceInput, maxVectorIndexInput);
};

Object.defineProperty(Math, 'PI_2', { value: Math.PI * 2 });
