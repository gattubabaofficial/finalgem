/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/ledger/route";
exports.ids = ["app/api/ledger/route"];
exports.modules = {

/***/ "(rsc)/./app/api/ledger/route.ts":
/*!*********************************!*\
  !*** ./app/api/ledger/route.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var _lib_auth_getContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth/getContext */ \"(rsc)/./lib/auth/getContext.ts\");\n\n\n\nasync function GET(req) {\n    try {\n        const { searchParams } = new URL(req.url);\n        const productId = searchParams.get(\"productId\");\n        const refType = searchParams.get(\"transactionType\");\n        const page = parseInt(searchParams.get(\"page\") || \"1\");\n        const limit = parseInt(searchParams.get(\"limit\") || \"50\");\n        const { organizationId } = await (0,_lib_auth_getContext__WEBPACK_IMPORTED_MODULE_2__.getTenantContext)();\n        const where = {\n            organizationId\n        };\n        if (productId) where.productId = productId;\n        if (refType) where.transactionType = refType;\n        const [entries, total] = await Promise.all([\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.stockLedger.findMany({\n                where,\n                include: {\n                    product: true\n                },\n                orderBy: {\n                    createdAt: \"desc\"\n                },\n                skip: (page - 1) * limit,\n                take: limit\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.stockLedger.count({\n                where\n            })\n        ]);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            entries,\n            total,\n            page,\n            limit\n        });\n    } catch (e) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to fetch ledger\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2xlZGdlci9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQXdEO0FBQ2xCO0FBQ21CO0FBRWxELGVBQWVHLElBQUlDLEdBQWdCO0lBQ3hDLElBQUk7UUFDRixNQUFNLEVBQUVDLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUlGLElBQUlHLEdBQUc7UUFDeEMsTUFBTUMsWUFBWUgsYUFBYUksR0FBRyxDQUFDO1FBQ25DLE1BQU1DLFVBQVVMLGFBQWFJLEdBQUcsQ0FBQztRQUNqQyxNQUFNRSxPQUFPQyxTQUFTUCxhQUFhSSxHQUFHLENBQUMsV0FBVztRQUNsRCxNQUFNSSxRQUFRRCxTQUFTUCxhQUFhSSxHQUFHLENBQUMsWUFBWTtRQUVwRCxNQUFNLEVBQUVLLGNBQWMsRUFBRSxHQUFHLE1BQU1aLHNFQUFnQkE7UUFDakQsTUFBTWEsUUFBYTtZQUFFRDtRQUFlO1FBRXBDLElBQUlOLFdBQVdPLE1BQU1QLFNBQVMsR0FBR0E7UUFDakMsSUFBSUUsU0FBU0ssTUFBTUMsZUFBZSxHQUFHTjtRQUVyQyxNQUFNLENBQUNPLFNBQVNDLE1BQU0sR0FBRyxNQUFNQyxRQUFRQyxHQUFHLENBQUM7WUFDekNuQiwrQ0FBTUEsQ0FBQ29CLFdBQVcsQ0FBQ0MsUUFBUSxDQUFDO2dCQUMxQlA7Z0JBQ0FRLFNBQVM7b0JBQ1BDLFNBQVM7Z0JBQ1g7Z0JBQ0FDLFNBQVM7b0JBQUVDLFdBQVc7Z0JBQU87Z0JBQzdCQyxNQUFNLENBQUNoQixPQUFPLEtBQUtFO2dCQUNuQmUsTUFBTWY7WUFDUjtZQUNBWiwrQ0FBTUEsQ0FBQ29CLFdBQVcsQ0FBQ1EsS0FBSyxDQUFDO2dCQUFFZDtZQUFNO1NBQ2xDO1FBRUQsT0FBT2YscURBQVlBLENBQUM4QixJQUFJLENBQUM7WUFBRWI7WUFBU0M7WUFBT1A7WUFBTUU7UUFBTTtJQUN6RCxFQUFFLE9BQU9rQixHQUFHO1FBQ1YsT0FBTy9CLHFEQUFZQSxDQUFDOEIsSUFBSSxDQUFDO1lBQUVFLE9BQU87UUFBeUIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDOUU7QUFDRiIsInNvdXJjZXMiOlsiRDpcXE5ldyBmb2xkZXJcXGdlbXMtc3RvbmUtbWFuYWdlbWVudFxcYXBwXFxhcGlcXGxlZGdlclxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tIFwiQC9saWIvcHJpc21hXCI7XHJcbmltcG9ydCB7IGdldFRlbmFudENvbnRleHQgfSBmcm9tIFwiQC9saWIvYXV0aC9nZXRDb250ZXh0XCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcTogTmV4dFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxLnVybCk7XHJcbiAgICBjb25zdCBwcm9kdWN0SWQgPSBzZWFyY2hQYXJhbXMuZ2V0KFwicHJvZHVjdElkXCIpO1xyXG4gICAgY29uc3QgcmVmVHlwZSA9IHNlYXJjaFBhcmFtcy5nZXQoXCJ0cmFuc2FjdGlvblR5cGVcIik7XHJcbiAgICBjb25zdCBwYWdlID0gcGFyc2VJbnQoc2VhcmNoUGFyYW1zLmdldChcInBhZ2VcIikgfHwgXCIxXCIpO1xyXG4gICAgY29uc3QgbGltaXQgPSBwYXJzZUludChzZWFyY2hQYXJhbXMuZ2V0KFwibGltaXRcIikgfHwgXCI1MFwiKTtcclxuXHJcbiAgICBjb25zdCB7IG9yZ2FuaXphdGlvbklkIH0gPSBhd2FpdCBnZXRUZW5hbnRDb250ZXh0KCk7XHJcbiAgICBjb25zdCB3aGVyZTogYW55ID0geyBvcmdhbml6YXRpb25JZCB9O1xyXG5cclxuICAgIGlmIChwcm9kdWN0SWQpIHdoZXJlLnByb2R1Y3RJZCA9IHByb2R1Y3RJZDtcclxuICAgIGlmIChyZWZUeXBlKSB3aGVyZS50cmFuc2FjdGlvblR5cGUgPSByZWZUeXBlO1xyXG5cclxuICAgIGNvbnN0IFtlbnRyaWVzLCB0b3RhbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgIHByaXNtYS5zdG9ja0xlZGdlci5maW5kTWFueSh7XHJcbiAgICAgICAgd2hlcmUsXHJcbiAgICAgICAgaW5jbHVkZToge1xyXG4gICAgICAgICAgcHJvZHVjdDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yZGVyQnk6IHsgY3JlYXRlZEF0OiBcImRlc2NcIiB9LFxyXG4gICAgICAgIHNraXA6IChwYWdlIC0gMSkgKiBsaW1pdCxcclxuICAgICAgICB0YWtlOiBsaW1pdCxcclxuICAgICAgfSksXHJcbiAgICAgIHByaXNtYS5zdG9ja0xlZGdlci5jb3VudCh7IHdoZXJlIH0pLFxyXG4gICAgXSk7XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZW50cmllcywgdG90YWwsIHBhZ2UsIGxpbWl0IH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBsZWRnZXJcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG5cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInByaXNtYSIsImdldFRlbmFudENvbnRleHQiLCJHRVQiLCJyZXEiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJwcm9kdWN0SWQiLCJnZXQiLCJyZWZUeXBlIiwicGFnZSIsInBhcnNlSW50IiwibGltaXQiLCJvcmdhbml6YXRpb25JZCIsIndoZXJlIiwidHJhbnNhY3Rpb25UeXBlIiwiZW50cmllcyIsInRvdGFsIiwiUHJvbWlzZSIsImFsbCIsInN0b2NrTGVkZ2VyIiwiZmluZE1hbnkiLCJpbmNsdWRlIiwicHJvZHVjdCIsIm9yZGVyQnkiLCJjcmVhdGVkQXQiLCJza2lwIiwidGFrZSIsImNvdW50IiwianNvbiIsImUiLCJlcnJvciIsInN0YXR1cyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/ledger/route.ts\n");

