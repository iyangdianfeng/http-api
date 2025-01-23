import { RequestClient, type Middleware, type RequestCfg } from "./RequestClient";
type ApiCfgItem = RequestCfg | (() => Promise<RequestCfg>);
type CfgData<C> = {
    [P in keyof C]: (C[P] extends RequestCfg ? C[P]["method"] extends "GET" ? InstanceType<typeof RequestClient<C[P] extends RequestCfg ? C[P] : never>>["$get"] : InstanceType<typeof RequestClient<C[P] extends RequestCfg ? C[P] : never>>["$post"] : (...args: any[]) => Promise<void>) & InstanceType<typeof RequestClient<C[P] extends RequestCfg ? C[P] : never>> & (C[P] extends {
        children: infer U;
    } ? CfgData<U> : object);
};
export declare function DefApi<T extends {
    [P in K]: ApiCfgItem & {
        children?: C;
    };
}, K extends keyof T, C>(c: T): T;
type BuildApiCfg<T> = {
    url?: string;
    api: T;
    middleware?: Middleware;
};
export declare function BuildApi<T>(c: BuildApiCfg<T>): CfgData<T> & (() => void);
export {};
