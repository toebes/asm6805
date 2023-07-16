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

import { CSourceLine, CSymbol, CSymbolTable } from './SourceLine'
import {
    isspace,
    isxdigit,
    isdigit,
    hexdigitToVal,
    iscsymf,
    stricmp,
    IsEmpty,
    iscsym,
    expandTabs,
} from './ctype'
import {
    CAT_EQU,
    CAT_INH,
    CAT_REL,
    CAT_BSCX,
    CAT_BSC,
    CAT_BTBX,
    CAT_BTB,
    CAT_DIR_EXT_IX1_IX1_IX,
    CAT_DIR_IX1_IX,
    CAT_ALIGN,
    CAT_DB,
    CAT_DS,
    CAT_DW,
    CAT_IF,
    CAT_ELSE,
    CAT_ENDIF,
    CAT_INCLUDE,
    CAT_TIMEX,
    CAT_TIMEX6,
    CAT_IMM_DIR_EXT_IX1_IX1_IX,
    aKeyWords,
} from './opcodes'
var sprintf = require('sprintf-js').sprintf

enum TOKEN {
    INVALID,
    CONST, //    $xx 0xnn 0dnn 123
    SYMBOL, //    symbol
    STAR, //    *
    STRING, //    'string' "string"
    RSHIFT, //    >>
    LSHIFT, //    <<
    PLUS, //    +
    MINUS, //    -
    LPAREN, //    (
    RPAREN, //    )
    NOT, //    !
    IMMED, //    #
    XOR, //    ^
    AND, //    &
    DIVIDE, //    /
    OR, //    |
    COMMA, //    ,
    COLON, //    :
    END, //    <null>
}

const MAX_LINES = 5000

class CAsmFile {
    // void GenListing(string strBasefile, stringArray &strData);
    // CAsmFile(string strFilename, string strHomeDir);
    // virtual ~CAsmFile();
    protected m_symbolTable = new CSymbolTable()
    protected m_nCurrentLine: number // Line number of the current source line
    protected m_nLinePos: number // Position of the start of the current source line
    protected m_nTokenVal: number
    protected m_nTokenPos: number
    protected m_nTokenStart: number
    protected m_strFilename: string
    protected m_strLine: string
    protected m_strTokenName: string
    protected m_strIncludeURI: string
    protected m_strErrors: string[]
    protected m_nLogicId: number
    protected m_nLogicNesting: number
    protected m_anLogicStack: number[]
    // public  ParseToken(int &nPos, int &fFlags) :number ;
    // public  ParseExpression(int &nPos, int &fFlags) :number ;
    // public  ParseLine(string strLine, int linenumber); :void
    // public  AddSourceLine(int nLine); :void
    protected m_nMaxLine: number
    // public  GetHex(void): string;
    protected m_lineData: CSourceLine[]
    // int FindKeyword(int nPos, int nLen);
    // void Emsg(string strEmsg, ...);