/***/ }),

/***/ "(rsc)/./auth.config.ts":
/*!************************!*\
  !*** ./auth.config.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authConfig: () => (/* binding */ authConfig)\n/* harmony export */ });\nconst authConfig = {\n    providers: [],\n    pages: {\n        signIn: \"/login\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.id = user.id;\n                token.organizationId = user.organizationId;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.role = token.role;\n                session.user.id = token.id;\n                session.user.organizationId = token.organizationId;\n            }\n            return session;\n        }\n    },\n    session: {\n        strategy: \"jwt\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hdXRoLmNvbmZpZy50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRU8sTUFBTUEsYUFBYTtJQUN4QkMsV0FBVyxFQUFFO0lBQ2JDLE9BQU87UUFDTEMsUUFBUTtJQUNWO0lBQ0FDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUE2QjtZQUNsRCxJQUFJQSxNQUFNO2dCQUNSRCxNQUFNRSxJQUFJLEdBQUcsS0FBY0EsSUFBSTtnQkFDL0JGLE1BQU1HLEVBQUUsR0FBR0YsS0FBS0UsRUFBRTtnQkFDbEJILE1BQU1JLGNBQWMsR0FBRyxLQUFjQSxjQUFjO1lBQ3JEO1lBQ0EsT0FBT0o7UUFDVDtRQUNBLE1BQU1LLFNBQVEsRUFBRUEsT0FBTyxFQUFFTCxLQUFLLEVBQWdDO1lBQzVELElBQUlLLFFBQVFKLElBQUksRUFBRTtnQkFDZkksUUFBUUosSUFBSSxDQUFTQyxJQUFJLEdBQUdGLE1BQU1FLElBQUk7Z0JBQ3RDRyxRQUFRSixJQUFJLENBQVNFLEVBQUUsR0FBR0gsTUFBTUcsRUFBRTtnQkFDbENFLFFBQVFKLElBQUksQ0FBU0csY0FBYyxHQUFHSixNQUFNSSxjQUFjO1lBQzdEO1lBQ0EsT0FBT0M7UUFDVDtJQUNGO0lBQ0FBLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0FBQ0YsRUFBMkIiLCJzb3VyY2VzIjpbIkQ6XFxOZXcgZm9sZGVyXFxnZW1zLXN0b25lLW1hbmFnZW1lbnRcXGF1dGguY29uZmlnLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTmV4dEF1dGhDb25maWcgfSBmcm9tIFwibmV4dC1hdXRoXCI7XHJcblxyXG5leHBvcnQgY29uc3QgYXV0aENvbmZpZyA9IHtcclxuICBwcm92aWRlcnM6IFtdLFxyXG4gIHBhZ2VzOiB7XHJcbiAgICBzaWduSW46IFwiL2xvZ2luXCIsXHJcbiAgfSxcclxuICBjYWxsYmFja3M6IHtcclxuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH06IHsgdG9rZW46IGFueSwgdXNlcjogYW55IH0pIHtcclxuICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICB0b2tlbi5yb2xlID0gKHVzZXIgYXMgYW55KS5yb2xlO1xyXG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZDtcclxuICAgICAgICB0b2tlbi5vcmdhbml6YXRpb25JZCA9ICh1c2VyIGFzIGFueSkub3JnYW5pemF0aW9uSWQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9OiB7IHNlc3Npb246IGFueSwgdG9rZW46IGFueSB9KSB7XHJcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcclxuICAgICAgICAoc2Vzc2lvbi51c2VyIGFzIGFueSkucm9sZSA9IHRva2VuLnJvbGU7XHJcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLmlkID0gdG9rZW4uaWQ7XHJcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLm9yZ2FuaXphdGlvbklkID0gdG9rZW4ub3JnYW5pemF0aW9uSWQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlc3Npb247XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgc2Vzc2lvbjoge1xyXG4gICAgc3RyYXRlZ3k6IFwiand0XCIsXHJcbiAgfSxcclxufSBzYXRpc2ZpZXMgTmV4dEF1dGhDb25maWc7XHJcbiJdLCJuYW1lcyI6WyJhdXRoQ29uZmlnIiwicHJvdmlkZXJzIiwicGFnZXMiLCJzaWduSW4iLCJjYWxsYmFja3MiLCJqd3QiLCJ0b2tlbiIsInVzZXIiLCJyb2xlIiwiaWQiLCJvcmdhbml6YXRpb25JZCIsInNlc3Npb24iLCJzdHJhdGVneSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./auth.config.ts\n");

/***/ }),

