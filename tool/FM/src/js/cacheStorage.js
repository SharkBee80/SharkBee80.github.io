/**
 * 如何使用？
1. 在 HTML 或 JS 文件中引入
import CacheManager from "./cacheStorage.js";

2. 预加载音频文件
CacheManager.preload("sound/null.wav");

3. 获取缓存中的音频 URL
CacheManager.get("sound/null.wav").then((url) => {
    const audio = document.getElementById("my-audio");
    audio.src = url;
});

4. 删除缓存
CacheManager.delete("sound/null.wav");

5. 清空所有缓存
CacheManager.clear();
 */
class CacheStorageManager {
    constructor(cacheName) {
        this.cacheName = cacheName;
    }

    // 预缓存资源
    async preload(url) {
        const cache = await caches.open(this.cacheName);
        const cachedResponse = await cache.match(url);

        if (!cachedResponse) {
            console.log(`[CacheStorage] 正在缓存: ${url}`);
            const response = await fetch(url);
            await cache.put(url, response.clone());
        } else {
            console.log(`[CacheStorage] 资源已存在: ${url}`);
        }
    }

    // 获取缓存中的资源 URL
    async get(url) {
        const cache = await caches.open(this.cacheName);
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            return URL.createObjectURL(blob);
        } else {
            console.warn(`[CacheStorage] 缓存未找到，直接返回原始 URL: ${url}`);
            return url;
        }
    }

    // 清除指定缓存资源
    async delete(url) {
        const cache = await caches.open(this.cacheName);
        const deleted = await cache.delete(url);
        if (deleted) {
            console.log(`[CacheStorage] 已删除缓存: ${url}`);
        } else {
            console.warn(`[CacheStorage] 资源未找到，无法删除: ${url}`);
        }
    }

    // 清空整个缓存
    async clear() {
        await caches.delete(this.cacheName);
        console.log(`[CacheStorage] 已清空缓存: ${this.cacheName}`);
    }
}

// 全局对象，方便调用
const CacheManager = new CacheStorageManager("my-cache");

// 导出模块（适用于 ES6 模块）
//export default CacheManager;
