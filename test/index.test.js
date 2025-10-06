import _ from '../src/lodash';
describe('工具库基础功能测试', () => {

  describe('数组方法', () => {
    test('map 应该正确映射数组元素', () => {
      const numbers = [1, 2, 3, 4];
      expect(_.map(numbers, n => n * 2)).toEqual([2, 4, 6, 8]);
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


describe('debounce', () => {
    const {debounce} = _;
    describe('类型检查', () => {
         it('传入的不是函数：抛出错误', () => {
            expect(() => debounce(2, 3)).toThrow(TypeError);
            expect(() => debounce(2, 3)).toThrow(new TypeError("Expected a function"));
        });
    })
    describe('功能检查', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        describe('leading: true, trailing: false', () => {
            it('应该立即执行第一次调用，忽略后续在等待期内的调用', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: true, trailing: false });

                // 第一次调用立即执行
                fn();
                expect(count).toBe(1);

                // 在等待期内多次调用
                fn();
                fn();
                fn();
                expect(count).toBe(1); // 仍然为1，因为后续调用被忽略

                // 快进时间超过等待期
                jest.advanceTimersByTime(300);
                
                // 等待期后再次调用
                fn();
                expect(count).toBe(2); // 再次立即执行
            });

            it('在等待期后调用应该再次立即执行', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: true, trailing: false });

                fn();
                expect(count).toBe(1);

                jest.advanceTimersByTime(200);

                fn();
                expect(count).toBe(2);
            });
        });

        describe('leading: false, trailing: true', () => {
            it('应该延迟执行，只执行最后一次调用', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: false, trailing: true });

                // 第一次调用，不立即执行
                fn();
                expect(count).toBe(0);

                // 在等待期内多次调用
                fn();
                fn();
                fn();
                expect(count).toBe(0); // 仍然为0，等待延迟执行

                // 快进时间超过等待期
                jest.advanceTimersByTime(200);
                expect(count).toBe(1); // 只执行最后一次调用

                // 再次调用
                fn();
                expect(count).toBe(1); // 等待期内，还未执行
                jest.advanceTimersByTime(200);
                expect(count).toBe(2); // 执行第二次调用
            });

            it('单次调用也应该延迟执行', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: false, trailing: true });

                fn();
                expect(count).toBe(0);

                jest.advanceTimersByTime(200);
                expect(count).toBe(1);
            });
        });

        describe('leading: true, trailing: true', () => {
            it('单次调用：只在 leading 阶段执行，trailing 阶段不执行', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: true, trailing: true });

                // 单次调用：立即执行（leading）
                fn();
                expect(count).toBe(1);

                // 快进时间超过等待期
                jest.advanceTimersByTime(200);
                expect(count).toBe(1); // 仍然是1，trailing 阶段不执行
            });

            it('等待期内多次调用：leading 阶段执行第一次，trailing 阶段执行最后一次', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: true, trailing: true });

                // 第一次调用立即执行（leading）
                fn();
                expect(count).toBe(1);

                // 在等待期内多次调用
                fn();
                fn();
                fn();
                expect(count).toBe(1); // 仍然为1

                // 快进时间超过等待期
                jest.advanceTimersByTime(200);
                expect(count).toBe(2); // trailing 阶段执行最后一次调用
            });

            it('多次调用但间隔超过等待期：每次都在 leading 阶段执行', () => {
                let count = 0;
                const fn = debounce(() => {
                    count++;
                }, 200, { leading: true, trailing: true });

                // 第一次调用
                fn();
                expect(count).toBe(1);

                // 等待超过防抖时间后再次调用
                jest.advanceTimersByTime(300);
                fn();
                expect(count).toBe(2); // 再次在 leading 阶段执行

                // 再次等待超过防抖时间
                jest.advanceTimersByTime(300);
                fn();
                expect(count).toBe(3); // 再次在 leading 阶段执行
            });

            it('复杂调用序列：验证 leading 和 trailing 的正确触发', () => {
                const callLog = [];
                const fn = debounce((value) => {
                    callLog.push(`executed: ${value}`);
                }, 200, { leading: true, trailing: true });

                // 第一次调用 - leading 执行
                fn('call1');
                expect(callLog).toEqual(['executed: call1']);

                // 150ms 后第二次调用 - 不立即执行
                jest.advanceTimersByTime(150);
                fn('call2');
                expect(callLog).toEqual(['executed: call1']);

                // 再 100ms 后（总 250ms）第三次调用 - 不立即执行
                jest.advanceTimersByTime(100);
                fn('call3');
                expect(callLog).toEqual(['executed: call1']);

                // 快进 200ms（总 450ms）- trailing 执行最后一次调用
                jest.advanceTimersByTime(200);
                expect(callLog).toEqual(['executed: call1', 'executed: call3']);

                // 等待期后单次调用 - leading 执行
                jest.advanceTimersByTime(300);
                fn('call4');
                expect(callLog).toEqual(['executed: call1', 'executed: call3', 'executed: call4']);

                // 快进等待期 - 没有 trailing 执行（因为是单次调用）
                jest.advanceTimersByTime(200);
                expect(callLog).toEqual(['executed: call1', 'executed: call3', 'executed: call4']);
            });
 
        })
        describe('leading: false, trailing: false', () => {
            it('函数永远不会被执行', () => {
                let count = 0;
                const fn = debounce(() => {
                count++;
                }, 200, { leading: false, trailing: false });

                // 单次调用
                fn();
                expect(count).toBe(0);
                
                jest.advanceTimersByTime(200);
                expect(count).toBe(0); // 仍然为0

                // 多次调用
                fn();
                fn();
                fn();
                expect(count).toBe(0);
                
                jest.advanceTimersByTime(200);
                expect(count).toBe(0); // 仍然为0
            });
        })
        it('this指向正确性，leading指向第一次调用的this，trailing 阶段指向最后一次调用的 this', () => {
            const context1 = { name: 'context1' };
            const context2 = { name: 'context2' };
            const context3 = { name: 'context3' };
            const capturedThis = [];

            function testFunction() {
            capturedThis.push(this);
            }

            const debouncedFn = debounce(testFunction, 100, { leading: true, trailing: true });

            // 多次调用
            debouncedFn.call(context1); // leading 执行
            debouncedFn.call(context2);
            debouncedFn.call(context3);

            jest.advanceTimersByTime(100); // trailing 执行

            expect(capturedThis[0]).toBe(context1); // leading 阶段是第一次调用的 this
            expect(capturedThis[1]).toBe(context3); // trailing 阶段是最后一次调用的 this
        });
            
    })

    
});

