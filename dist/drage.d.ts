/**
 * DrageJs - 跨平台拖拽库
 * 支持：浏览器 / 微信小程序 / Node.js / React Native
 */
export type DragePlatform = 'browser' | 'weixin' | 'node' | 'rn';
export type DrageStorageType = 'local' | 'session' | 'none';
export type DrageStorageOperation = 'get' | 'set' | 'remove';
export interface DrageStyle {
    [key: string]: string | number;
}
export interface DrageListenOptions {
    ref: HTMLElement | string | Record<string, any> | null;
    style?: DrageStyle;
    setStorage?: DrageStorageType;
    platform?: DragePlatform;
}
declare class DrageJs {
    [key: string]: any;
    ref: HTMLElement | string | Record<string, any> | null;
    platform: DragePlatform;
    draggingFlag: boolean;
    initX: number | undefined;
    initY: number | undefined;
    currentX: number;
    currentY: number;
    offsetX: number;
    offsetY: number;
    pageX: number | undefined;
    pageY: number | undefined;
    style: DrageStyle;
    setStorage: DrageStorageType;
    animationFrame: number | null;
    clientW: number;
    clientH: number;
    _wxBindEvents: Record<string, (event: any) => void> | null;
    constructor();
    /**
     * 检测运行平台
     */
    _detectPlatform(): void;
    /**
     * 初始化平台适配器
     */
    _initAdapter(): void;
    _initBrowser(): void;
    _initWeixin(): void;
    _initNode(): void;
    _initRN(): void;
    _getStorage(type: any): {
        get: any;
        set: any;
        remove: any;
    };
    storageHandle(operation: DrageStorageOperation): void;
    resetPosition(): void;
    /**
     * 启用拖拽
     * @param {Object} options
     * @param {HTMLElement|String|Function} options.ref - 浏览器: HTMLElement / 小程序: 选择器字符串 / RN: ref 回调
     * @param {Object} [options.style={}] - 自定义样式
     * @param {String} [options.setStorage='local'] - 'local' | 'session' | 'none'
     * @param {String} [options.platform] - 强制指定平台: 'browser' | 'weixin' | 'node' | 'rn'
     */
    listen({ ref, style, setStorage, platform }: DrageListenOptions): void;
    /**
     * 移除拖拽监听
     * @param {HTMLElement|String|Function} [ref]
     */
    removeListen(ref?: DrageListenOptions['ref']): void;
    setRef(): void;
    _listenBrowser(ref: any): void;
    _removeBrowser(ref: any): void;
    _listenWeixin(selector: any): void;
    _removeWeixin(ref?: DrageListenOptions['ref']): void;
    _listenNode(ref: any): void;
    _listenRN(ref: any): void;
    _removeRN(ref?: DrageListenOptions['ref']): void;
    onStart(event: any): void;
    onMove(event: any): void;
    onEnd(event: any): void;
}
declare const Drage: DrageJs;
export default Drage;
