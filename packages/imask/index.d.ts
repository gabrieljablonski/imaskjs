export as namespace IMask;
export = IMask;


declare function IMask (el: IMask.MaskElement | IMask.HTMLMaskingElement, opts: IMask.MaskedOptionsAny): IMask.InputMask;

declare namespace IMask {
  type HTMLMaskingElement = HTMLTextAreaElement | HTMLInputElement;
  export type ElementEvent =
    'selectionChange' |
    'input' |
    'drop' |
    'click' |
    'focus' |
    'commit';

  export class MaskElement {
    value: string;
    readonly selectionStart: number;
    readonly selectionEnd: number;
    readonly isActive: boolean;
    select (start: number, end: number): void;
    bindEvents (handlers: {[key in ElementEvent]: Function}): void;
    unbindEvents (): void;
  }

  export class HTMLMaskElement extends MaskElement {
    static EVENTS_MAP: {[key in ElementEvent]: string};
    input: HTMLMaskingElement;
    constructor (input: HTMLMaskingElement);
  }

  type AppendType = {
    input?: boolean,
    tail?: boolean,
    raw?: boolean,
  };
  type AppendFlags = {
    input?: boolean,
    tail?: boolean,
    raw?: boolean,
  };
  type ExtractFlags = {
    raw?: boolean,
  };
  type Direction =
    'NONE' |
    'LEFT' |
    'FORCE_LEFT' |
    'RIGHT' |
    'FORCE_RIGHT';
  interface AppendTail {
    append (str: string, flags?: AppendFlags): ChangeDetails;
  }
  interface TailDetails {
    from: number;
    stop?: number;
    state: any;

    toString (): string;
    extend (value: string | TailDetails): void;
    appendTo (masked: AppendTail): ChangeDetails;
    shiftBefore (pos: number): string;
  }
  class ChangeDetails {
    inserted: string;
    skip: boolean;
    tailShift: number;
    rawInserted: string;
    readonly offset: number;

    constructor (details?: {
      inserted?: string,
      skip?: boolean,
      tailShift?: number,
      rawInserted?: string,
    });

    aggregate (details: ChangeDetails): ChangeDetails;
  }

  type MaskedOptions<MaskType> = {
    mask: MaskType
  } & Partial<Pick<Masked<MaskType>,
    'parent' |
    'prepare' |
    'validate' |
    'commit' |
    'overwrite'
  >>;
  export class Masked<MaskType> {
    mask: MaskType;
    state: any;
    value: string;
    unmaskedValue: string;
    typedValue: any;
    rawInputValue: string;
    readonly isComplete: boolean;
    parent?: AnyMasked;
    prepare: (value: string, masked: Masked<MaskType>, type: AppendType) => string;
    validate: (value: string, masked: Masked<MaskType>, type: AppendType) => boolean;
    commit: (value: string, masked: Masked<MaskType>) => void;
    overwrite?: boolean;
    isInitialized: boolean;

    constructor (opts: MaskedOptions<MaskType>);
    updateOptions (opts: Partial<MaskedOptions<MaskType>>);
    reset ();
    resolve (value: string): string;
    nearestInputPos (cursorPos: number, direction?: Direction): number;
    extractTail (fromPos?: number, toPos?: number): TailDetails;
    appendTail (tail: string | TailDetails): ChangeDetails;
    append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails;
    remove (fromPos?: number, toPos?: number): ChangeDetails;
    doPrepare (str: string, flags: AppendFlags): string;
    doValidate (flags: AppendFlags): boolean;
    doCommit (): boolean;
    splice (start: number, deleteCount: number, inserted: string, removeDirection: Direction): ChangeDetails;
  }
  interface AnyMasked extends Masked<AnyMask> {}

  type MaskedPatternOptions = MaskedOptions<string> & Partial<Pick<MaskedPattern,
    'blocks' |
    'definitions' |
    'placeholderChar' |
    'lazy'
  >>;
  type MaskedPatternOptionsDefaults = Pick<MaskedPattern, 'lazy' | 'placeholderChar'>;
  export class MaskedPattern extends Masked<string> {
    static DEFAULTS: MaskedPatternOptionsDefaults;
    static STOP_CHAR: string;
    static ESCAPE_CHAR: string;
    blocks: { [key: string]: AnyMasked };
    definitions: MaskedPattern.Definitions;
    placeholderChar: string;
    lazy: boolean;

