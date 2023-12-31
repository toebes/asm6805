/**
 * Copyright (c) 2023 John Toebes
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export function isxdigit(char: string): boolean {
    const code = char.charCodeAt(0)
    return (
        (code >= 48 && code <= 57) || // 0-9
        (code >= 65 && code <= 70) || // A-F
        (code >= 97 && code <= 102) // a-f
    )
}
export function isspace(char: string): boolean {
    const code = char.charCodeAt(0)
    return (
        code === 32 || // space
        (code >= 9 && code <= 13) // horizontal tabs and line breaks
    )
}

export function isdigit(char: string): boolean {
    const code = char.charCodeAt(0)
    return code >= 48 && code <= 57 // 0-9
}

export function iscsymf(char: string): boolean {
    const code = char.charCodeAt(0)
    return (
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        code === 95 || // underscore (_)
        (code >= 128 && code <= 255) // extended ASCII characters
    )
}

export function iscsym(char: string): boolean {
    const code = char.charCodeAt(0)
    return (
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        (code >= 48 && code <= 57) || // 0-9
        code === 95 // underscore (_)
    )
}

export function hexdigitToVal(char: string): number {
    return '0123456789ABCDEF'.indexOf(char.toUpperCase())
}

export function stricmp(str1: string, str2: string): number {
    return str1.localeCompare(str2, undefined, { sensitivity: 'base' })
}

export function IsEmpty(str: string): boolean {
    return str.trim().length === 0
}

export function expandTabs(line: string, tabSize: number = 8): string {
    return line.replace(/\t/g, (match, offset) => {
        const spacesToAdd = tabSize - (offset % tabSize)
        return ' '.repeat(spacesToAdd)
    })
}

export function sprintf(fmt: string, ...argv: any[]): string {
    const re = new RegExp(/(%-?[0-9]*l?[dsxXc])/)
    const elems = fmt.split(re)
    let pos = 0
    let result = ''
    elems.forEach((elem) => {
        if (elem.length > 0) {
            if (elem.charAt(0) === '%') {
                let val: string = argv[pos++]
                if (val === undefined) {
                    val = '0'
                }
                const rep = new RegExp(/%(-?)(0?)([0-9]*)(l?)([dsxXc])/)
                const specs = elem.match(rep)
                // specs[0] = the full pattern
                // specs[1] = '-' if field is to be left justified
                // specs[2] = '0' if leading zeros are desired
                // specs[3] = precision (width of output field)
                // specs[4] = 'l' if the field is a long (ignored)
                // specs[5] = format request 'd' 's' 'x' or 'c'
                switch (specs[5] || '') {
                    case 'c':
                        val = val.substring(0, 1)
                        specs[3] = '' // We ignore the precision for characters
                        break
                    case 'x':
                        val = parseInt(val, 10).toString(16)
                        break
                    case 'X':
                        val = parseInt(val, 10).toString(16).toUpperCase()
                        break
                    default:
                        break
                }
                const width = Number(specs[3]) || 0
                const pad = specs[2] || ' '

                if (specs[1] === '-') {
                    val = String(val).padEnd(width, pad)
                } else {
                    val = String(val).padStart(width, pad)
                }
                result += val
            } else {
                result += elem
            }
        }
    })
    return result
}
