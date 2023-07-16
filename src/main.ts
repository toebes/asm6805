'use strict';

/**
 * ciphers.js is a library for JavaScript which provides functions for
 * generating web pages to solve Ciphers of many forms.
 *
 * @version 1.0.0
 * @date    2017-02-24
 *
 * @license
 * Copyright (C) 2017-2018 John A Toebes <john@toebes.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/**
 * Main CipherTool class object
 * @type {Object.<string, function>}
 */
import 'foundation.css';
import 'foundation-sites';
import 'katex.css';
import '../common/styles.css';
import 'flatpickr.css';
import 'datatables.net-dt';
import 'datatables.css';
import 'datatables.net-zf';
import 'datatables.foundation.css';
import 'datatables.net-plugins/sorting/natural.js';

import { CipherHandler } from '../common/cipherhandler';
import { CipherFactory } from './cipherfactory';

let cipherTool: CipherHandler = new CipherHandler();
declare let window: any;
window.cipherTool = cipherTool;

$(function (): void {
    window.cipherTool = cipherTool = CipherFactory(data_cipher, data_lang);
    cipherTool.layout();
    $(document).foundation();
});