    constructor (opts: MaskedPatternOptions);
    updateOptions (opts: Partial<MaskedPatternOptions>);
    maskedBlock (name: string): MaskedPattern.PatternBlock | undefined;
    maskedBlocks (name: string): Array<MaskedPattern.PatternBlock>;
  }
  namespace MaskedPattern {
    interface PatternBlock {
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      readonly _appendPlaceholder?: (number?) => ChangeDetails;
      state: any;

      reset (): void;
      remove (fromPos?: number, toPos?: number): ChangeDetails;
      extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
      extractTail (fromPos?: number, toPos?: number): TailDetails;
      append (str: string, flags?: AppendFlags, tail?: TailDetails): ChangeDetails;
      appendTail (tail: string | TailDetails): ChangeDetails;
      _appendChar (str: string, flags: AppendFlags): ChangeDetails;
      doCommit (): void;
      nearestInputPos (cursorPos: number, direction: Direction): number;
    }
    type Definitions = {[key: string]: AnyMask};
    type PatternInputDefinitionOptions = {
      mask: AnyMask
    } & Pick<InputDefinition,
      'parent' |
      'isOptional' |
      'lazy' |
      'placeholderChar'
    >;
    class InputDefinition implements PatternBlock {
      readonly masked: AnyMasked;
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      state: any;
      parent: AnyMasked;
      isOptional: boolean;
      lazy: boolean;
      placeholderChar: string;

      constructor(opts: PatternInputDefinitionOptions);
      reset ();
      remove (fromPos?: number, toPos?: number): ChangeDetails;
      append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails;
      extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
      nearestInputPos (cursorPos: number, direction?: Direction): number;
      extractTail (fromPos?: number, toPos?: number): TailDetails;
      appendTail (tail: string | TailDetails): ChangeDetails;
      _appendChar (str: string, flags: AppendFlags): ChangeDetails;
      doValidate (flags: AppendFlags): boolean;
      doCommit (): void;
    }
    type PatternFixedDefinitionOptions = Pick<FixedDefinition,
      'char' |
      'isUnmasking'
    >;
    class FixedDefinition implements PatternBlock {
      readonly value: string;
      readonly unmaskedValue: string;
      readonly isComplete: boolean;
      state: any;
      char: string;
      isUnmasking?: boolean;
      constructor(opts: PatternFixedDefinitionOptions);
      reset ();
      remove (fromPos?: number, toPos?: number): ChangeDetails;
      append (str: string, flags?: AppendFlags, tail?: string | TailDetails): ChangeDetails;
      extractInput (fromPos?: number, toPos?: number, flags?: ExtractFlags): string;
      nearestInputPos (cursorPos: number, direction?: Direction): number;
      extractTail (fromPos?: number, toPos?: number): TailDetails;
      appendTail (tail: string | TailDetails): ChangeDetails;
      _appendChar (str: string, flags: AppendFlags): ChangeDetails;
      doCommit (): void;
    }
  }

  export class MaskedEnum extends MaskedPattern {
    readonly enum: Array<string>;
  }

  export class MaskedRange extends MaskedPattern {
    readonly maxLength: number;
    readonly from: number;
    readonly to: number;
  }

  type MaskedNumberOptions = MaskedOptions<typeof Number> & Partial<Pick<MaskedNumber,
    'radix' |
    'thousandsSeparator' |
    'mapToRadix' |
    'min' |
    'max' |
    'scale' |
    'signed' |
    'normalizeZeros' |
    'padFractionalZeros'
  >>;
  export class MaskedNumber extends Masked<typeof Number> {
    static DEFAULTS: Pick<MaskedNumber,
      'radix' |
      'thousandsSeparator' |
      'mapToRadix' |
      'scale' |
      'signed' |
      'normalizeZeros' |
      'padFractionalZeros'
    >;
    readonly radix: string;
    readonly thousandsSeparator: string;
    readonly mapToRadix: Array<string>;
    readonly min: number;
    readonly max: number;
    readonly scale: number;
    readonly signed: boolean;
    readonly normalizeZeros: boolean;
    readonly padFractionalZeros: boolean;
    readonly allowNegative: boolean;
    typedValue: number;
    number: number;

