import {Pipe, PipeTransform} from '@angular/core';
import {isInteger, isNumberFinite, isPositive, toDecimal} from './utils';

export type ByteUnit = 'B' | 'kB' | 'KB' | 'MB' | 'GB' | 'TB';

@Pipe({
    standalone: true,
    name: 'bytes'
})
export class BytesPipe implements PipeTransform {

    static formats: { [key: string]: { max: number; prev?: ByteUnit } } = {
        B: {max: 1024},
        kB: {max: Math.pow(1024, 2), prev: 'B'},
        KB: {max: Math.pow(1024, 2), prev: 'B'}, // Backward compatible
        MB: {max: Math.pow(1024, 3), prev: 'kB'},
        GB: {max: Math.pow(1024, 4), prev: 'MB'},
        TB: {max: Number.MAX_SAFE_INTEGER, prev: 'GB'}
    };

    static formatResult(result: number, unit: string): string {
        return `${result}${unit}`;
    }

    static calculateResult(format: { max: number; prev?: ByteUnit }, bytes: number) {
        const prev = format.prev ? BytesPipe.formats[format.prev] : undefined;
        return prev ? bytes / prev.max : bytes;
    }

    transform(input: any, decimal: number = 0, from: ByteUnit = 'B', to?: ByteUnit): any {

        if (!(isNumberFinite(input) &&
            isNumberFinite(decimal) &&
            isInteger(decimal) &&
            isPositive(decimal))) {
            return input;
        }

        let bytes = input;
        let unit = from;
        while (unit !== 'B') {
            bytes *= 1024;
            unit = BytesPipe.formats[unit].prev;
        }

        if (to) {
            const format = BytesPipe.formats[to];

            const result = toDecimal(BytesPipe.calculateResult(format, bytes), decimal);

            return BytesPipe.formatResult(result, to);
        }

        for (const key in BytesPipe.formats) {
            if (BytesPipe.formats.hasOwnProperty(key)) {
                const format = BytesPipe.formats[key];
                if (bytes < format.max) {
                  const result = toDecimal(BytesPipe.calculateResult(format, bytes), decimal);
                  return result ? BytesPipe.formatResult(result, key) : '';
                }
            }
        }
    }

}
