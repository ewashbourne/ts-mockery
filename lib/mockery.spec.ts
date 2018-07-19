import { Mockery } from './mockery';

describe('Mockery', () => {
  interface AnotherObjectToNest {
    function: () => boolean;
  }

  interface ObjectToNest {
    anotherNestedObject: AnotherObjectToNest;
    string: string;
    stringFunction: () => string;
  }

  class Foo {
    static static(): string {
      throw new Error();
    }
    array: ObjectToNest[] = [];
    nestedObject!: ObjectToNest;
    string = ':-)';
    booleanFunction = () => true;
    functionWithParam = (par: string) => par;
    objectFunction = (): ObjectToNest => ({
      anotherNestedObject: { function: () => true },
      string: 'hi',
      stringFunction: () => 'hi'
    })
    stringFunction = (buzz: string): string => buzz.toUpperCase();
    voidFunction = (): void => undefined;
  }

  describe('of', () => {
    it('mocks the supplied method', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });

      expect(mock.stringFunction('bye')).toEqual('hi');
    });

    it('mocks multiple methods', () => {
      const mock = Mockery.of<Foo>({ array: [{ stringFunction: () => 'string' }],
                                     booleanFunction: () => false,
                                     stringFunction: () => 'hi' });

      expect(mock.stringFunction('whatevs')).toBe('hi');
      expect(mock.booleanFunction()).toBe(false);
    });

    it('adds a spy to the supplied method on the mock object', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });
      mock.stringFunction('bye');

      expect(mock.stringFunction).toHaveBeenCalledWith('bye');
    });

    it('works with no arguments', () => {
      expect(() => Mockery.of<Foo>()).not.toThrow(); // tslint:disable-line:no-unnecessary-callback-wrapper
    });

    it('works with nested types', () => {
      const mock = Mockery.of<Foo>({ nestedObject : { stringFunction : () => 'hi' } });

      expect(mock.nestedObject.stringFunction()).toEqual('hi');
    });

    it('mocks multiple level nested functions', () => {
      const mock = Mockery.of<Foo>({ nestedObject : { anotherNestedObject: { function : () => false } } });
      mock.nestedObject.anotherNestedObject.function();

      expect(mock.nestedObject.anotherNestedObject.function).toHaveBeenCalled();
    });

    it('mocks partials function return types', () => {
      const mock = Mockery.of<Foo>({ objectFunction: () => ({ string: 'bah' }) });

      expect(mock.objectFunction().string).toBe('bah');
    });
  });

  describe('extend', () => {
    it('can extend an empty mock object', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ stringFunction: () => 'foooo' });

      expect(mock.stringFunction('bye')).toEqual('foooo');
    });

    it('extends the mock object with the supplied property', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ string: ':-)' });

      expect(mock.string).toEqual(':-)');
    });

    it('extends the mock object with spies for the supplied function', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ booleanFunction: () => false });

      mock.booleanFunction();
      expect(mock.booleanFunction).toHaveBeenCalled();
    });

    it('overrides preexisting mock', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });
      Mockery.extend(mock).with({ stringFunction: () => 'foooo' });

      expect(mock.stringFunction('bye')).toEqual('foooo');
    });

    it('mocks an already mocked method multiple times', () => {
      const mock = Mockery.of<Foo>({ booleanFunction: () => false });

      expect(mock.booleanFunction()).toBeFalsy();

      Mockery.extend(mock).with({ booleanFunction: () => true });

      expect(mock.booleanFunction()).toBeTruthy();

      Mockery.extend(mock).with({ booleanFunction: () => false });

      expect(mock.booleanFunction()).toBeFalsy();
      expect(mock.booleanFunction).toHaveBeenCalled();
    });

    it('mocks an already mocked property multiple times', () => {
      const mock = Mockery.of<Foo>({ string: 'first' });

      expect(mock.string).toEqual('first');

      Mockery.extend(mock).with({ string: 'second' });

      expect(mock.string).toEqual('second');

      Mockery.extend(mock).with({ string: 'third' });

      expect(mock.string).toEqual('third');
    });

    it('mocks partials function return types', () => {
      const mock = Mockery.of<Foo>({ objectFunction: () => ({ string: 'bah' }) });

      expect(mock.objectFunction().string).toBe('bah');
    });
  });

  describe('static', () => {
    it('should not call the underlying implememtation', () => {
      Mockery.static(Foo, 'static', () => 'hi');
      expect(() => { Foo.static(); }).not.toThrow();
    });

    it('should call fake', () => {
      Mockery.static(Foo, 'static', () => 'hi');
      expect(Foo.static()).toEqual('hi');
    });

    it('should be a spy', () => {
      Mockery.static(Foo, 'static', () => 'hi');
      Foo.static();
      expect(Foo.static).toHaveBeenCalled();
    });

    it('should reset the call count', () => {
      Mockery.static(Foo, 'static', () => 'hi');
      Foo.static();
      Mockery.static(Foo, 'static', () => 'hi');
      expect(Foo.static).not.toHaveBeenCalled();
    });

    it('should overwrite spy fake', () => {
      Mockery.static(Foo, 'static', () => 'hi');
      Mockery.static(Foo, 'static', () => 'hello');
      expect(Foo.static()).toEqual('hello');
    });
  });
});
