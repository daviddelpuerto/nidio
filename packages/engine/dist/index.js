"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @packageDocumentation
 * Public API for @nidio/engine:
 * - AppFactory / AppServer
 * - DI Container
 * - Logger facade (+ types)
 * - Adapter TYPES only (no concrete adapters/middlewares)
 */
__exportStar(require("./AppFactory"), exports);
__exportStar(require("./AppServer"), exports);
__exportStar(require("./di/Container"), exports);
__exportStar(require("./logger"), exports); // Logger + types
// Adapter *types* only (HttpAdapter, FrameworkRequest/Response, etc.)
__exportStar(require("./http/adapters/HttpAdapter"), exports);
//# sourceMappingURL=index.js.map