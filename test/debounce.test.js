const { debounce } = require('../src/debounce');
// import { debounce } from '../src/debounce';

describe('debounce', () => {
    it('应该返回两个参数的和', () => {
        const result = debounce(2, 3);
        expect(result).toBe(5);
    });
});