    constructor (opts: MaskedNumberOptions);
    updateOptions (opts: Partial<MaskedNumberOptions>);
  }

  type MaskedDateOptions = {
    mask: typeof Date | string,
  } & Pick<MaskedPatternOptions, Exclude<keyof MaskedPatternOptions, 'mask'>> & Partial<Pick<MaskedDate,
    'parse' |
    'format' |
    'pattern' |
    'min' |
    'max'
  >>;
  export class MaskedDate extends MaskedPattern {
    static GET_DEFAULT_BLOCKS: () => {
      d: {
        mask: MaskedRange,
        from: number,
        to: number,
        maxLength: number,
      },
      m: {
        mask: MaskedRange,
        from: number,
        to: number,
        maxLength: number,
      },
      Y: {
        mask: MaskedRange,
        from: number,
        to: number,
      },
    };
    static DEFAULTS: MaskedPatternOptionsDefaults & Pick<MaskedDate, 'pattern' | 'format' | 'parse'>;
    readonly parse: (string) => Date;
    readonly format: (Date) => string;
    readonly pattern: string;
    readonly min?: Date;
    readonly max?: Date;
    date: Date;
    typedValue: Date;

    constructor (opts: MaskedDateOptions);
    updateOptions (opts: Partial<MaskedDateOptions>);
    isDateExist (str: string): boolean;
  }

  export class MaskedRegExp extends Masked<RegExp> {}
  export class MaskedFunction extends Masked<Function> {}

  export class MaskedDynamic extends Masked<MaskedOptionsAnyArray> {
    static DEFAULTS: Pick<MaskedDynamic, 'dispatch'>;
    readonly currentMask?: AnyMasked;
    readonly compiledMasks: Array<AnyMasked>;
    dispatch: (value: string, masked: AnyMasked, flags: AppendFlags) => AnyMasked;
  }

  type MaskedOptionsAny =
    MaskedDateOptions |
    MaskedNumberOptions |
    MaskedPatternOptions |
    MaskedOptions<RegExp> |
    MaskedOptions<Function> |
    MaskedOptions<MaskedOptionsAnyArray> |
    MaskedOptions<MaskedOptionsAnyMasked> |
    MaskedOptions<typeof Masked>;
  interface MaskedOptionsAnyArray extends Array<MaskedOptionsAny> { }
  interface MaskedOptionsAnyMasked extends Masked<MaskedOptionsAny> { }

  export function createMask<Opts extends MaskedOptionsAny> (opts: Opts): Masked<
    Opts extends MaskedDateOptions ? MaskedDate :
    Opts extends MaskedNumberOptions ? MaskedNumber :
    Opts extends MaskedPatternOptions ? MaskedPattern :
    Opts extends MaskedOptions<RegExp> ? MaskedRegExp :
    Opts extends MaskedOptions<Function> ? MaskedFunction :
    Opts extends MaskedOptions<MaskedOptionsAnyArray> ? MaskedDynamic :
    Masked<Opts['mask']>
  >;

  export type AnyMask = MaskedOptionsAny['mask'];
  export class InputMask {
    el: MaskElement;
    masked: AnyMasked;
    mask: AnyMask;
    value: string;
    unmaskedValue: string;
    typedValue: any;
    cursorPos: number;
    readonly selectionStart: number;

    constructor (el: MaskElement | HTMLMaskingElement, opts: MaskedOptionsAny);

    alignCursor (): void;
    alignCursorFriendly (): void;
    updateValue (): void;
    updateControl (): void;
    updateOptions (opts: Partial<MaskedOptionsAny>): void;
    updateCursor (cursorPos: number): void;
    on (ev: string, handler: Function): this;
    off (ev: string, handler: Function): this;
    destroy (): void;
  }
}