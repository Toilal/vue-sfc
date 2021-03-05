import { Module } from './context'

export interface Compiler {
  compile (source: string, filename: string): Module
}