/***/ "(rsc)/./auth.ts":
/*!*****************!*\
  !*** ./auth.ts ***!
  \*****************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   handlers: () => (/* binding */ handlers)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _auth_config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./auth.config */ \"(rsc)/./auth.config.ts\");\n\n\n\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_2__.PrismaClient();\nconst { handlers, auth } = (0,next_auth__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n    ..._auth_config__WEBPACK_IMPORTED_MODULE_4__.authConfig,\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                const user = await prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user) return null;\n                const isValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_3___default().compare(credentials.password, user.password);\n                if (!isValid) return null;\n                return {\n                    id: user.id,\n                    name: user.name,\n                    email: user.email,\n                    role: user.role,\n                    organizationId: user.organizationId\n                };\n            }\n        })\n    ]\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hdXRoLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFpQztBQUN5QjtBQUNaO0FBQ2hCO0FBQ2E7QUFFM0MsTUFBTUssU0FBUyxJQUFJSCx3REFBWUE7QUFFeEIsTUFBTSxFQUFFSSxRQUFRLEVBQUVDLElBQUksRUFBRSxHQUFHUCxxREFBUUEsQ0FBQztJQUN6QyxHQUFHSSxvREFBVTtJQUNiSSxXQUFXO1FBQ1RQLDJFQUFXQSxDQUFDO1lBQ1ZRLE1BQU07WUFDTkMsYUFBYTtnQkFDWEMsT0FBTztvQkFBRUMsT0FBTztvQkFBU0MsTUFBTTtnQkFBUTtnQkFDdkNDLFVBQVU7b0JBQUVGLE9BQU87b0JBQVlDLE1BQU07Z0JBQVc7WUFDbEQ7WUFDQSxNQUFNRSxXQUFVTCxXQUFnQjtnQkFDOUIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVUsT0FBTztnQkFFMUQsTUFBTUUsT0FBTyxNQUFNWCxPQUFPVyxJQUFJLENBQUNDLFVBQVUsQ0FBQztvQkFDeENDLE9BQU87d0JBQUVQLE9BQU9ELFlBQVlDLEtBQUs7b0JBQVc7Z0JBQzlDO2dCQUVBLElBQUksQ0FBQ0ssTUFBTSxPQUFPO2dCQUVsQixNQUFNRyxVQUFVLE1BQU1oQix1REFBYyxDQUNsQ08sWUFBWUksUUFBUSxFQUNwQkUsS0FBS0YsUUFBUTtnQkFHZixJQUFJLENBQUNLLFNBQVMsT0FBTztnQkFFckIsT0FBTztvQkFDTEUsSUFBSUwsS0FBS0ssRUFBRTtvQkFDWFosTUFBTU8sS0FBS1AsSUFBSTtvQkFDZkUsT0FBT0ssS0FBS0wsS0FBSztvQkFDakJXLE1BQU1OLEtBQUtNLElBQUk7b0JBQ2ZDLGdCQUFnQlAsS0FBS08sY0FBYztnQkFDckM7WUFDRjtRQUNGO0tBQ0Q7QUFDSCxHQUFHIiwic291cmNlcyI6WyJEOlxcTmV3IGZvbGRlclxcZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50XFxhdXRoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tIFwibmV4dC1hdXRoXCI7XHJcbmltcG9ydCBDcmVkZW50aWFscyBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xyXG5pbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcclxuaW1wb3J0IGJjcnlwdCBmcm9tIFwiYmNyeXB0anNcIjtcclxuaW1wb3J0IHsgYXV0aENvbmZpZyB9IGZyb20gXCIuL2F1dGguY29uZmlnXCI7XHJcblxyXG5jb25zdCBwcmlzbWEgPSBuZXcgUHJpc21hQ2xpZW50KCk7XHJcblxyXG5leHBvcnQgY29uc3QgeyBoYW5kbGVycywgYXV0aCB9ID0gTmV4dEF1dGgoe1xyXG4gIC4uLmF1dGhDb25maWcsXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICBDcmVkZW50aWFscyh7XHJcbiAgICAgIG5hbWU6IFwiY3JlZGVudGlhbHNcIixcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcclxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJQYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfSxcclxuICAgICAgfSxcclxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzOiBhbnkpIHtcclxuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xyXG4gICAgICAgICAgd2hlcmU6IHsgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsIGFzIHN0cmluZyB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIXVzZXIpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICBjb25zdCBpc1ZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoXHJcbiAgICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZCBhcyBzdHJpbmcsXHJcbiAgICAgICAgICB1c2VyLnBhc3N3b3JkXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFpc1ZhbGlkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGlkOiB1c2VyLmlkLFxyXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxyXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXHJcbiAgICAgICAgICByb2xlOiB1c2VyLnJvbGUsXHJcbiAgICAgICAgICBvcmdhbml6YXRpb25JZDogdXNlci5vcmdhbml6YXRpb25JZCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxufSk7XHJcbiJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIkNyZWRlbnRpYWxzIiwiUHJpc21hQ2xpZW50IiwiYmNyeXB0IiwiYXV0aENvbmZpZyIsInByaXNtYSIsImhhbmRsZXJzIiwiYXV0aCIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwiaXNWYWxpZCIsImNvbXBhcmUiLCJpZCIsInJvbGUiLCJvcmdhbml6YXRpb25JZCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth/getContext.ts":
