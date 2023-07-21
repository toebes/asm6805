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
export const DIR2 = 1 // Direct/REL, used only for BRSET and BRCLR
export const DIR = 2 // Direct, 1 byte address (high byte is 0x00)
export const EXT = 3 // Extended, 2 byte address
export const REL = 4 // Relative, 1 byte signed offset (branches only)
export const INH = 5 // Inherent, no arg
export const IX = 6 // Indexed, no offset
export const IX1 = 7 // Indexed, 1 byte unsigned offset
export const IX2 = 8 // Indexed, 2 byte unsigned offset
export const IMM = 9 // Immediate, 1 byte arg
export const DB = 10 // Illegal instruction, use a DB
export const BSC = 11 // Bit set/clear instructions

export const CAT_INH = 1 << 8
export const CAT_REL = 2 << 8
export const CAT_BSC = 3 << 8
export const CAT_BSCX = 4 << 8
export const CAT_BTB = 5 << 8
export const CAT_BTBX = 6 << 8
export const CAT_IMM_DIR_EXT_IX1_IX1_IX = 7 << 8
export const CAT_DIR_EXT_IX1_IX1_IX = 8 << 8
export const CAT_DIR_IX1_IX = 9 << 8
export const CAT_ALIGN = 10 << 8
export const CAT_DB = 11 << 8
export const CAT_DS = 12 << 8
export const CAT_DW = 13 << 8
export const CAT_EQU = 14 << 8
export const CAT_INCLUDE = 15 << 8
export const CAT_TIMEX = 16 << 8
export const CAT_TIMEX6 = 17 << 8
export const CAT_IF = 18 << 8
export const CAT_ELSE = 19 << 8
export const CAT_ENDIF = 20 << 8
export const CAT_ORIGIN = 21 << 8
export const CAT_ASCII = 22 << 8

export interface keywordDefinitions {
    name: string
    value: number
}

