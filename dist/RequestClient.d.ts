import { z, type ZodType } from "zod";
type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export interface RequestCfg {
    method?: RequestMethod;
    name?: string;
    path?: string;
    headers?: Record<string, string>;
    search_params?: () => ZodType;
    req_data?: () => ZodType;
    res_data?: () => ZodType;
    res_error?: () => RequestCfg["res_data"];
}
export interface Middleware {
    beforeRequestInit?: (req: {
        url: string;
        cfg: RequestCfg;
    }) => RequestInit;
    afterData?: (cfg: {
        url: string;
        cfg: RequestCfg;
        req_data: any;
    }) => any;
}
export declare class RequestClient<Cfg extends RequestCfg> {
    private cfg;
    private url;
    private request_config;
    private middleware;
    $post(req_data?: z.infer<ReturnType<NonNullable<Cfg["req_data"]>>>, search_params?: z.infer<ReturnType<NonNullable<Cfg["search_params"]>>>): Promise<z.infer<ReturnType<NonNullable<Cfg["res_data"]>>>>;
    $get(search_params?: z.infer<ReturnType<NonNullable<Cfg["search_params"]>>>): Promise<z.infer<ReturnType<NonNullable<Cfg["res_data"]>>>>;
    $request(...args: any): Promise<any>;
}
export {};