describe('throttle', () => {
    const {throttle} = _;
    describe('类型检查', () => {
        it('传入的不是函数：抛出错误', () => {
            expect(() => throttle(2, 3)).toThrow(TypeError);
            expect(() => throttle(2, 3)).toThrow(new TypeError("Expected a function"));
        });
    });

    describe('功能检查', () => {
        let mockFn;
        let throttledFn;

        beforeEach(() => {
        jest.useFakeTimers();
        mockFn = jest.fn();
        });

        afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        });

        describe('leading: true, trailing: true (默认)', () => {
        beforeEach(() => {
            throttledFn = throttle(mockFn, 100);
        });

        it('第一次调用立即执行', () => {
            throttledFn();
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('在节流期间多次调用，只执行首尾两次', () => {
            throttledFn('first');
            throttledFn('second');
            throttledFn('third');
            
            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenLastCalledWith('first');

            jest.advanceTimersByTime(100);
            expect(mockFn).toHaveBeenCalledTimes(2);
            expect(mockFn).toHaveBeenLastCalledWith('third');
        });

        it('节流结束后再次调用会立即执行', () => {
            throttledFn();
            jest.advanceTimersByTime(100);
            throttledFn();
            
            expect(mockFn).toHaveBeenCalledTimes(2);
        });
        });

        describe('leading: true, trailing: false', () => {
        beforeEach(() => {
            throttledFn = throttle(mockFn, 100, { leading: true, trailing: false });
        });

        it('第一次调用立即执行', () => {
            throttledFn();
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('在节流期间多次调用，只执行第一次', () => {
            throttledFn('first');
            throttledFn('second');
            throttledFn('third');
            
            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenLastCalledWith('first');

            jest.advanceTimersByTime(100);
            expect(mockFn).toHaveBeenCalledTimes(1); // 没有尾随调用
        });
        });

        describe('leading: false, trailing: true', () => {
            beforeEach(() => {
                throttledFn = throttle(mockFn, 100, { leading: false, trailing: true });
            });

            it('第一次调用不立即执行', () => {
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(0);
            });

            it('在节流期间多次调用，只执行最后一次', () => {
                throttledFn('first');
                throttledFn('second');
                throttledFn('third');
                
                expect(mockFn).toHaveBeenCalledTimes(0);

                jest.advanceTimersByTime(100);
                expect(mockFn).toHaveBeenCalledTimes(1);
                expect(mockFn).toHaveBeenLastCalledWith('third');
            });

            it('单次调用也会在延迟后执行', () => {
                throttledFn('single');
                expect(mockFn).toHaveBeenCalledTimes(0);

                jest.advanceTimersByTime(100);
                expect(mockFn).toHaveBeenCalledTimes(1);
                expect(mockFn).toHaveBeenLastCalledWith('single');
            });
        });

        describe('leading: false, trailing: false', () => {
            beforeEach(() => {
                throttledFn = throttle(mockFn, 100, { leading: false, trailing: false });
            });

            it('任何调用都不会执行', () => {
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(0);

                throttledFn();
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(0);

                jest.advanceTimersByTime(100);
                expect(mockFn).toHaveBeenCalledTimes(0);
            });
        });

        describe('边界条件', () => {
            it('等待时间为0', () => {
                throttledFn = throttle(mockFn, 0);
                
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(1);
                
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(2);
            });

            it('等待时间极大', () => {
                throttledFn = throttle(mockFn, 1000000);
                
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(1);
                
                jest.advanceTimersByTime(999999);
                throttledFn();
                expect(mockFn).toHaveBeenCalledTimes(1);
                
                jest.advanceTimersByTime(1);
                expect(mockFn).toHaveBeenCalledTimes(2);
            });

            it('连续快速调用后的正确行为', () => {
                throttledFn = throttle(mockFn, 100);
                
                // 快速连续调用
                for (let i = 0; i < 10; i++) {
                throttledFn(i);
                }
                
                expect(mockFn).toHaveBeenCalledTimes(1); // 立即执行第一次
                expect(mockFn).toHaveBeenLastCalledWith(0);
                
                jest.advanceTimersByTime(100);
                expect(mockFn).toHaveBeenCalledTimes(2); // 延迟执行最后一次
                expect(mockFn).toHaveBeenLastCalledWith(9);
            });
        });

        describe('参数传递', () => {
            it('正确传递所有参数', () => {
                throttledFn = throttle(mockFn, 100);
                
                throttledFn('a', 'b', 'c');
                expect(mockFn).toHaveBeenCalledWith('a', 'b', 'c');
                
                throttledFn('d', 'e', 'f');
                jest.advanceTimersByTime(100);
                expect(mockFn).toHaveBeenLastCalledWith('d', 'e', 'f');
            });
        });
    });
});

describe('compose', () => {
    const {compose} = _;
    describe('类型检查', () => {
        test('应该抛出错误，当参数不是函数时', () => {
            const fn1 = compose([1, 2, 3]);
            const fn2 = compose(['a', 'b', 'c']);
            const fn3 = compose([null, undefined, {}]);

            expect(() => fn1('a')).toThrow(TypeError);
            expect(() => fn2('a')).toThrow(TypeError);
            expect(() => fn3('a')).toThrow(TypeError);
            expect(() => fn1('a')).toThrow('Expected a function');
            expect(() => fn2('a')).toThrow('Expected a function');
            expect(() => fn3('a')).toThrow('Expected a function');
        });
    })

    describe('边界情况', () => { 
        test('应该处理空数组，返回第一个参数', () => {
            const identity = compose([]);
            expect(identity(5)).toBe(5);
            expect(identity('hello')).toBe('hello');
            expect(identity(1, 2, 3)).toBe(1); // 只返回第一个参数
        });

    })

    describe('功能检查', () => {
        test('应该正确组合多个函数', () => {
            const add = (a, b) => a + b;
            const square = n => n * n;
            const double = n => n * 2;

            const addSquare = compose([add, square]);
            const addSquareDouble = compose([add, square, double]);

            expect(addSquare(1, 2)).toBe(9); // (1+2)² = 9
            expect(addSquareDouble(1, 2)).toBe(18); // ((1+2)²) * 2 = 18
        });

        test('应该处理单个函数', () => {
            const square = n => n * n;
            const squareOnly = compose([square]);

            expect(squareOnly(3)).toBe(9);
            expect(squareOnly(4)).toBe(16);
        });

  

        test('应该保持 this 绑定', () => {
            const obj = {
            value: 10,
            add(x) {
                return this.value + x;
            },
            multiply(y) {
                return this.value * y;
            }
            };

            const addThenMultiply = compose([obj.add, obj.multiply]);
            
            // 使用 call 来绑定 this
            const result = addThenMultiply.call(obj, 5);
            expect(result).toBe(150); // (10 + 5) * 10 = 150
        });

        test('应该正确处理多个参数的函数', () => {
            const multiply = (a, b) => a * b;
            const add = (a, b) => a + b;
            const stringify = n => n.toString();

            const complexOp = compose([multiply, add.bind(null, 10), stringify]);

            // multiply(3, 4) = 12, then add(10, 12) = 22, then stringify(22) = "22"
            expect(complexOp(3, 4)).toBe("22");
        });

        test('应该按顺序执行函数', () => {
            const mock1 = jest.fn(x => x + 1);
            const mock2 = jest.fn(x => x * 2);
            const mock3 = jest.fn(x => x - 3);

            const composed = compose([mock1, mock2, mock3]);
            const result = composed(5);

            // 验证执行顺序
            expect(mock1).toHaveBeenCalledWith(5);
            expect(mock2).toHaveBeenCalledWith(6); // 5+1=6
            expect(mock3).toHaveBeenCalledWith(12); // 6*2=12
            
            expect(result).toBe(9); // 12-3=9
        });

        test('应该处理异步函数（如果需要）', () => {
            const syncDouble = n => n * 2;
            const syncAdd = n => n + 5;
            
            const composed = compose([syncDouble, syncAdd]);
            expect(composed(3)).toBe(11); // (3*2)+5=11
        });
    })
});