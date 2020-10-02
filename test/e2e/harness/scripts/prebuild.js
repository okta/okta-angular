/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


const path = require('path');
const shell = require('shelljs');

// Link the local module. We are not using yarn link because we do not want to modify the global state
// If we don't link this way we get bizarre errors such as: "NullInjectorError: No provider for Injector!"
const MODULE_NAME = '@okta/okta-angular';
const SRC_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'dist');
const DEST_LINK = path.resolve(__dirname, '..', 'node_modules', MODULE_NAME);
const DEST_DIR = path.resolve(DEST_LINK, '..');

shell.echo(`Linking module: ${MODULE_NAME} from ${SRC_DIR}`);
shell.mkdir(`-p`, `${SRC_DIR}`);
shell.mkdir(`-p`, `${DEST_DIR}`);
shell.exec(`ln -sF ${SRC_DIR} ${DEST_LINK}`);
