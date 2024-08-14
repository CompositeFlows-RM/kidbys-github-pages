const _base62Digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const padBase62Random = (input: string) => {

    const padded = input.padStart(4, '0');

    return padded;
};

const gUtilities = {

    getExtensionFromFileName: (fileName: string): string => {

        const fileNameSplit = fileName.split('.');

        if (fileNameSplit.length > 1) {

            const extension = fileNameSplit[fileNameSplit.length - 1];

            return extension;
        }
        
        return '';
    },

    lowercaseFirstLetter: (filePath: string): string => {

        const lowercased = filePath.charAt(0).toLowerCase() + filePath.slice(1);

        return lowercased;
    },

    getDirectory: (filePath: string): string => {

        var matches = filePath.match(/(.*)[\/\\]/);

        if (matches
            && matches.length > 0
        ) {

            return matches[1];
        }

        return '';
    },

    getFileNameAndExtension: (filePath: string): string => {

        const fileName = filePath.replace(/^.*[\\/]/, '');

        return fileName;
    },

    truncate: (
        value: string,
        maxLength: number,
        truncationSuffix: string = "") => {

        return value.length > maxLength
            ? value.substring(0, maxLength) + truncationSuffix
            : value;
    },

    onlyLettersAndDigits: (input: string) => {

        const regex = /^[a-zA-Z][0-9_a-zA-Z-]*$/g;
        const valid = regex.test(input);

        return valid;
    },

    getNonce: (length: number) => {

        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < length; i++) {

            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        return text;
    },

    toToken: (input: string): string => {

        // Should remove all non alphanumeric, capitalise the first letter in 
        // each word and remove all spaces
        const result = input
            .replace("'", "") // remove apostrophes to turn fred's into freds
            .replace("\\", " ")
            .replace(/\w\S*/g, (word) => {
                return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
            })
            .replace(/[\W_]+/g, "") // belt and braces - removes all non-alphanumeric
            .replace(/\s/g, "");
        ;

        return result;
    },

    generateToken: (token: string): string => {

        const length = 8;
        let result = token;

        if (result.length > 12) {

            result = result.substring(0, 11);
        }

        const random = gUtilities.getNonce(length);

        return `${result}${random}`;
    },

    isEmptyStringObjectOrFalse: (a: any) => {

        if (!a) {

            return true;
        }

        if ((typeof a === 'string' || a instanceof String)
            && a.length === 0) {

            return true;
        }

        return gUtilities.isEmptyObject(a);
    },

    isEmptyObject: (a: any) => {

        // eslint-disable-next-line eqeqeq
        if (a == null) {

            return true;
        }

        if (Array.isArray(a)
            && a.length === 0) {

            return true;
        }

        return typeof a === 'object'
            && Object.keys(a).length === 0;
    },

    base62Compare: (
        a: string,
        b: string): number => {

        if (a.length < b.length) {

            return -1;
        }

        if (a.length > b.length) {

            return 1;
        }

        if (a < b) {

            return -1;
        }

        if (a > b) {

            return 1;
        }

        return 0;
    },

    binIntToBase62: (bInput: bigint): string => {

        const base = BigInt(_base62Digits.length);
        let result = '';

        while (0n < bInput) {

            result = _base62Digits.charAt(Number(bInput % base)) + result;
            bInput = bInput / base;
        }

        return result || '0';
    },

    intToBase62: (input: number): string => {

        let bInput: bigint = BigInt(input);

        return gUtilities.binIntToBase62(bInput);
    },

    base62ToBigInt: (x: string): bigint => {

        let base = BigInt(_base62Digits.length);
        let result = 0n;

        for (let i = 0; i < x.length; i++) {

            result = result * base + BigInt(_base62Digits.indexOf(x.charAt(i)));
        }

        return result;
    },

    getNewKey: (): string => {

        const zeroDate = Date.parse('01 Feb 2024 00:00:00 GMT');
        const now = Date.now();
        const difference = now - zeroDate;
        const random: number = Math.round(Math.random() * 10000);
        const differenceBase62: string = gUtilities.intToBase62(difference);
        const randomBase62: string = gUtilities.intToBase62(random);
        const randomBase62Padded: string = padBase62Random(randomBase62);
        const key = `${differenceBase62}${randomBase62Padded}`;

        return `${key}`;
    },

    padKey: (key: string | null): string => {

        if (gUtilities.isNullOrWhiteSpace(key)) {

            key = '';
        }

        const padded = (key as string).padEnd(12, ' ');

        return padded;
    },

    getNewPaddedKey: (): string => {

        const key = gUtilities.getNewKey();

        return gUtilities.padKey(key);
    },

    isNullOrWhiteSpace: (input: string | null | undefined): boolean => {

        return !input
            || input.match(/^\s*$/) !== null;
    },

    getFileName: (input: string | null | undefined): string => {

        if (gUtilities.isNullOrWhiteSpace(input) === true) {

            return "";
        }

        const path = input as string;
        const nameAndExtension = path.split('\\').pop()?.split('/').pop();

        if (gUtilities.isNullOrWhiteSpace(nameAndExtension) === true) {

            return "";
        }

        const nameExt = nameAndExtension as string;

        return nameExt.replace(/\.[^/.]+$/, "");
    },

    isNumeric: (input: any): boolean => {

        if (gUtilities.isNullOrWhiteSpace(input) === true) {

            return false;
        }

        return !isNaN(input);
    },

    isNegativeNumeric: (input: any): boolean => {

        if (!gUtilities.isNumeric(input)) {

            return false;
        }

        return +input < 0; // + converts a string to a number if it consists only of digits.
    },

    isObjectEmpty: (input: any): boolean => {

        if (input
            && Object.keys(input).length === 0
            && input.constructor === Object) {

            return true;
        }

        return false;
    },

    hasDuplicates: <T>(input: Array<T>): boolean => {

        if (new Set(input).size !== input.length) {

            return true;
        }

        return false;
    },

    extend: <T>(array1: Array<T>, array2: Array<T>): void => {

        array2.forEach((item: T) => {

            array1.push(item);
        });
    },

    prettyPrintJsonFromString: (input: string | null): string => {

        if (!input) {

            return "";
        }

        return gUtilities.prettyPrintJsonFromObject(JSON.parse(input));
    },

    prettyPrintJsonFromObject: (input: object | null): string => {

        if (!input) {

            return "";
        }

        return JSON.stringify(
            input,
            null,
            4 // indented 4 spaces
        );
    },

    isPositiveNumeric: (input: any): boolean => {

        if (!gUtilities.isNumeric(input)) {

            return false;
        }

        return Number(input) >= 0;
    },

    getTime: (): string => {

        const now: Date = new Date(Date.now());
        const time: string = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}::${now.getMilliseconds()}:`;

        return time;
    },

    printDateTime: (ticks: number): string => {

        var date = new Date(ticks);
        const year = date.getFullYear();
        const month = String(date.getMonth()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

        const time: string = `${year}-${month}-${day}  ${hour}:${minute}:${seconds}::${milliseconds}  (${date.getTimezoneOffset()})`;

        return time;
    },

    splitByNewLine: (input: string): Array<string> => {

        if (gUtilities.isNullOrWhiteSpace(input) === true) {

            return [];
        }

        const results = input.split(/[\r\n]+/);
        const cleaned: Array<string> = [];

        results.forEach((value: string) => {

            if (!gUtilities.isNullOrWhiteSpace(value)) {

                cleaned.push(value.trim());
            }
        });

        return cleaned;
    },

    splitByPipe: (input: string): Array<string> => {

        if (gUtilities.isNullOrWhiteSpace(input) === true) {

            return [];
        }

        const results = input.split('|');
        const cleaned: Array<string> = [];

        results.forEach((value: string) => {

            if (!gUtilities.isNullOrWhiteSpace(value)) {

                cleaned.push(value.trim());
            }
        });

        return cleaned;
    },

    splitByNewLineAndOrder: (input: string): Array<string> => {

        return gUtilities
            .splitByNewLine(input)
            .sort();
    },

    joinByNewLine: (input: Array<string>): string => {

        if (!input
            || input.length === 0) {

            return '';
        }

        return input.join('\n');
    },

    removeAllChildren: (parent: Element): void => {

        if (parent !== null) {

            while (parent.firstChild) {

                parent.removeChild(parent.firstChild);
            }
        }
    },

    shortPrintText: (
        input: string,
        maxLength: number = 100): string => {

        if (gUtilities.isNullOrWhiteSpace(input) === true) {

            return '';
        }

        const firstNewLineIndex: number = gUtilities.getFirstNewLineIndex(input);

        if (firstNewLineIndex > 0
            && firstNewLineIndex <= maxLength) {

            const output = input.substr(0, firstNewLineIndex - 1);

            return gUtilities.trimAndAddEllipsis(output);
        }

        if (input.length <= maxLength) {

            return input;
        }

        const output = input.substr(0, maxLength);

        return gUtilities.trimAndAddEllipsis(output);
    },

    trimAndAddEllipsis: (input: string): string => {

        let output: string = input.trim();
        // let punctuationRegex: RegExp = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        // let spaceRegex: RegExp = /\W+/g;
        let punctuationRegex: RegExp = /[.,\/#!$%\^&\*;:{}=\-_`~()]/;
        let spaceRegex: RegExp = /\W+/;
        let lastCharacter: string = output[output.length - 1];

        let lastCharacterIsPunctuation: boolean =
            punctuationRegex.test(lastCharacter)
            || spaceRegex.test(lastCharacter);


        while (lastCharacterIsPunctuation === true) {

            output = output.substr(0, output.length - 1);
            lastCharacter = output[output.length - 1];

            lastCharacterIsPunctuation =
                punctuationRegex.test(lastCharacter)
                || spaceRegex.test(lastCharacter);
        }

        return `${output}...`;
    },

    getFirstNewLineIndex: (input: string): number => {

        let character: string;

        for (let i = 0; i < input.length; i++) {

            character = input[i];

            if (character === '\n'
                || character === '\r') {

                return i;
            }
        }

        return -1;
    },

    upperCaseFirstLetter: (input: string): string => {

        return input.charAt(0).toUpperCase() + input.slice(1);
    },

    lowerCaseFirstLetter: (input: string): string => {

        return input.charAt(0).toLowerCase() + input.slice(1);
    },

    generateGuid: (useHypens: boolean = false): string => {

        let d = new Date().getTime();

        let d2 = (performance
            && performance.now
            && (performance.now() * 1000)) || 0;

        let pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        if (!useHypens) {
            pattern = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
        }

        const guid = pattern
            .replace(
                /[xy]/g,
                function (c) {

                    let r = Math.random() * 16;

                    if (d > 0) {

                        r = (d + r) % 16 | 0;
                        d = Math.floor(d / 16);
                    }
                    else {

                        r = (d2 + r) % 16 | 0;
                        d2 = Math.floor(d2 / 16);
                    }

                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                }
            );

        return guid;
    },

    checkArraysEqual: (a: string[], b: string[]): boolean => {

        if (a === b) {

            return true;
        }

        // eslint-disable-next-line eqeqeq
        if (a == null
            // eslint-disable-next-line eqeqeq
            || b == null) {

            return false;
        }

        if (a.length !== b.length) {

            return false;
        }

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        const x: string[] = [...a];
        const y: string[] = [...b];

        x.sort();
        y.sort();

        for (let i = 0; i < x.length; i++) {

            if (x[i] !== y[i]) {

                return false;
            }
        }

        return true;
    },

    checkIfChrome: (): boolean => {

        // please note, 
        // that IE11 now returns undefined again for window.chrome
        // and new Opera 30 outputs true for window.chrome
        // but needs to check if window.opr is not undefined
        // and new IE Edge outputs to true now for window.chrome
        // and if not iOS Chrome check
        // so use the below updated condition

        let tsWindow: any = window as any;
        let isChromium = tsWindow.chrome;
        let winNav = window.navigator;
        let vendorName = winNav.vendor;
        let isOpera = typeof tsWindow.opr !== "undefined";
        let isIEedge = winNav.userAgent.indexOf("Edge") > -1;
        let isIOSChrome = winNav.userAgent.match("CriOS");

        if (isIOSChrome) {
            // is Google Chrome on IOS
            return true;
        }
        else if (isChromium !== null
            && typeof isChromium !== "undefined"
            && vendorName === "Google Inc."
            && isOpera === false
            && isIEedge === false) {
            // is Google Chrome
            return true;
        }

        return false;
    },

    toJson: (
        input: any,
        pretty: boolean = false
    ): string => {

        function isEmpty(value: any): boolean {

            // eslint-disable-next-line eqeqeq
            if (value == null) {

                return true;
            }
            else if (value === false) {

                return true;
            }
            else if (typeof value === 'string'
                && gUtilities.isNullOrWhiteSpace(value)) {

                return true;
            }
            else if (Array.isArray(value)) {

                return value
                    .every(isEmpty);
            }
            else if (typeof (value) === 'object') {

                return Object
                    .values(value)
                    .every(isEmpty);
            }

            return false;
        }

        function replacer(
            key: string,
            value: any) {

            if (key === "ui"
                || key === "action") {

                return undefined;
            }

            return isEmpty(value)
                ? undefined
                : value;
        }

        let json: string;

        if (pretty === true) {

            json = JSON.stringify(
                input,
                replacer,
                4
            );

        }
        else {

            json = JSON.stringify(
                input,
                replacer
            );
        }

        return json;
    }
};

export default gUtilities;