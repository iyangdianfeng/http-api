import { RequestClient, } from "./RequestClient";
export function DefApi(c) {
    return c;
}
export function BuildApi(c) {
    const requestClient = new RequestClient();
    const baseUrl = c.url ?? "";
    const newProxy = (o) => {
        return new Proxy(o, {
            get: (...args) => {
                const key = args[1];
                if (typeof key === "symbol") {
                    throw new Error("not support symbol");
                }
                return handle(o, key);
            },
            apply: (...data) => {
                const args = data[2];
                return o.apply(undefined, args);
            },
        });
    };
    const handle = (action, key) => {
        if (action.children != undefined) {
            if (action.children != undefined) {
                if (action.children[key] != undefined) {
                    const apiCfg = action.children[key];
                    const apiCfgChildren = apiCfg?.children;
                    return newAction([...(action.paths ?? [])], apiCfg?.name ?? key, apiCfg, apiCfgChildren);
                }
            }
        }
        if (action.apiCfg != undefined) {
            return async (...args) => {
                const func = requestClient[key];
                return await func.apply({
                    cfg: action.apiCfg,
                    url: baseUrl + (action.apiCfg?.path ?? action.paths?.join("/")),
                }, args);
            };
        }
        throw new Error("api is not defined");
    };
    const newAction = (paths, path, apiCfg, children) => {
        const func = (...args) => requestClient.$request.apply({
            cfg: apiCfg,
            url: c.url + (apiCfg?.path ?? paths?.join("/")),
            matchMedia: c.middleware,
        }, args);
        paths.push(path);
        func.paths = paths;
        func.children = children;
        func.apiCfg = apiCfg;
        return newProxy(func);
    };
    return newAction([], "", undefined, c.api);
}
// 获取对应的配置
// 转换配置成函数
// 在函数中找到对应的配置并转换成函数
// 处理调用