/*!********************************!*\
  !*** ./lib/auth/getContext.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getTenantContext: () => (/* binding */ getTenantContext)\n/* harmony export */ });\n/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/auth */ \"(rsc)/./auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\nasync function getTenantContext() {\n    const session = await (0,_auth__WEBPACK_IMPORTED_MODULE_0__.auth)();\n    const sessionUser = session?.user;\n    if (!sessionUser?.email) {\n        throw new Error(\"Unauthorized: Please log in again\");\n    }\n    // Fetch the latest user data from DB to get the current organizationId\n    // This avoids issues with stale session tokens after database resets/reseeds\n    const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_1__.prisma.user.findUnique({\n        where: {\n            email: sessionUser.email\n        },\n        select: {\n            id: true,\n            organizationId: true,\n            role: true\n        }\n    });\n    if (!user) {\n        throw new Error(\"Unauthorized: User not found in database\");\n    }\n    if (!user.organizationId && user.role !== \"SUPERADMIN\") {\n        throw new Error(\"Unauthorized: Your account is not associated with any organization\");\n    }\n    return {\n        userId: user.id,\n        organizationId: user.organizationId,\n        role: user.role\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC9nZXRDb250ZXh0LnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QjtBQUNRO0FBRS9CLGVBQWVFO0lBQ3BCLE1BQU1DLFVBQVUsTUFBTUgsMkNBQUlBO0lBQzFCLE1BQU1JLGNBQWNELFNBQVNFO0lBRTdCLElBQUksQ0FBQ0QsYUFBYUUsT0FBTztRQUN2QixNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFFQSx1RUFBdUU7SUFDdkUsNkVBQTZFO0lBQzdFLE1BQU1GLE9BQU8sTUFBTUosK0NBQU1BLENBQUNJLElBQUksQ0FBQ0csVUFBVSxDQUFDO1FBQ3hDQyxPQUFPO1lBQUVILE9BQU9GLFlBQVlFLEtBQUs7UUFBQztRQUNsQ0ksUUFBUTtZQUFFQyxJQUFJO1lBQU1DLGdCQUFnQjtZQUFNQyxNQUFNO1FBQUs7SUFDdkQ7SUFFQSxJQUFJLENBQUNSLE1BQU07UUFDVCxNQUFNLElBQUlFLE1BQU07SUFDbEI7SUFFQSxJQUFJLENBQUNGLEtBQUtPLGNBQWMsSUFBSVAsS0FBS1EsSUFBSSxLQUFLLGNBQWM7UUFDdEQsTUFBTSxJQUFJTixNQUFNO0lBQ2xCO0lBRUEsT0FBTztRQUNMTyxRQUFRVCxLQUFLTSxFQUFFO1FBQ2ZDLGdCQUFnQlAsS0FBS08sY0FBYztRQUNuQ0MsTUFBTVIsS0FBS1EsSUFBSTtJQUNqQjtBQUNGIiwic291cmNlcyI6WyJEOlxcTmV3IGZvbGRlclxcZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50XFxsaWJcXGF1dGhcXGdldENvbnRleHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXV0aCB9IGZyb20gXCJAL2F1dGhcIjtcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRlbmFudENvbnRleHQoKSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGF1dGgoKTtcclxuICBjb25zdCBzZXNzaW9uVXNlciA9IHNlc3Npb24/LnVzZXIgYXMgYW55O1xyXG5cclxuICBpZiAoIXNlc3Npb25Vc2VyPy5lbWFpbCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hdXRob3JpemVkOiBQbGVhc2UgbG9nIGluIGFnYWluXCIpO1xyXG4gIH1cclxuXHJcbiAgLy8gRmV0Y2ggdGhlIGxhdGVzdCB1c2VyIGRhdGEgZnJvbSBEQiB0byBnZXQgdGhlIGN1cnJlbnQgb3JnYW5pemF0aW9uSWRcclxuICAvLyBUaGlzIGF2b2lkcyBpc3N1ZXMgd2l0aCBzdGFsZSBzZXNzaW9uIHRva2VucyBhZnRlciBkYXRhYmFzZSByZXNldHMvcmVzZWVkc1xyXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcclxuICAgIHdoZXJlOiB7IGVtYWlsOiBzZXNzaW9uVXNlci5lbWFpbCB9LFxyXG4gICAgc2VsZWN0OiB7IGlkOiB0cnVlLCBvcmdhbml6YXRpb25JZDogdHJ1ZSwgcm9sZTogdHJ1ZSB9XHJcbiAgfSk7XHJcblxyXG4gIGlmICghdXNlcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hdXRob3JpemVkOiBVc2VyIG5vdCBmb3VuZCBpbiBkYXRhYmFzZVwiKTtcclxuICB9XHJcblxyXG4gIGlmICghdXNlci5vcmdhbml6YXRpb25JZCAmJiB1c2VyLnJvbGUgIT09IFwiU1VQRVJBRE1JTlwiKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmF1dGhvcml6ZWQ6IFlvdXIgYWNjb3VudCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGFueSBvcmdhbml6YXRpb25cIik7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgdXNlcklkOiB1c2VyLmlkLFxyXG4gICAgb3JnYW5pemF0aW9uSWQ6IHVzZXIub3JnYW5pemF0aW9uSWQgYXMgc3RyaW5nLFxyXG4gICAgcm9sZTogdXNlci5yb2xlLFxyXG4gIH07XHJcbn1cclxuIl0sIm5hbWVzIjpbImF1dGgiLCJwcmlzbWEiLCJnZXRUZW5hbnRDb250ZXh0Iiwic2Vzc2lvbiIsInNlc3Npb25Vc2VyIiwidXNlciIsImVtYWlsIiwiRXJyb3IiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJzZWxlY3QiLCJpZCIsIm9yZ2FuaXphdGlvbklkIiwicm9sZSIsInVzZXJJZCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth/getContext.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log: [\n        \"query\"\n    ]\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQ1hGLGdCQUFnQkUsTUFBTSxJQUN0QixJQUFJSCx3REFBWUEsQ0FBQztJQUNmSSxLQUFLO1FBQUM7S0FBUTtBQUNoQixHQUFHO0FBRUwsSUFBSUMsSUFBcUMsRUFBRUosZ0JBQWdCRSxNQUFNLEdBQUdBIiwic291cmNlcyI6WyJEOlxcTmV3IGZvbGRlclxcZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50XFxsaWJcXHByaXNtYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcclxuXHJcbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7XHJcbiAgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcHJpc21hID1cclxuICBnbG9iYWxGb3JQcmlzbWEucHJpc21hID8/XHJcbiAgbmV3IFByaXNtYUNsaWVudCh7XHJcbiAgICBsb2c6IFtcInF1ZXJ5XCJdLFxyXG4gIH0pO1xyXG5cclxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYTtcclxuIl0sIm5hbWVzIjpbIlByaXNtYUNsaWVudCIsImdsb2JhbEZvclByaXNtYSIsImdsb2JhbFRoaXMiLCJwcmlzbWEiLCJsb2ciLCJwcm9jZXNzIiwiZW52IiwiTk9ERV9FTlYiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fledger%2Froute&page=%2Fapi%2Fledger%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fledger%2Froute.ts&appDir=D%3A%5CNew%20folder%5Cgems-stone-management%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CNew%20folder%5Cgems-stone-management&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fledger%2Froute&page=%2Fapi%2Fledger%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fledger%2Froute.ts&appDir=D%3A%5CNew%20folder%5Cgems-stone-management%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CNew%20folder%5Cgems-stone-management&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_New_folder_gems_stone_management_app_api_ledger_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/ledger/route.ts */ \"(rsc)/./app/api/ledger/route.ts\");\n\r\n\r\n\r\n\r\n// We inject the nextConfigOutput here so that we can use them in the route\r\n// module.\r\nconst nextConfigOutput = \"\"\r\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\r\n    definition: {\r\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\r\n        page: \"/api/ledger/route\",\r\n        pathname: \"/api/ledger\",\r\n        filename: \"route\",\r\n        bundlePath: \"app/api/ledger/route\"\r\n    },\r\n    resolvedPagePath: \"D:\\\\New folder\\\\gems-stone-management\\\\app\\\\api\\\\ledger\\\\route.ts\",\r\n    nextConfigOutput,\r\n    userland: D_New_folder_gems_stone_management_app_api_ledger_route_ts__WEBPACK_IMPORTED_MODULE_3__\r\n});\r\n// Pull out the exports that we need to expose from the module. This should\r\n// be eliminated when we've moved the other routes to the new format. These\r\n// are used to hook into the route.\r\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\r\nfunction patchFetch() {\r\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\r\n        workAsyncStorage,\r\n        workUnitAsyncStorage\r\n    });\r\n}\r\n\r\n\r\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZsZWRnZXIlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmxlZGdlciUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmxlZGdlciUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDTmV3JTIwZm9sZGVyJTVDZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50JTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1EJTNBJTVDTmV3JTIwZm9sZGVyJTVDZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50JmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUNpQjtBQUM5RjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjtBQUMxRjtBQUNBIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xyXG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XHJcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcclxuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXE5ldyBmb2xkZXJcXFxcZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50XFxcXGFwcFxcXFxhcGlcXFxcbGVkZ2VyXFxcXHJvdXRlLnRzXCI7XHJcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxyXG4vLyBtb2R1bGUuXHJcbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXHJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xyXG4gICAgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXHJcbiAgICAgICAgcGFnZTogXCIvYXBpL2xlZGdlci9yb3V0ZVwiLFxyXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvbGVkZ2VyXCIsXHJcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcclxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvbGVkZ2VyL3JvdXRlXCJcclxuICAgIH0sXHJcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXE5ldyBmb2xkZXJcXFxcZ2Vtcy1zdG9uZS1tYW5hZ2VtZW50XFxcXGFwcFxcXFxhcGlcXFxcbGVkZ2VyXFxcXHJvdXRlLnRzXCIsXHJcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxyXG4gICAgdXNlcmxhbmRcclxufSk7XHJcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxyXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2VcclxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cclxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xyXG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xyXG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcclxuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxyXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcclxuXHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fledger%2Froute&page=%2Fapi%2Fledger%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fledger%2Froute.ts&appDir=D%3A%5CNew%20folder%5Cgems-stone-management%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CNew%20folder%5Cgems-stone-management&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/jose","vendor-chunks/oauth4webapi","vendor-chunks/bcryptjs","vendor-chunks/preact","vendor-chunks/preact-render-to-string","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fledger%2Froute&page=%2Fapi%2Fledger%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fledger%2Froute.ts&appDir=D%3A%5CNew%20folder%5Cgems-stone-management%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CNew%20folder%5Cgems-stone-management&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();