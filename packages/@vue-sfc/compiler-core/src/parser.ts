export interface StartOfSourceMap {
  file?: string;
  sourceRoot?: string;
}

export interface RawSourceMap extends StartOfSourceMap {
  version: string;
  sources: string[];
  names: string[];
  sourcesContent?: string[];
  mappings: string;
}

export interface Position {
  offset: number;
  line: number;
  column: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source: string;
}

export interface SFCBlock {
  type: string;
  content: string;
  attrs: Record<string, string | true>;
  loc: SourceLocation;
  map?: RawSourceMap;
  lang?: string;
  src?: string;
}

export interface SFCTemplateBlock extends SFCBlock {
  type: 'template';
}

export interface SFCStyleBlock extends SFCBlock {
  type: 'style';
  scoped?: boolean;
  module?: string | boolean;
}

export interface SFCScriptBlock extends SFCBlock {
  type: 'script';
  setup?: string | boolean;
}

export interface SFCDescriptor {
  filename: string;
  source: string;
  template: SFCTemplateBlock | null;
  script: SFCScriptBlock | null;
  scriptSetup: SFCScriptBlock | null;
  styles: SFCStyleBlock[];
  customBlocks: SFCBlock[];
  cssVars: string[];
}

export interface CompilerError extends SyntaxError {
  code: number;
  loc?: SourceLocation;
}

export interface SFCParserOptions {
  sourceMap?: boolean
}

export interface SFCParserResult {
  descriptor: SFCDescriptor;
  scopeId: string | null;
  errors: (CompilerError | SyntaxError)[];
}

export interface SFCParser {
  parse (source: string, filename: string, options?: SFCParserOptions): SFCParserResult
}
