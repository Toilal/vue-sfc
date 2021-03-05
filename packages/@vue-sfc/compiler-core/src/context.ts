import {SFCBlock} from "@vue/compiler-sfc";
import {Cache} from "./cache";
import { PathHandler } from './path'

export interface Module {
}

/**
 * Used by the library when it does not know how to handle a given file type (eg. `.json` files).
 * see [[moduleHandlers]]
 * @param source The content of the file
 * @param path The path of the file
 * @param options The options
 *
 *
 * **example:**
 *
 * ```javascript
 *    ...
 *    additionalModuleHandlers: {
 *		'.json': (source, path, options) => JSON.parse(source),
 *	}
 *    ...
 * ```
 */
export interface ModuleHandler {
  (source: string, filename: string, context: Context): Promise<Module>
}

/**
 * Represents the content of the file or the content and the extension name.
 */
export type File = string | { content: string, extname: string };

export type CustomBlockCallback = (component: Module) => void;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Options = PartialBy<Context, "modules" | "babelPlugins" | "moduleHandlers" | "pathHandler">

export interface Context {
    /**
     * Called by the library when it needs a file.
     * @param path  The path of the file
     * @returns a Promise of the file content (UTF-8)
     *
     * **example:**
     * ```javascript
     *    ...
     *    async getFile(url) {
     *
     *		const res = await fetch(url);
     *		if ( !res.ok )
     *			throw Object.assign(new Error(url+' '+res.statusText), { res });
     *		return await res.text();
     *	},
     *    ...
     * ```
     */
    getFile(path: string): Promise<File>,

    /**
     * Called by the library when CSS style must be added in the HTML document.
     * @param style The CSS style chunk
     * @param scopeId The scope ID of the CSS style chunk
     * @return
     *
     * **example:**
     * ```javascript
     *    ...
     *    addStyle(styleStr) {
     *
     *		const style = document.createElement('style');
     *		style.textContent = styleStr;
     *		const ref = document.head.getElementsByTagName('style')[0] || null;
     *		document.head.insertBefore(style, ref);
     *	},
     *    ...
     * ```
     */
    addStyle(style: string, scopeId: string): void,

    /**
     * Initial cache that will contain resolved dependencies. All new modules go here.
     * `vue` must initially be contained in this object.
     * [[moduleCache]] is mandatory for the lib. If you do not provide it, the library will create one.
     * It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...).
     ​ *
     * See also [[options.loadModule]].
     *
     * **example:**
     * ```javascript
     *    ...
     *    moduleCache: Object.assign(Object.create(null), {
     *		vue: Vue,
     *	}),
     *    ...
     * ```
     *
     */
    modules: Record<string, Module>,

    /**
     * Additional babel plugins. [TBD]
     *
     *    ```javascript
     *        ...
     *        ...
     *    ```
     */
    babelPlugins: any[],

    /**
     * Additional module type handlers. see ModuleHandler
     *
     */
    moduleHandlers: Record<string, ModuleHandler>,

    /**
     * Path handler.
     *
     */
    pathHandler: PathHandler,

    /**
     * [[get]]() and [[set]]() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`).
     * Since compilation consume a lot of CPU, is is always a good idea to provide this object.
     *
     * **example:**
     *
     * In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place (usually 5MB).
     * Here we handle space limitation in a very basic way.
     * Maybe (not tested), the following libraries may help you to gain more space [pako](https://github.com/nodeca/pako), [lz-string](https://github.com/pieroxy/lz-string/)
     * ```javascript
     *    ...
     *    compiledCache: {
     *		set(key, str) {
     *
     *			// naive storage space management
     *			for (;;) {
     *
     *				try {
     *
     *					// doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage
     *					window.localStorage.setItem(key, str);
     *					break;
     *				} catch(ex) {
     *					// here we handle DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota
     *
     *					window.localStorage.removeItem(window.localStorage.key(0));
     *				}
     *			}
     *		},
     *		get(key) {
     *
     *			return window.localStorage.getItem(key);
     *		},
     *	},
     *    ...
     * ```
     */
    cache?: Cache,

    /**
     * Called by the library when there is something to log (eg. scripts compilation errors, template compilation errors, template compilation  tips, style compilation errors, ...)
     * @param type the type of the notification, it respects console property names (error, warn, info).
     * @param data the values to log
     * @return
     *
     * ```javascript
     *    ...
     *    log(type, ...args) {
     *
     *		console.log(type, ...args);
     *	},
     *    ...
     * ```
     */
    log?(type: string, ...data: any[]): void,

    /**
     * Called when the lib requires a module. Do return `undefined` to let the library handle this.
     * @param path  The path of the module.
     * @param options  The options object.
     * @returns A Promise of the module or undefined
     *
     * [[moduleCache]] and [[Options.loadModule]] are strongly related, in the sense that the result of [[options.loadModule]] is stored in [[moduleCache]].
     * However, [[options.loadModule]] is asynchronous and may help you to handle modules or components that are conditionally required (optional features, current languages, plugins, ...).
     * ```javascript
     *    ...
     *    loadModule(path, options) {
     *
     *		if ( path === 'vue' )
     *			return Vue;
     *		},
     *    ...
     * ```
     */
    loadModule?(path: string, options: Options): Promise<Module | undefined>,

    /**
     * Called for each custom block.
     * @returns A Promise of the module or undefined
     *
     * ```javascript
     *    ...
     *    customBlockHandler(block, filename, options) {
     *
     *		if ( block.type !== 'i18n' )
     *			 return;
     *
     *		return (component) => {
     *
     *			component.i18n = JSON.parse(block.content);
     *		}
     *	}
     *    ...
     * ```
     */
    customBlockHandler?(block: SFCBlock, filename: string, options: Options): Promise<CustomBlockCallback>,
}