    public async getTextFromFile(uri: string): Promise<string> {
        try {
            const response = await fetch(uri)
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
            }
            const text = await response.text()
            return text
        } catch (error) {
            throw new Error(`Error fetching file: ${error.message}`)
        }
    }

    public async getincludeFile(filepath: string): Promise<string> {
        let uri = this.m_strIncludeURI
        if (!uri.endsWith('/')) {
            uri += '/'
        }
        let result = await this.getTextFromFile(uri + filepath)
        return result
    }
    public ResetErrors(): void {
        this.m_strErrors = []
        this.m_nLogicNesting = 0
        this.m_nLogicId = 0
    }
    public GetErrors(): string[] {
        return this.m_strErrors
    }
    public GetToken(): TOKEN {
        this.m_nTokenVal = 0
        this.m_strTokenName = ''
        //
        // Valid tokens
        //    $xx       TOKEN_CONST
        //    0xnn      TOKEN_CONST
        //    0dnn      TOKEN_CONST
        //    123       TOKEN_CONST
        //    symbol    TOKEN_SYMBOL
        //    *         TOKEN_STAR
        //    'string'  TOKEN_STRING
        //    "string"  TOKEN_STRING
        //    >>        TOKEN_RSHIFT
        //    <<        TOKEN_LSHIFT
        //    +         TOKEN_PLUS
        //    -         TOKEN_MINUS
        //    (         TOKEN_LPAREN
        //    )         TOKEN_RPAREN
        //    !         TOKEN_NOT
        //    #         TOKEN_IMMED
        //    ^         TOKEN_XOR
        //    &         TOKEN_AND
        //    /         TOKEN_DIVIDE
        //    |         TOKEN_OR
        //    ,         TOKEN_COMMA
        //    :         TOKEN_COLON
        //    <null>    TOKEN_END
        //
        while (
            this.m_nTokenPos < this.m_strLine.length &&
            isspace(this.m_strLine[this.m_nTokenPos])
        )
            this.m_nTokenPos++
        if (this.m_nTokenPos >= this.m_strLine.length) {
            return TOKEN.END
        }
        this.m_nTokenStart = this.m_nTokenPos
        let c = ''
        switch (this.m_strLine[this.m_nTokenPos]) {
            case '\0':
                return TOKEN.END
            case ';':
                return TOKEN.END
            case ':':
                this.m_nTokenPos++
                return TOKEN.COLON
            case '+':
                this.m_nTokenPos++
                return TOKEN.PLUS
            case '-':
                this.m_nTokenPos++
                return TOKEN.MINUS
            case '(':
                this.m_nTokenPos++
                return TOKEN.LPAREN
            case ')':
                this.m_nTokenPos++
                return TOKEN.RPAREN
            case '!':
                this.m_nTokenPos++
                return TOKEN.NOT
            case '#':
                this.m_nTokenPos++
                return TOKEN.IMMED
            case '^':
                this.m_nTokenPos++
                return TOKEN.XOR
            case '&':
                this.m_nTokenPos++
                return TOKEN.AND
            case '/':
                this.m_nTokenPos++
                return TOKEN.DIVIDE
            case '|':
                this.m_nTokenPos++
                return TOKEN.OR
            case ',':
                this.m_nTokenPos++
                return TOKEN.COMMA
            case '*':
                this.m_nTokenPos++
                return TOKEN.STAR
            case '>':
                if (
                    this.m_nTokenPos < this.m_strLine.length &&
                    this.m_strLine[this.m_nTokenPos + 1] == '>'
                ) {
                    this.m_nTokenPos += 2
                    return TOKEN.RSHIFT
                }
                //Emsg("Illegal characters >%c", this.m_strLine[this.m_nTokenPos+1]);
                return TOKEN.INVALID
            case '<':
                if (
                    this.m_nTokenPos < this.m_strLine.length &&
                    this.m_strLine[this.m_nTokenPos + 1] == '<'
                ) {
                    this.m_nTokenPos += 2
                    return TOKEN.LSHIFT
                }
                //Emsg("Illegal characters <%c", this.m_strLine[this.m_nTokenPos+1]);
                return TOKEN.INVALID

            case "'": //    'string'  TOKEN_STRING
            case '"': //    "string"  TOKEN_STRING
                this.m_strTokenName = ''
                c = this.m_strLine[this.m_nTokenPos++]
                for (;;) {
                    if (this.m_strLine[this.m_nTokenPos] == c) {
                        this.m_nTokenPos++
                        if (
                            this.m_nTokenPos + 1 >= this.m_strLine.length ||
                            this.m_strLine[this.m_nTokenPos + 1] != c
                        )
                            break
                    }
                    this.m_strTokenName += this.m_strLine[this.m_nTokenPos]
                    this.m_nTokenPos++
                }
                return TOKEN.STRING

            case '$': //    $xx       TOKEN_CONST
                this.m_nTokenPos++
                if (this.m_nTokenPos >= this.m_strLine.length) {
                    this.Emsg("No hex digits after '$'")
                    return TOKEN.INVALID
                }
                if (!isxdigit(this.m_strLine[this.m_nTokenPos])) {
                    this.Emsg(
                        "Invalid Hex character '%c' after $",
                        this.m_strLine[this.m_nTokenPos]
                    )
                    return TOKEN.INVALID
                }
                while (
                    this.m_nTokenPos < this.m_strLine.length &&
                    isxdigit(this.m_strLine[this.m_nTokenPos])
                ) {
                    let c = this.m_strLine[this.m_nTokenPos]
                    let v = '0123456789ABCDEF'.indexOf(c.toUpperCase())
                    this.m_nTokenVal = (this.m_nTokenVal << 4) + v
                    this.m_nTokenPos++
                }
                return TOKEN.CONST

            case '0': //    0xnn      TOKEN_CONST
                //    0dnn      TOKEN_CONST
                if (this.m_nTokenPos + 1 < this.m_strLine.length) {
                    c = this.m_strLine[this.m_nTokenPos + 1]
                    if (c == 'x' || c == 'X') {
                        this.m_nTokenPos += 2
                        if (this.m_nTokenPos >= this.m_strLine.length) {
                            this.Emsg("No hex digits after '$'")
                            return TOKEN.INVALID
                        }
                        if (!isxdigit(this.m_strLine[this.m_nTokenPos])) {
                            this.Emsg(
                                "Invalid Hex character '%c' after $",
                                this.m_strLine[this.m_nTokenPos]
                            )
                            return TOKEN.INVALID
                        }
                        while (
                            this.m_nTokenPos < this.m_strLine.length &&
                            isxdigit(this.m_strLine[this.m_nTokenPos])
                        ) {
                            this.m_nTokenVal = (this.m_nTokenVal << 4) + hexdigitToVal(c)
                            this.m_nTokenPos++
                        }
                        return TOKEN.CONST
                    }
                    if (c == 'd' || c == 'D') this.m_nTokenPos += 2
                }
            //
            // Fall into the normal digit case
            //
            //    123       TOKEN_CONST
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                while (
                    this.m_nTokenPos < this.m_strLine.length &&
                    isdigit(this.m_strLine[this.m_nTokenPos])
                ) {
                    this.m_nTokenVal =
                        this.m_nTokenVal * 10 + hexdigitToVal(this.m_strLine[this.m_nTokenPos])
                    this.m_nTokenPos++
                }
                return TOKEN.CONST

            default:
                if (!iscsymf(this.m_strLine[this.m_nTokenPos])) {
                    this.Emsg(
                        "I have no idea what this character '%c' is for",
                        this.m_strLine[this.m_nTokenPos]
                    )
                    return TOKEN.INVALID
                }
                //
                // There was actually something on the line.  Let's see if we like it
                //
                while (
                    this.m_nTokenPos < this.m_strLine.length &&
                    iscsym(this.m_strLine[this.m_nTokenPos])
                ) {
                    this.m_strTokenName += this.m_strLine[this.m_nTokenPos++]
                }
                return TOKEN.SYMBOL
        }
    }

    public ParseLevel1(eToken: TOKEN): [TOKEN, number] {
        let nValue: number = 0
        // Level 1 -  ( <expr> )
        switch (eToken) {
            case TOKEN.LPAREN:
                ;[eToken, nValue] = this.ParseLevel8(this.GetToken())
                if (eToken == TOKEN.RPAREN) return [this.GetToken(), nValue]
                //
                // We have an error on the expression....
                //
                return [eToken, nValue]
            case TOKEN.CONST:
                nValue = this.m_nTokenVal
                return [this.GetToken(), nValue]

            case TOKEN.SYMBOL:
                {
                    let pSymbol = this.m_symbolTable.LookupSymbol(
                        this.m_strTokenName,
                        this.m_lineData[this.m_nCurrentLine]
                    )
                    nValue = pSymbol.GetValue()
                    if (pSymbol.GetDefinitionCount() == 0) {
                        this.Emsg("Undefined symbol '%s' Value=%d", this.m_strTokenName, nValue)
                    }
                }
                //
                // Handle error cases
                //
                return [this.GetToken(), nValue]
            case TOKEN.STAR:
                nValue = this.m_lineData[this.m_nCurrentLine].GetOffset()
                return [this.GetToken(), nValue]

            case TOKEN.STRING:
                return [eToken, nValue]

            case TOKEN.COMMA:
                return [eToken, nValue]

            case TOKEN.END:
                return [eToken, nValue]

            default:
                this.Emsg('Unable to parse this line')
                return [eToken, nValue]
        }
        return [eToken, nValue]
    }

    public ParseLevel2(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 2 -  ! <expr>
        if (eToken == TOKEN.NOT) {
            ;[eToken, nValue] = this.ParseLevel1(this.GetToken())
            nValue = ~nValue
            return [eToken, nValue]
        }
        return this.ParseLevel1(eToken)
    }

    public ParseLevel3(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 3 -  <expr>'*'<expr>  <expr>'/'<expr>
        ;[eToken, nValue] = this.ParseLevel2(eToken)
        if (eToken == TOKEN.STAR || eToken == TOKEN.DIVIDE) {
            let nRightValue: number = 0
            let eTokenOp = eToken
            ;[eToken, nRightValue] = this.ParseLevel3(this.GetToken())
            if (eTokenOp == TOKEN.STAR) {
                nValue *= nRightValue
            } else {
                nValue /= nRightValue
            }
        }
        return [eToken, nValue]
    }

    public ParseLevel4(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 4 -  <expr>'+'<expr>  <expr>'-'<expr>
        ;[eToken, nValue] = this.ParseLevel3(eToken)
        if (eToken == TOKEN.PLUS || eToken == TOKEN.MINUS) {
            let nRightValue = 0
            let eTokenOp = eToken
            ;[eToken, nRightValue] = this.ParseLevel4(this.GetToken())
            if (eTokenOp == TOKEN.PLUS) {
                nValue += nRightValue
            } else {
                nValue -= nRightValue
            }
        }
        return [eToken, nValue]
    }

    public ParseLevel5(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 5 -  <expr>'<<'<expr> <expr>'>>'<expr>
        ;[eToken, nValue] = this.ParseLevel4(eToken)
        if (eToken == TOKEN.LSHIFT || eToken == TOKEN.RSHIFT) {
            let nRightValue = 0
            let eTokenOp = eToken
            ;[eToken, nRightValue] = this.ParseLevel5(this.GetToken())
            if (eTokenOp == TOKEN.LSHIFT) {
                nValue <<= nRightValue
            } else {
                nValue >>= nRightValue
            }
        }
        return [eToken, nValue]
    }

    public ParseLevel6(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 6 -  <expr>'&'<expr>
        ;[eToken, nValue] = this.ParseLevel5(eToken)
        if (eToken == TOKEN.AND) {
            let nRightValue = 0
            ;[eToken, nRightValue] = this.ParseLevel6(this.GetToken())
            nValue = nValue & nRightValue
        }
        return [eToken, nValue]
    }

    public ParseLevel7(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 7 -  <expr>'^'<expr>
        ;[eToken, nValue] = this.ParseLevel6(eToken)
        if (eToken == TOKEN.XOR) {
            let nRightValue = 0
            ;[eToken, nRightValue] = this.ParseLevel7(this.GetToken())
            nValue ^= nRightValue
        }
        return [eToken, nValue]
    }

    public ParseLevel8(eToken: TOKEN): [TOKEN, number] {
        let nValue = 0
        // Level 8 -  <expr>'|'<expr>
        ;[eToken, nValue] = this.ParseLevel7(eToken)
        if (eToken == TOKEN.OR) {
            let nRightValue = 0
            ;[eToken, nRightValue] = this.ParseLevel8(this.GetToken())
            nValue |= nRightValue
        }
        return [eToken, nValue]
    }

    // Level 1 -  ( <expr> )
    // Level 2 -  ! <expr>
    // Level 3 -  <expr>'*'<expr>  <expr>'/'<expr>
    // Level 4 -  <expr>'+'<expr>  <expr>'-'<expr>
    // Level 5 -  <expr>'<<'<expr> <expr>'>>'<expr>
    // Level 6 -  <expr>'&'<expr>
    // Level 7 -  <expr>'^'<expr>
    // Level 8 -  <expr>'|'<expr>
    public FindKeyword(nPos: number, nLen: number): number {
        if (nLen > 7) return 0

        let strKeyword = this.m_strLine.substring(nPos, nPos + nLen)

        return this.m_symbolTable.LookupKeyword(strKeyword)
    }

    public Emsg(strEmsg: string, ...args: any[]): void {
        const vaMarker: any[] = args // va_list is not directly supported in TypeScript

        const aszOutput: string = sprintf(strEmsg, ...vaMarker)

        const strError: string = `${this.m_strFilename}(${
            this.m_nCurrentLine + 1
        }): ${aszOutput}\n\r`
        this.m_strErrors.push(strError + this.m_strLine)
    }

    public async ParseLine(strLine: string, linenumber: number): Promise<void> {
        return new Promise<void>(async (resolve) => {
            let nData: number[] = new Array(100)
            let nBytes = 0
            let nOpcode = 0

            let nValue
            let nLabelStart

            this.m_strLine = strLine
            let strLabel = ''

            this.m_nTokenPos = 0
            this.m_nCurrentLine = linenumber

            this.m_lineData[this.m_nCurrentLine].ResetReferences()
            this.m_lineData[this.m_nCurrentLine].SetDefinition(undefined)
            this.m_lineData[this.m_nCurrentLine].SetRelative(-1)

            let eToken = this.GetToken()
            nLabelStart = this.m_nTokenStart
            if (eToken == TOKEN.SYMBOL && !this.m_symbolTable.LookupKeyword(this.m_strTokenName)) {
                //
                // We have a label on the line.
                //
                strLabel = this.m_strTokenName
                eToken = this.GetToken()
                //
                // Throw away a colon if it is after the label
                //
                if (eToken == TOKEN.COLON) eToken = this.GetToken()
            }

            if (eToken == TOKEN.SYMBOL) {
                nOpcode = this.m_symbolTable.LookupKeyword(this.m_strTokenName)
                if (nOpcode != 0) {
                    eToken = this.GetToken()
                } else {
                    //
                    // We have an error
                    //
                }
            } else if (eToken != TOKEN.END) {
                //
                // We have an error
                //
            }

            //
            // Lastly, parse out any operands
            //
            if (nOpcode != CAT_EQU && strLabel.trim().length > 0) {
                let pSymbol = this.m_symbolTable.DefineSymbol(
                    strLabel,
                    this.m_lineData[this.m_nCurrentLine],
                    this.m_lineData[this.m_nCurrentLine].GetOffset()
                )
                if (pSymbol.GetDefinitionCount() != 1) {
                    this.Emsg('Symbol %s defined on more than one line', strLabel)
                } else if (nLabelStart != 0 && !pSymbol.IsReferenced()) {
                    this.Emsg('Assumed Label %s is not referenced', strLabel)
                }
            }
            switch (nOpcode >> 8) {
                case CAT_INH >> 8:
                    nData[nBytes++] = nOpcode & 0xff
                    break
                case CAT_REL >> 8:
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    nData[nBytes++] = nOpcode & 0xff
                    // TODO: Assert that the value is in range!
                    this.m_lineData[this.m_nCurrentLine].SetRelative(nValue ? nValue : -1)
                    nValue -= this.m_lineData[this.m_nCurrentLine].GetOffset() + 2
                    if (nValue > 0x7f || nValue < -0x80)
                        this.Emsg('Branch Target out of range (Distance=%d)', nValue)
                    nData[nBytes++] = nValue & 0xff
                    break
                case CAT_BSCX >> 8:
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    nOpcode += nValue * 2
                    if (eToken == TOKEN.COMMA) eToken = this.GetToken()
                // Fall through to the BSC case
                case CAT_BSC >> 8:
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    nData[nBytes++] = nOpcode & 0xff
                    if (nValue > 0xff || nValue < 0)
                        this.Emsg('BSET/BCLR target (%04x) not in zero page', nValue)
                    nData[nBytes++] = nValue & 0xff
                    break
                case CAT_BTBX >> 8:
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    nOpcode += nValue * 2
                    if (eToken == TOKEN.COMMA) eToken = this.GetToken()
                // Fall through to the BTB case
                case CAT_BTB >> 8:
                    nData[nBytes++] = nOpcode & 0xff
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    if (nValue > 0xff || nValue < 0)
                        this.Emsg('BRSET/BRCLR target (%04x) not in zero page', nValue)
                    nData[nBytes++] = nValue & 0xff
                    if (eToken == TOKEN.COMMA) {
                        eToken = this.GetToken()
                    }
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    this.m_lineData[this.m_nCurrentLine].SetRelative(nValue ? nValue : -1)
                    nValue -= this.m_lineData[this.m_nCurrentLine].GetOffset() + 3
                    nData[nBytes++] = nValue & 0xff
                    if (nValue > 0x7f || nValue < -0x80)
                        this.Emsg('Branch Target out of range (Distance=%d)', nValue)
                    break
                case CAT_IMM_DIR_EXT_IX1_IX1_IX >> 8:
                    if (eToken == TOKEN.IMMED) {
                        nData[nBytes++] = nOpcode & 0xff
                        ;[eToken, nValue] = this.ParseLevel8(this.GetToken())
                        if (nValue > 0xff || nValue < 0) {
                            this.Emsg('Operand (%04x) out of range 00-FF', nValue)
                            // this.Emsg('Operand (%04x) out of range $00-$FF', nValue)
                        }
                        nData[nBytes++] = nValue & 0xff
                        break
                    }
                case CAT_DIR_EXT_IX1_IX1_IX >> 8:
                    if (eToken == TOKEN.COMMA) {
                        nValue = 0
                    } else {
                        ;[eToken, nValue] = this.ParseLevel8(eToken)
                    }
                    if (eToken == TOKEN.COMMA) {
                        //
                        // One of the indexed modes.  Make sure that the next character is a X
                        //
                        eToken = this.GetToken()
                        if (stricmp(this.m_strTokenName, 'X')) {
                            this.Emsg('Missing X after ,')
                        } else {
                            eToken = this.GetToken()
                        }
                        if (nValue == 0) {
                            //
                            // IX Mode
                            //
                            nData[nBytes++] = (nOpcode & 0xff) + 0x50
                        } else if (nValue >= -256 && nValue < 256) {
                            // IX1 Mode
                            nData[nBytes++] = (nOpcode & 0xff) + 0x40
                            nData[nBytes++] = nValue & 0xff
                        } else {
                            // IX2 Mode
                            nData[nBytes++] = (nOpcode & 0xff) + 0x30
                            nData[nBytes++] = (nValue >> 8) & 0xff
                            nData[nBytes++] = nValue & 0xff
                        }
                    } else {
                        //
                        // Must be DIR or EXT mode, based on the size of the value
                        //
                        if (nValue >= -256 && nValue < 256) {
                            // DIR Mode
                            nData[nBytes++] = (nOpcode & 0xff) + 0x10
                            nData[nBytes++] = nValue & 0xff
                        } else {
                            // DIR Mode
                            nData[nBytes++] = (nOpcode & 0xff) + 0x20
                            nData[nBytes++] = (nValue >> 8) & 0xff
                            nData[nBytes++] = nValue & 0xff
                            //
                            //  For JMP/JSR, see if we can replace them with a BRA/BSR
                            //
                            if (
                                ((nOpcode & 0xff) == 0xac || (nOpcode & 0xff) == 0xad) &&
                                this.m_lineData[this.m_nCurrentLine].GetOffset() > 0x12a
                            ) {
                                nValue -= this.m_lineData[this.m_nCurrentLine].GetOffset() + 2
                                if (nValue <= 0x7f && nValue >= -0x80) {
                                    if ((nOpcode & 0xff) == 0xad)
                                        this.Emsg(
                                            'JSR could be replaced with a BSR (distance=%d)',
                                            nValue
                                        )
                                    else
                                        this.Emsg(
                                            'JMP could be replaced with a BRA (distance=%d)',
                                            nValue
                                        )
                                }
                            }
                        }
                    }
                    break
                case CAT_DIR_IX1_IX >> 8:
                    if (eToken == TOKEN.COMMA) {
                        nValue = 0
                    } else {
                        ;[eToken, nValue] = this.ParseLevel8(eToken)
                    }
                    if (eToken == TOKEN.COMMA) {
                        //
                        // One of the indexed modes.  Make sure that the next character is a X
                        //
                        eToken = this.GetToken()
                        if (stricmp(this.m_strTokenName, 'X')) {
                            this.Emsg('Missing X after ,')
                        } else {
                            eToken = this.GetToken()
                        }
                        if (nValue == 0) {
                            //
                            // IX Mode
                            //
                            nData[nBytes++] = (nOpcode & 0xff) + 0x40
                        } else {
                            // IX1 Mode
                            nData[nBytes++] = (nOpcode & 0xff) + 0x30
                            if (nValue > 0xff || nValue < 0)
                                // this.Emsg('Operand (%04x) out of range $00-$FF', nValue)
                                this.Emsg('Operand (%04x) out of range 00-FF', nValue)
                            nData[nBytes++] = nValue & 0xff
                        }
                    } else {
                        // DIR Mode
                        nData[nBytes++] = nOpcode & 0xff
                        if (nValue > 0xff || nValue < 0)
                            // this.Emsg('Operand (%04x) out of range $00-$FF', nValue)
                            this.Emsg('Operand (%04x) out of range 00-FF', nValue)
                        nData[nBytes++] = nValue & 0xff
                    }
                    break
                case CAT_ALIGN >> 8:
                    this.Emsg('Align directive not supported')
                    break
                case CAT_DB >> 8:
                    for (;;) {
                        ;[eToken, nValue] = this.ParseLevel8(eToken)
                        if (nValue > 0xff || nValue < 0)
                            // this.Emsg('Operand (%04x) out of range $00-$FF', nValue)
                            this.Emsg('Operand (%04x) out of range 00-FF', nValue)
                        nData[nBytes++] = nValue & 0xff
                        if (eToken != TOKEN.COMMA) break
                        eToken = this.GetToken()
                    }
                    break
                case CAT_DS >> 8:
                    this.Emsg('DS directive not supported')
                    break
                case CAT_DW >> 8:
                    for (;;) {
                        ;[eToken, nValue] = this.ParseLevel8(eToken)
                        nData[nBytes++] = (nValue >> 8) & 0xff
                        nData[nBytes++] = nValue & 0xff
                        if (eToken != TOKEN.COMMA) break
                        eToken = this.GetToken()
                    }
                    break
                case CAT_EQU >> 8:
                    if (IsEmpty(strLabel)) {
                        this.Emsg('No label for EQU statement')
                        break
                    }
                    ;[eToken, nValue] = this.ParseLevel8(eToken)
                    {
                        let pSymbol = this.m_symbolTable.DefineSymbol(
                            strLabel,
                            this.m_lineData[this.m_nCurrentLine],
                            nValue
                        )
                        if (pSymbol.GetDefinitionCount() != 1) {
                            this.Emsg('Symbol %s defined on more than one line', strLabel)
                        }
                    }
                    break

                // case CAT_IF >> 8:
                //     {
                //         //
                //         // Syntax   IF [A|X] < > != == <= >= (Expr) for
                //         //          IF CS CC
                //         //
                //         //  IF  1           BRN         Branch Never
                //         //  IF  0           BRA         Branch always
                //         //  IF  <= LE       BHI  C|Z=0  Branch iff Higher
                //         //  IF  > GT        BLS  C|Z=1  Branch iff Lower or Same
                //         //  IF  < LT CS     BCC  C=0    Branch iff Higher or Same/Carry Clear
                //         //  IF  >= GE CC    BCS  C=1    Branch iff Lower/Carry Set
                //         //  IF  == EQ       BNE  Z=0    Branch iff Not Equal
                //         //  IF  <> != NE    BEQ  Z=1    Branch iff Equal
                //         //  IF  HCS         BHCC H=0    Branch iff Half Carry Clear
                //         //  IF  HCC         BHCS H=1    Branch iff Half Carry Set
                //         //  IF  <0 LTZ NEG  BPL  N=0    Branch iff Plus
                //         //  IF  >=0 GTZ POS BMI  N=1    Branch iff Minus
                //         //  IF  IMS         BMC  M=0    Branch iff interrupt mask is clear
                //         //  IF  IMC         BMS  M=1    Branch iff interrupt mask is set
                //         //  IF  INT0        BIL  I=0    Branch iff interrupt line is low
                //         //  IF  INT1        BIH  I=1    Branch iff interrupt line is High
                //         this.m_anLogicStack[this.m_nLogicNesting++] = this.m_nLogicId++;
                //     }

                // case CAT_ELSE >> 8:

                // case CAT_ENDIF >> 8:

                case CAT_INCLUDE >> 8:
                    //
                    // The first time around, we need to actually read in the include file
                    //
                    if (eToken != TOKEN.STRING) {
                        this.Emsg('Include file must be enclosed in quotes')
                    } else {
                        let pSymbol = this.m_symbolTable.LookupSymbol(
                            this.m_strTokenName,
                            this.m_lineData[this.m_nCurrentLine]
                        )
                        if (pSymbol.GetValue() == 0) {
                            try {
                                let filecontent = await this.getincludeFile(this.m_strTokenName)
                                // string strLine;
                                //
                                // The file has never been read in before
                                //
                                pSymbol.SetValue(1, this.m_lineData[this.m_nCurrentLine])
                                let lines = filecontent.split(/[\r\n]+/g)
                                lines.forEach((strLine) => {
                                    this.m_strLine = strLine
                                    this.m_nTokenPos = 0
                                    if (this.GetToken() == TOKEN.SYMBOL) {
                                        let nValue = 0
                                        let strName = this.m_strTokenName
                                        if (
                                            this.GetToken() == TOKEN.SYMBOL &&
                                            !stricmp(this.m_strTokenName, 'equ')
                                        ) {
                                            ;[eToken, nValue] = this.ParseLevel8(this.GetToken())
                                            this.m_symbolTable.DefineSymbol(strName, null, nValue)
                                        }
                                    }
                                })
                            } catch (e) {
                                this.Emsg(
                                    "Unable to open '%s', Base Directory='%s'",
                                    this.m_strTokenName,
                                    this.m_strIncludeURI
                                )
                            }
                        }
                        eToken = this.GetToken()
                    }
                    break
                case CAT_TIMEX >> 8:
                    if (eToken == TOKEN.STRING) {
                        for (let c of this.m_strTokenName) {
                            const ucTimex: number[] = [
                                //  00   01   02   03   04   05   06   07   08   09   0A   0B   0C   0D   0E   0F
                                0x39,
                                0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39,
                                0x39, 0x39, 0x39, 0x39,
                                //  10   11   12   13   14   15   16   17   18   19   1A   1B   1C   1D   1E   1F
                                0x39,
                                0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39, 0x39,
                                0x39, 0x39, 0x39, 0x39,
                                //        !    "   #    $    %    &    '    (    )    *    +    ,    -    .    /
                                0x24,
                                0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
                                0x30, 0x31, 0x32, 0x33,
                                //  0    1    2    3    4    5    6    7    8    9    :    ;    <    =    >    ?
                                0x00,
                                0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x34, 0x35,
                                0x36, 0x37, 0x38, 0x39,
                                //  @    A    B    C    D    E    F    G    H    I    J    K    L    M    N    O
                                0x3a,
                                0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14,
                                0x15, 0x16, 0x17, 0x18,
                                //  P    Q    R    S    T    U    V    W    X    Y    Z    [    \    ]    ^    _
                                0x19,
                                0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x2c,
                                0x39, 0x2c, 0x39, 0x31,
                                //  `    a    b    c    d    e    f    g    h    i    j    k    l    m    n    o
                                0x3a,
                                0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14,
                                0x15, 0x16, 0x17, 0x18,
                                //  p    q    r    s    t    u    v    w    x    y    z    {    |    }    ~
                                0x19,
                                0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x2c,
                                0x39, 0x2c, 0x39, 0x31,
                                //  p    q    r    s    t    u    v    w    x    y    z    {    |    }    ~
                            ]
                            nData[nBytes++] = ucTimex[c.charCodeAt(0) & 0x7f]
                        }
                        eToken = this.GetToken()
                    }
                    break
                case CAT_TIMEX6 >> 8:
                    if (eToken == TOKEN.STRING) {
                        for (let c of this.m_strTokenName) {
                            const ucTimex6: number[] = [
                                //  00   01   02   03   04   05   06   07   08   09   0A   0B   0C   0D   0E   0F
                                0x1d,
                                0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d,
                                0x1d, 0x1d, 0x1d, 0x1d,
                                //  10   11   12   13   14   15   16   17   18   19   1A   1B   1C   1D   1E   1F
                                0x1d,
                                0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d,
                                0x1d, 0x1d, 0x1d, 0x1d,
                                //        !    "   #    $    %    &    '    (    )    *    +    ,    -    .    /
                                0x1d,
                                0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1d, 0x1f,
                                0x1e, 0x1d, 0x1d, 0x1d,
                                //  0    1    2    3    4    5    6    7    8    9    :    ;    <    =    >    ?
                                0x00,
                                0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x34, 0x35,
                                0x36, 0x37, 0x38, 0x1d,
                                //  @    A    B    C    D    E    F    G    H    I    J    K    L    M    N    O
                                0x1d,
                                0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x01, 0x01, 0x01,
                                0x13, 0x14, 0x15, 0x00,
                                //  P    Q    R    S    T    U    V    W    X    Y    Z    [    \    ]    ^    _
                                0x16,
                                0x01, 0x17, 0x05, 0x18, 0x19, 0x19, 0x1a, 0x01, 0x1b, 0x02, 0x1d,
                                0x1d, 0x1d, 0x1d, 0x1e,
                                //  `    a    b    c    d    e    f    g    h    i    j    k    l    m    n    o
                                0x1d,
                                0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x01, 0x01, 0x01,
                                0x13, 0x14, 0x15, 0x00,
                                //  p    q    r    s    t    u    v    w    x    y    z    {    |    }    ~
                                0x16,
                                0x01, 0x1c, 0x05, 0x18, 0x19, 0x19, 0x1a, 0x01, 0x1b, 0x02, 0x1d,
                                0x1d, 0x1d, 0x1d, 0x1e,
                            ]
                            nData[nBytes++] = ucTimex6[c.charCodeAt(0) & 0x7f]
                        }
                        eToken = this.GetToken()
                    }
                    break

                case 0:
                    //
                    // This is just the case of a label only
                    //
                    break

                default:
                    this.Emsg('Unrecognized opcode')
                    break
            }

            if (eToken != TOKEN.END) {
                this.Emsg('Junk past the end of the instruction')
            }
            nBytes = this.m_lineData[this.m_nCurrentLine].SetData(nData, nBytes)
            this.m_lineData[this.m_nCurrentLine].MarkDirty(false)

            if (nBytes) {
                let nLineCur = 0

                let nCurrentOffset = this.m_lineData[this.m_nCurrentLine].GetOffset()
                for (nLineCur = this.m_nCurrentLine + 1; nLineCur < this.m_nMaxLine; nLineCur++) {
                    this.m_lineData[nLineCur].AdjustOffset(nBytes)
                    let nRelativeOffset = this.m_lineData[nLineCur].GetRelativeOffset()
                    if (nRelativeOffset >= 0 && nRelativeOffset < nCurrentOffset)
                        this.m_lineData[nLineCur].MarkDirty(true)
                }
                //
                // Go through and figure out which relative offsets may have been affected.
                //
                for (nLineCur = this.m_nCurrentLine; nLineCur > 0; nLineCur--) {
                    if (this.m_lineData[nLineCur].GetOffset() > nCurrentOffset)
                        this.m_lineData[nLineCur].MarkDirty(true)
                }
            }
            resolve()
        })
    }

    constructor(strFilename: string, includeURI: string) {
        aKeyWords.forEach((entry) => {
            this.m_symbolTable.DefineKeyword(entry.name, entry.value)
        })
        this.m_strFilename = strFilename
        this.m_strIncludeURI = includeURI
        this.m_nMaxLine = 0
        this.m_lineData = new Array(MAX_LINES).fill(undefined)
    }

    public cleanup(): void {
        this.m_lineData.forEach((entry) => {
            if (entry !== undefined) {
                entry.ResetReferences()
                entry.SetDefinition(undefined)
            }
        })
    }
    public AddSourceLine(nLineNum: number): void {
        this.m_lineData[nLineNum] = new CSourceLine()
        if (nLineNum >= this.m_nMaxLine) this.m_nMaxLine = nLineNum + 1

        if (nLineNum == 0) {
            this.m_lineData[nLineNum].SetOffset(0x0110)
        } else {
            this.m_lineData[nLineNum].SetOffset(
                this.m_lineData[nLineNum - 1].GetOffset() +
                    this.m_lineData[nLineNum - 1].GetByteCount()
            )
        }
    }

    public GetHex(): string {
        let strResult = ''
        let bComplained = false
        let nOffset = this.m_lineData[0].GetOffset()

        this.m_lineData.forEach((entry) => {
            if (entry !== undefined) {
                if (nOffset != entry.GetOffset()) {
                    if (!bComplained) {
                        this.Emsg(
                            'Bad offset dumping hex.  Was at %x expected to be at %x',
                            entry.GetOffset(),
                            nOffset
                        )
                    }
                    bComplained = true
                }

                let nBytes = entry.GetByteCount()
                nOffset += nBytes

                let nData = entry.GetData()
                nData.forEach((byte) => {
                    let strTemp = byte.toString(16).padStart(2, '0')
                    strResult += strTemp
                })
            }
        })
        return strResult
    }

    public GenListing(strData: string[]): string[] {
        let result: string[] = []
        for (let nLineCur = 0; nLineCur < this.m_nMaxLine; nLineCur++) {
            let nOffset = this.m_lineData[nLineCur].GetOffset()
            let nBytes = this.m_lineData[nLineCur].GetByteCount()
            let nData = this.m_lineData[nLineCur].GetData()
            let strLine = ''
            if (nBytes == 0) {
                let pSymDefine = this.m_lineData[nLineCur].GetDefinition()
                if (pSymDefine == null) {
                    strLine = sprintf('%4d|                |%s', nLineCur + 1, strData[nLineCur])
                } else {
                    let nValue = pSymDefine.GetValue()
                    if (!pSymDefine.IsReferenced()) {
                        if (nValue == nOffset) {
                            strLine = sprintf(
                                '%4d| %04x?          |%s',
                                nLineCur + 1,
                                nValue,
                                strData[nLineCur]
                            )
                        } else {
                            strLine = sprintf(
                                '%4d|     =%04x?     |%s',
                                nLineCur + 1,
                                nValue,
                                strData[nLineCur]
                            )
                        }
                    } else {
                        if (nValue == nOffset) {
                            strLine = sprintf(
                                '%4d| %04x:          |%s',
                                nLineCur + 1,
                                nValue,
                                strData[nLineCur]
                            )
                        } else {
                            strLine = sprintf(
                                '%4d|     =%04x      |%s',
                                nLineCur + 1,
                                nValue,
                                strData[nLineCur]
                            )
                        }
                    }
                }
            } else if (nBytes == 1) {
                strLine = sprintf(
                    '%4d| %04x: %02x       |%s',
                    nLineCur + 1,
                    nOffset,
                    nData[0],
                    strData[nLineCur]
                )
            } else if (nBytes == 2) {
                strLine = sprintf(
                    '%4d| %04x: %02x %02x    |%s',
                    nLineCur + 1,
                    nOffset,
                    nData[0],
                    nData[1],
                    strData[nLineCur]
                )
            } else {
                let nPos = 0
                strLine = sprintf(
                    '%4d| %04x: %02x %02x %02x |%s',
                    nLineCur + 1,
                    nOffset,
                    nData[0],
                    nData[1],
                    nData[2],
                    strData[nLineCur]
                )
                while (nBytes > 3) {
                    nBytes -= 3
                    nOffset += 3
                    nPos += 3
                    result.push(strLine)
                    if (nBytes == 1) {
                        strLine = sprintf('    | %04x: %02x       |', nOffset, nData[0])
                    } else if (nBytes == 2) {
                        strLine = sprintf('    | %04x: %02x %02x    |', nOffset, nData[0], nData[1])
                    } else {
                        strLine = sprintf(
                            '    | %04x: %02x %02x %02x |',
                            nOffset,
                            nData[nPos + 0],
                            nData[nPos + 1],
                            nData[nPos + 2]
                        )
                    }
                }
            }
            result.push(strLine)
        }

        return result
    }
}
export async function Assemble(
    strFilename: string,
    strData: string[],
    includeURI: string,
    showProgress: (str) => void
): Promise<[string[], string, string[]]> {
    let nLine
    let nLineCount = strData.length
    let asmFile = new CAsmFile(strFilename, includeURI)

    showProgress('Pass1....')
    asmFile.ResetErrors()
    for (nLine = 0; nLine < nLineCount; nLine++) {
        asmFile.AddSourceLine(nLine)
        strData[nLine] = expandTabs(strData[nLine])
        await asmFile.ParseLine(strData[nLine], nLine)
    }
    showProgress('Pass2....')
    asmFile.ResetErrors()

    for (nLine = 0; nLine < nLineCount; nLine++) {
        await asmFile.ParseLine(strData[nLine], nLine)
    }
    showProgress('Pass3....')
    asmFile.ResetErrors()
    let prevErrors = asmFile.GetErrors()
    for (nLine = 0; nLine < nLineCount; nLine++) {
        await asmFile.ParseLine(strData[nLine], nLine)
    }
    let strErrors = asmFile.GetErrors()
    let strHexOut = asmFile.GetHex()
    let strListing = asmFile.GenListing(strData)
    return [strErrors, strHexOut, strListing]
}
// }
