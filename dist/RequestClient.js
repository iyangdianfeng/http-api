function params_analysis(url, p) {
    let url_path = url;
    if (p == undefined) {
        p = {};
    }
    const pathParams = {};
    for (const [key, value] of Object.entries(p)) {
        if (key.startsWith(":")) {
            url_path = url_path.replace(key, encodeURIComponent(String(value)));
        }
        else {
            pathParams[key] = value;
        }
    }
    return [url_path, pathParams];
}
function get_query_params(schema, params) {
    if (schema == undefined) {
        return "";
    }
    const search_params = schema.parse(params);
    return "?" + new URLSearchParams(search_params).toString();
}
export class RequestClient {
    async $post(req_data, search_params) {
        if (this.cfg.req_data) {
            const req_schema = this.cfg.req_data();
            try {
                req_schema.parse(req_data);
            }
            catch (error) {
                console.error(error);
                throw new Error("请求参数错误");
            }
        }
        const [url, search_params_data] = params_analysis(this.url, search_params);
        const query_params = get_query_params(this.cfg.search_params?.(), search_params_data);
        const res = await fetch(url + query_params, Object.assign({
            method: "POST",
            body: JSON.stringify(req_data),
        }, this.request_config));
        const data = await (async () => {
            const data = await res.text();
            try {
                return JSON.parse(data);
            }
            catch {
                throw new Error(data);
            }
        })();
        if (this.cfg.res_data) {
            const req_schema = this.cfg.res_data();
            return req_schema.parse(data);
        }
        return data;
    }
    async $get(search_params) {
        if (this.cfg.search_params) {
            const req_schema = this.cfg.search_params();
            try {
                req_schema.parse(search_params);
            }
            catch (error) {
                console.error(error);
                throw new Error("请求参数错误");
            }
        }
        const [url, search_params_data] = params_analysis(this.url, search_params);
        const query_params = get_query_params(this.cfg.search_params?.(), search_params_data);
        const res = await fetch(url + query_params, this.request_config);
        const data = await (async () => {
            const data = await res.text();
            try {
                return JSON.parse(data);
            }
            catch {
                throw new Error(data);
            }
        })();
        if (this.cfg.res_data) {
            const req_schema = this.cfg.res_data();
            return req_schema.parse(data);
        }
        return data;
    }
    async $request(...args) {
        const method = this.cfg.method ?? "GET";
        const client = new RequestClient();
        if (this.middleware?.beforeRequestInit) {
            this.middleware.beforeRequestInit({
                cfg: this.cfg,
                url: this.url,
            });
        }
        const data = await (async () => {
            switch (method) {
                case "GET":
                    return client.$get.apply(this, args);
                case "POST":
                    return client.$post.apply(this, args);
                default:
                    throw new Error(`method ${method} not support`);
            }
        })();
        if (this.middleware?.afterData) {
            return this.middleware.afterData({
                cfg: this.cfg,
                url: this.url,
                req_data: args[0],
            });
        }
        else {
            return data;
        }
    }
}
