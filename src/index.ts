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
import { Assemble } from './Assemble'
import { createDocumentElement, htmlToElement } from './common/htmldom'
import './style.css'

function getSource(): string[] {
    const codeblock = document.getElementById('code')
    if (codeblock === null || codeblock === undefined) {
        return [';NO CODE FOUND']
    }
    const codeblockarea = codeblock as HTMLTextAreaElement
    const lines = codeblockarea.value.split(/[\n\r]/g)
    return lines
}
function setDivContentLines(id: string, content: string[]) {
    const elem = document.getElementById(id)
    if (elem !== undefined && elem !== null) {
        const div = elem as HTMLDivElement
        // Empty it out
        while (div.firstChild) {
            div.firstChild.remove()
        }
        content.forEach((line) => {
            const ldiv = createDocumentElement('div', { class: 'ldiv', textContent: line })
            div.appendChild(ldiv)
        })
    }
}

function doCompile(ev: Event) {
    // export async function Assemble(
    //     strFilename: string,
    //     strData: string[],
    //     includeURI: string,
    //     showProgress: (str) => void
    // ): Promise<[string[], string, string[]]> {
    const lines = getSource()
    const h3errors = document.getElementById('errors')

    Assemble('SourceFile.asm', lines, 'include/Inc150', (status) => {
        if (h3errors) {
            setDivContentLines('errors', [status])
        } else {
            console.log(status)
        }
    }).then((res) => {
        let [errors, hex, listing] = res

        if (errors.length === 0) {
            errors = ['No Errors']
        }
        setDivContentLines('errors', errors)
        setDivContentLines('listing', listing)
        const hexdiv = document.getElementById('hex')
        if (hexdiv !== undefined && hexdiv !== null) {
            hexdiv.innerHTML = hex
        }
    })
}

window.addEventListener('load', function () {
    let content = document.getElementById('content')
    if (content !== undefined && content !== null) {
        const button = createDocumentElement('button', {
            id: 'comp2',
            class: 'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800',
            textContent: 'Compile',
        })
        button.onclick = doCompile

        content.appendChild(button)

        const label = createDocumentElement('label', {
            for: 'code',
            class: 'block mb-2 text-sm font-medium text-gray-900 dark:text-white',
            textContent: 'Code to Compile',
        })
        const textarea = createDocumentElement('textarea', {
            id: 'code',
            rows: '10',
            class: 'block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
            placeholder: 'Paste Code Here',
        })
        content.appendChild(label)
        content.appendChild(textarea)
        const hr = createDocumentElement('hr')
        content.appendChild(hr)
        const h3errors = createDocumentElement('h3', { textContent: 'Errors' })
        content.appendChild(h3errors)
        const outputErrors = createDocumentElement('div', {
            id: 'errors',
            class: 'block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
        })
        content.appendChild(outputErrors)
        const hr2 = createDocumentElement('hr')
        const h3hex = createDocumentElement('h3', { textContent: 'Hex' })
        content.appendChild(h3hex)

        content.appendChild(hr2)
        const outputHex = createDocumentElement('div', {
            id: 'hex',
            class: 'block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
        })
        content.appendChild(outputHex)
        const hr3 = createDocumentElement('hr')
        const h3listing = createDocumentElement('h3', { textContent: 'Listing' })
        content.appendChild(h3listing)
        content.appendChild(hr3)
        const outputListing = createDocumentElement('div', {
            id: 'listing',
            class: 'block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
        })
        content.appendChild(outputListing)
    }
})
