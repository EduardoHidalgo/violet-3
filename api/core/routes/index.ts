import { ApiRouter } from "@/core/routes/apiRouter";
import { RouteGateway } from "@/core/routes/routeGateway";
import { RouteNode, RouteNodeArgs } from "@/core/routes/routeNode";
import {
  ApiVersion,
  ApiVersionEnum,
  RestVerb,
  RouteDomainFn,
  RouteVersionFn,
  RoutesMiddlewareFn,
  apiVersions,
} from "@/core/routes/types";

export {
  ApiRouter,
  ApiVersion,
  ApiVersionEnum,
  RestVerb,
  RouteDomainFn,
  RouteGateway,
  RouteNode,
  RouteNodeArgs,
  RouteVersionFn,
  RoutesMiddlewareFn,
  apiVersions,
};

enum A {
  a = "a",
  b = "b",
  c = "c",
}

enum B {
  d = "d",
  e = "e",
  f = "f",
}

enum C {
  g = "g",
  h = "h",
  i = "i",
}

enum D {
  z = "z",
}

type UnionT = A | B | C;

class UnionClass<T> {
  list: Array<SingleClass<T>>;

  constructor() {
    this.list = [];
  }
}

class SingleClass<T> {
  t: T;

  constructor(t: T) {
    this.t = t;
  }

  register<T>(t: T) {
    console.log(t);
  }
}

const union = new UnionClass<UnionT>();

union.list.push(new SingleClass<B>(B.d));
