import {
  RequestClient,
  type Middleware,
  type RequestCfg,
} from "./RequestClient";

type ApiCfgItem = RequestCfg | (() => Promise<RequestCfg>);

type ApiCfgChildrenCfg = RequestCfg & { children?: ApiCfgChildren };
type ApiCfgChildren = Record<string, ApiCfgChildrenCfg>;

type CfgData<C> = {
  [P in keyof C]: (C[P] extends RequestCfg
    ? C[P]["method"] extends "GET"
      ? InstanceType<
          typeof RequestClient<C[P] extends RequestCfg ? C[P] : never>
        >["$get"]
      : InstanceType<
          typeof RequestClient<C[P] extends RequestCfg ? C[P] : never>
        >["$post"]
    : (...args: any[]) => Promise<void>) &
    InstanceType<typeof RequestClient<C[P] extends RequestCfg ? C[P] : never>> &
    (C[P] extends { children: infer U } ? CfgData<U> : object);
};

interface Action {
  (option: any): any;

  paths?: string[];

  children?: ApiCfgChildren;

  apiCfg?: RequestCfg;
}

export function DefApi<
  T extends { [P in K]: ApiCfgItem & { children?: C } },
  K extends keyof T,
  C
>(c: T): T {
  return c;
}

type BuildApiCfg<T> = {
  url?: string;
  api: T;

  middleware?: Middleware;
};

export function BuildApi<T>(c: BuildApiCfg<T>): CfgData<T> & (() => void) {
  const requestClient = new RequestClient();
  const baseUrl = c.url ?? "";

  const newProxy = (o: Action): any => {
    return new Proxy(o, {
      get: (...args) => {
        const key = args[1];
        if (typeof key === "symbol") {
          throw new Error("not support symbol");
        }

        return handle(o as any, key);
      },
      apply: (...data) => {
        const args = data[2] as any;

        return o.apply(undefined, args);
      },
    });
  };

  const handle = (action: Action, key: string) => {
    if (action.children != undefined) {
      if (action.children != undefined) {
        if (action.children[key] != undefined) {
          const apiCfg = action.children[key];
          const apiCfgChildren = apiCfg?.children;

          return newAction(
            [...(action.paths ?? [])],
            apiCfg?.name ?? key,
            apiCfg,
            apiCfgChildren
          );
        }
      }
    }

    if (action.apiCfg != undefined) {
      return async (...args: any[]) => {
        const func = (requestClient as any)[key] as (
          ...args: any[]
        ) => Promise<any>;
        return await func.apply(
          {
            cfg: action.apiCfg,
            url: baseUrl + (action.apiCfg?.path ?? action.paths?.join("/")),
          },
          args
        );
      };
    }

    throw new Error("api is not defined");
  };

  const newAction = (
    paths: string[],
    path: string,
    apiCfg: RequestCfg | undefined,
    children: ApiCfgChildren | undefined
  ) => {
    const func: Action = (...args: any) =>
      requestClient.$request.apply(
        {
          cfg: apiCfg,
          url: c.url + (apiCfg?.path ?? paths?.join("/")),
          matchMedia: c.middleware,
        },
        args
      );

    paths.push(path);

    func.paths = paths;

    func.children = children;
    func.apiCfg = apiCfg;

    return newProxy(func);
  };

  return newAction([], "", undefined, c.api as any);
}

// 获取对应的配置
// 转换配置成函数
// 在函数中找到对应的配置并转换成函数

// 处理调用
