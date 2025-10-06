import _ from '../src/lodash';
describe('工具库基础功能测试', () => {

  describe('数组方法', () => {
    test('map 应该正确映射数组元素', () => {
      const numbers = [1, 2, 3, 4];
      expect(_.map(numbers, n => n * 2)).toEqual([2, 4, 6, 8]);
      
      // 测试索引参数
      expect(_.map(numbers, (n, i) => i)).toEqual([0, 1, 2, 3]);
    });

    test('map 应该处理边界情况', () => {
      // 非数组输入
      expect(() => _.map(null, n => n * 2)).toThrow(TypeError);
      expect(() => _.map(undefined, n => n * 2)).toThrow(TypeError);
      expect(() => _.map({}, n => n * 2)).toThrow(TypeError);

      // 非函数迭代器
      expect(_.map([1, 2, 3], 'not a function')).toEqual([1, 2, 3]);
      
      // 空数组
      expect(_.map([], n => n * 2)).toEqual([]);
      
      // 迭代器抛出异常
      const result = _.map([1, 2, 3], () => { throw new Error('test'); });
      expect(result.every(item => item instanceof Error)).toBe(true);
    });

    test('filter 应该正确过滤数组元素', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      expect(_.filter(numbers, n => n % 2 === 0)).toEqual([2, 4, 6]);
    });

    test('filter 应该处理边界情况', () => {
      // 非数组输入
      expect(() => _.filter(null, n => n % 2 === 0)).toThrow(TypeError);
      
      // 非函数断言器
      expect(_.filter([1, 2, 3], 'not a function')).toEqual([]);
      
      // 空数组
      expect(_.filter([], n => n % 2 === 0)).toEqual([]);
      
      // 断言器抛出异常
      expect(_.filter([1, 2, 3], () => { throw new Error('test'); })).toEqual([]);
    });

    test('reduce 应该正确归约数组', () => {
      const numbers = [1, 2, 3, 4];
      expect(_.reduce(numbers, (acc, n) => acc + n, 0)).toBe(10);
      expect(_.reduce(numbers, (acc, n) => acc * n, 1)).toBe(24);
      
      // 测试无初始值
      expect(_.reduce([1, 2, 3], (acc, n) => acc + n)).toBe(6);
    });

    test('reduce 应该处理边界情况', () => {
      // 非数组输入
      expect(() => _.reduce(null, (acc, n) => acc + n, 0)).toThrow(TypeError);
      
      // 非函数归约器
      expect(_.reduce([1, 2, 3], 'not a function', 0)).toBe(0);
      
      // 空数组且无初始值
      expect(() => _.reduce([], (acc, n) => acc + n)).toThrow();
      
      // 归约器抛出异常
      expect(_.reduce([1, 2, 3], () => { throw new Error('test'); }, 0)).toBe(0);
    });
  });

  describe('函数式特性', () => {
    test('curry 应该正确柯里化函数', () => {
      const add = (a, b, c) => a + b + c;
      const curriedAdd = _.curry(add);
      
      expect(curriedAdd(1)(2)(3)).toBe(6);
      expect(curriedAdd(1, 2)(3)).toBe(6);
      expect(curriedAdd(1)(2, 3)).toBe(6);
      expect(curriedAdd(1, 2, 3)).toBe(6);
    });

    test('curry 应该处理边界情况', () => {
      // 非函数输入
      expect(() => _.curry('not a function')).toThrow(TypeError);
      
      // 零参数函数
      const noArgFunc = () => 42;
      expect(_.curry(noArgFunc)).toBe(42);
    });
  });

  describe('链式调用与惰性求值', () => {
    test('链式调用应该正确执行', () => {
      const result = _.chain([1, 2, 3, 4, 5])
        .map(n => n * 2)
        .filter(n => n > 5)
        .value();
      expect(result).toEqual([6, 8, 10]);
    });

    test('惰性求值应该正常工作', () => {
      const log = jest.fn(n => n);
      
      // 惰性模式下，map不会立即执行
      const chain = _.chain([1, 2, 3])
        .map(log)
        .filter(n => n > 1);
      
      expect(log).not.toHaveBeenCalled();
      
      // 调用value()时才执行
      chain.value();
      expect(log).toHaveBeenCalledTimes(3);
    });

    test('run() 应该立即执行操作', () => {
      const log = jest.fn(n => n);
      
      // run()会立即执行
      const chain = _.chain([1, 2, 3])
        .map(log)
        .run();
      
      expect(log).toHaveBeenCalledTimes(3);
    });
  });

  describe('极端情况测试', () => {
    test('处理超大数组', () => {
      // 创建包含100000个元素的数组
      const largeArray = Array.from({ length: 100000 }, (_, i) => i);
      
      // 测试map性能
      const mapped = _.map(largeArray, n => n * 2);
      expect(mapped.length).toBe(100000);
      expect(mapped[0]).toBe(0);
      expect(mapped[99999]).toBe(199998);
      
      // 测试链式调用处理大数组
      const result = _.chain(largeArray)
        .filter(n => n % 1000 === 0)
        .map(n => n / 1000)
        .value();
      
      expect(result).toEqual(Array.from({ length: 100 }, (_, i) => i));
    });

    test('处理循环引用对象', () => {
      // 创建循环引用
      const obj = {};
      obj.self = obj;
      
      // 测试map处理循环引用
      const result = _.map([obj], val => val.self === obj);
      expect(result).toEqual([true]);
      
      // 测试链式调用处理循环引用
      const chainResult = _.chain([obj])
        .map(val => val.self)
        .value();
      
      expect(chainResult[0]).toStrictEqual(obj);
    });
  });
});