export const aKeyWords: keywordDefinitions[] = [
    { name: 'ADC', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa9 },
    { name: 'ADD', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xab },
    { name: 'ALIGN', value: CAT_ALIGN | 0 },
    { name: 'AND', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa4 },
    { name: 'ASCII', value: CAT_ASCII | 0 },
    { name: 'ASL', value: CAT_DIR_IX1_IX | 0x38 },
    { name: 'ASLA', value: CAT_INH | 0x48 },
    { name: 'ASLX', value: CAT_INH | 0x58 },
    { name: 'ASR', value: CAT_DIR_IX1_IX | 0x37 },
    { name: 'ASRA', value: CAT_INH | 0x47 },
    { name: 'ASRX', value: CAT_INH | 0x57 },
    { name: 'BCC', value: CAT_REL | 0x24 },
    { name: 'BCLR', value: CAT_BSCX | 0x11 },
    { name: 'BCLR0', value: CAT_BSC | 0x11 },
    { name: 'BCLR1', value: CAT_BSC | 0x13 },
    { name: 'BCLR2', value: CAT_BSC | 0x15 },
    { name: 'BCLR3', value: CAT_BSC | 0x17 },
    { name: 'BCLR4', value: CAT_BSC | 0x19 },
    { name: 'BCLR5', value: CAT_BSC | 0x1b },
    { name: 'BCLR6', value: CAT_BSC | 0x1d },
    { name: 'BCLR7', value: CAT_BSC | 0x1f },
    { name: 'BCS', value: CAT_REL | 0x25 },
    { name: 'BEQ', value: CAT_REL | 0x27 },
    { name: 'BHCC', value: CAT_REL | 0x28 },
    { name: 'BHCS', value: CAT_REL | 0x29 },
    { name: 'BHI', value: CAT_REL | 0x22 },
    { name: 'BHS', value: CAT_REL | 0x24 },
    { name: 'BIH', value: CAT_REL | 0x2f },
    { name: 'BIL', value: CAT_REL | 0x2e },
    { name: 'BIT', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa5 },
    { name: 'BLO', value: CAT_REL | 0x25 },
    { name: 'BLS', value: CAT_REL | 0x23 },
    { name: 'BMC', value: CAT_REL | 0x2c },
    { name: 'BMI', value: CAT_REL | 0x2b },
    { name: 'BMS', value: CAT_REL | 0x2d },
    { name: 'BNE', value: CAT_REL | 0x26 },
    { name: 'BPL', value: CAT_REL | 0x2a },
    { name: 'BRA', value: CAT_REL | 0x20 },
    { name: 'BRSKIP', value: CAT_INH | 0x21 },
    { name: 'BRSKIP2', value: CAT_INH | 0xc5 },
    { name: 'BRCLR', value: CAT_BTBX | 0x01 },
    { name: 'BRCLR0', value: CAT_BTB | 0x01 },
    { name: 'BRCLR1', value: CAT_BTB | 0x03 },
    { name: 'BRCLR2', value: CAT_BTB | 0x05 },
    { name: 'BRCLR3', value: CAT_BTB | 0x07 },
    { name: 'BRCLR4', value: CAT_BTB | 0x09 },
    { name: 'BRCLR5', value: CAT_BTB | 0x0b },
    { name: 'BRCLR6', value: CAT_BTB | 0x0d },
    { name: 'BRCLR7', value: CAT_BTB | 0x0f },
    { name: 'BRN', value: CAT_REL | 0x21 },
    { name: 'BRSET', value: CAT_BTBX | 0x00 },
    { name: 'BRSET0', value: CAT_BTB | 0x00 },
    { name: 'BRSET1', value: CAT_BTB | 0x02 },
    { name: 'BRSET2', value: CAT_BTB | 0x04 },
    { name: 'BRSET3', value: CAT_BTB | 0x06 },
    { name: 'BRSET4', value: CAT_BTB | 0x08 },
    { name: 'BRSET5', value: CAT_BTB | 0x0a },
    { name: 'BRSET6', value: CAT_BTB | 0x0c },
    { name: 'BRSET7', value: CAT_BTB | 0x0e },
    { name: 'BSET', value: CAT_BSCX | 0x10 },
    { name: 'BSET0', value: CAT_BSC | 0x10 },
    { name: 'BSET1', value: CAT_BSC | 0x12 },
    { name: 'BSET2', value: CAT_BSC | 0x14 },
    { name: 'BSET3', value: CAT_BSC | 0x16 },
    { name: 'BSET4', value: CAT_BSC | 0x18 },
    { name: 'BSET5', value: CAT_BSC | 0x1a },
    { name: 'BSET6', value: CAT_BSC | 0x1c },
    { name: 'BSET7', value: CAT_BSC | 0x1e },
    { name: 'BSR', value: CAT_REL | 0xad },
    { name: 'CLC', value: CAT_INH | 0x98 },
    { name: 'CLI', value: CAT_INH | 0x9a },
    { name: 'CLR', value: CAT_DIR_IX1_IX | 0x3f },
    { name: 'CLRA', value: CAT_INH | 0x4f },
    { name: 'CLRX', value: CAT_INH | 0x5f },
    { name: 'CMP', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa1 },
    { name: 'COM', value: CAT_DIR_IX1_IX | 0x33 },
    { name: 'COMA', value: CAT_INH | 0x43 },
    { name: 'COMX', value: CAT_INH | 0x53 },
    { name: 'CPX', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa3 },
    { name: 'DB', value: CAT_DB | 0 },
    { name: 'DEC', value: CAT_DIR_IX1_IX | 0x3a },
    { name: 'DECA', value: CAT_INH | 0x4a },
    { name: 'DECX', value: CAT_INH | 0x5a },
    { name: 'DS', value: CAT_DS | 0 },
    { name: 'DW', value: CAT_DW | 0 },
    { name: 'ELSE', value: CAT_ELSE | 0 },
    { name: 'ENDIF', value: CAT_ENDIF | 0 },
    { name: 'EOR', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa8 },
    { name: 'EQU', value: CAT_EQU | 0 },
    { name: 'IF', value: CAT_IF | 0 },
    { name: 'INC', value: CAT_DIR_IX1_IX | 0x3c },
    { name: 'INCA', value: CAT_INH | 0x4c },
    { name: 'INCLUDE', value: CAT_INCLUDE | 0 },
    { name: 'INCX', value: CAT_INH | 0x5c },
    { name: 'JMP', value: CAT_DIR_EXT_IX1_IX1_IX | 0xac },
    { name: 'JSR', value: CAT_DIR_EXT_IX1_IX1_IX | 0xad },
    { name: 'LDA', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa6 },
    { name: 'LDX', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xae },
    { name: 'LSL', value: CAT_DIR_IX1_IX | 0x38 },
    { name: 'LSLA', value: CAT_INH | 0x48 },
    { name: 'LSLX', value: CAT_INH | 0x58 },
    { name: 'LSR', value: CAT_DIR_IX1_IX | 0x34 },
    { name: 'LSRA', value: CAT_INH | 0x44 },
    { name: 'LSRX', value: CAT_INH | 0x54 },
    { name: 'MUL', value: CAT_INH | 0x42 },
    { name: 'NEG', value: CAT_DIR_IX1_IX | 0x30 },
    { name: 'NEGA', value: CAT_INH | 0x40 },
    { name: 'NEGX', value: CAT_INH | 0x50 },
    { name: 'NOP', value: CAT_INH | 0x9d },
    { name: 'ORIGIN', value: CAT_ORIGIN | 0 },
    { name: 'ORA', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xaa },
    { name: 'ROL', value: CAT_DIR_IX1_IX | 0x39 },
    { name: 'ROLA', value: CAT_INH | 0x49 },
    { name: 'ROLX', value: CAT_INH | 0x59 },
    { name: 'ROR', value: CAT_DIR_IX1_IX | 0x36 },
    { name: 'RORA', value: CAT_INH | 0x46 },
    { name: 'RORX', value: CAT_INH | 0x56 },
    { name: 'RSP', value: CAT_INH | 0x9c },
    { name: 'RTI', value: CAT_INH | 0x80 },
    { name: 'RTS', value: CAT_INH | 0x81 },
    { name: 'SBC', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa2 },
    { name: 'SEC', value: CAT_INH | 0x99 },
    { name: 'SEI', value: CAT_INH | 0x9b },
    { name: 'STA', value: CAT_DIR_EXT_IX1_IX1_IX | 0xa7 },
    { name: 'STOP', value: CAT_INH | 0x8e },
    { name: 'STX', value: CAT_DIR_EXT_IX1_IX1_IX | 0xaf },
    { name: 'SUB', value: CAT_IMM_DIR_EXT_IX1_IX1_IX | 0xa0 },
    { name: 'SWI', value: CAT_INH | 0x83 },
    { name: 'TAX', value: CAT_INH | 0x97 },
    { name: 'TIMEX', value: CAT_TIMEX | 0 },
    { name: 'TIMEX6', value: CAT_TIMEX6 | 0 },
    { name: 'TST', value: CAT_DIR_IX1_IX | 0x3d },
    { name: 'TSTA', value: CAT_INH | 0x4d },
    { name: 'TSTX', value: CAT_INH | 0x5d },
    { name: 'TXA', value: CAT_INH | 0x9f },
    { name: 'WAIT', value: CAT_INH | 0x8f },
]
