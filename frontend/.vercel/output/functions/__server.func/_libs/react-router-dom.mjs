import { t as __commonJSMin } from "../_runtime.mjs";
import { n as require_development, t as require_dom_export } from "./react-router+set-cookie-parser.mjs";
//#region node_modules/react-router-dom/dist/index.js
/**
* react-router-dom v7.18.0
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
var require_dist = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var index_exports = {};
	__export(index_exports, {
		HydratedRouter: () => import_dom.HydratedRouter,
		RouterProvider: () => import_dom.RouterProvider
	});
	module.exports = __toCommonJS(index_exports);
	var import_dom = require_dom_export();
	__reExport(index_exports, require_development(), module.exports);
	0 && (module.exports = {
		HydratedRouter,
		RouterProvider,
		...require_development()
	});
}));
//#endregion
export { require_dist as t };
