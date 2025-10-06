export default _ = (function() {
  // 利用闭包的原理, 实现私有工具函数
  const isArray = value => Array.isArray(value);

  const isFunction = value => typeof value === 'function';

  const isNil = value => value == null;
  
  // 检查是否为类数组(不包括array)
  const isArrayLike = value => 
    !isNil(value) && 
    !isArray(value) && 
    typeof value.length === 'number' && 
    value.length >= 0 && 
    Math.floor(value.length) === value.length && 
    value.length <= Number.MAX_SAFE_INTEGER;
  
  // 将类数组或单个值转换为数组
  const toArray = value => {
    if (isNil(value)) return [];
    if (isArray(value)) return [...value];
    if (isArrayLike(value)) {
      const arr = [];
      for (let i = 0; i < value.length; i++) {
        if (i in value) arr.push(value[i]);
      }
      return arr;
    }
    return [value];
  };
  
  // 获取集合长度
  const getLength = collection => 
    (isArray(collection) || isArrayLike(collection)) ? collection.length : 0;
  // 获取类数组中指定索引的元素
  const getElement = (collection, index) => 
    (isArray(collection) || isArrayLike(collection)) && 
    index >= 0 && 
    index < getLength(collection) && 
    index in collection 
      ? collection[index] 
      : undefined;
  // 深拷贝对象或数组
  const deepClone = (value, hash = new WeakMap()) => {
    if (isNil(value) || typeof value !== 'object') return value;
    
    if (isArray(value)) {
      return value.map((v) => deepClone(v, hash));
    }
    
    if (isArrayLike(value)) {
      return toArray(value).map((v) => deepClone(v, hash));
    }
    if( value instanceof Date) return new Date(value);
    if( value instanceof RegExp) return new RegExp(value);
    if (typeof value !== "object") return value;
    // 处理循环引用
    if (hash.get(value)) return hash.get(value);
    let cloneObj = new value.constructor();
    // 找到的是所属类原型上的constructor, 而原型上的 constructor指向的是当前类本身
    hash.set(value, cloneObj);
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        cloneObj[key] = deepClone(value[key], hash);
      }
    }
    return cloneObj;
  };

  // map函数
  const map = (collection, iteratee) => {
    if (!isArray(collection) && !isArrayLike(collection)) throw new TypeError('Expected a collection but got ' + typeof collection);

    if (!isFunction(iteratee)) return toArray(collection);
    
    const result = [];
    const length = getLength(collection);
    
    for (let i = 0; i < length; i++) {
      const value = getElement(collection, i);
      try {
        result.push(iteratee(value, i, collection));
      } catch (e) {
        result.push(e);
      }
    }
    return result;
  };

  // filter函数
  const filter = (collection, predicate) => {
    if (!isArray(collection) && !isArrayLike(collection)) throw new TypeError('Expected a collection but got ' + typeof collection);
    if (!isFunction(predicate)) return [];
    
    const result = [];
    const length = getLength(collection);
    
    for (let i = 0; i < length; i++) {
      const value = getElement(collection, i);
      try {
        if (predicate(value, i, collection)) result.push(value);
      } catch (e) {
        // 忽略异常
      }
    }
    return result;
  };
  // reduce函数
  const reduce = (collection, reducer, initialValue) => {
    if (!isArray(collection) && !isArrayLike(collection)) throw new TypeError('Expected a collection but got ' + typeof collection);
    if (!isFunction(reducer)) return initialValue;
    
    let accumulator = initialValue;
    let startIndex = 0;
    const length = getLength(collection);
    // 确定初始值
    if (initialValue === undefined) {
      if (length === 0) throw new Error('Reduce of empty collection with no initial value');
      accumulator = getElement(collection, 0);
      startIndex = 1;
    }
    // 迭代
    for (let i = startIndex; i < length; i++) {
      const value = getElement(collection, i);
      try {
        accumulator = reducer(accumulator, value, i, collection);
      } catch (e) {
        break;
      }
    }
    
    return accumulator;
  };

  // 柯里化函数
  const curry = func => {
    if (!isFunction(func)) throw new TypeError('Expected a function');
    
    const curryN = (arity, args) => 
      args.length >= arity 
        ? func.apply(this, args) 
        : (...nextArgs) => curryN(arity, [...args, ...nextArgs]);
    
    return curryN(func.length, []);
  };
  // 链式调用&惰性求值
  // 柯里化核心方法
  const curriedMethods = {
    map: curry(map),
    filter: curry(filter),
    reduce: curry(reduce)
  };
  // 调用栈包装器, 实现链式调用和惰性求值
  function Wrapper(value) {
    // 实现函数调用缓存
    this.__value = deepClone(value); // 深拷贝避免修改原始数据
    this.__actions = [];
    this.__lazy = true;
  }

  Wrapper.prototype.value = function() {
    let result = this.__value;
    
    if (this.__lazy && this.__actions.length > 0) {
      result = reduce(this.__actions, (acc, { method, args }) => {
        return curriedMethods[method](acc, ...args);
      }, result);
      // 清空操作栈
      this.__actions = [];
      this.__lazy = false;
    }
    
    return result;
  };

  // 立刻执行链式调用
  Wrapper.prototype.run = function() {
    this.__value = this.value();
    this.__lazy = false;
    return this;
  };
  // 为每个核心方法添加链式调用支持
  Object.keys(curriedMethods).forEach(method => {
    Wrapper.prototype[method] = function(...args) {
      if (this.__lazy) {
        this.__actions.push({ method, args });
        return this;
      }
      
      this.__value = curriedMethods[method](this.__value, ...args);
      return this;
    };
  });

  return {
    // 核心方法
    map,
    filter,
    reduce,
    
    // 函数式工具
    curry,
    chain: value => new Wrapper(value)
  };
})();