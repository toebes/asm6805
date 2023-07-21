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
export class CSourceLine {
    protected m_psymbolDefine: CSymbol | undefined
    protected m_listSymbols: CSymbol[] = []
    protected m_bIsDirty: boolean
    protected m_nLineOffset: number
    protected m_bIsOrigin: boolean
    protected m_dataBytes: number[] = []
    protected m_nRelativeOffset: number
    public GetDefinition(): CSymbol | undefined {
        return this.m_psymbolDefine
    }
    public SetDefinition(pSymbol: CSymbol | undefined): void {
        if (this.m_psymbolDefine != undefined) {
            this.m_psymbolDefine.RemoveDefinition(this)
        }
        this.m_psymbolDefine = pSymbol
    }

    public RemoveReference(pSymbol: CSymbol): void {
        const pos = this.m_listSymbols.indexOf(pSymbol)
        if (pos > -1) {
            this.m_listSymbols.splice(pos, 1)
        }
    }

    public AddReference(pSymbol: CSymbol): void {
        if (this.m_listSymbols.indexOf(pSymbol) >= -1) return
        this.m_listSymbols.push(pSymbol)
    }

    public ResetReferences(): void {
        this.m_listSymbols = []
    }
    public SetRelative(nOffset: number): void {
        this.m_nRelativeOffset = nOffset
    }
    public GetRelativeOffset(): number {
        return this.m_nRelativeOffset
    }
    public GetOffset(): number {
        return this.m_nLineOffset
    }

    public GetByteCount(): number {
        return this.m_dataBytes.length
    }

    public SetData(nData: number[], nBytes: number): number {
        let nDelta = nBytes - this.GetByteCount()
        this.m_dataBytes = nData.slice(0, nBytes)
        return nDelta
    }

    public GetData(): number[] {
        return this.m_dataBytes
    }

    public SetOffset(nByteOffset: number, isOrigin = false): void {
        this.m_nLineOffset = nByteOffset
        this.m_bIsOrigin = isOrigin
        if (this.m_psymbolDefine != null) {
            this.m_psymbolDefine.SetValue(nByteOffset, this)
        }
    }

    public AdjustOffset(nOffset: number): void {
        this.SetOffset(this.m_nLineOffset + nOffset)
    }

    public MarkDirty(bIsDirty: boolean = true) {
        this.m_bIsDirty = bIsDirty
    }

    public IsDirty(): boolean {
        return this.m_bIsDirty
    }

    public IsOrigin(): boolean {
        return this.m_bIsOrigin
    }
    constructor() {
        this.MarkDirty(false)
        this.m_psymbolDefine = undefined
        this.m_nRelativeOffset = -1
    }
}

export class CSymbol {
    protected m_nValue: number
    protected m_nDefinitions: number
    protected m_bIsKeyword: boolean

    protected m_listDefine: CSourceLine[] = []
    protected m_listReference: CSourceLine[] = []

    public SetKeyword(nValue: number): void {
        this.m_bIsKeyword = true
        this.m_nValue = nValue
    }
    public constructor() {
        this.m_bIsKeyword = false
        this.m_nDefinitions = 0
        this.m_nValue = 0
    }

    public Cleanup(): void {
        this.m_listDefine.forEach((entry) => {
            entry.MarkDirty()
        })
        this.m_listReference.forEach((entry) => {
            entry.MarkDirty()
        })
        this.m_listDefine = []
        this.m_listReference = []
    }

    public IsKeyword(): boolean {
        return this.m_bIsKeyword
    }

    public IsReferenced(): boolean {
        return this.m_listReference.length > 0
    }

    GetValue(): number {
        return this.m_nValue
    }

    public SetValue(nValue: number, pSourceLine: CSourceLine): void {
        this.AddDefinition(pSourceLine)

        if (nValue == this.m_nValue) return

        this.m_listDefine.forEach((pDefLine) => {
            if (pDefLine !== pSourceLine) {
                pDefLine.MarkDirty()
            }
        })
        this.m_listReference.forEach((pRefLine) => {
            //
            // If it was a relative reference to the current symbol, then let's don't actually
            // mark it dirty.
            //
            if (pRefLine.GetRelativeOffset() !== this.m_nValue) {
                pRefLine.MarkDirty()
            }
        })
        this.m_nValue = nValue
    }

    public AddDefinition(pSourceLine: CSourceLine): void {
        if (pSourceLine == null) {
            this.m_nDefinitions++
            return
        }
        if (this.m_listDefine.indexOf(pSourceLine) > -1) return

        this.m_nDefinitions++
        this.m_listDefine.push(pSourceLine)
        pSourceLine.SetDefinition(this)
    }

    public RemoveDefinition(pSourceLine: CSourceLine): void {
        const pos = this.m_listDefine.indexOf(pSourceLine)
        if (pos > -1) {
            this.m_listDefine.splice(pos, 1)
            pSourceLine.SetDefinition(undefined)
        }
        this.m_nDefinitions = this.m_listDefine.length
        this.m_listDefine.forEach((entry) => {
            entry.MarkDirty()
        })
    }

    public AddReference(pSourceLine: CSourceLine): void {
        if (this.m_listReference.indexOf(pSourceLine) > -1) {
            return
        }
        this.m_listReference.push(pSourceLine)
        pSourceLine.AddReference(this)
    }

    public RemoveReference(pSourceLine: CSourceLine): void {
        const pos = this.m_listReference.indexOf(pSourceLine)
        if (pos > -1) {
            this.m_listReference.splice(pos, 1)
        }
    }

    public GetDefinitionCount(): number {
        return this.m_nDefinitions
    }
}

export class CSymbolTable {
    protected m_mapSymbols = new Map<string, CSymbol>()

    public LookupSymbol(strSymbol: string, pSourceLine: CSourceLine): CSymbol {
        let symbol = strSymbol.toUpperCase()
        let pSymbol = this.m_mapSymbols.get(symbol)
        if (pSymbol === undefined) {
            pSymbol = new CSymbol()
            this.m_mapSymbols.set(symbol, pSymbol)
        }
        if (!pSymbol.IsKeyword()) {
            pSymbol.AddReference(pSourceLine)
        }
        return pSymbol
    }

    public LookupKeyword(strSymbol: string): number {
        let pSymbol = this.m_mapSymbols.get(strSymbol.toUpperCase())
        if (pSymbol === undefined) {
            return 0
        }
        if (!pSymbol.IsKeyword()) {
            return 0
        }
        return pSymbol.GetValue()
    }

    public FindSymbol(strSymbol: string): CSymbol | undefined {
        return this.m_mapSymbols.get(strSymbol.toUpperCase())
    }

    public DefineSymbol(strSymbol: string, pSourceLine: CSourceLine, nValue: number): CSymbol {
        let symbol = strSymbol.toUpperCase()
        let pSymbol = this.m_mapSymbols.get(symbol)

        if (pSymbol === undefined) {
            pSymbol = new CSymbol()
            this.m_mapSymbols.set(symbol, pSymbol)
        }
        pSymbol.SetValue(nValue, pSourceLine)
        return pSymbol
    }

    public DefineKeyword(strSymbol: string, nValue: number): CSymbol {
        let symbol = strSymbol.toUpperCase()
        let pSymbol = this.m_mapSymbols.get(symbol)

        if (pSymbol === undefined) {
            pSymbol = new CSymbol()
            this.m_mapSymbols.set(symbol, pSymbol)
        }
        pSymbol.SetKeyword(nValue)
        return pSymbol
    }
}
